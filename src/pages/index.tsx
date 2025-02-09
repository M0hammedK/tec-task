import { useState, useEffect } from "react";

type Task = {
  id: number;
  text: string;
  complated: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [activeTab, setActiveTab] = useState("current");

  // Fetch tasks from the JSON server
  const fetchTasks = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_PATH}/${
        activeTab === "current" ? "task" : "complated"
      }`,{
        headers: {"Type-Content": "application/json", "Access-Control-Allow-Origin": "true"}
      }
    );
    const data = await response.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() === "") return;

    const task = { text: newTask, complated: false };
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PATH}/task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (response.ok) {
      fetchTasks();
      setNewTask("");
    }
  };

  const toggleTask = async (task: Task) => {
    const updatedTask = { ...task, complated: !task.complated };

    // Move task to the appropriate table
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_PATH}/${task.complated ? "complated" : "task"}/${
        task.id
      }`,
      {
        method: "DELETE",
      }
    );

    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_PATH}/${task.complated ? "task" : "complated"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      }
    );

    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_PATH}/${
        activeTab === "current" ? "task" : "complated"
      }/${id}`,
      {
        method: "DELETE",
      }
    );

    fetchTasks();
  };

  return (
    <div className="w-full flex justify-center bg-light p-4">
      <div className="max-w-[800px] w-full h-[100vh] flex flex-col justify-center items-center">
        <h1 className="text-3xl font-semibold my-4">Tec-Task</h1>

        <form onSubmit={handleSubmit} className="w-full flex gap-2 mb-4">
          <input
            type="text"
            className="flex-grow border p-2 rounded"
            placeholder="Add a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            type="submit"
          >
            Add
          </button>
        </form>

        <div className="flex w-full justify-around mb-4">
          <button
            onClick={() => setActiveTab("current")}
            className={`px-4 py-2 ${
              activeTab === "current" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            Current Tasks
          </button>
          <button
            onClick={() => setActiveTab("complated")}
            className={`px-4 py-2 ${
              activeTab === "complated" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            Completed Tasks
          </button>
        </div>

        <div className="w-full">
          {Array.isArray(tasks) && tasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center bg-white shadow p-2 mb-2 rounded"
            >
              <span
                className={task.complated ? "line-through text-gray-500" : ""}
              >
                {task.text}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleTask(task)}
                  className="text-green-500"
                >
                  {task.complated ? "Undo" : "Complete"}
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// pages/index.tsx
import { useState, useEffect } from "react";

type Task = {
  id: number;
  text: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [activeTab, setActiveTab] = useState("current");

  // Fetch tasks from the Express server
  const fetchTasks = async () => {
    try {
      // Pass completed query param: "true" for completed tab, "false" for current tasks.
      const completed = activeTab === "completed" ? "true" : "false";
      const res = await fetch(
        `https://tec-task-server.onrender.com/${
          completed === "true" ? "complated" : "tasks"
        }`
      );

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  // Create a new task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() === "") return;
    console.log(newTask);

    try {
      const res = await fetch(`https://tec-task-server.onrender.com/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTask }),
      });
      if (res.ok) {
        setNewTask("");
        fetchTasks();
      } else {
        console.error("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // Toggle a task's completed status
  const toggleTask = async (task: Task) => {
    try {
      const res = await fetch(
        `https://tec-task-server.onrender.com/${
          activeTab === "completed" ? "tasks" : "complated"
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: task.text }),
        }
      );
      await deleteTask(task.id);
      if (res.ok) {
        fetchTasks();
      } else {
        console.error("Failed to toggle task");
      }
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  // Delete a task
  const deleteTask = async (id: number) => {
    try {
      console.log(activeTab === "completed");
      const res = await fetch(
        `https://tec-task-server.onrender.com/${
          activeTab === "completed" ? "complated" : "tasks"
        }/${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        fetchTasks();
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
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
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 ${
              activeTab === "completed" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            Completed Tasks
          </button>
        </div>

        <div className="w-full">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center bg-white shadow p-2 mb-2 rounded"
            >
              <span
                className={
                  activeTab === "completed" ? "line-through text-gray-500" : ""
                }
              >
                {task.text}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleTask(task)}
                  className="text-green-500"
                >
                  {activeTab === "completed" ? "Undo" : "Complete"}
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

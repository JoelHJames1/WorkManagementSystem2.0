import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, CheckCircle } from 'lucide-react';
import { getTasks, addTask, completeTask, getWorkers } from '../utils/db';

interface Task {
  id: number;
  title: string;
  assignedTo: number;
  assignedToName: string;
  completed: boolean;
}

interface Worker {
  id: number;
  username: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [newTask, setNewTask] = useState('');
  const [assignTo, setAssignTo] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const fetchedTasks = getTasks();
      setTasks(fetchedTasks);
      const fetchedWorkers = getWorkers();
      setWorkers(fetchedWorkers);
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddTask = () => {
    if (newTask && assignTo) {
      addTask(newTask, parseInt(assignTo));
      const updatedTasks = getTasks();
      setTasks(updatedTasks);
      setNewTask('');
      setAssignTo('');
    }
  };

  const handleCompleteTask = (taskId: number) => {
    completeTask(taskId);
    const updatedTasks = getTasks();
    setTasks(updatedTasks);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Assign New Task</h2>
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter task title"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <select
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a worker</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.username} (ID: {worker.id})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddTask}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </button>
            </div>

            <h2 className="text-lg font-semibold mb-4">Task List</h2>
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between bg-white p-4 rounded-md shadow"
                >
                  <div>
                    <h3 className="text-lg font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-500">Assigned to: {task.assignedToName} (ID: {task.assignedTo})</p>
                  </div>
                  <div className="flex items-center">
                    {task.completed ? (
                      <span className="text-green-500 flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Mark as Complete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
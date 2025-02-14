import { AddTask, GetTasks, ToggleTaskCompletion, DeleteTask } from '../wailsjs/go/main/App';
import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, AlertCircle, Trash2, CheckCircle, Circle, Sun, Moon } from 'lucide-react';

import { Todo, Priority } from './types';

function mapTaskToTodo(task: any): Todo {
  const validPriorities = ["low", "medium", "high"];
  return {
    ...task,
    priority: validPriorities.includes(task.priority) ? task.priority : "medium", // Default to "medium" if invalid
  };
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isDark, setIsDark] = useState(() => { // Changed: Added dark mode state
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await GetTasks(); // Fetch tasks from backend
        const todos = tasks.map(mapTaskToTodo); // Map tasks to frontend-compatible Todos
        setTodos(todos);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);


  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const todo = await AddTask(newTodo, priority, dueDate || null); // Call backend method
      const mappedTodo = mapTaskToTodo(todo); // Map response to frontend-compatible Todo
      setTodos([mappedTodo, ...todos]);
      setNewTodo('');
      setDueDate('');
      setPriority('medium');
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };


  const toggleTodo = async (id: string) => {
    try {
      await ToggleTaskCompletion(id); // Notify backend of status change
      setTodos(todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (error) {
      console.error("Failed to toggle task completion:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await DeleteTask(id); // Notify backend of deletion
        setTodos(todos.filter(todo => todo.id !== id));
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200">
        <div className="max-w-3xl mx-auto">
          {/* Changed: Added theme toggle button */}
          <div className="flex justify-end mb-4">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
            >
              {isDark ? (
                  <Sun className="text-yellow-500" size={24}/>
              ) : (
                  <Moon className="text-gray-700" size={24}/>
              )}
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8 text-center">
            Task Manager
          </h1>

          <form onSubmit={addTodo} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex gap-4 mb-4">
              <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"/>
              <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2">
                <PlusCircle size={20}/>
                Add Task
              </button>

            </div>

            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-gray-500 dark:text-gray-400"/>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
          </form>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {todos.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No tasks yet. Add one above!
                </div>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {todos.map((todo) => (
                      <li
                          key={todo.id}
                          className={`p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              todo.completed ? 'bg-gray-50 dark:bg-gray-700' : ''
                          }`}
                      >
                        <button
                            onClick={() => toggleTodo(todo.id)}
                            className="text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          {todo.completed ? (
                              <CheckCircle size={24} className="text-purple-600"/>
                          ) : (
                              <Circle size={24}/>
                          )}
                        </button>

                        <div className="flex-1">
                          <p
                              className={`text-lg ${
                                  todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'
                              }`}
                          >
                            {todo.title}
                          </p>
                          <div className="flex gap-4 mt-1 text-sm">
                            {todo.dueDate && (
                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar size={16}/>
                                  {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                            )}
                            <span className={`flex items-center gap-1 ${getPriorityColor(todo.priority)}`}>
                        <AlertCircle size={16}/>
                              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                      </span>
                          </div>
                        </div>

                        <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={20}/>
                        </button>
                      </li>
                  ))}
                </ul>
            )}
          </div>
        </div>
      </div>
  );
}

export default App;
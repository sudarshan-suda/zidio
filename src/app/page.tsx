'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, User } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Task = {
  id: string;
  text: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  date: Date | null;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [date, setDate] = useState<Date | undefined>();
  const [isUpdate, setIsUpdate] = useState(false);
  const [updateId, setUpdateId] = useState('');
  const { toast } = useToast();

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }

    // Check authentication status on load
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in to add tasks.",
        variant: "destructive"
      });
      return;
    }

    if (newTask.trim() !== '') {
      if (isUpdate) {
        updateTask();
        return;
      }
      setTasks([...tasks, { id: Date.now().toString(), text: newTask, description: newDescription, completed: false, priority: priority, date: date }]);
      setNewTask('');
      setNewDescription('');
      setDate(undefined);
      toast({
        title: "Task added successfully!",
      })
    }
  };

  const toggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleUpdate = (task: Task) => {
    setIsUpdate(true);
    setNewTask(task.text);
    setNewDescription(task.description);
    setPriority(task.priority);
    setDate(task.date);
    setUpdateId(task.id);
  }

  const updateTask = () => {
    setTasks(
      tasks.map((task) => {
        if (task.id === updateId) {
          return { ...task, text: newTask, description: newDescription, priority: priority, date: date };
        }
        return task;
      })
    );
    setNewTask('');
    setNewDescription('');
    setDate(undefined);
    setIsUpdate(false);
    setUpdateId('');
      toast({
        title: "Task updated successfully!",
      })
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-priority-high';
      case 'medium':
        return 'bg-priority-medium';
      case 'low':
        return 'bg-priority-low';
      default:
        return 'bg-gray-500';
    }
  };

  const completedTasks = tasks.filter((task) => task.completed).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  // Authentication handlers
  const handleLogin = () => {
    if (username === 'user' && password === 'password') {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      setIsLoginOpen(false);
      toast({
        title: "Login successful!",
      })
    } else {
      toast({
        title: "Invalid credentials.",
        variant: "destructive"
      });
    }
  };

  const handleRegister = () => {
    // In a real application, you'd save this to a database
    localStorage.setItem('user', username);
    localStorage.setItem('password', password);
    setIsRegisterOpen(false);
    setIsAuthenticated(true); // Automatically log in after registration
    localStorage.setItem('isAuthenticated', 'true');
    toast({
      title: "Registration successful!",
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    toast({
      title: "Logged out successfully!",
    })
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary">TaskMaster</h1>

        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <User className="h-5 w-5" />
            <span>Welcome, user!</span>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Login</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Login</DialogTitle>
                  <DialogDescription>
                    Enter your username and password to log in.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <Button type="submit" onClick={handleLogin}>Log In</Button>
              </DialogContent>
            </Dialog>

            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Register</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Register</DialogTitle>
                  <DialogDescription>
                    Create a new account by entering a username and password.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="register-username" className="text-right">
                      Username
                    </Label>
                    <Input
                      type="text"
                      id="register-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="register-password" className="text-right">
                      Password
                    </Label>
                    <Input
                      type="password"
                      id="register-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <Button type="submit" onClick={handleRegister}>Register</Button>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Progress value={progress} className="mb-4" />

      {isAuthenticated && (
        <div className="md:flex flex-col gap-4 mb-4">
          <Input
            type="text"
            placeholder="Add a task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-grow mb-2 md:mb-0"
          />
          <Textarea
            placeholder="Add a description..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="flex-grow mb-2 md:mb-0"
          />
          <div className='md:flex md:items-center gap-2'>
            <Select onValueChange={setPriority} defaultValue={priority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date < new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={addTask} className="bg-accent text-background hover:bg-accent/80">{isUpdate ? 'Update Task' : 'Add Task'}</Button>
          </div>
        </div>
      )}
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between p-3 rounded shadow-sm hover:bg-secondary transition-colors"
          >
            <div className="flex flex-col">
              <div className="flex items-center">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => toggleComplete(task.id)}
                />
                <Label
                  htmlFor={`task-${task.id}`}
                  className="ml-2 cursor-pointer flex-grow line-clamp-1"
                >
                  {task.text}
                  {task.date && (
                    <span className="ml-2 text-muted-foreground">
                      ({format(task.date, "PPP")})
                    </span>
                  )}
                </Label>
              </div>
              {task.description && (
                <p className="ml-6 text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex items-center">
              <div className={`rounded-full w-3 h-3 mr-2 ${getPriorityColor(task.priority)}`}></div>
              <Button
                onClick={() => handleUpdate(task)}
                variant="ghost"
                className="text-blue-500 hover:bg-blue-100"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Update</span>
              </Button>
              <Button
                onClick={() => deleteTask(task.id)}
                variant="ghost"
                className="text-red-500 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

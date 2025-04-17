'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

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

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, { id: Date.now().toString(), text: newTask, description: newDescription, completed: false, priority: priority, date: date }]);
      setNewTask('');
      setNewDescription('');
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

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-primary">TaskMaster</h1>

      <Progress value={progress} className="mb-4" />

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
          <Button onClick={addTask} className="bg-accent text-background hover:bg-accent/80">Add Task</Button>
        </div>
      </div>
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

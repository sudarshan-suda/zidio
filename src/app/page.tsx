'use client';

import React, { useEffect, useState } from 'react';
import {
  Input, Button, Calendar, Checkbox, Label, Select,
  SelectContent, SelectItem, SelectTrigger, SelectValue,
  Textarea, Progress, Popover, PopoverContent, PopoverTrigger,
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger
} from '@/components/ui';
import { Trash2, Edit, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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
  const [form, setForm] = useState({ text: '', description: '', priority: 'medium', date: undefined as Date | undefined });
  const [editingId, setEditingId] = useState('');
  const [auth, setAuth] = useState({ username: '', password: '', isAuthenticated: false });
  const [dialog, setDialog] = useState({ login: false, register: false });

  const { toast } = useToast();

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    setAuth(prev => ({ ...prev, isAuthenticated }));
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const addOrUpdateTask = () => {
    if (!auth.isAuthenticated) {
      toast({ title: 'Please log in to add tasks.', variant: 'destructive' });
      return;
    }

    if (form.text.trim() === '') return;

    if (editingId) {
      setTasks(tasks.map(task => task.id === editingId ? { ...task, ...form } : task));
      setEditingId('');
      toast({ title: 'Task updated!' });
    } else {
      const newTask: Task = { id: Date.now().toString(), ...form, completed: false };
      setTasks([...tasks, newTask]);
      toast({ title: 'Task added!' });
    }

    setForm({ text: '', description: '', priority: 'medium', date: undefined });
  };

  const handleEdit = (task: Task) => {
    setForm(task);
    setEditingId(task.id);
  };

  const handleDelete = (id: string) => setTasks(tasks.filter(task => task.id !== id));
  const toggleComplete = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const getPriorityColor = (priority: Task['priority']) => ({
    high: 'bg-priority-high',
    medium: 'bg-priority-medium',
    low: 'bg-priority-low'
  }[priority]);

  const progress = tasks.length ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

  const handleLogin = () => {
    if (auth.username === 'user' && auth.password === 'password') {
      localStorage.setItem('isAuthenticated', 'true');
      setAuth(prev => ({ ...prev, isAuthenticated: true }));
      setDialog({ login: false, register: false });
      toast({ title: 'Login successful!' });
    } else {
      toast({ title: 'Invalid credentials', variant: 'destructive' });
    }
  };

  const handleRegister = () => {
    localStorage.setItem('user', auth.username);
    localStorage.setItem('password', auth.password);
    localStorage.setItem('isAuthenticated', 'true');
    setAuth(prev => ({ ...prev, isAuthenticated: true }));
    setDialog({ login: false, register: false });
    toast({ title: 'Registered successfully!' });
  };

  const logout = () => {
    setAuth({ ...auth, isAuthenticated: false });
    localStorage.removeItem('isAuthenticated');
    toast({ title: 'Logged out!' });
  };

  return (
    <main className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">TaskMaster</h1>
        {auth.isAuthenticated ? (
          <div className="flex items-center gap-3">
            <User className="h-5 w-5" />
            <span>Welcome, {auth.username || 'user'}!</span>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Dialog open={dialog.login} onOpenChange={val => setDialog(prev => ({ ...prev, login: val }))}>
              <DialogTrigger asChild><Button variant="outline">Login</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Login</DialogTitle></DialogHeader>
                <DialogDescription>Enter your login details.</DialogDescription>
                <Input placeholder="Username" value={auth.username} onChange={e => setAuth({ ...auth, username: e.target.value })} />
                <Input placeholder="Password" type="password" value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} />
                <Button onClick={handleLogin}>Login</Button>
              </DialogContent>
            </Dialog>
            <Dialog open={dialog.register} onOpenChange={val => setDialog(prev => ({ ...prev, register: val }))}>
              <DialogTrigger asChild><Button variant="outline">Register</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Register</DialogTitle></DialogHeader>
                <DialogDescription>Create a new account.</DialogDescription>
                <Input placeholder="Username" value={auth.username} onChange={e => setAuth({ ...auth, username: e.target.value })} />
                <Input placeholder="Password" type="password" value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} />
                <Button onClick={handleRegister}>Register</Button>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </header>

      <Progress value={progress} className="mb-4" />

      {auth.isAuthenticated && (
        <section className="space-y-2 mb-4">
          <Input placeholder="Task title..." value={form.text} onChange={e => handleChange('text', e.target.value)} />
          <Textarea placeholder="Description..." value={form.description} onChange={e => handleChange('description', e.target.value)} />
          <div className="flex items-center gap-2">
            <Select onValueChange={val => handleChange('priority', val)} defaultValue={form.priority}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px]">
                  {form.date ? format(form.date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Calendar selected={form.date} onSelect={val => handleChange('date', val)} disabled={d => d < new Date()} />
              </PopoverContent>
            </Popover>
            <Button onClick={addOrUpdateTask}>{editingId ? 'Update Task' : 'Add Task'}</Button>
          </div>
        </section>
      )}

      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="flex justify-between items-start p-3 bg-white rounded shadow">
            <div>
              <div className="flex items-center">
                <Checkbox checked={task.completed} onCheckedChange={() => toggleComplete(task.id)} />
                <Label className="ml-2">
                  {task.text} {task.date && <span className="ml-2 text-muted-foreground">({format(task.date, 'PPP')})</span>}
                </Label>
              </div>
              {task.description && <p className="ml-6 text-sm text-muted-foreground">{task.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
              <Button onClick={() => handleEdit(task)} variant="ghost"><Edit className="h-4 w-4" /></Button>
              <Button onClick={() => handleDelete(task.id)} variant="ghost"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}


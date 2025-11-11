import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Calendar, CheckCircle, DollarSign, Plus, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Task, Project, Payment, Client, UserProfile } from '../App';

interface TodayViewProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  projects: Project[];
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  clients: Client[];
  userProfile: UserProfile;
}

export function TodayView({ tasks, setTasks, projects, payments, setPayments, clients, userProfile }: TodayViewProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Today's tasks
  const todayTasks = tasks.filter(t => t.deadline === today);

  // Today's deliveries (projects)
  const todayDeliveries = projects.filter(p => p.deliveryDate === today);

  // Today's expected payments
  const todayPayments = payments.filter(p => p.expectedDate === today && !p.isPaid);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const markPaymentAsPaid = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId ? { ...p, isPaid: true, paidDate: new Date().toISOString() } : p
    ));
  };

  const addQuickTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      deadline: today,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name;
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2">
        <h1>Hoje</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('pt-PT', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </p>
      </div>

      {/* Quick Add Task */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="size-4 mr-2" />
            Adicionar Tarefa Rápida
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa para Hoje</DialogTitle>
            <DialogDescription>Adiciona uma tarefa rápida para completares hoje</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Título da tarefa</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="O que precisas fazer hoje?"
                onKeyDown={(e) => e.key === 'Enter' && addQuickTask()}
              />
            </div>
            <Button onClick={addQuickTask} className="w-full">
              Adicionar Tarefa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Today's Tasks */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="size-5 text-primary" />
          <h2>Tarefas de Hoje</h2>
          <span className="ml-auto text-sm text-muted-foreground">
            {todayTasks.filter(t => t.completed).length}/{todayTasks.length}
          </span>
        </div>
        {todayTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="size-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma tarefa para hoje</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map(task => (
              <div
                key={task.id}
                className={`p-3 bg-muted/50 rounded-lg flex items-start gap-3 ${
                  task.completed ? 'opacity-50' : ''
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className={task.completed ? 'line-through' : ''}>{task.title}</p>
                  {task.projectId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {getProjectName(task.projectId)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Today's Deliveries */}
      {todayDeliveries.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-5 text-orange-500" />
            <h2>Entregas de Hoje</h2>
          </div>
          <div className="space-y-2">
            {todayDeliveries.map(project => (
              <div key={project.id} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div>{project.name}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getClientName(project.clientId)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    project.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                    project.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {project.status === 'in-progress' && 'Em progresso'}
                    {project.status === 'delivered' && 'Entregue'}
                    {project.status === 'planned' && 'Planeado'}
                    {project.status === 'paid' && 'Pago'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Today's Expected Payments */}
      {todayPayments.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="size-5 text-green-500" />
            <h2>Pagamentos Esperados Hoje</h2>
          </div>
          <div className="space-y-2">
            {todayPayments.map(payment => {
              const project = projects.find(p => p.id === payment.projectId);
              const client = project ? clients.find(c => c.id === project.clientId) : null;
              
              return (
                <div key={payment.id} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div>{project?.name || 'Projeto'}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {client?.name || 'Cliente'}
                      </p>
                    </div>
                    <div className="text-green-500">
                      {payment.amount} {userProfile.currency}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-green-500/50 hover:bg-green-500/10"
                    onClick={() => markPaymentAsPaid(payment.id)}
                  >
                    Marcar como Recebido
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {todayTasks.length === 0 && todayDeliveries.length === 0 && todayPayments.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="mb-2">Dia Livre!</h2>
          <p className="text-muted-foreground">
            Não tens tarefas, entregas ou pagamentos agendados para hoje.
          </p>
        </Card>
      )}
    </div>
  );
}
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { CheckSquare, Plus, Calendar, AlertCircle } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import type { Task, Project, Client } from '../App';

interface TasksViewProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  projects: Project[];
  clients: Client[];
}

export function TasksView({ tasks, setTasks, projects, clients }: TasksViewProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [projectId, setProjectId] = useState('');
  const [view, setView] = useState<'today' | 'week' | 'overdue' | 'all'>('all');

  const addTask = () => {
    if (!title.trim() || !deadline) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      deadline,
      projectId: projectId || undefined,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks([...tasks, newTask]);
    setTitle('');
    setDeadline('');
    setProjectId('');
    setIsAddingTask(false);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    const client = clients.find(c => c.id === project.clientId);
    return `${project.name} - ${client?.name || 'Cliente'}`;
  };

  const today = new Date().toISOString().split('T')[0];
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filteredTasks = tasks.filter(task => {
    if (view === 'today') return task.deadline === today;
    if (view === 'week') return task.deadline <= weekFromNow && task.deadline >= today;
    if (view === 'overdue') return task.deadline < today && !task.completed;
    return true;
  });

  const overdueTasks = tasks.filter(t => t.deadline < today && !t.completed);
  const todayTasks = tasks.filter(t => t.deadline === today && !t.completed);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1>Tarefas</h1>
          <p className="text-muted-foreground mt-1">
            {tasks.filter(t => !t.completed).length} pendente{tasks.filter(t => !t.completed).length !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nova
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
              <DialogDescription>Adiciona uma nova tarefa à tua lista</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="task-title">Título da tarefa *</Label>
                <Input
                  id="task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="O que precisas fazer?"
                />
              </div>
              <div>
                <Label htmlFor="task-deadline">Data limite *</Label>
                <Input
                  id="task-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="task-project">Projeto (opcional)</Label>
                <select
                  id="task-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                >
                  <option value="">Sem projeto</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={addTask} className="w-full" disabled={!title.trim() || !deadline}>
                Adicionar Tarefa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {(overdueTasks.length > 0 || todayTasks.length > 0) && (
        <div className="space-y-2">
          {overdueTasks.length > 0 && (
            <Card className="p-3 bg-destructive/10 border-destructive/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-destructive" />
                <span className="text-sm text-destructive">
                  {overdueTasks.length} tarefa{overdueTasks.length !== 1 ? 's' : ''} atrasada{overdueTasks.length !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-xs"
                  onClick={() => setView('overdue')}
                >
                  Ver
                </Button>
              </div>
            </Card>
          )}
          {todayTasks.length > 0 && (
            <Card className="p-3 bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-blue-500" />
                <span className="text-sm text-blue-500">
                  {todayTasks.length} tarefa{todayTasks.length !== 1 ? 's' : ''} para hoje
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-xs"
                  onClick={() => setView('today')}
                >
                  Ver
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={view === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('all')}
        >
          Todas
        </Button>
        <Button
          variant={view === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('today')}
        >
          Hoje
        </Button>
        <Button
          variant={view === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('week')}
        >
          Esta semana
        </Button>
        <Button
          variant={view === 'overdue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('overdue')}
        >
          Atrasadas
        </Button>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckSquare className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="mb-2">Nenhuma tarefa</h2>
          <p className="text-muted-foreground mb-4">
            {view === 'all' 
              ? 'Adiciona a tua primeira tarefa para começar.'
              : `Não tens tarefas para "${view === 'today' ? 'hoje' : view === 'week' ? 'esta semana' : 'atrasadas'}".`
            }
          </p>
          <Button onClick={() => setIsAddingTask(true)}>
            <Plus className="size-4 mr-2" />
            Adicionar Tarefa
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Incomplete tasks */}
          {filteredTasks.filter(t => !t.completed).length > 0 && (
            <div className="space-y-2">
              {filteredTasks
                .filter(t => !t.completed)
                .sort((a, b) => a.deadline.localeCompare(b.deadline))
                .map(task => {
                  const isOverdue = task.deadline < today;
                  const isToday = task.deadline === today;
                  
                  return (
                    <Card key={task.id} className={`p-4 ${
                      isOverdue ? 'border-destructive/50 bg-destructive/5' :
                      isToday ? 'border-blue-500/50 bg-blue-500/5' :
                      ''
                    }`}>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div>{task.title}</div>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <div className={`flex items-center gap-1 ${
                              isOverdue ? 'text-destructive' :
                              isToday ? 'text-blue-500' :
                              ''
                            }`}>
                              <Calendar className="size-3" />
                              {new Date(task.deadline).toLocaleDateString('pt-PT')}
                              {isOverdue && ' (atrasada)'}
                              {isToday && ' (hoje)'}
                            </div>
                            {task.projectId && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {getProjectName(task.projectId)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}

          {/* Completed tasks */}
          {filteredTasks.filter(t => t.completed).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm text-muted-foreground px-2">Concluídas</h3>
              {filteredTasks
                .filter(t => t.completed)
                .map(task => (
                  <Card key={task.id} className="p-4 opacity-60">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="line-through">{task.title}</div>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(task.deadline).toLocaleDateString('pt-PT')}
                          </div>
                          {task.projectId && (
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {getProjectName(task.projectId)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
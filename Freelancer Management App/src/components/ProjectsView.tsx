import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Briefcase, Plus, Star, Calendar, DollarSign, Filter } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import type { Project, Client, UserProfile } from '../App';

interface ProjectsViewProps {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  clients: Client[];
  userProfile: UserProfile;
}

export function ProjectsView({ projects, setProjects, clients, userProfile }: ProjectsViewProps) {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [expectedValue, setExpectedValue] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [status, setStatus] = useState<'planned' | 'in-progress' | 'delivered' | 'paid'>('planned');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const addProject = () => {
    if (!name.trim() || !clientId) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name,
      clientId,
      expectedValue: parseFloat(expectedValue) || 0,
      deliveryDate,
      status,
      isRecurring,
      isPriority,
      notes,
      createdAt: new Date().toISOString()
    };

    setProjects([...projects, newProject]);
    setName('');
    setClientId('');
    setExpectedValue('');
    setDeliveryDate('');
    setStatus('planned');
    setIsRecurring(false);
    setIsPriority(false);
    setNotes('');
    setIsAddingProject(false);
  };

  const updateProjectStatus = (projectId: string, newStatus: 'planned' | 'in-progress' | 'delivered' | 'paid') => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, status: newStatus } : p
    ));
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente';
  };

  const filteredProjects = projects.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const getDaysUntilDelivery = (deliveryDate: string) => {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1>Projetos</h1>
          <p className="text-muted-foreground mt-1">{projects.length} projeto{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Projeto</DialogTitle>
              <DialogDescription>Cria um novo projeto para um dos teus clientes</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Nome do projeto *</Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Website institucional"
                />
              </div>
              <div>
                <Label htmlFor="project-client">Cliente *</Label>
                <select
                  id="project-client"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                >
                  <option value="">Selecionar cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="project-value">Valor previsto ({userProfile.currency})</Label>
                <Input
                  id="project-value"
                  type="number"
                  value={expectedValue}
                  onChange={(e) => setExpectedValue(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="project-delivery">Data de entrega</Label>
                <Input
                  id="project-delivery"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="project-status">Estado</Label>
                <select
                  id="project-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                >
                  <option value="planned">Planeado</option>
                  <option value="in-progress">Em progresso</option>
                  <option value="delivered">Entregue</option>
                  <option value="paid">Pago</option>
                </select>
              </div>
              <div>
                <Label htmlFor="project-notes">Notas</Label>
                <Textarea
                  id="project-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Briefing, links, informações importantes..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="project-recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                />
                <Label htmlFor="project-recurring" className="cursor-pointer">
                  Projeto recorrente
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="project-priority"
                  checked={isPriority}
                  onCheckedChange={(checked) => setIsPriority(checked as boolean)}
                />
                <Label htmlFor="project-priority" className="cursor-pointer">
                  Marcar como prioridade
                </Label>
              </div>
              <Button onClick={addProject} className="w-full" disabled={!name.trim() || !clientId}>
                Adicionar Projeto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          Todos
        </Button>
        <Button
          variant={filterStatus === 'planned' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('planned')}
        >
          Planeados
        </Button>
        <Button
          variant={filterStatus === 'in-progress' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('in-progress')}
        >
          Em progresso
        </Button>
        <Button
          variant={filterStatus === 'delivered' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('delivered')}
        >
          Entregues
        </Button>
        <Button
          variant={filterStatus === 'paid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('paid')}
        >
          Pagos
        </Button>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="mb-2">Nenhum projeto</h2>
          <p className="text-muted-foreground mb-4">
            {filterStatus === 'all' 
              ? 'Adiciona o teu primeiro projeto para começar.'
              : `Não tens projetos com o estado "${filterStatus}".`
            }
          </p>
          {clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Adiciona primeiro um cliente na secção "Clientes"
            </p>
          ) : (
            <Button onClick={() => setIsAddingProject(true)}>
              <Plus className="size-4 mr-2" />
              Adicionar Projeto
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProjects
            .sort((a, b) => {
              if (a.isPriority && !b.isPriority) return -1;
              if (!a.isPriority && b.isPriority) return 1;
              return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
            })
            .map(project => {
              const daysUntil = project.deliveryDate ? getDaysUntilDelivery(project.deliveryDate) : null;
              
              return (
                <Card key={project.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3>{project.name}</h3>
                        {project.isPriority && (
                          <Star className="size-4 text-yellow-500 fill-yellow-500" />
                        )}
                        {project.isRecurring && (
                          <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded">
                            Recorrente
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getClientName(project.clientId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    {project.expectedValue > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="size-4" />
                        {project.expectedValue} {userProfile.currency}
                      </div>
                    )}
                    {project.deliveryDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        {new Date(project.deliveryDate).toLocaleDateString('pt-PT')}
                        {daysUntil !== null && (
                          <span className={`ml-1 ${
                            daysUntil < 0 ? 'text-red-500' :
                            daysUntil <= 3 ? 'text-orange-500' :
                            'text-muted-foreground'
                          }`}>
                            ({daysUntil < 0 ? `${Math.abs(daysUntil)}d atrasado` :
                              daysUntil === 0 ? 'hoje' :
                              daysUntil === 1 ? 'amanhã' :
                              `${daysUntil}d`})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {project.notes && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.notes}</p>
                  )}

                  <div className="flex gap-2">
                    <select
                      value={project.status}
                      onChange={(e) => updateProjectStatus(project.id, e.target.value as any)}
                      className={`flex-1 p-2 rounded-lg border text-sm ${
                        project.status === 'in-progress' ? 'bg-blue-500/10 border-blue-500/50 text-blue-500' :
                        project.status === 'delivered' ? 'bg-green-500/10 border-green-500/50 text-green-500' :
                        project.status === 'paid' ? 'bg-purple-500/10 border-purple-500/50 text-purple-500' :
                        'bg-muted border-border'
                      }`}
                    >
                      <option value="planned">Planeado</option>
                      <option value="in-progress">Em progresso</option>
                      <option value="delivered">Entregue</option>
                      <option value="paid">Pago</option>
                    </select>
                  </div>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Users, Plus, Star, Briefcase, Phone } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import type { Client, Project } from '../App';

interface ClientsViewProps {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  projects: Project[];
}

export function ClientsView({ clients, setClients, projects }: ClientsViewProps) {
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const addClient = () => {
    if (!name.trim()) return;

    const newClient: Client = {
      id: Date.now().toString(),
      name,
      contact,
      notes,
      isPriority,
      createdAt: new Date().toISOString()
    };

    setClients([...clients, newClient]);
    setName('');
    setContact('');
    setNotes('');
    setIsPriority(false);
    setIsAddingClient(false);
  };

  const getClientProjects = (clientId: string) => {
    return projects.filter(p => p.clientId === clientId);
  };

  const getActiveProjects = (clientId: string) => {
    return projects.filter(p => 
      p.clientId === clientId && 
      (p.status === 'in-progress' || p.status === 'planned')
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1>Clientes</h1>
          <p className="text-muted-foreground mt-1">{clients.length} cliente{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>Adiciona um novo cliente à tua lista</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client-name">Nome do cliente *</Label>
                <Input
                  id="client-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome da empresa ou pessoa"
                />
              </div>
              <div>
                <Label htmlFor="client-contact">Contacto</Label>
                <Input
                  id="client-contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Email, telefone, etc."
                />
              </div>
              <div>
                <Label htmlFor="client-notes">Notas</Label>
                <Textarea
                  id="client-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais, links, briefings..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="client-priority"
                  checked={isPriority}
                  onCheckedChange={(checked) => setIsPriority(checked as boolean)}
                />
                <Label htmlFor="client-priority" className="cursor-pointer">
                  Marcar como cliente prioritário
                </Label>
              </div>
              <Button onClick={addClient} className="w-full" disabled={!name.trim()}>
                Adicionar Cliente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients List */}
      {clients.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="mb-2">Nenhum cliente ainda</h2>
          <p className="text-muted-foreground mb-4">
            Adiciona o teu primeiro cliente para começar a organizar os teus projetos.
          </p>
          <Button onClick={() => setIsAddingClient(true)}>
            <Plus className="size-4 mr-2" />
            Adicionar Primeiro Cliente
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients
            .sort((a, b) => {
              if (a.isPriority && !b.isPriority) return -1;
              if (!a.isPriority && b.isPriority) return 1;
              return 0;
            })
            .map(client => {
              const clientProjects = getClientProjects(client.id);
              const activeProjects = getActiveProjects(client.id);
              const isExpanded = expandedClient === client.id;

              return (
                <Card key={client.id} className="overflow-hidden">
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3>{client.name}</h3>
                          {client.isPriority && (
                            <Star className="size-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        {client.contact && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Phone className="size-3" />
                            {client.contact}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Briefcase className="size-4" />
                            {clientProjects.length} projeto{clientProjects.length !== 1 ? 's' : ''}
                          </div>
                          {activeProjects.length > 0 && (
                            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded">
                              {activeProjects.length} ativo{activeProjects.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-border mt-2">
                      {client.notes && (
                        <div className="mt-3">
                          <Label className="text-xs">Notas</Label>
                          <p className="text-sm text-muted-foreground mt-1">{client.notes}</p>
                        </div>
                      )}
                      {clientProjects.length > 0 && (
                        <div className="mt-3">
                          <Label className="text-xs">Projetos</Label>
                          <div className="mt-2 space-y-2">
                            {clientProjects.slice(0, 3).map(project => (
                              <div key={project.id} className="p-2 bg-muted/50 rounded text-sm">
                                <div className="flex items-center justify-between">
                                  <span>{project.name}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    project.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                                    project.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                    project.status === 'paid' ? 'bg-purple-500/10 text-purple-500' :
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
                            {clientProjects.length > 3 && (
                              <p className="text-xs text-muted-foreground text-center">
                                +{clientProjects.length - 3} mais
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
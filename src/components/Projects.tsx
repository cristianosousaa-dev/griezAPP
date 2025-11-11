import { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { AppData, Project } from '../App';

interface ProjectsProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const projectColors = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-yellow-500 to-orange-500',
  'from-indigo-500 to-purple-500',
];

export function Projects({ data, setData }: ProjectsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filteredProjects = data.projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      color: projectColors[Math.floor(Math.random() * projectColors.length)],
    };
    setData({ ...data, projects: [...data.projects, newProject] });
    setShowAddModal(false);
  };

  const handleUpdateProject = (project: Project) => {
    setData({
      ...data,
      projects: data.projects.map(p => p.id === project.id ? project : p)
    });
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este projeto?')) {
      setData({
        ...data,
        projects: data.projects.filter(p => p.id !== id)
      });
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Procurar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
        >
          <option value="all">Todos estados</option>
          <option value="active">Ativo</option>
          <option value="on-hold">Em Pausa</option>
          <option value="completed">Concluído</option>
        </select>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Projeto</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProjects.map((project) => {
          const client = data.clients.find(c => c.id === project.clientId);
          const progress = (project.earned / project.budget) * 100;
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:border-white/20 transition-all group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${project.color} opacity-20 blur-3xl`} />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white text-lg mb-1">{project.name}</h3>
                    <p className="text-white/60 text-sm">{client?.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    project.status === 'active' ? 'bg-green-500/20 text-green-300' :
                    project.status === 'on-hold' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {project.status === 'active' ? 'Ativo' : project.status === 'on-hold' ? 'Em Pausa' : 'Concluído'}
                  </span>
                </div>

                {project.description && (
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">{project.description}</p>
                )}

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Progresso</span>
                    <span className="text-white">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${project.color}`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-white/60 text-sm">Ganho</p>
                    <p className="text-white text-lg">{project.earned.toFixed(0)}€</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-sm">Orçamento</p>
                    <p className="text-white text-lg">{project.budget.toFixed(0)}€</p>
                  </div>
                </div>

                {project.deadline && (
                  <p className="text-white/40 text-xs mt-3">
                    Prazo: {new Date(project.deadline).toLocaleDateString('pt-PT')}
                  </p>
                )}

                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 flex items-center justify-center gap-2 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 flex items-center justify-center gap-2 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Nenhum projeto encontrado</p>
        </div>
      )}

      {(showAddModal || editingProject) && (
        <ProjectModal
          project={editingProject}
          data={data}
          onSave={(project) => {
            if (editingProject) {
              handleUpdateProject(project as Project);
            } else {
              handleAddProject(project);
            }
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}

function ProjectModal({ project, data, onSave, onClose }: any) {
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: project?.name || '',
    clientId: project?.clientId || '',
    status: project?.status || 'active',
    budget: project?.budget || 0,
    earned: project?.earned || 0,
    deadline: project?.deadline || '',
    description: project?.description || '',
    color: project?.color || 'from-purple-500 to-pink-500',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(project ? { ...formData, id: project.id, color: project.color } : formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl text-white mb-6">
          {project ? 'Editar Projeto' : 'Novo Projeto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Nome do Projeto</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              required
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Cliente</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              required
            >
              <option value="">Selecionar cliente</option>
              {data.clients.map((client: any) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              >
                <option value="active">Ativo</option>
                <option value="on-hold">Em Pausa</option>
                <option value="completed">Concluído</option>
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Orçamento (€)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
                required
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Ganho (€)</label>
              <input
                type="number"
                value={formData.earned}
                onChange={(e) => setFormData({ ...formData, earned: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Prazo (opcional)</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Descrição (opcional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50 min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              {project ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

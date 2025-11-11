import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Plus, Search } from 'lucide-react';
import { AppData, Task } from '../App';

interface TasksProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export function Tasks({ data, setData }: TasksProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredTasks = data.tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTask = (task: Omit<Task, 'id'>) => {
    setData({
      ...data,
      tasks: [...data.tasks, { ...task, id: Date.now().toString() }]
    });
    setShowAddModal(false);
  };

  const handleToggleTask = (id: string) => {
    setData({
      ...data,
      tasks: data.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    });
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Procurar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const project = data.projects.find(p => p.id === task.projectId);
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-white/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    task.completed ? 'bg-green-500 border-green-500' : 'border-white/20'
                  }`}
                >
                  {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1">
                  <p className={`text-white mb-1 ${task.completed ? 'line-through opacity-60' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span>{project?.name}</span>
                    {task.dueDate && (
                      <>
                        <span>•</span>
                        <span>{new Date(task.dueDate).toLocaleDateString('pt-PT')}</span>
                      </>
                    )}
                    <span className={`px-2 py-0.5 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                      task.priority === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showAddModal && (
        <TaskModal data={data} onSave={handleAddTask} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function TaskModal({ data, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    completed: false,
    priority: 'medium' as Task['priority'],
    dueDate: '',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 p-6"
      >
        <h2 className="text-2xl text-white mb-6">Nova Tarefa</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Projeto</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              required
            >
              <option value="">Selecionar projeto</option>
              {data.projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Prazo</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Criar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Plus, TrendingUp, Users, Briefcase, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { AppData, Goal } from '../App';

interface GoalsProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const goalIcons = {
  revenue: DollarSign,
  clients: Users,
  projects: Briefcase,
  savings: TrendingUp,
};

const goalColors = {
  revenue: 'from-green-500 to-emerald-500',
  clients: 'from-blue-500 to-cyan-500',
  projects: 'from-purple-500 to-pink-500',
  savings: 'from-orange-500 to-red-500',
};

export function Goals({ data, setData }: GoalsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const activeGoals = data.goals.filter(goal => 
    new Date(goal.deadline) >= new Date()
  );

  const completedGoals = data.goals.filter(goal => 
    goal.currentAmount >= goal.targetAmount
  );

  const handleAddGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
    };
    setData({ ...data, goals: [...data.goals, newGoal] });
    setShowAddModal(false);
  };

  const handleUpdateGoal = (goal: Goal) => {
    setData({
      ...data,
      goals: data.goals.map(g => g.id === goal.id ? goal : g)
    });
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta meta?')) {
      setData({
        ...data,
        goals: data.goals.filter(g => g.id !== id)
      });
    }
  };

  // Calculate current amounts based on real data
  const calculateCurrentAmount = (goal: Goal) => {
    switch (goal.type) {
      case 'revenue':
        return data.payments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);
      case 'clients':
        return data.clients.filter(c => c.status === 'active').length;
      case 'projects':
        return data.projects.filter(p => p.status === 'completed').length;
      case 'savings':
        const totalRevenue = data.payments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);
        const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
        return totalRevenue - totalExpenses;
      default:
        return goal.currentAmount;
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Metas Ativas</p>
            <Target className="w-5 h-5 text-purple-300" />
          </div>
          <p className="text-3xl text-white">{activeGoals.length}</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-400/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Concluídas</p>
            <TrendingUp className="w-5 h-5 text-green-300" />
          </div>
          <p className="text-3xl text-white">{completedGoals.length}</p>
        </div>
      </div>

      {/* Add Goal Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>Adicionar Nova Meta</span>
      </button>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.goals.map((goal) => {
          const currentAmount = calculateCurrentAmount(goal);
          const progress = Math.min((currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = currentAmount >= goal.targetAmount;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          return (
            <GoalCard
              key={goal.id}
              goal={{ ...goal, currentAmount }}
              progress={progress}
              isCompleted={isCompleted}
              daysLeft={daysLeft}
              onEdit={() => setEditingGoal(goal)}
              onDelete={() => handleDeleteGoal(goal.id)}
            />
          );
        })}
      </div>

      {data.goals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-4">Nenhuma meta definida</p>
          <p className="text-white/40 text-sm">Defina metas para acompanhar o seu progresso!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingGoal) && (
        <GoalModal
          goal={editingGoal}
          onSave={(goal) => {
            if (editingGoal) {
              handleUpdateGoal(goal as Goal);
            } else {
              handleAddGoal(goal);
            }
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
}

function GoalCard({ goal, progress, isCompleted, daysLeft, onEdit, onDelete }: any) {
  const Icon = goalIcons[goal.type as keyof typeof goalIcons];
  const gradient = goalColors[goal.type as keyof typeof goalColors];

  const getTypeLabel = (type: string) => {
    const labels = {
      revenue: 'Receita',
      clients: 'Clientes',
      projects: 'Projetos',
      savings: 'Poupança',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatValue = (type: string, value: number) => {
    if (type === 'revenue' || type === 'savings') {
      return `${value.toFixed(0)}€`;
    }
    return value.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border p-5 group transition-all ${
        isCompleted 
          ? 'bg-green-500/10 border-green-400/30' 
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
    >
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradient} opacity-20 blur-3xl`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white mb-1">{goal.title}</h3>
              <p className="text-white/60 text-sm">{getTypeLabel(goal.type)}</p>
            </div>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              <Edit2 className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/60">Progresso</span>
            <span className="text-white">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${gradient}`}
            />
          </div>
        </div>

        {/* Values */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-white/60 text-sm mb-1">Atual</p>
            <p className="text-2xl text-white">{formatValue(goal.type, goal.currentAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm mb-1">Meta</p>
            <p className="text-xl text-white/80">{formatValue(goal.type, goal.targetAmount)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm">
            {isCompleted ? (
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full">
                ✓ Concluída
              </span>
            ) : daysLeft > 0 ? (
              <span className="text-white/60">
                {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} restantes
              </span>
            ) : (
              <span className="text-red-400">Expirada</span>
            )}
          </div>
          <p className="text-white/40 text-xs">
            {new Date(goal.deadline).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function GoalModal({ goal, onSave, onClose }: any) {
  const [formData, setFormData] = useState<Omit<Goal, 'id'>>({
    title: goal?.title || '',
    type: goal?.type || 'revenue',
    targetAmount: goal?.targetAmount || 0,
    currentAmount: goal?.currentAmount || 0,
    deadline: goal?.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    color: goal?.color || 'from-purple-500 to-pink-500',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(goal ? { ...formData, id: goal.id } : formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 p-6"
      >
        <h2 className="text-2xl text-white mb-6">
          {goal ? 'Editar Meta' : 'Nova Meta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
              required
              placeholder="Ex: Ganhar 10.000€ este trimestre"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Tipo de Meta</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
            >
              <option value="revenue">Receita</option>
              <option value="clients">Clientes</option>
              <option value="projects">Projetos Concluídos</option>
              <option value="savings">Poupança</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">
                Valor Meta {(formData.type === 'revenue' || formData.type === 'savings') && '(€)'}
              </label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
                required
                step={formData.type === 'revenue' || formData.type === 'savings' ? '0.01' : '1'}
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Prazo</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
                required
              />
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
            <p className="text-blue-300 text-sm">
              ℹ️ O valor atual será calculado automaticamente com base nos seus dados
              {formData.type === 'revenue' && ' (pagamentos recebidos)'}
              {formData.type === 'clients' && ' (clientes ativos)'}
              {formData.type === 'projects' && ' (projetos concluídos)'}
              {formData.type === 'savings' && ' (receita - despesas)'}
            </p>
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
              {goal ? 'Atualizar' : 'Criar Meta'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

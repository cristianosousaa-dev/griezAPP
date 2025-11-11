import { useState } from 'react';
import { motion } from 'motion/react';
import { Receipt, Plus, Search, TrendingDown, PieChart, Calendar } from 'lucide-react';
import { AppData, Expense } from '../App';

interface ExpensesProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const categoryConfig = {
  equipment: { label: 'Equipamento', color: 'from-blue-500 to-cyan-500' },
  software: { label: 'Software', color: 'from-purple-500 to-pink-500' },
  marketing: { label: 'Marketing', color: 'from-orange-500 to-red-500' },
  office: { label: 'Escritório', color: 'from-green-500 to-emerald-500' },
  transport: { label: 'Transporte', color: 'from-yellow-500 to-orange-500' },
  education: { label: 'Educação', color: 'from-indigo-500 to-purple-500' },
  other: { label: 'Outros', color: 'from-gray-500 to-slate-500' },
};

export function Expenses({ data, setData }: ExpensesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredExpenses = data.expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    const matchesMonth = filterMonth === 'all' || expense.date.startsWith(filterMonth);
    return matchesSearch && matchesCategory && matchesMonth;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const deductibleExpenses = filteredExpenses.filter(exp => exp.deductible).reduce((sum, exp) => sum + exp.amount, 0);
  const totalTax = filteredExpenses.reduce((sum, exp) => sum + exp.tax, 0);

  const expensesByCategory = Object.keys(categoryConfig).map(category => ({
    category,
    total: data.expenses.filter(exp => exp.category === category).reduce((sum, exp) => sum + exp.amount, 0)
  })).filter(item => item.total > 0);

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setData({ ...data, expenses: [...data.expenses, newExpense] });
    setShowAddModal(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta despesa?')) {
      setData({
        ...data,
        expenses: data.expenses.filter(exp => exp.id !== id)
      });
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Despesas"
          value={`${totalExpenses.toFixed(0)}€`}
          icon={TrendingDown}
          gradient="from-red-500 to-pink-500"
        />
        <StatCard
          title="Dedutíveis"
          value={`${deductibleExpenses.toFixed(0)}€`}
          icon={PieChart}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="IVA Total"
          value={`${totalTax.toFixed(0)}€`}
          icon={Receipt}
          gradient="from-orange-500 to-red-500"
        />
        <StatCard
          title="Nº Despesas"
          value={filteredExpenses.length.toString()}
          icon={Calendar}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Category Breakdown */}
      {expensesByCategory.length > 0 && (
        <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <h3 className="text-white mb-4">Despesas por Categoria</h3>
          <div className="space-y-2">
            {expensesByCategory.map(({ category, total }) => {
              const config = categoryConfig[category as keyof typeof categoryConfig];
              const percentage = (total / totalExpenses) * 100;
              
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">{config.label}</span>
                    <span className="text-white">{total.toFixed(0)}€ ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${config.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Procurar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
        >
          <option value="all">Todas categorias</option>
          {Object.entries(categoryConfig).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nova Despesa</span>
        </button>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            data={data}
            onDelete={() => handleDeleteExpense(expense.id)}
          />
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Nenhuma despesa encontrada</p>
        </div>
      )}

      {showAddModal && (
        <AddExpenseModal
          data={data}
          onSave={handleAddExpense}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, gradient }: any) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white/60 text-sm">{title}</p>
          <Icon className="w-5 h-5 text-white/40" />
        </div>
        <p className="text-2xl text-white">{value}</p>
      </div>
    </div>
  );
}

function ExpenseCard({ expense, data, onDelete }: any) {
  const config = categoryConfig[expense.category as keyof typeof categoryConfig];
  const project = data.projects.find((p: any) => p.id === expense.projectId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 hover:border-white/20 transition-all group"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.color} opacity-10 blur-3xl`} />
      
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white">{expense.description}</h3>
            {expense.deductible && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full">
                Dedutível
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-white/60">
            <span className={`px-2 py-1 rounded-lg bg-gradient-to-r ${config.color} bg-opacity-20 text-white/80`}>
              {config.label}
            </span>
            <span>{new Date(expense.date).toLocaleDateString('pt-PT')}</span>
            {project && <span>• {project.name}</span>}
          </div>

          {expense.tax > 0 && (
            <p className="text-white/40 text-xs mt-2">
              IVA: {expense.tax.toFixed(2)}€
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-2xl text-white mb-2">{expense.amount.toFixed(2)}€</p>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm transition-all opacity-0 group-hover:opacity-100"
          >
            Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AddExpenseModal({ data, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'other' as Expense['category'],
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    tax: 0,
    deductible: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 p-6"
      >
        <h2 className="text-2xl text-white mb-6">Nova Despesa</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              >
                {Object.entries(categoryConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Valor (€)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
                required
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">IVA (€)</label>
              <input
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Projeto (opcional)</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
            >
              <option value="">Sem projeto associado</option>
              {data.projects.map((project: any) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="deductible"
              checked={formData.deductible}
              onChange={(e) => setFormData({ ...formData, deductible: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/5"
            />
            <label htmlFor="deductible" className="text-white/80 text-sm">
              Despesa dedutível em IRS
            </label>
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
              Adicionar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

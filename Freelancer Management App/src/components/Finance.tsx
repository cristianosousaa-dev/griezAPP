import { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { AppData, Payment } from '../App';

interface FinanceProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export function Finance({ data, setData }: FinanceProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const totalPaid = data.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = data.payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalPaid - totalExpenses;

  const handleAddPayment = (payment: Omit<Payment, 'id'>) => {
    setData({
      ...data,
      payments: [...data.payments, { ...payment, id: Date.now().toString() }]
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-400/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Recebido</p>
            <TrendingUp className="w-5 h-5 text-green-300" />
          </div>
          <p className="text-3xl text-white">{totalPaid.toFixed(0)}€</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-400/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Pendente</p>
            <DollarSign className="w-5 h-5 text-orange-300" />
          </div>
          <p className="text-3xl text-white">{totalPending.toFixed(0)}€</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl border border-red-400/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Despesas</p>
            <TrendingDown className="w-5 h-5 text-red-300" />
          </div>
          <p className="text-3xl text-white">{totalExpenses.toFixed(0)}€</p>
        </div>

        <div className={`p-5 bg-gradient-to-br ${profit >= 0 ? 'from-blue-500/20 to-cyan-500/20 border-blue-400/30' : 'from-red-500/20 to-pink-500/20 border-red-400/30'} backdrop-blur-xl border rounded-2xl`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Lucro</p>
            <DollarSign className="w-5 h-5 text-white/40" />
          </div>
          <p className={`text-3xl text-white ${profit < 0 ? 'text-red-400' : ''}`}>{profit.toFixed(0)}€</p>
        </div>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>Novo Pagamento</span>
      </button>

      <div className="space-y-3">
        {data.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => {
          const project = data.projects.find(p => p.id === payment.projectId);
          return (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white mb-1">{project?.name || 'Pagamento'}</p>
                  <p className="text-white/60 text-sm">{new Date(payment.date).toLocaleDateString('pt-PT')}</p>
                  {payment.description && <p className="text-white/40 text-xs mt-1">{payment.description}</p>}
                </div>
                <div className="text-right">
                  <p className="text-2xl text-white mb-1">{payment.amount.toFixed(0)}€</p>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    payment.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                    payment.status === 'pending' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {payment.status === 'paid' ? 'Pago' : payment.status === 'pending' ? 'Pendente' : 'Atrasado'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showAddModal && (
        <PaymentModal data={data} onSave={handleAddPayment} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function PaymentModal({ data, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    projectId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as Payment['status'],
    description: '',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 p-6"
      >
        <h2 className="text-2xl text-white mb-6">Novo Pagamento</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
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
              <label className="block text-white/60 text-sm mb-2">Valor (€)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
                required
                step="0.01"
              />
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
          <div>
            <label className="block text-white/60 text-sm mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Atrasado</option>
            </select>
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Descrição (opcional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50 min-h-[80px]"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Adicionar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

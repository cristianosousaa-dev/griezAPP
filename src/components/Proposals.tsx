import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Plus, Search, Send, CheckCircle, XCircle, FileText, Calendar } from 'lucide-react';
import { AppData, Proposal } from '../App';

interface ProposalsProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export function Proposals({ data, setData }: ProposalsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredProposals = data.proposals.filter(proposal => {
    const client = data.clients.find(c => c.id === proposal.clientId);
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalProposed = data.proposals.reduce((sum, p) => sum + p.amount, 0);
  const acceptedAmount = data.proposals
    .filter(p => p.status === 'accepted')
    .reduce((sum, p) => sum + p.amount, 0);
  const winRate = data.proposals.length > 0 
    ? (data.proposals.filter(p => p.status === 'accepted').length / data.proposals.length) * 100 
    : 0;

  const handleCreateProposal = (proposal: Omit<Proposal, 'id'>) => {
    const newProposal: Proposal = {
      ...proposal,
      id: Date.now().toString(),
    };
    setData({ ...data, proposals: [...data.proposals, newProposal] });
    setShowCreateModal(false);
  };

  const handleUpdateStatus = (proposalId: string, status: Proposal['status']) => {
    setData({
      ...data,
      proposals: data.proposals.map(prop =>
        prop.id === proposalId ? { ...prop, status } : prop
      )
    });
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Proposto"
          value={`${totalProposed.toFixed(0)}€`}
          icon={TrendingUp}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Aceites"
          value={`${acceptedAmount.toFixed(0)}€`}
          icon={CheckCircle}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Taxa de Sucesso"
          value={`${winRate.toFixed(0)}%`}
          icon={TrendingUp}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Propostas"
          value={data.proposals.length.toString()}
          icon={FileText}
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Procurar propostas..."
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
          <option value="draft">Rascunho</option>
          <option value="sent">Enviadas</option>
          <option value="accepted">Aceites</option>
          <option value="rejected">Rejeitadas</option>
        </select>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nova Proposta</span>
        </button>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProposals.map((proposal) => {
          const client = data.clients.find(c => c.id === proposal.clientId);
          return (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              client={client}
              onUpdateStatus={handleUpdateStatus}
            />
          );
        })}
      </div>

      {filteredProposals.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Nenhuma proposta encontrada</p>
        </div>
      )}

      {showCreateModal && (
        <CreateProposalModal
          data={data}
          onSave={handleCreateProposal}
          onClose={() => setShowCreateModal(false)}
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

function ProposalCard({ proposal, client, onUpdateStatus }: any) {
  const statusConfig = {
    draft: { label: 'Rascunho', color: 'bg-gray-500/20 text-gray-300', gradient: 'from-gray-500 to-slate-500' },
    sent: { label: 'Enviada', color: 'bg-blue-500/20 text-blue-300', gradient: 'from-blue-500 to-cyan-500' },
    accepted: { label: 'Aceite', color: 'bg-green-500/20 text-green-300', gradient: 'from-green-500 to-emerald-500' },
    rejected: { label: 'Rejeitada', color: 'bg-red-500/20 text-red-300', gradient: 'from-red-500 to-pink-500' },
  };

  const status = statusConfig[proposal.status];
  const daysUntilExpiry = Math.ceil((new Date(proposal.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:border-white/20 transition-all"
    >
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${status.gradient} opacity-10 blur-3xl`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white text-lg mb-1">{proposal.title}</h3>
            <p className="text-white/60 text-sm">{client?.name || 'Cliente desconhecido'}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {proposal.amount.toFixed(0)}€
          </p>
        </div>

        {/* Description */}
        <p className="text-white/60 text-sm mb-4 line-clamp-2">{proposal.description}</p>

        {/* Deliverables */}
        {proposal.deliverables.length > 0 && (
          <div className="mb-4">
            <p className="text-white/40 text-xs mb-2">Entregas:</p>
            <div className="space-y-1">
              {proposal.deliverables.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="line-clamp-1">{item}</span>
                </div>
              ))}
              {proposal.deliverables.length > 3 && (
                <p className="text-white/40 text-xs">+{proposal.deliverables.length - 3} mais</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-sm">
            <p className="text-white/40">
              {daysUntilExpiry > 0 ? `Válida por ${daysUntilExpiry} dias` : 'Expirada'}
            </p>
          </div>

          <div className="flex gap-2">
            {proposal.status === 'draft' && (
              <button
                onClick={() => onUpdateStatus(proposal.id, 'sent')}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-all"
              >
                <Send className="w-4 h-4 text-blue-300" />
              </button>
            )}
            {proposal.status === 'sent' && (
              <>
                <button
                  onClick={() => onUpdateStatus(proposal.id, 'accepted')}
                  className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-all"
                >
                  <CheckCircle className="w-4 h-4 text-green-300" />
                </button>
                <button
                  onClick={() => onUpdateStatus(proposal.id, 'rejected')}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                >
                  <XCircle className="w-4 h-4 text-red-300" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreateProposalModal({ data, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    amount: 0,
    status: 'draft' as Proposal['status'],
    createdDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    scope: [''],
    deliverables: [''],
  });

  const addItem = (field: 'scope' | 'deliverables') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const updateItem = (field: 'scope' | 'deliverables', index: number, value: string) => {
    const newItems = [...formData[field]];
    newItems[index] = value;
    setFormData({ ...formData, [field]: newItems });
  };

  const removeItem = (field: 'scope' | 'deliverables', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      scope: formData.scope.filter(s => s.trim()),
      deliverables: formData.deliverables.filter(d => d.trim()),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl text-white mb-6">Nova Proposta</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Título da Proposta</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Data de Criação</label>
              <input
                type="date"
                value={formData.createdDate}
                onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
                required
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Válida Até</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50 min-h-[100px]"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/60 text-sm">Entregas</label>
              <button
                type="button"
                onClick={() => addItem('deliverables')}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm transition-all"
              >
                + Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {formData.deliverables.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateItem('deliverables', index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/50"
                    placeholder="Descreva uma entrega..."
                  />
                  {formData.deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('deliverables', index)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-all"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              Criar Proposta
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

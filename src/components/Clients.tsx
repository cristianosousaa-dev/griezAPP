import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Search, Mail, Phone, Building, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { AppData, Client } from '../App';

interface ClientsProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export function Clients({ data, setData }: ClientsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = data.clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClients = data.clients.filter(c => c.status === 'active');
  const totalRevenue = data.clients.reduce((sum, c) => sum + c.totalPaid, 0);

  const handleAddClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
    };
    setData({ ...data, clients: [...data.clients, newClient] });
    setShowAddModal(false);
  };

  const handleUpdateClient = (client: Client) => {
    setData({
      ...data,
      clients: data.clients.map(c => c.id === client.id ? client : c)
    });
    setEditingClient(null);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este cliente?')) {
      setData({
        ...data,
        clients: data.clients.filter(c => c.id !== id)
      });
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Total Clientes</p>
            <Users className="w-5 h-5 text-purple-300" />
          </div>
          <p className="text-3xl text-white mb-1">{data.clients.length}</p>
          <p className="text-white/60 text-sm">{activeClients.length} ativos</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-400/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Receita Total</p>
            <TrendingUp className="w-5 h-5 text-green-300" />
          </div>
          <p className="text-3xl text-white">{totalRevenue.toFixed(0)}€</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl lg:col-span-1 col-span-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Projetos Totais</p>
            <Building className="w-5 h-5 text-blue-300" />
          </div>
          <p className="text-3xl text-white">{data.clients.reduce((sum, c) => sum + c.projectsCount, 0)}</p>
        </div>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Procurar clientes..."
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
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredClients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={() => setEditingClient(client)}
            onDelete={() => handleDeleteClient(client.id)}
          />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Nenhum cliente encontrado</p>
        </div>
      )}

      {(showAddModal || editingClient) && (
        <ClientModal
          client={editingClient}
          onSave={(client) => {
            if (editingClient) {
              handleUpdateClient(client as Client);
            } else {
              handleAddClient(client);
            }
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
}

function ClientCard({ client, onEdit, onDelete }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:border-white/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-lg">{client.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="text-white mb-1">{client.name}</h3>
            {client.company && <p className="text-white/60 text-sm">{client.company}</p>}
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs ${
          client.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
        }`}>
          {client.status === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Mail className="w-4 h-4" />
          <span>{client.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Phone className="w-4 h-4" />
          <span>{client.phone}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div>
          <p className="text-white/60 text-sm">Total Pago</p>
          <p className="text-white text-lg">{client.totalPaid.toFixed(0)}€</p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-sm">Projetos</p>
          <p className="text-white text-lg">{client.projectsCount}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 flex items-center justify-center gap-2 transition-all"
        >
          <Edit2 className="w-4 h-4" />
          <span>Editar</span>
        </button>
        <button
          onClick={onDelete}
          className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 flex items-center justify-center gap-2 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>Eliminar</span>
        </button>
      </div>
    </motion.div>
  );
}

function ClientModal({ client, onSave, onClose }: any) {
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
    status: client?.status || 'active',
    totalPaid: client?.totalPaid || 0,
    projectsCount: client?.projectsCount || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(client ? { ...formData, id: client.id } : formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 p-6"
      >
        <h2 className="text-2xl text-white mb-6">
          {client ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              required
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              required
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Telefone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              required
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Empresa (opcional)</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
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
              {client ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

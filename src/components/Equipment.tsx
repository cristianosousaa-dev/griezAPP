import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, Plus, Search, Filter, Edit2, Trash2, 
  Monitor, Camera, Mic, Code, Armchair, MoreHorizontal,
  TrendingDown, Wrench, Calendar, DollarSign
} from 'lucide-react';
import { AppData, EquipmentItem, MaintenanceRecord } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EquipmentProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const categoryIcons = {
  computer: Monitor,
  camera: Camera,
  audio: Mic,
  software: Code,
  furniture: Armchair,
  other: Package,
};

const categoryColors = {
  computer: 'from-blue-500 to-cyan-500',
  camera: 'from-purple-500 to-pink-500',
  audio: 'from-orange-500 to-red-500',
  software: 'from-green-500 to-emerald-500',
  furniture: 'from-yellow-500 to-orange-500',
  other: 'from-gray-500 to-slate-500',
};

export function Equipment({ data, setData }: EquipmentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);

  const filteredEquipment = data.equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalValue = data.equipment.reduce((sum, item) => sum + item.currentValue, 0);
  const totalInvestment = data.equipment.reduce((sum, item) => sum + item.purchasePrice, 0);
  const totalDepreciation = totalInvestment - totalValue;
  const activeEquipment = data.equipment.filter(item => item.status === 'active').length;

  const handleAddEquipment = (item: Omit<EquipmentItem, 'id'>) => {
    const newItem: EquipmentItem = {
      ...item,
      id: Date.now().toString(),
    };
    setData({ ...data, equipment: [...data.equipment, newItem] });
    setShowAddModal(false);
  };

  const handleUpdateEquipment = (item: EquipmentItem) => {
    setData({
      ...data,
      equipment: data.equipment.map(e => e.id === item.id ? item : e)
    });
    setEditingItem(null);
  };

  const handleDeleteEquipment = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este equipamento?')) {
      setData({
        ...data,
        equipment: data.equipment.filter(e => e.id !== id)
      });
    }
  };

  const handleAddMaintenance = (equipmentId: string, record: Omit<MaintenanceRecord, 'id'>) => {
    setData({
      ...data,
      equipment: data.equipment.map(item => 
        item.id === equipmentId 
          ? {
              ...item,
              maintenanceHistory: [
                ...(item.maintenanceHistory || []),
                { ...record, id: Date.now().toString() }
              ]
            }
          : item
      )
    });
    setShowMaintenanceModal(false);
    setSelectedEquipment(null);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Valor Total"
          value={`${totalValue.toFixed(0)}€`}
          subtitle={`de ${totalInvestment.toFixed(0)}€`}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Depreciação"
          value={`${totalDepreciation.toFixed(0)}€`}
          subtitle={`${((totalDepreciation / totalInvestment) * 100 || 0).toFixed(0)}%`}
          icon={TrendingDown}
          gradient="from-orange-500 to-red-500"
        />
        <StatCard
          title="Equipamentos"
          value={data.equipment.length.toString()}
          subtitle={`${activeEquipment} ativos`}
          icon={Package}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Manutenções"
          value={data.equipment.reduce((sum, item) => sum + (item.maintenanceHistory?.length || 0), 0).toString()}
          subtitle="Registos totais"
          icon={Wrench}
          gradient="from-blue-500 to-cyan-500"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Procurar equipamento..."
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
          <option value="computer">Computadores</option>
          <option value="camera">Câmeras</option>
          <option value="audio">Áudio</option>
          <option value="software">Software</option>
          <option value="furniture">Mobília</option>
          <option value="other">Outros</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
        >
          <option value="all">Todos estados</option>
          <option value="active">Ativo</option>
          <option value="maintenance">Manutenção</option>
          <option value="sold">Vendido</option>
          <option value="retired">Retirado</option>
        </select>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((item) => (
          <EquipmentCard
            key={item.id}
            item={item}
            onEdit={() => setEditingItem(item)}
            onDelete={() => handleDeleteEquipment(item.id)}
            onAddMaintenance={() => {
              setSelectedEquipment(item);
              setShowMaintenanceModal(true);
            }}
          />
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Nenhum equipamento encontrado</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 transition-all"
          >
            Adicionar primeiro equipamento
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <EquipmentModal
          item={editingItem}
          onSave={(item) => {
            if (editingItem) {
              handleUpdateEquipment(item as EquipmentItem);
            } else {
              handleAddEquipment(item);
            }
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedEquipment && (
        <MaintenanceModal
          equipment={selectedEquipment}
          onSave={(record) => handleAddMaintenance(selectedEquipment.id, record)}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedEquipment(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, gradient }: any) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white/60 text-sm">{title}</p>
          <Icon className="w-5 h-5 text-white/40" />
        </div>
        <p className="text-2xl text-white mb-1">{value}</p>
        <p className="text-white/40 text-xs">{subtitle}</p>
      </div>
    </div>
  );
}

function EquipmentCard({ item, onEdit, onDelete, onAddMaintenance }: any) {
  const Icon = categoryIcons[item.category];
  const gradient = categoryColors[item.category];
  const depreciationPercent = ((item.purchasePrice - item.currentValue) / item.purchasePrice) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 hover:border-white/20 transition-all group"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-3xl`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onAddMaintenance}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Wrench className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Edit2 className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-white mb-1">{item.name}</h3>
        <p className="text-white/40 text-sm mb-3">
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </p>

        {/* Stats */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Valor Atual</span>
            <span className="text-white">{item.currentValue.toFixed(0)}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Compra</span>
            <span className="text-white/40">{item.purchasePrice.toFixed(0)}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Depreciação</span>
            <span className={depreciationPercent > 50 ? 'text-red-400' : 'text-orange-400'}>
              {depreciationPercent.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs ${
            item.status === 'active' ? 'bg-green-500/20 text-green-300' :
            item.status === 'maintenance' ? 'bg-orange-500/20 text-orange-300' :
            item.status === 'sold' ? 'bg-blue-500/20 text-blue-300' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {item.status === 'active' ? 'Ativo' :
             item.status === 'maintenance' ? 'Manutenção' :
             item.status === 'sold' ? 'Vendido' : 'Retirado'}
          </span>
          
          {item.maintenanceHistory && item.maintenanceHistory.length > 0 && (
            <span className="text-xs text-white/40">
              {item.maintenanceHistory.length} manutenções
            </span>
          )}
        </div>

        {item.notes && (
          <p className="mt-3 text-sm text-white/40 line-clamp-2">{item.notes}</p>
        )}
      </div>
    </motion.div>
  );
}

function EquipmentModal({ item, onSave, onClose }: any) {
  const [formData, setFormData] = useState<Omit<EquipmentItem, 'id'>>({
    name: item?.name || '',
    category: item?.category || 'computer',
    purchaseDate: item?.purchaseDate || new Date().toISOString().split('T')[0],
    purchasePrice: item?.purchasePrice || 0,
    currentValue: item?.currentValue || 0,
    status: item?.status || 'active',
    notes: item?.notes || '',
    maintenanceHistory: item?.maintenanceHistory || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item ? { ...formData, id: item.id } : formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl text-white mb-6">
          {item ? 'Editar Equipamento' : 'Novo Equipamento'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
              required
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Categoria</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
            >
              <option value="computer">Computador</option>
              <option value="camera">Câmera</option>
              <option value="audio">Áudio</option>
              <option value="software">Software</option>
              <option value="furniture">Mobília</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Data de Compra</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
                required
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              >
                <option value="active">Ativo</option>
                <option value="maintenance">Manutenção</option>
                <option value="sold">Vendido</option>
                <option value="retired">Retirado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Preço de Compra (€)</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
                required
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Valor Atual (€)</label>
              <input
                type="number"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
                required
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50 min-h-[100px]"
              placeholder="Especificações, garantia, etc..."
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
              {item ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function MaintenanceModal({ equipment, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    cost: 0,
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
        className="w-full max-w-md bg-slate-900 rounded-2xl border border-white/10 p-6"
      >
        <h2 className="text-2xl text-white mb-2">Adicionar Manutenção</h2>
        <p className="text-white/60 mb-6">{equipment.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-white/60 text-sm mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50 min-h-[100px]"
              placeholder="O que foi feito?"
              required
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Custo (€)</label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
              required
              step="0.01"
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
              Adicionar
            </button>
          </div>
        </form>

        {/* Maintenance History */}
        {equipment.maintenanceHistory && equipment.maintenanceHistory.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-white/80 mb-3">Histórico de Manutenções</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {equipment.maintenanceHistory.map((record: MaintenanceRecord) => (
                <div key={record.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white text-sm">{record.description}</span>
                    <span className="text-white/60 text-xs">{record.cost.toFixed(0)}€</span>
                  </div>
                  <span className="text-white/40 text-xs">
                    {new Date(record.date).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

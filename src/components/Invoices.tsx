import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Plus, Search, Download, Eye, Send, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { AppData, Invoice, InvoiceItem } from '../App';

interface InvoicesProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export function Invoices({ data, setData }: InvoicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredInvoices = data.invoices.filter(invoice => {
    const client = data.clients.find(c => c.id === invoice.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = data.invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);
  
  const pendingAmount = data.invoices
    .filter(i => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0);

  const handleCreateInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
    };
    setData({ ...data, invoices: [...data.invoices, newInvoice] });
    setShowCreateModal(false);
  };

  const handleUpdateStatus = (invoiceId: string, status: Invoice['status']) => {
    setData({
      ...data,
      invoices: data.invoices.map(inv =>
        inv.id === invoiceId ? { ...inv, status } : inv
      )
    });
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Faturado"
          value={`${totalRevenue.toFixed(0)}€`}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Por Receber"
          value={`${pendingAmount.toFixed(0)}€`}
          icon={Clock}
          gradient="from-orange-500 to-red-500"
        />
        <StatCard
          title="Pagas"
          value={data.invoices.filter(i => i.status === 'paid').length.toString()}
          icon={CheckCircle}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Pendentes"
          value={data.invoices.filter(i => i.status !== 'paid' && i.status !== 'draft').length.toString()}
          icon={AlertCircle}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Procurar faturas..."
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
          <option value="paid">Pagas</option>
          <option value="overdue">Atrasadas</option>
        </select>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nova Fatura</span>
        </button>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices.map((invoice) => {
          const client = data.clients.find(c => c.id === invoice.clientId);
          return (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              client={client}
              onUpdateStatus={handleUpdateStatus}
            />
          );
        })}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Nenhuma fatura encontrada</p>
        </div>
      )}

      {showCreateModal && (
        <CreateInvoiceModal
          data={data}
          onSave={handleCreateInvoice}
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

function InvoiceCard({ invoice, client, onUpdateStatus }: any) {
  const statusConfig = {
    draft: { label: 'Rascunho', color: 'bg-gray-500/20 text-gray-300' },
    sent: { label: 'Enviada', color: 'bg-blue-500/20 text-blue-300' },
    paid: { label: 'Paga', color: 'bg-green-500/20 text-green-300' },
    overdue: { label: 'Atrasada', color: 'bg-red-500/20 text-red-300' },
  };

  const status = statusConfig[invoice.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white">{invoice.invoiceNumber}</h3>
            <span className={`px-3 py-1 rounded-full text-xs ${status.color}`}>
              {status.label}
            </span>
          </div>
          
          <p className="text-white/60 text-sm mb-1">{client?.name || 'Cliente desconhecido'}</p>
          <p className="text-white/40 text-xs">
            Emitida: {new Date(invoice.issueDate).toLocaleDateString('pt-PT')} • 
            Vencimento: {new Date(invoice.dueDate).toLocaleDateString('pt-PT')}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl text-white mb-2">{invoice.total.toFixed(2)}€</p>
          <div className="flex gap-2">
            {invoice.status === 'draft' && (
              <button
                onClick={() => onUpdateStatus(invoice.id, 'sent')}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-all"
              >
                <Send className="w-4 h-4 text-blue-300" />
              </button>
            )}
            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
              <button
                onClick={() => onUpdateStatus(invoice.id, 'paid')}
                className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-all"
              >
                <CheckCircle className="w-4 h-4 text-green-300" />
              </button>
            )}
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
              <Download className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </div>

      {/* Items Preview */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="space-y-1">
          {invoice.items.slice(0, 3).map((item: InvoiceItem, idx: number) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-white/60">{item.description}</span>
              <span className="text-white/80">{item.amount.toFixed(2)}€</span>
            </div>
          ))}
          {invoice.items.length > 3 && (
            <p className="text-white/40 text-xs">+{invoice.items.length - 3} itens</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CreateInvoiceModal({ data, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    clientId: '',
    projectId: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }] as InvoiceItem[],
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft' as Invoice['status'],
    notes: '',
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * (data.settings.taxRate / 100);
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      subtotal,
      tax,
      total,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl text-white mb-6">Nova Fatura</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Número da Fatura</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Data de Emissão</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
                required
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Data de Vencimento</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
                required
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white/60 text-sm">Itens</label>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm transition-all"
              >
                + Adicionar Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                  <input
                    type="text"
                    placeholder="Descrição"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="col-span-5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/50"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qtd"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                    className="col-span-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/50"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Preço"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value))}
                    className="col-span-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/50"
                    required
                    step="0.01"
                  />
                  <div className="col-span-2 px-3 py-2 bg-white/5 rounded-lg text-white/60 text-sm flex items-center">
                    {item.amount.toFixed(2)}€
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="col-span-1 px-2 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-all"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 bg-white/5 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Subtotal</span>
              <span className="text-white">{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">IVA ({data.settings.taxRate}%)</span>
              <span className="text-white">{tax.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-white">Total</span>
              <span className="text-white text-xl">{total.toFixed(2)}€</span>
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50 min-h-[80px]"
              placeholder="Condições de pagamento, observações..."
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
              Criar Fatura
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

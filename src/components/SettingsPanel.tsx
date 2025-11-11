import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, User, DollarSign, Percent, Download, Upload, Trash2, Moon, Sun } from 'lucide-react';
import { AppData } from '../App';

interface SettingsPanelProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export function SettingsPanel({ data, setData }: SettingsPanelProps) {
  const [formData, setFormData] = useState(data.settings);

  const handleSave = () => {
    setData({ ...data, settings: formData });
    alert('Definições guardadas com sucesso!');
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `freelance-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        setData(importedData);
        alert('Dados importados com sucesso!');
      } catch (error) {
        alert('Erro ao importar dados. Verifique o arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('ATENÇÃO: Isto irá eliminar TODOS os seus dados. Esta ação não pode ser desfeita. Tem certeza?')) {
      setData({
        clients: [],
        projects: [],
        tasks: [],
        payments: [],
        timeEntries: [],
        equipment: [],
        invoices: [],
        expenses: [],
        proposals: [],
        goals: [],
        settings: data.settings,
      });
      alert('Dados eliminados com sucesso!');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Profile Settings */}
      <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <h3 className="text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Perfil
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Nome</label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Nome do Negócio</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
            />
          </div>
        </div>
      </div>

      {/* Financial Settings */}
      <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <h3 className="text-white mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Configurações Financeiras
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Moeda</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Taxa de IVA (%)</label>
            <input
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Tarifa Horária (€/h)</label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <h3 className="text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Gestão de Dados
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={handleExportData}
            className="px-6 py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl text-blue-300 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Exportar Dados</span>
          </button>

          <label className="px-6 py-4 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-xl text-green-300 flex items-center justify-center gap-2 transition-all cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>Importar Dados</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>

          <button
            onClick={handleClearData}
            className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-300 flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            <span>Limpar Tudo</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <h3 className="text-white mb-6">Estatísticas da Aplicação</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem label="Clientes" value={data.clients.length} />
          <StatItem label="Projetos" value={data.projects.length} />
          <StatItem label="Tarefas" value={data.tasks.length} />
          <StatItem label="Pagamentos" value={data.payments.length} />
          <StatItem label="Equipamentos" value={data.equipment.length} />
          <StatItem label="Faturas" value={data.invoices.length} />
          <StatItem label="Despesas" value={data.expenses.length} />
          <StatItem label="Propostas" value={data.proposals.length} />
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
      >
        Guardar Alterações
      </motion.button>

      {/* Version */}
      <div className="text-center">
        <p className="text-white/40 text-sm">FreelancePro v2.0</p>
        <p className="text-white/20 text-xs mt-1">© 2025 - Gestão Completa para Freelancers</p>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-white/5 rounded-xl text-center">
      <p className="text-3xl text-white mb-1">{value}</p>
      <p className="text-white/60 text-sm">{label}</p>
    </div>
  );
}

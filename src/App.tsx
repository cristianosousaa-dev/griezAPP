import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Users, Briefcase, DollarSign, Clock, BarChart3, 
  Settings, Package, FileText, Receipt, TrendingUp, Calendar,
  Target, Download
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Projects } from './components/Projects';
import { Tasks } from './components/Tasks';
import { Finance } from './components/Finance';
import { TimeTracker } from './components/TimeTracker';
import { Analytics } from './components/Analytics';
import { Equipment } from './components/Equipment';
import { Invoices } from './components/Invoices';
import { Expenses } from './components/Expenses';
import { Proposals } from './components/Proposals';
import { Goals } from './components/Goals';
import { SettingsPanel } from './components/SettingsPanel';
import { Onboarding } from './components/Onboarding';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  avatar?: string;
  totalPaid: number;
  projectsCount: number;
  status: 'active' | 'inactive';
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  status: 'active' | 'completed' | 'on-hold';
  budget: number;
  earned: number;
  deadline?: string;
  description?: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface Payment {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  description?: string;
  invoiceId?: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  startTime: number;
  endTime?: number;
  description?: string;
  billable: boolean;
  hourlyRate?: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'computer' | 'camera' | 'audio' | 'software' | 'furniture' | 'other';
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  status: 'active' | 'maintenance' | 'sold' | 'retired';
  image?: string;
  notes?: string;
  maintenanceHistory?: MaintenanceRecord[];
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  cost: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'equipment' | 'software' | 'marketing' | 'office' | 'transport' | 'education' | 'other';
  date: string;
  projectId?: string;
  receipt?: string;
  tax: number;
  deductible: boolean;
}

export interface Proposal {
  id: string;
  title: string;
  clientId: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdDate: string;
  validUntil: string;
  description: string;
  scope: string[];
  deliverables: string[];
}

export interface Goal {
  id: string;
  title: string;
  type: 'revenue' | 'clients' | 'projects' | 'savings';
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
}

export interface AppData {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  payments: Payment[];
  timeEntries: TimeEntry[];
  equipment: EquipmentItem[];
  invoices: Invoice[];
  expenses: Expense[];
  proposals: Proposal[];
  goals: Goal[];
  settings: {
    userName: string;
    businessName: string;
    currency: string;
    taxRate: number;
    hourlyRate: number;
    darkMode: boolean;
  };
}

type TabType = 'dashboard' | 'clients' | 'projects' | 'tasks' | 'finance' | 'time' | 'analytics' | 'equipment' | 'invoices' | 'expenses' | 'proposals' | 'goals' | 'settings';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [data, setData] = useState<AppData>({
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
    settings: {
      userName: '',
      businessName: '',
      currency: 'EUR',
      taxRate: 23,
      hourlyRate: 50,
      darkMode: true,
    },
  });

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('freelanceAppData');
    if (savedData) {
      setData(JSON.parse(savedData));
    } else {
      setShowOnboarding(true);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (data.settings.userName) {
      localStorage.setItem('freelanceAppData', JSON.stringify(data));
    }
  }, [data]);

  const handleOnboardingComplete = (userName: string, businessName: string) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, userName, businessName }
    }));
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: Home },
    { id: 'clients' as TabType, label: 'Clientes', icon: Users },
    { id: 'projects' as TabType, label: 'Projetos', icon: Briefcase },
    { id: 'finance' as TabType, label: 'Finanças', icon: DollarSign },
    { id: 'invoices' as TabType, label: 'Faturas', icon: FileText },
    { id: 'expenses' as TabType, label: 'Despesas', icon: Receipt },
    { id: 'time' as TabType, label: 'Tempo', icon: Clock },
    { id: 'equipment' as TabType, label: 'Equipamento', icon: Package },
    { id: 'proposals' as TabType, label: 'Propostas', icon: TrendingUp },
    { id: 'goals' as TabType, label: 'Metas', icon: Target },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Definições', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {data.settings.businessName || 'FreelancePro'}
              </h1>
              <p className="text-white/60 text-sm">Olá, {data.settings.userName}!</p>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <Settings className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && <Dashboard data={data} onNavigate={setActiveTab} />}
            {activeTab === 'clients' && <Clients data={data} setData={setData} />}
            {activeTab === 'projects' && <Projects data={data} setData={setData} />}
            {activeTab === 'tasks' && <Tasks data={data} setData={setData} />}
            {activeTab === 'finance' && <Finance data={data} setData={setData} />}
            {activeTab === 'time' && <TimeTracker data={data} setData={setData} />}
            {activeTab === 'analytics' && <Analytics data={data} />}
            {activeTab === 'equipment' && <Equipment data={data} setData={setData} />}
            {activeTab === 'invoices' && <Invoices data={data} setData={setData} />}
            {activeTab === 'expenses' && <Expenses data={data} setData={setData} />}
            {activeTab === 'proposals' && <Proposals data={data} setData={setData} />}
            {activeTab === 'goals' && <Goals data={data} setData={setData} />}
            {activeTab === 'settings' && <SettingsPanel data={data} setData={setData} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/5 border-t border-white/10 pb-safe">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex items-center justify-around overflow-x-auto py-2 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex flex-col items-center justify-center min-w-[60px] px-3 py-2 rounded-xl transition-all
                    ${isActive ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'hover:bg-white/5'}
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 mb-1 relative z-10 ${isActive ? 'text-purple-300' : 'text-white/60'}`} />
                  <span className={`text-xs relative z-10 whitespace-nowrap ${isActive ? 'text-white' : 'text-white/60'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom padding to prevent content from being hidden behind nav */}
      <div className="h-24" />
    </div>
  );
}

export default App;

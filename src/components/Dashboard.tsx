import { motion } from 'motion/react';
import { 
  TrendingUp, Clock, CheckCircle, AlertCircle, Target, 
  DollarSign, Briefcase, Users, Calendar, ArrowRight,
  Package, FileText
} from 'lucide-react';
import { AppData } from '../App';

interface DashboardProps {
  data: AppData;
  onNavigate: (tab: string) => void;
}

export function Dashboard({ data, onNavigate }: DashboardProps) {
  // Calculate month stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthPayments = data.payments.filter(p => {
    const date = new Date(p.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear && p.status === 'paid';
  });

  const monthRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const monthExpenses = data.expenses.filter(e => {
    const date = new Date(e.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).reduce((sum, e) => sum + e.amount, 0);

  const monthProfit = monthRevenue - monthExpenses;

  const pendingPayments = data.payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const activeProjects = data.projects.filter(p => p.status === 'active');
  const activeClients = data.clients.filter(c => c.status === 'active');
  
  const upcomingTasks = data.tasks
    .filter(t => !t.completed && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const totalEquipmentValue = data.equipment
    .filter(e => e.status === 'active')
    .reduce((sum, e) => sum + e.currentValue, 0);

  const pendingInvoices = data.invoices.filter(i => i.status === 'sent' || i.status === 'overdue');

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-3xl" />
        <div className="relative">
          <h2 className="text-white text-2xl mb-2">
            Olá, {data.settings.userName}! 👋
          </h2>
          <p className="text-white/60">Aqui está o resumo do seu trabalho hoje</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Receita Mensal"
          value={`${monthRevenue.toFixed(0)}€`}
          subtitle={monthProfit >= 0 ? `+${monthProfit.toFixed(0)}€ lucro` : `${monthProfit.toFixed(0)}€ prejuízo`}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
          onClick={() => onNavigate('finance')}
        />
        <QuickStatCard
          title="Projetos Ativos"
          value={activeProjects.length.toString()}
          subtitle={`${activeClients.length} clientes`}
          icon={Briefcase}
          gradient="from-purple-500 to-pink-500"
          onClick={() => onNavigate('projects')}
        />
        <QuickStatCard
          title="Por Receber"
          value={`${pendingAmount.toFixed(0)}€`}
          subtitle={`${pendingPayments.length} pagamentos`}
          icon={Clock}
          gradient="from-orange-500 to-red-500"
          onClick={() => onNavigate('finance')}
        />
        <QuickStatCard
          title="Tarefas Pendentes"
          value={data.tasks.filter(t => !t.completed).length.toString()}
          subtitle={upcomingTasks.length > 0 ? `${upcomingTasks.length} próximas` : 'Nenhuma próxima'}
          icon={CheckCircle}
          gradient="from-blue-500 to-cyan-500"
          onClick={() => onNavigate('tasks')}
        />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <div className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Projetos Ativos
            </h3>
            <button
              onClick={() => onNavigate('projects')}
              className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
            >
              Ver todos →
            </button>
          </div>
          
          <div className="space-y-3">
            {activeProjects.length === 0 ? (
              <p className="text-white/40 text-sm py-8 text-center">Nenhum projeto ativo</p>
            ) : (
              activeProjects.slice(0, 4).map((project) => {
                const client = data.clients.find(c => c.id === project.clientId);
                const progress = (project.earned / project.budget) * 100;
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => onNavigate('projects')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white text-sm mb-1">{project.name}</h4>
                        <p className="text-white/60 text-xs">{client?.name}</p>
                      </div>
                      <span className="text-white/80 text-sm">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full bg-gradient-to-r ${project.color}`}
                      />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximas Tarefas
            </h3>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
            >
              Ver todas →
            </button>
          </div>
          
          <div className="space-y-2">
            {upcomingTasks.length === 0 ? (
              <p className="text-white/40 text-sm py-8 text-center">Nenhuma tarefa pendente</p>
            ) : (
              upcomingTasks.map((task) => {
                const project = data.projects.find(p => p.id === task.projectId);
                const isOverdue = task.dueDate && new Date(task.dueDate) < now;
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => onNavigate('tasks')}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-1 h-full rounded-full ${
                        task.priority === 'high' ? 'bg-red-400' :
                        task.priority === 'medium' ? 'bg-orange-400' :
                        'bg-green-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm mb-1">{task.title}</p>
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <span>{project?.name}</span>
                          {task.dueDate && (
                            <>
                              <span>•</span>
                              <span className={isOverdue ? 'text-red-400' : ''}>
                                {new Date(task.dueDate).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Equipamento"
          value={`${totalEquipmentValue.toFixed(0)}€`}
          subtitle={`${data.equipment.length} itens`}
          icon={Package}
          gradient="from-blue-500 to-cyan-500"
          onClick={() => onNavigate('equipment')}
        />
        <QuickActionCard
          title="Faturas"
          value={pendingInvoices.length.toString()}
          subtitle="Pendentes"
          icon={FileText}
          gradient="from-orange-500 to-red-500"
          onClick={() => onNavigate('invoices')}
        />
        <QuickActionCard
          title="Despesas"
          value={`${monthExpenses.toFixed(0)}€`}
          subtitle="Este mês"
          icon={TrendingUp}
          gradient="from-red-500 to-pink-500"
          onClick={() => onNavigate('expenses')}
        />
        <QuickActionCard
          title="Metas"
          value={data.goals.filter(g => g.currentAmount >= g.targetAmount).length.toString()}
          subtitle={`de ${data.goals.length} concluídas`}
          icon={Target}
          gradient="from-purple-500 to-pink-500"
          onClick={() => onNavigate('goals')}
        />
      </div>

      {/* Alerts */}
      {(pendingPayments.length > 0 || pendingInvoices.length > 0) && (
        <div className="space-y-3">
          {pendingInvoices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-orange-500/10 border border-orange-400/30 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <div className="flex-1">
                <p className="text-orange-200">
                  Tem {pendingInvoices.length} fatura{pendingInvoices.length > 1 ? 's' : ''} pendente{pendingInvoices.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => onNavigate('invoices')}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-orange-300 transition-all"
              >
                Ver
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function QuickStatCard({ title, value, subtitle, icon: Icon, gradient, onClick }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 cursor-pointer hover:border-white/20 transition-all group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/60 text-sm">{title}</p>
          <Icon className="w-5 h-5 text-white/40" />
        </div>
        <p className="text-2xl text-white mb-1">{value}</p>
        <p className="text-white/40 text-xs">{subtitle}</p>
      </div>
    </motion.div>
  );
}

function QuickActionCard({ title, value, subtitle, icon: Icon, gradient, onClick }: any) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-left hover:border-white/20 transition-all group"
    >
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
      <div className="relative">
        <Icon className="w-8 h-8 text-white/40 mb-2" />
        <p className="text-white/60 text-xs mb-1">{title}</p>
        <p className="text-white text-lg mb-0.5">{value}</p>
        <p className="text-white/40 text-xs">{subtitle}</p>
      </div>
    </motion.button>
  );
}

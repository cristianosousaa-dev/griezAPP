import { Card } from './ui/card';
import { TrendingUp, TrendingDown, DollarSign, Clock, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Project, Payment, UserProfile, Client } from '../App';
import type { TimeEntry } from './TimeTracker';

interface AnalyticsViewProps {
  projects: Project[];
  payments: Payment[];
  timeEntries: TimeEntry[];
  userProfile: UserProfile;
  clients: Client[];
}

export function AnalyticsView({ projects, payments, timeEntries, userProfile, clients }: AnalyticsViewProps) {
  // Calculate earnings over last 6 months
  const getMonthlyEarnings = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-PT', { month: 'short' });
      
      const monthPayments = payments.filter(p => {
        if (!p.isPaid) return false;
        const paymentDate = new Date(p.paidDate || p.expectedDate);
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear();
      });
      
      const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      months.push({
        month: monthName,
        earnings: total,
      });
    }
    
    return months;
  };

  // Calculate project status distribution
  const getProjectStatusData = () => {
    const statusCount = {
      planned: projects.filter(p => p.status === 'planned').length,
      'in-progress': projects.filter(p => p.status === 'in-progress').length,
      delivered: projects.filter(p => p.status === 'delivered').length,
      paid: projects.filter(p => p.status === 'paid').length,
    };

    return [
      { name: 'Planeado', value: statusCount.planned, color: '#f59e0b' },
      { name: 'Em Progresso', value: statusCount['in-progress'], color: '#8b5cf6' },
      { name: 'Entregue', value: statusCount.delivered, color: '#06b6d4' },
      { name: 'Pago', value: statusCount.paid, color: '#10b981' },
    ].filter(item => item.value > 0);
  };

  // Calculate top clients by revenue
  const getTopClients = () => {
    const clientRevenue = new Map<string, number>();
    
    payments
      .filter(p => p.isPaid)
      .forEach(payment => {
        const project = projects.find(pr => pr.id === payment.projectId);
        if (project) {
          const current = clientRevenue.get(project.clientId) || 0;
          clientRevenue.set(project.clientId, current + payment.amount);
        }
      });

    return Array.from(clientRevenue.entries())
      .map(([clientId, revenue]) => {
        const client = clients.find(c => c.id === clientId);
        return {
          name: client?.name || 'Unknown',
          revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Calculate time spent per project
  const getTimePerProject = () => {
    const projectTime = new Map<string, number>();
    
    timeEntries.forEach(entry => {
      const current = projectTime.get(entry.projectId) || 0;
      projectTime.set(entry.projectId, current + entry.duration);
    });

    return Array.from(projectTime.entries())
      .map(([projectId, seconds]) => {
        const project = projects.find(p => p.id === projectId);
        return {
          name: project?.name || 'Unknown',
          hours: Math.round(seconds / 3600 * 10) / 10,
        };
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
  };

  // Calculate stats
  const totalEarnings = payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0);
  const totalTime = timeEntries.reduce((sum, e) => sum + e.duration, 0);
  const avgProjectValue = projects.length > 0 
    ? projects.reduce((sum, p) => sum + p.expectedValue, 0) / projects.length 
    : 0;

  const monthlyData = getMonthlyEarnings();
  const lastMonth = monthlyData[monthlyData.length - 2]?.earnings || 0;
  const currentMonth = monthlyData[monthlyData.length - 1]?.earnings || 0;
  const growthRate = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2">
        <h1>Analytics</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-primary opacity-20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg gradient-primary flex items-center justify-center">
                  <DollarSign className="size-4 text-white" />
                </div>
              </div>
              <div className="text-2xl">{totalEarnings.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Total Ganho</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-warning opacity-20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg gradient-warning flex items-center justify-center">
                  <Clock className="size-4 text-white" />
                </div>
              </div>
              <div className="text-2xl">{Math.round(totalTime / 3600)}h</div>
              <p className="text-xs text-muted-foreground">Tempo Total</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-success opacity-20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg gradient-success flex items-center justify-center">
                  {growthRate >= 0 ? (
                    <TrendingUp className="size-4 text-white" />
                  ) : (
                    <TrendingDown className="size-4 text-white" />
                  )}
                </div>
              </div>
              <div className="text-2xl">{growthRate > 0 ? '+' : ''}{growthRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">Crescimento</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-secondary opacity-20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg gradient-secondary flex items-center justify-center">
                  <Target className="size-4 text-white" />
                </div>
              </div>
              <div className="text-2xl">{avgProjectValue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Valor Médio</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Earnings Trend */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass p-4">
          <h3 className="mb-4">Ganhos (Últimos 6 Meses)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(18, 18, 27, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Project Status Distribution */}
      {getProjectStatusData().length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass p-4">
            <h3 className="mb-4">Status dos Projetos</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={getProjectStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getProjectStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(18, 18, 27, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}

      {/* Top Clients */}
      {getTopClients().length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass p-4">
            <h3 className="mb-4">Top Clientes (Revenue)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={getTopClients()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(18, 18, 27, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}

      {/* Time per Project */}
      {getTimePerProject().length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="glass p-4">
            <h3 className="mb-3">Tempo por Projeto</h3>
            <div className="space-y-3">
              {getTimePerProject().map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">{item.hours}h</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full gradient-secondary rounded-full"
                      style={{ 
                        width: `${(item.hours / Math.max(...getTimePerProject().map(p => p.hours))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Insights */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="glass p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="size-5 text-yellow-500" />
            <h3>Insights</h3>
          </div>
          <div className="space-y-2 text-sm">
            {growthRate > 10 && (
              <p className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                🎉 Excelente! Os seus ganhos cresceram {growthRate.toFixed(0)}% este mês!
              </p>
            )}
            {totalPending > totalEarnings * 0.5 && (
              <p className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                ⚠️ Tem {totalPending.toFixed(0)} {userProfile.currency} em pagamentos pendentes.
              </p>
            )}
            {projects.filter(p => p.status === 'in-progress').length > 5 && (
              <p className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                💡 Tem muitos projetos em progresso. Considere focar em finalizá-los.
              </p>
            )}
            {timeEntries.length > 0 && totalEarnings > 0 && (
              <p className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                📊 Taxa horária média: {((totalEarnings / (totalTime / 3600))).toFixed(0)} {userProfile.currency}/h
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

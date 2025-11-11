import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, Briefcase, DollarSign, Clock } from 'lucide-react';
import { AppData } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsProps {
  data: AppData;
}

export function Analytics({ data }: AnalyticsProps) {
  // Monthly revenue data
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const revenue = data.payments
      .filter(p => {
        const pDate = new Date(p.date);
        return pDate.getMonth() === month && pDate.getFullYear() === year && p.status === 'paid';
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const expenses = data.expenses
      .filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === month && eDate.getFullYear() === year;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      month: date.toLocaleDateString('pt-PT', { month: 'short' }),
      receita: revenue,
      despesas: expenses,
      lucro: revenue - expenses,
    };
  });

  // Projects by status
  const projectsByStatus = [
    { name: 'Ativos', value: data.projects.filter(p => p.status === 'active').length, color: '#10b981' },
    { name: 'Em Pausa', value: data.projects.filter(p => p.status === 'on-hold').length, color: '#f59e0b' },
    { name: 'Concluídos', value: data.projects.filter(p => p.status === 'completed').length, color: '#3b82f6' },
  ].filter(item => item.value > 0);

  // Top clients by revenue
  const topClients = data.clients
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 5)
    .map(client => ({
      name: client.name,
      valor: client.totalPaid,
    }));

  const totalRevenue = data.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6 pb-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Receita Total"
          value={`${totalRevenue.toFixed(0)}€`}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
        />
        <MetricCard
          title="Margem de Lucro"
          value={`${profitMargin.toFixed(1)}%`}
          icon={TrendingUp}
          gradient="from-blue-500 to-cyan-500"
        />
        <MetricCard
          title="Clientes Ativos"
          value={data.clients.filter(c => c.status === 'active').length.toString()}
          icon={Users}
          gradient="from-purple-500 to-pink-500"
        />
        <MetricCard
          title="Projetos"
          value={data.projects.length.toString()}
          icon={Briefcase}
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Monthly Revenue Chart */}
      <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <h3 className="text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Receita vs Despesas (6 meses)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="month" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #ffffff20',
                borderRadius: '8px',
                color: '#ffffff',
              }}
            />
            <Bar dataKey="receita" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="despesas" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Projects Distribution */}
        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <h3 className="text-white mb-6">Distribuição de Projetos</h3>
          {projectsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={projectsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-white/40 text-center py-12">Sem dados de projetos</p>
          )}
        </div>

        {/* Top Clients */}
        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <h3 className="text-white mb-6">Top 5 Clientes</h3>
          {topClients.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topClients} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" stroke="#ffffff60" />
                <YAxis dataKey="name" type="category" stroke="#ffffff60" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
                <Bar dataKey="valor" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-white/40 text-center py-12">Sem dados de clientes</p>
          )}
        </div>
      </div>

      {/* Profit Trend */}
      <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <h3 className="text-white mb-6">Tendência de Lucro</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="month" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #ffffff20',
                borderRadius: '8px',
                color: '#ffffff',
              }}
            />
            <Line type="monotone" dataKey="lucro" stroke="#8b5cf6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, gradient }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/60 text-sm">{title}</p>
          <Icon className="w-5 h-5 text-white/40" />
        </div>
        <p className="text-3xl text-white">{value}</p>
      </div>
    </motion.div>
  );
}

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { DollarSign, Plus, TrendingUp, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import type { Payment, Project, Client, UserProfile } from '../App';

interface EarningsViewProps {
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  projects: Project[];
  clients: Client[];
  userProfile: UserProfile;
}

export function EarningsView({ payments, setPayments, projects, clients, userProfile }: EarningsViewProps) {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transferência Bancária');

  const addPayment = () => {
    if (!projectId || !amount || !expectedDate) return;

    const newPayment: Payment = {
      id: Date.now().toString(),
      projectId,
      amount: parseFloat(amount),
      expectedDate,
      paymentMethod,
      isPaid: false,
      createdAt: new Date().toISOString()
    };

    setPayments([...payments, newPayment]);
    setProjectId('');
    setAmount('');
    setExpectedDate('');
    setPaymentMethod('Transferência Bancária');
    setIsAddingPayment(false);
  };

  const markAsPaid = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId ? { ...p, isPaid: true, paidDate: new Date().toISOString() } : p
    ));
  };

  const markAsUnpaid = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId ? { ...p, isPaid: false, paidDate: undefined } : p
    ));
  };

  const getProjectInfo = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return { projectName: 'Projeto', clientName: 'Cliente' };
    const client = clients.find(c => c.id === project.clientId);
    return {
      projectName: project.name,
      clientName: client?.name || 'Cliente'
    };
  };

  const getDaysOverdue = (expectedDate: string) => {
    const today = new Date();
    const expected = new Date(expectedDate);
    const diffTime = today.getTime() - expected.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Month stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthPayments = payments.filter(p => {
    const date = new Date(p.expectedDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalExpected = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalReceived = monthPayments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
  const totalPending = monthPayments.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0);

  const overduePayments = payments.filter(p => {
    if (p.isPaid) return false;
    const expectedDate = new Date(p.expectedDate);
    return expectedDate < now;
  });

  const pendingPayments = payments.filter(p => !p.isPaid);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1>Ganhos</h1>
          <p className="text-muted-foreground mt-1">{payments.length} pagamento{payments.length !== 1 ? 's' : ''}</p>
        </div>
        <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registar Pagamento</DialogTitle>
              <DialogDescription>Adiciona um novo pagamento esperado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="payment-project">Projeto *</Label>
                <select
                  id="payment-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                >
                  <option value="">Selecionar projeto</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="payment-amount">Valor ({userProfile.currency}) *</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="payment-date">Data esperada de pagamento *</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="payment-method">Método de pagamento</Label>
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                >
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="MBWay">MBWay</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Multibanco">Multibanco</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <Button onClick={addPayment} className="w-full" disabled={!projectId || !amount || !expectedDate}>
                Registar Pagamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month Summary */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-5 text-primary" />
          <h2>Resumo do Mês</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="text-2xl text-primary">
              {totalExpected.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Previsto</p>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <div className="text-2xl text-green-500">
              {totalReceived.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Recebido</p>
          </div>
          <div className="text-center p-3 bg-orange-500/10 rounded-lg">
            <div className="text-2xl text-orange-500">
              {totalPending.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Em falta</p>
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm text-muted-foreground">{userProfile.currency}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </Card>

      {/* Overdue Payments Alert */}
      {overduePayments.length > 0 && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="size-5 text-destructive" />
            <h2 className="text-destructive">Pagamentos em Atraso</h2>
          </div>
          <div className="space-y-2">
            {overduePayments.map(payment => {
              const { projectName, clientName } = getProjectInfo(payment.projectId);
              const daysOverdue = getDaysOverdue(payment.expectedDate);
              
              return (
                <div key={payment.id} className="p-3 bg-background rounded-lg border border-destructive/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div>{projectName}</div>
                      <p className="text-sm text-muted-foreground mt-1">{clientName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-destructive">
                        {payment.amount} {userProfile.currency}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {daysOverdue} dia{daysOverdue !== 1 ? 's' : ''} atrasado{daysOverdue !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-green-500/50 hover:bg-green-500/10 text-green-500"
                    onClick={() => markAsPaid(payment.id)}
                  >
                    <CheckCircle className="size-4 mr-2" />
                    Marcar como Recebido
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Pending Payments */}
      {pendingPayments.filter(p => !overduePayments.includes(p)).length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="size-5 text-orange-500" />
            <h2>Pagamentos Pendentes</h2>
          </div>
          <div className="space-y-2">
            {pendingPayments
              .filter(p => !overduePayments.includes(p))
              .sort((a, b) => a.expectedDate.localeCompare(b.expectedDate))
              .map(payment => {
                const { projectName, clientName } = getProjectInfo(payment.projectId);
                
                return (
                  <div key={payment.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div>{projectName}</div>
                        <p className="text-sm text-muted-foreground mt-1">{clientName}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Calendar className="size-3" />
                          {new Date(payment.expectedDate).toLocaleDateString('pt-PT')}
                          <span className="mx-1">•</span>
                          {payment.paymentMethod}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-orange-500">
                          {payment.amount} {userProfile.currency}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-green-500/50 hover:bg-green-500/10 text-green-500"
                      onClick={() => markAsPaid(payment.id)}
                    >
                      <CheckCircle className="size-4 mr-2" />
                      Marcar como Recebido
                    </Button>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Received Payments */}
      {payments.filter(p => p.isPaid).length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="size-5 text-green-500" />
            <h2>Pagamentos Recebidos</h2>
          </div>
          <div className="space-y-2">
            {payments
              .filter(p => p.isPaid)
              .sort((a, b) => {
                const dateA = a.paidDate || a.expectedDate;
                const dateB = b.paidDate || b.expectedDate;
                return dateB.localeCompare(dateA);
              })
              .slice(0, 5)
              .map(payment => {
                const { projectName, clientName } = getProjectInfo(payment.projectId);
                
                return (
                  <div key={payment.id} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="size-4 text-green-500" />
                          <span>{projectName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 ml-6">{clientName}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 ml-6">
                          <Calendar className="size-3" />
                          {payment.paidDate && new Date(payment.paidDate).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-500">
                          {payment.amount} {userProfile.currency}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 text-xs"
                          onClick={() => markAsUnpaid(payment.id)}
                        >
                          Desfazer
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {payments.length === 0 && (
        <Card className="p-8 text-center">
          <DollarSign className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="mb-2">Nenhum pagamento registado</h2>
          <p className="text-muted-foreground mb-4">
            Começa a registar os teus ganhos e pagamentos esperados.
          </p>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Adiciona primeiro um projeto na secção "Projetos"
            </p>
          ) : (
            <Button onClick={() => setIsAddingPayment(true)}>
              <Plus className="size-4 mr-2" />
              Registar Primeiro Pagamento
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
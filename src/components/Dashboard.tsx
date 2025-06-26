
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  processes: {
    analysis: number;
    distributed: number;
    hearing: number;
    sentenced: number;
    archived: number;
  };
  clients: number;
  financialSummary: {
    total: number;
    paid: number;
    pending: number;
  };
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    processes: {
      analysis: 0,
      distributed: 0,
      hearing: 0,
      sentenced: 0,
      archived: 0
    },
    clients: 0,
    financialSummary: {
      total: 0,
      paid: 0,
      pending: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Buscar estatísticas de processos
      const { data: processesData, error: processesError } = await supabase
        .from('processes')
        .select('status');

      if (processesError) throw processesError;

      // Contar processos por status
      const processStats = {
        analysis: processesData?.filter(p => p.status === 'analysis').length || 0,
        distributed: processesData?.filter(p => p.status === 'distributed').length || 0,
        hearing: processesData?.filter(p => p.status === 'hearing').length || 0,
        sentenced: processesData?.filter(p => p.status === 'sentenced').length || 0,
        archived: processesData?.filter(p => p.status === 'archived').length || 0
      };

      // Buscar número de clientes
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (clientsError) throw clientsError;

      // Buscar dados financeiros
      const { data: financialData, error: financialError } = await supabase
        .from('financial_records')
        .select('amount, status');

      if (financialError) throw financialError;

      const totalAmount = financialData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
      const paidAmount = financialData?.filter(r => r.status === 'paid').reduce((sum, record) => sum + Number(record.amount), 0) || 0;
      const pendingAmount = financialData?.filter(r => r.status === 'pending').reduce((sum, record) => sum + Number(record.amount), 0) || 0;

      setStats({
        processes: processStats,
        clients: clientsCount || 0,
        financialSummary: {
          total: totalAmount,
          paid: paidAmount,
          pending: pendingAmount
        }
      });

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard - Resumo dos Processos</h2>
      
      {/* Estatísticas de Processos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Em Análise', count: stats.processes.analysis, color: 'bg-yellow-500', icon: '🔍' },
          { title: 'Distribuído', count: stats.processes.distributed, color: 'bg-blue-500', icon: '📤' },
          { title: 'Em Audiência', count: stats.processes.hearing, color: 'bg-purple-500', icon: '⚖️' },
          { title: 'Sentenciado', count: stats.processes.sentenced, color: 'bg-green-500', icon: '📄' },
          { title: 'Arquivado', count: stats.processes.archived, color: 'bg-gray-500', icon: '📦' },
        ].map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`${card.color} rounded-full p-3 mr-4`}>
                  <span className="text-white text-xl">{card.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.clients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {stats.financialSummary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valores Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              R$ {stats.financialSummary.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

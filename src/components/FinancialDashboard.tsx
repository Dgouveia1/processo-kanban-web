
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FinancialRecord {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  payment_method: string;
  due_date: string;
  paid_date: string;
  description: string;
  clients: {
    name: string;
  };
  processes: {
    number: string;
  };
}

const statusLabels = {
  paid: 'Pago',
  pending: 'Pendente',
  overdue: 'Em Atraso'
};

const statusColors = {
  paid: 'text-green-600 bg-green-100',
  pending: 'text-yellow-600 bg-yellow-100',
  overdue: 'text-red-600 bg-red-100'
};

export const FinancialDashboard: React.FC = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialRecords();
  }, []);

  const fetchFinancialRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .select(`
          *,
          clients (
            name
          ),
          processes (
            number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRecords(data || []);
      
      // Calcular resumo
      const totalPaid = data?.filter(r => r.status === 'paid').reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const totalPending = data?.filter(r => r.status === 'pending').reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const totalOverdue = data?.filter(r => r.status === 'overdue').reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      
      setSummary({
        total: totalPaid + totalPending + totalOverdue,
        paid: totalPaid,
        pending: totalPending,
        overdue: totalOverdue
      });
      
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados financeiros",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando dados financeiros...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Controle Financeiro</h2>
      
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {summary.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {summary.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Em Atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {summary.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros Financeiros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum registro financeiro encontrado</p>
            ) : (
              records.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{record.clients?.name}</span>
                      {record.processes?.number && (
                        <span className="text-sm text-gray-500">
                          (Processo: {record.processes.number})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{record.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {record.due_date && (
                        <span>Vencimento: {new Date(record.due_date).toLocaleDateString('pt-BR')}</span>
                      )}
                      {record.paid_date && (
                        <span>Pago em: {new Date(record.paid_date).toLocaleDateString('pt-BR')}</span>
                      )}
                      {record.payment_method && (
                        <span>Método: {record.payment_method}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">
                      R$ {Number(record.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
                      {statusLabels[record.status]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

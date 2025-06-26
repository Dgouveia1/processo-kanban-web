
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Process {
  id: string;
  number: string;
  client_id: string;
  status: 'analysis' | 'distributed' | 'hearing' | 'sentenced' | 'archived';
  description: string;
  entry_date: string;
  clients: {
    name: string;
  };
}

const statusLabels = {
  analysis: 'Em Análise',
  distributed: 'Distribuído',
  hearing: 'Em Audiência',
  sentenced: 'Sentenciado',
  archived: 'Arquivado'
};

const statusColors = {
  analysis: 'bg-yellow-100 border-yellow-300',
  distributed: 'bg-blue-100 border-blue-300',
  hearing: 'bg-purple-100 border-purple-300',
  sentenced: 'bg-green-100 border-green-300',
  archived: 'bg-gray-100 border-gray-300'
};

export const ProcessesKanban: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .select(`
          *,
          clients (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProcesses(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar processos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProcessStatus = async (processId: string, newStatus: Process['status']) => {
    try {
      const { error } = await supabase
        .from('processes')
        .update({ status: newStatus })
        .eq('id', processId);

      if (error) throw error;

      setProcesses(prev => 
        prev.map(process => 
          process.id === processId 
            ? { ...process, status: newStatus }
            : process
        )
      );

      toast({
        title: "Status atualizado",
        description: "O status do processo foi alterado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getProcessesByStatus = (status: Process['status']) => {
    return processes.filter(process => process.status === status);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando processos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Processos - Kanban</h2>
        <Button onClick={() => window.location.reload()}>
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">{label}</h3>
              <span className="bg-gray-200 text-gray-600 text-sm px-2 py-1 rounded-full">
                {getProcessesByStatus(status as Process['status']).length}
              </span>
            </div>
            
            <div className="space-y-3 min-h-[400px]">
              {getProcessesByStatus(status as Process['status']).map((process) => (
                <Card key={process.id} className={`${statusColors[status as Process['status']]} border-2`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Processo {process.number}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Cliente:</strong> {process.clients?.name}
                      </p>
                      {process.description && (
                        <p className="text-sm text-gray-600">
                          <strong>Descrição:</strong> {process.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Entrada: {new Date(process.entry_date).toLocaleDateString('pt-BR')}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {Object.entries(statusLabels)
                          .filter(([s]) => s !== status)
                          .map(([newStatus, newLabel]) => (
                            <Button
                              key={newStatus}
                              size="sm"
                              variant="outline"
                              className="text-xs h-6"
                              onClick={() => updateProcessStatus(process.id, newStatus as Process['status'])}
                            >
                              → {newLabel}
                            </Button>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

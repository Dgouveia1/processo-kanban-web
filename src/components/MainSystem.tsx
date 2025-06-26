
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

interface MainSystemProps {
  user: User;
  onLogout: () => void;
}

export const MainSystem: React.FC<MainSystemProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      onLogout();
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a3 3 0 01-3-3V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Sistema Jurídico</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bem-vindo, {user.user_metadata?.name || user.email}!
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'kanban', label: 'Processos', icon: '📋' },
              { id: 'financial', label: 'Financeiro', icon: '💰' },
              { id: 'search', label: 'Busca', icon: '🔍' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                  activeSection === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeSection === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard - Resumo dos Processos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: 'Em Análise', count: 12, color: 'bg-yellow-500', icon: '🔍' },
                { title: 'Distribuído', count: 8, color: 'bg-blue-500', icon: '📤' },
                { title: 'Em Audiência', count: 5, color: 'bg-purple-500', icon: '⚖️' },
                { title: 'Sentenciado', count: 15, color: 'bg-green-500', icon: '📄' },
                { title: 'Arquivado', count: 23, color: 'bg-gray-500', icon: '📦' },
              ].map((card) => (
                <div key={card.title} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`${card.color} rounded-full p-3 mr-4`}>
                      <span className="text-white text-xl">{card.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'kanban' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestão de Processos - Kanban</h2>
            <p className="text-gray-600">Funcionalidade de Kanban será implementada em breve...</p>
          </div>
        )}

        {activeSection === 'financial' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Controle Financeiro</h2>
            <p className="text-gray-600">Funcionalidade financeira será implementada em breve...</p>
          </div>
        )}

        {activeSection === 'search' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Busca Avançada</h2>
            <p className="text-gray-600">Funcionalidade de busca será implementada em breve...</p>
          </div>
        )}
      </main>
    </div>
  );
};

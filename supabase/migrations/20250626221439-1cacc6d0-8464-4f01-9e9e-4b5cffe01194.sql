
-- Criar enum para status dos processos
CREATE TYPE process_status AS ENUM ('analysis', 'distributed', 'hearing', 'sentenced', 'archived');

-- Criar enum para status de pagamento
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'overdue');

-- Tabela de perfis de usuários (advogados)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  oab TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de processos
CREATE TABLE public.processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status process_status NOT NULL DEFAULT 'analysis',
  description TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de movimentações dos processos
CREATE TABLE public.process_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE,
  from_status process_status,
  to_status process_status NOT NULL,
  moved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  moved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela financeira
CREATE TABLE public.financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  process_id UUID REFERENCES public.processes(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  due_date DATE,
  paid_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para clients (todos os advogados podem ver todos os clientes)
CREATE POLICY "Authenticated users can view all clients" ON public.clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert clients" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" ON public.clients
  FOR UPDATE TO authenticated USING (true);

-- Políticas RLS para processes (todos os advogados podem ver todos os processos)
CREATE POLICY "Authenticated users can view all processes" ON public.processes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert processes" ON public.processes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update processes" ON public.processes
  FOR UPDATE TO authenticated USING (true);

-- Políticas RLS para process_movements
CREATE POLICY "Authenticated users can view all movements" ON public.process_movements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert movements" ON public.process_movements
  FOR INSERT TO authenticated WITH CHECK (true);

-- Políticas RLS para financial_records
CREATE POLICY "Authenticated users can view all financial records" ON public.financial_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert financial records" ON public.financial_records
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update financial records" ON public.financial_records
  FOR UPDATE TO authenticated USING (true);

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, oab, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Novo Usuário'),
    COALESCE(new.raw_user_meta_data->>'oab', ''),
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger para executar a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Aplicar trigger de updated_at em todas as tabelas relevantes
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_processes_updated_at
  BEFORE UPDATE ON public.processes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_financial_records_updated_at
  BEFORE UPDATE ON public.financial_records
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger para registrar movimentações de processo automaticamente
CREATE OR REPLACE FUNCTION public.handle_process_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Só registra se o status realmente mudou
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.process_movements (process_id, from_status, to_status, moved_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_process_status_change
  AFTER UPDATE ON public.processes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_process_status_change();

-- Inserir alguns dados de exemplo
INSERT INTO public.clients (name, cpf_cnpj, email, phone) VALUES
('Maria Silva Santos', '123.456.789-00', 'maria@email.com', '(11) 99999-1111'),
('Carlos Pereira Lima', '987.654.321-00', 'carlos@email.com', '(11) 99999-2222'),
('Empresa ABC Ltda', '12.345.678/0001-90', 'contato@empresaabc.com', '(11) 3333-4444'),
('José Santos Filho', '456.789.123-00', 'jose@email.com', '(11) 99999-5555'),
('Loja XYZ S.A.', '98.765.432/0001-10', 'contato@lojaxyz.com', '(11) 3333-6666');

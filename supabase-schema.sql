-- ============================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS ELO NO SUPABASE (PostgreSQL)
-- Execute este script no menu "SQL Editor" do seu painel do Supabase
-- ============================================================================

-- 1. TABELA DE PERFIS DOS USUÁRIOS (Garis e Moradores)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('trabalhador', 'morador', 'gestor')),
  rota_ou_bairro TEXT,
  pontos_elos INTEGER DEFAULT 50,
  total_checkins INTEGER DEFAULT 0,
  total_alongamentos INTEGER DEFAULT 0,
  total_alertas INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE CHECK-INS DIÁRIOS DE SAÚDE
CREATE TABLE IF NOT EXISTS checkins_saude (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT REFERENCES profiles(email) ON DELETE CASCADE,
  humor TEXT NOT NULL,
  nivel_dor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE DENÚNCIAS E RISCOS (VIDRO QUEBRADO / PERFUROCORTANTES)
CREATE TABLE IF NOT EXISTS ocorrencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo TEXT UNIQUE NOT NULL,
  morador_email TEXT,
  tipo_problema TEXT NOT NULL,
  endereco TEXT NOT NULL,
  descricao TEXT,
  foto_url TEXT,
  status TEXT DEFAULT 'Em análise' CHECK (status IN ('Em análise', 'Em atendimento', 'Resolvida')),
  is_risco_cortante BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE VOUCHERS E RECOMPENSAS RESGATADAS
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT REFERENCES profiles(email) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  local_parceiro TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'Pronto para Usar',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE MURAL DA COMUNIDADE (RECADOS DOS MORADORES)
CREATE TABLE IF NOT EXISTS mural_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor TEXT NOT NULL,
  texto TEXT NOT NULL,
  apoios INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar permissão pública de leitura e escrita para o Hackathon (Anon Key)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mural_mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas públicas simplificadas para desenvolvimento rápido
CREATE POLICY "Acesso público profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público checkins" ON checkins_saude FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público ocorrencias" ON ocorrencias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público vouchers" ON vouchers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público mural" ON mural_mensagens FOR ALL USING (true) WITH CHECK (true);

-- Inserir dados de exemplo para o Carlos e Mariana
INSERT INTO profiles (email, nome, perfil, rota_ou_bairro, pontos_elos, total_checkins, total_alongamentos, total_alertas)
VALUES 
  ('carlos@elo.com', 'Carlos Silva', 'trabalhador', 'Rota 14 - Bairro Ipiranga', 340, 12, 8, 4),
  ('mariana@elo.com', 'Mariana Souza', 'morador', 'Rua dos Patriotas - Ipiranga', 80, 4, 2, 3)
ON CONFLICT (email) DO NOTHING;

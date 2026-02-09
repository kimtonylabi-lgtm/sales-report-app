-- 영업팀 일일업무보고 웹앱 DB 스키마

-- 1. 프로필 테이블 (사용자 정보)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY, -- MVP 테스트를 위해 외래 키 제약을 일시 제거합니다.
  name TEXT NOT NULL,
  role TEXT DEFAULT 'sales' CHECK (role IN ('sales', 'leader')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 고객사 테이블
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  last_visited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 보고서 테이블
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('visit', 'phone', 'email')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 정책 설정 (MVP를 위해 단순화)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Clients are viewable by everyone" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Clients are insertable by everyone" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Clients are updatable by everyone" ON public.clients FOR UPDATE USING (true);

CREATE POLICY "Reports are viewable by everyone" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Reports are insertable by everyone" ON public.reports FOR INSERT WITH CHECK (true);

-- 고객사 방문일 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_client_last_visited()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.clients
  SET last_visited_at = NEW.created_at
  WHERE id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_report_created
AFTER INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION update_client_last_visited();

-- 샘플 데이터가 필요하다면 아래 주석을 해제하거나 직접 입력하세요.
-- INSERT INTO public.profiles (id, name, role) VALUES ('00000000-0000-0000-0000-000000000000', '홍길동 과장', 'sales');
-- INSERT INTO public.clients (name) VALUES ('삼성전자'), ('LG전자'), ('현대자동차');


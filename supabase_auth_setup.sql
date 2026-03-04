-- 1. profiles 테이블 수정 (auth.users와 연결) - 안전하게 실행
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey') THEN 
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE; 
  END IF; 
END $$;

-- 2. 회원가입 시 자동으로 프로필을 생성하는 함수 및 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
    'sales'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RLS 정책 업데이트 (보안 강화)
-- Profiles 정책
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Reports 정책 (기존 단순 정책 삭제)
DROP POLICY IF EXISTS "Reports are viewable by everyone" ON public.reports;
DROP POLICY IF EXISTS "Reports are insertable by everyone" ON public.reports;

-- Reports 새 정책 (중복 방지 위해 삭제 후 생성)
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reports" ON public.reports;
CREATE POLICY "Users can insert their own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Leaders can view all reports" ON public.reports;
CREATE POLICY "Leaders can view all reports" ON public.reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'leader'
  )
);

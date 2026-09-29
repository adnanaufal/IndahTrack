-- ==============================================================================
-- INDAHTRACK — COMPLETE DATABASE SCHEMA & SEED SCRIPT
-- Phase 1 Sprint 1: Data Architecture
--
-- INSTRUCTION:
-- Copy and paste the entire script below into the Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New query -> Run)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. AUTOMATION FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, timezone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'Asia/Jakarta')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_application_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.application_events (
    application_id,
    stage_id,
    event_date,
    notes,
    metadata
  )
  VALUES (
    NEW.id,
    NEW.current_stage_id,
    COALESCE(NEW.application_date::timestamptz, NOW()),
    'Lamaran pertama kali dibuat / disubmit',
    jsonb_build_object(
      'action', 'created',
      'source', NEW.source,
      'employment_type', NEW.employment_type
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_companies_updated_at ON public.companies;
CREATE TRIGGER set_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  stage_type TEXT NOT NULL CHECK (stage_type IN ('active', 'closed_won', 'closed_lost')),
  position INT NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pipeline_stages_user_slug 
  ON public.pipeline_stages (COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  position TEXT NOT NULL,
  location TEXT,
  employment_type TEXT,
  source TEXT,
  job_url TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT DEFAULT 'IDR',
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Offer', 'Accepted', 'Rejected', 'Withdrawn', 'Ghosted', 'Completed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_applications_updated_at ON public.applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_application_initial_event ON public.applications;
CREATE TRIGGER trigger_application_initial_event
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_application_event();

CREATE TABLE IF NOT EXISTS public.application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id),
  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_follow_ups_updated_at ON public.follow_ups;
CREATE TRIGGER set_follow_ups_updated_at
  BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  interview_type TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  meeting_url TEXT,
  interviewer TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_interviews_updated_at ON public.interviews;
CREATE TRIGGER set_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications (user_id);
CREATE INDEX IF NOT EXISTS idx_applications_company_id ON public.applications (company_id);
CREATE INDEX IF NOT EXISTS idx_applications_current_stage_id ON public.applications (current_stage_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON public.applications (user_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_user_date ON public.applications (user_id, application_date DESC);
CREATE INDEX IF NOT EXISTS idx_applications_user_stage ON public.applications (user_id, current_stage_id);

CREATE INDEX IF NOT EXISTS idx_application_events_application_id ON public.application_events (application_id);
CREATE INDEX IF NOT EXISTS idx_application_events_stage_id ON public.application_events (stage_id);
CREATE INDEX IF NOT EXISTS idx_application_events_date ON public.application_events (event_date DESC);

CREATE INDEX IF NOT EXISTS idx_follow_ups_user_due ON public.follow_ups (user_id, due_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_app_id ON public.follow_ups (application_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON public.follow_ups (user_id, status);

CREATE INDEX IF NOT EXISTS idx_interviews_app_id ON public.interviews (application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON public.interviews (scheduled_at);

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_user ON public.pipeline_stages (user_id, position);

-- 5. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Companies RLS
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
CREATE POLICY "Authenticated users can view companies" ON public.companies FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert companies" ON public.companies;
CREATE POLICY "Authenticated users can insert companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update companies" ON public.companies;
CREATE POLICY "Authenticated users can update companies" ON public.companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Pipeline Stages RLS
DROP POLICY IF EXISTS "Users can view system and own pipeline stages" ON public.pipeline_stages;
CREATE POLICY "Users can view system and own pipeline stages" ON public.pipeline_stages FOR SELECT TO authenticated USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own custom pipeline stages" ON public.pipeline_stages;
CREATE POLICY "Users can insert own custom pipeline stages" ON public.pipeline_stages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own custom pipeline stages" ON public.pipeline_stages;
CREATE POLICY "Users can update own custom pipeline stages" ON public.pipeline_stages FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own custom pipeline stages" ON public.pipeline_stages;
CREATE POLICY "Users can delete own custom pipeline stages" ON public.pipeline_stages FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Applications RLS
DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own applications" ON public.applications;
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON public.applications;
CREATE POLICY "Users can update own applications" ON public.applications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own applications" ON public.applications;
CREATE POLICY "Users can delete own applications" ON public.applications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Application Events RLS
DROP POLICY IF EXISTS "Users can view own application events" ON public.application_events;
CREATE POLICY "Users can view own application events" ON public.application_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = application_events.application_id AND applications.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert own application events" ON public.application_events;
CREATE POLICY "Users can insert own application events" ON public.application_events FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = application_events.application_id AND applications.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update own application events" ON public.application_events;
CREATE POLICY "Users can update own application events" ON public.application_events FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = application_events.application_id AND applications.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = application_events.application_id AND applications.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete own application events" ON public.application_events;
CREATE POLICY "Users can delete own application events" ON public.application_events FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = application_events.application_id AND applications.user_id = auth.uid())
);

-- Follow-ups RLS
DROP POLICY IF EXISTS "Users can view own follow_ups" ON public.follow_ups;
CREATE POLICY "Users can view own follow_ups" ON public.follow_ups FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own follow_ups" ON public.follow_ups;
CREATE POLICY "Users can insert own follow_ups" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own follow_ups" ON public.follow_ups;
CREATE POLICY "Users can update own follow_ups" ON public.follow_ups FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own follow_ups" ON public.follow_ups;
CREATE POLICY "Users can delete own follow_ups" ON public.follow_ups FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Interviews RLS
DROP POLICY IF EXISTS "Users can view own interviews" ON public.interviews;
CREATE POLICY "Users can view own interviews" ON public.interviews FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = interviews.application_id AND applications.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert own interviews" ON public.interviews;
CREATE POLICY "Users can insert own interviews" ON public.interviews FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = interviews.application_id AND applications.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update own interviews" ON public.interviews;
CREATE POLICY "Users can update own interviews" ON public.interviews FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = interviews.application_id AND applications.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = interviews.application_id AND applications.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete own interviews" ON public.interviews;
CREATE POLICY "Users can delete own interviews" ON public.interviews FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = interviews.application_id AND applications.user_id = auth.uid())
);

-- 6. SEED DATA (14 DEFAULT SYSTEM STAGES)
INSERT INTO public.pipeline_stages (name, slug, stage_type, position, is_system, is_active)
VALUES
  ('Wishlist', 'wishlist', 'active', 1, TRUE, TRUE),
  ('Applied (Udah Kirim)', 'applied', 'active', 2, TRUE, TRUE),
  ('Screening (Disaring HR)', 'screening', 'active', 3, TRUE, TRUE),
  ('HR Interview', 'hr-interview', 'active', 4, TRUE, TRUE),
  ('Assessment / Test', 'assessment', 'active', 5, TRUE, TRUE),
  ('User Interview', 'user-interview', 'active', 6, TRUE, TRUE),
  ('Final Interview / BoD', 'final-interview', 'active', 7, TRUE, TRUE),
  ('Offering Letter', 'offer', 'active', 8, TRUE, TRUE),
  ('Accepted (Sikat!)', 'accepted', 'closed_won', 9, TRUE, TRUE),
  ('Onboarding (Mulai Gawe)', 'onboarding', 'closed_won', 10, TRUE, TRUE),
  ('Completed', 'completed', 'closed_won', 11, TRUE, TRUE),
  ('Rejected (Belum Jodoh)', 'rejected', 'closed_lost', 12, TRUE, TRUE),
  ('Withdrawn (Cancel Sendiri)', 'withdrawn', 'closed_lost', 13, TRUE, TRUE),
  ('Ghosted (Ditinggal Tanpa Kabar)', 'ghosted', 'closed_lost', 14, TRUE, TRUE)
ON CONFLICT (COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), slug)
DO UPDATE SET
  name = EXCLUDED.name,
  stage_type = EXCLUDED.stage_type,
  position = EXCLUDED.position,
  is_system = EXCLUDED.is_system,
  is_active = EXCLUDED.is_active;

-- Initial Common Companies Seed
INSERT INTO public.companies (name, normalized_name, location)
VALUES
  ('Tokopedia', 'tokopedia', 'Jakarta (Hybrid)'),
  ('Shopee', 'shopee', 'Jakarta (Onsite)'),
  ('Traveloka', 'traveloka', 'Tangerang (Hybrid)'),
  ('Gojek', 'gojek', 'Jakarta (Hybrid)'),
  ('Bukalapak', 'bukalapak', 'Jakarta (Remote)'),
  ('Blibli', 'blibli', 'Jakarta (Onsite)'),
  ('DANA Indonesia', 'dana indonesia', 'Jakarta (Hybrid)'),
  ('Tiket.com', 'tiket.com', 'Jakarta (Hybrid)'),
  ('Bank Mandiri', 'bank mandiri', 'Jakarta (Onsite)'),
  ('Bank Central Asia (BCA)', 'bank central asia (bca)', 'Jakarta (Onsite)')
ON CONFLICT (normalized_name) DO NOTHING;

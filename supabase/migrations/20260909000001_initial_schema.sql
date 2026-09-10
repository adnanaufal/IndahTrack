-- ==============================================================================
-- IndahTrack — Phase 1 Sprint 1: Data Architecture Migration
-- Description: Core schema, tables, triggers, indexes, and RLS policies
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Helper Functions & Automation Triggers
-- ==============================================================================

-- Trigger function for auto-updating 'updated_at' timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for creating profile automatically on auth.users signup
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

-- Trigger function for auto-creating initial timeline event on application creation
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

-- ==============================================================================
-- 3. Table Definitions
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table: profiles
-- Description: User profile linked 1-to-1 with Supabase auth.users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- Table: companies
-- Description: Shared company directory with normalized name deduplication
-- ------------------------------------------------------------------------------
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

CREATE TRIGGER set_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- Table: pipeline_stages
-- Description: Hybrid system stages (user_id IS NULL) and custom user stages
-- ------------------------------------------------------------------------------
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

-- Unique constraint for stage slug per user scope (system stages vs user custom)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pipeline_stages_user_slug 
  ON public.pipeline_stages (COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);

-- ------------------------------------------------------------------------------
-- Table: applications
-- Description: Core job applications tracking table
-- ------------------------------------------------------------------------------
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

CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_application_initial_event
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_application_event();

-- ------------------------------------------------------------------------------
-- Table: application_events
-- Description: Append-only timeline history of stage transitions & notes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id),
  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: follow_ups
-- Description: Action reminders and task tracking per application
-- ------------------------------------------------------------------------------
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

CREATE TRIGGER set_follow_ups_updated_at
  BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- Table: interviews
-- Description: Structured interview schedule, interviewer, & meeting data
-- ------------------------------------------------------------------------------
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

CREATE TRIGGER set_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. Database Performance Indexes
-- ==============================================================================

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

-- ==============================================================================
-- 5. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all user tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS: profiles
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- RLS: companies (Shared directory: everyone can view & contribute)
-- ------------------------------------------------------------------------------
CREATE POLICY "Authenticated users can view companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update companies"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- RLS: pipeline_stages (System stages readable by all, custom stages by owner)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view system and own pipeline stages"
  ON public.pipeline_stages FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert own custom pipeline stages"
  ON public.pipeline_stages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own custom pipeline stages"
  ON public.pipeline_stages FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own custom pipeline stages"
  ON public.pipeline_stages FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- RLS: applications (Strict user isolation)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON public.applications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: application_events (Isolated via parent application ownership)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own application events"
  ON public.application_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_events.application_id
        AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own application events"
  ON public.application_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_events.application_id
        AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own application events"
  ON public.application_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_events.application_id
        AND applications.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_events.application_id
        AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own application events"
  ON public.application_events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_events.application_id
        AND applications.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- RLS: follow_ups (Strict user isolation)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own follow_ups"
  ON public.follow_ups FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own follow_ups"
  ON public.follow_ups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own follow_ups"
  ON public.follow_ups FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own follow_ups"
  ON public.follow_ups FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: interviews (Isolated via parent application ownership)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own interviews"
  ON public.interviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = interviews.application_id
        AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own interviews"
  ON public.interviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = interviews.application_id
        AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own interviews"
  ON public.interviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = interviews.application_id
        AND applications.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = interviews.application_id
        AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own interviews"
  ON public.interviews FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = interviews.application_id
        AND applications.user_id = auth.uid()
    )
  );

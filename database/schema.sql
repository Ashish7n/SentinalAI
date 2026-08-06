-- SentinelAI Database Schema (PostgreSQL + PostGIS)

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'police', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'verified', 'dismissed', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE patrol_shift AS ENUM ('morning', 'afternoon', 'night');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'citizen',
  badge_number TEXT,
  station_sector TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Incident Categories Table
CREATE TABLE IF NOT EXISTS public.incident_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  base_severity_weight DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  description TEXT
);

-- 3. Incidents & Telemetry Table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.incident_categories(id),
  severity incident_severity NOT NULL DEFAULT 'medium',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status report_status NOT NULL DEFAULT 'pending',
  description TEXT,
  pii_scrubbed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_coords ON public.incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_occurred_at ON public.incidents(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);

-- 4. Infrastructure Telemetry
CREATE TABLE IF NOT EXISTS public.infrastructure_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telemetry_type TEXT NOT NULL, -- 'streetlight', 'cctv', 'shelter', 'police_station', 'hospital'
  name TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status_score DECIMAL(3,2) NOT NULL DEFAULT 1.0, -- 1.0 = working/lit, 0.0 = broken/dark
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_infra_coords ON public.infrastructure_telemetry(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_infra_type ON public.infrastructure_telemetry(telemetry_type);

-- 5. Patrol Allocations Log
CREATE TABLE IF NOT EXISTS public.patrol_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sector_id TEXT NOT NULL,
  shift patrol_shift NOT NULL,
  allocated_officers INT NOT NULL,
  calculated_risk_index DECIMAL(5,2) NOT NULL,
  gemini_recommendation_summary TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. AI Decision Audits
CREATE TABLE IF NOT EXISTS public.ai_decision_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_type TEXT NOT NULL,
  input_summary JSONB NOT NULL,
  deterministic_output JSONB NOT NULL,
  gemini_explanation TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.85,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

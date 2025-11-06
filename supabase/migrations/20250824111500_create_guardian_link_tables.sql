-- Guardian Link Platform Tables Migration
-- This creates the database schema for the Guardian Link family monitoring system

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('private_family', 'care_company')),
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monitored persons table  
CREATE TABLE IF NOT EXISTS monitored_person (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  device_id TEXT UNIQUE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('active', 'inactive', 'offline', 'emergency')),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profile_image_url TEXT,
  phone TEXT,
  email TEXT,
  relationship TEXT,
  monitoring_enabled BOOLEAN DEFAULT TRUE,
  fall_detection_enabled BOOLEAN DEFAULT TRUE,
  location_tracking_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monitoring data table
CREATE TABLE IF NOT EXISTS monitoring_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitored_person_id UUID NOT NULL REFERENCES monitored_person(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  battery_level INTEGER,
  battery_is_charging BOOLEAN,
  location_latitude FLOAT,
  location_longitude FLOAT,
  location_address TEXT,
  movement_step_count INTEGER DEFAULT 0,
  fall_event_detected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitored_person_id UUID NOT NULL REFERENCES monitored_person(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitored_person ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (testing)
CREATE POLICY IF NOT EXISTS "Enable all for organizations" 
ON organizations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable all for monitored_person" 
ON monitored_person FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable all for monitoring_data" 
ON monitoring_data FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable all for emergency_alerts" 
ON emergency_alerts FOR ALL USING (true) WITH CHECK (true);

-- Insert test data
INSERT INTO organizations (id, name, organization_type, contact_email) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Guardian Link Test Family', 'private_family', 'test@guardianlink.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO monitored_person (organization_id, name, device_id, status, relationship)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Your Phone', 'test-device-001', 'active', 'Primary Device')
ON CONFLICT (device_id) DO NOTHING;
-- Phase 1 extras: run_of_show, vendors, checklists
-- ================================================

-- Run of Show items (day-of timeline)
CREATE TABLE IF NOT EXISTS run_of_show (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  time_slot TIME NOT NULL,
  duration_minutes INT DEFAULT 30,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES staff_members(id),
  location TEXT,
  is_completed BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- catering, florals, photography, dj, officiant, etc.
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  notes TEXT,
  is_preferred BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event-Vendor junction (which vendors are assigned to which events)
CREATE TABLE IF NOT EXISTS event_vendors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  role TEXT, -- what they're doing at this event
  arrival_time TIME,
  fee NUMERIC(10,2),
  deposit_paid BOOLEAN DEFAULT false,
  contract_signed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, vendor_id)
);

-- Checklists (reusable templates + per-event instances)
CREATE TABLE IF NOT EXISTS checklists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- NULL = template
  title TEXT NOT NULL,
  description TEXT,
  is_template BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  assigned_to UUID REFERENCES staff_members(id),
  sort_order INT DEFAULT 0,
  due_time TIME, -- optional time on event day
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure trigger function exists
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_run_of_show
  BEFORE UPDATE ON run_of_show
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_vendors
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_checklists
  BEFORE UPDATE ON checklists
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS
ALTER TABLE run_of_show ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Staff + owners can see run_of_show for their events
CREATE POLICY "Staff can view run_of_show" ON run_of_show
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owners can manage run_of_show" ON run_of_show
  FOR ALL USING (is_owner_or_admin());

-- Vendors: all authenticated users can view, owners manage
CREATE POLICY "Authenticated view vendors" ON vendors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owners manage vendors" ON vendors
  FOR ALL USING (is_owner_or_admin());

CREATE POLICY "Authenticated view event_vendors" ON event_vendors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owners manage event_vendors" ON event_vendors
  FOR ALL USING (is_owner_or_admin());

-- Checklists: staff can view, owners manage
CREATE POLICY "Staff view checklists" ON checklists
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owners manage checklists" ON checklists
  FOR ALL USING (is_owner_or_admin());

CREATE POLICY "Staff view checklist_items" ON checklist_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff update checklist_items" ON checklist_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Owners manage checklist_items" ON checklist_items
  FOR ALL USING (is_owner_or_admin());

/**
 * Trellis Database Types
 * =====================
 * These types mirror the Supabase schema. They'll be replaced by
 * auto-generated types from `supabase gen types typescript` once
 * the schema is applied.
 */

// --- Enums ---

export type UserRole = 'owner' | 'admin' | 'office_staff' | 'field_staff';
export type CoupleRole = 'couple'; // magic-link scoped

export type LifecycleStage =
  | 'lead'
  | 'inquiry'
  | 'tour_scheduled'
  | 'tour_complete'
  | 'proposal_sent'
  | 'contract_sent'
  | 'booked'
  | 'planning'
  | 'week_of'
  | 'event_day'
  | 'post_event'
  | 'closed'
  | 'lost';

export type EventType = 'wedding' | 'corporate' | 'private_party' | 'other';

export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'void';

export type PaymentMethod = 'square' | 'cash' | 'check' | 'other';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ExpenseCategory =
  | 'food_beverage'
  | 'decor'
  | 'equipment'
  | 'supplies'
  | 'maintenance'
  | 'utilities'
  | 'labor'
  | 'insurance'
  | 'marketing'
  | 'other';

export type InventoryUnit = 'each' | 'case' | 'bottle' | 'box' | 'lb' | 'oz' | 'gallon';

// --- Core Tables ---

export interface Profile {
  id: string; // UUID, FK to auth.users
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Couple {
  id: string; // UUID
  customer_id: string; // Unique, human-readable (e.g., WA-2026-001)
  partner_1_name: string;
  partner_2_name: string | null;
  email: string;
  phone: string | null;
  lifecycle_stage: LifecycleStage;
  source: string | null; // How they found Willow Acres
  notes: string | null;
  magic_link_token_hash: string | null;
  magic_link_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string; // UUID
  couple_id: string; // FK to couples
  event_type: EventType;
  event_date: string | null; // date
  start_time: string | null; // time
  end_time: string | null; // time
  guest_count: number | null;
  venue_area: string | null; // barn, grounds, etc.
  ceremony_location: string | null;
  reception_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BarPackage {
  id: string;
  event_id: string; // FK to events
  package_name: string;
  includes_beer: boolean;
  includes_wine: boolean;
  includes_spirits: boolean;
  per_person_price: number | null;
  gratuity_pct: number; // default 15
  tax_pct: number; // default 8 (bar tax)
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  couple_id: string; // FK to couples
  event_id: string | null; // FK to events
  invoice_number: string; // Unique, human-readable
  status: InvoiceStatus;
  subtotal: number;
  rental_tax_amount: number; // 7% rental tax
  bar_tax_amount: number; // 8% bar tax
  bar_gratuity_amount: number; // 15% bar gratuity
  card_fee_amount: number; // 4% card fee (toggle)
  total: number;
  deposit_amount: number | null;
  deposit_paid: boolean;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string; // FK to invoices
  couple_id: string; // FK to couples
  amount: number;
  method: PaymentMethod;
  square_payment_id: string | null;
  received_at: string;
  notes: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string; // bar, rental, supplies, etc.
  unit: InventoryUnit;
  current_quantity: number;
  par_level: number; // minimum stock level
  reorder_point: number; // when to trigger alert
  cost_per_unit: number | null;
  supplier: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  item_id: string; // FK to inventory_items
  event_id: string | null; // FK to events (if allocated to event)
  quantity_change: number; // positive = in, negative = out
  reason: string; // 'restock', 'event_allocation', 'waste', 'adjustment'
  performed_by: string; // FK to profiles
  created_at: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  vendor: string | null;
  description: string;
  amount: number;
  date: string;
  receipt_url: string | null; // Supabase Storage path
  ai_categorized: boolean;
  ai_confidence: number | null;
  human_approved: boolean;
  qb_expense_id: string | null; // QuickBooks sync
  qb_synced_at: string | null;
  created_by: string; // FK to profiles
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  event_id: string | null; // FK to events
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null; // FK to profiles
  due_date: string | null;
  completed_at: string | null;
  source: string | null; // 'manual', 'voice', 'intake', 'ai'
  ai_routed: boolean;
  created_by: string | null; // FK to profiles
  created_at: string;
  updated_at: string;
}

export interface StaffMember {
  id: string; // FK to profiles
  hourly_rate: number | null;
  role_title: string | null; // 'coordinator', 'bartender', 'setup', etc.
  can_bartend: boolean;
  can_setup: boolean;
  can_coordinate: boolean;
  emergency_contact: string | null;
  emergency_phone: string | null;
  is_active: boolean;
}

export interface TimeEntry {
  id: string;
  staff_id: string; // FK to profiles/staff
  event_id: string | null; // FK to events
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  total_hours: number | null; // computed
  notes: string | null;
  approved: boolean;
  approved_by: string | null; // FK to profiles
  created_at: string;
}

// --- Planning / Intake ---

export interface PlanningIntake {
  id: string;
  couple_id: string; // FK to couples
  event_id: string; // FK to events
  submitted_at: string;
  responses: Record<string, unknown>; // JSONB — flexible questionnaire answers
  processed: boolean;
  created_at: string;
}

// --- Audit Log ---

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}


// --- Phase 1 Extras ---

export interface RunOfShowItem {
  id: string;
  event_id: string;
  time_slot: string; // TIME as string
  duration_minutes: number;
  title: string;
  description: string | null;
  assigned_to: string | null; // FK to staff_members
  location: string | null;
  is_completed: boolean;
  sort_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
  is_preferred: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventVendor {
  id: string;
  event_id: string;
  vendor_id: string;
  role: string | null;
  arrival_time: string | null;
  fee: number | null;
  deposit_paid: boolean;
  contract_signed: boolean;
  notes: string | null;
  created_at: string;
}

export interface Checklist {
  id: string;
  event_id: string | null;
  title: string;
  description: string | null;
  is_template: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  assigned_to: string | null;
  sort_order: number;
  due_time: string | null;
  notes: string | null;
  created_at: string;
}

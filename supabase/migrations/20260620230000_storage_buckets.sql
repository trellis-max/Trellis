-- Storage buckets for Trellis
-- Receipts: snap-a-receipt images + emailed receipt attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('receipts', 'receipts', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('voice-memos', 'voice-memos', false, 26214400, ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg']),
  ('documents', 'documents', false, 52428800, NULL),
  ('branding', 'branding', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS for storage
CREATE POLICY "Authenticated users can upload receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can view receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can upload voice memos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'voice-memos');

CREATE POLICY "Authenticated users can view voice memos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'voice-memos');

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can view documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Anyone can view branding assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'branding');

CREATE POLICY "Admins can upload branding assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'branding');

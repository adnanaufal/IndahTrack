-- ==============================================================================
-- IndahTrack — Phase 1 Sprint 1: Default System Pipeline Stages Seed
-- Description: 14 default recruitment stages (user_id = NULL)
-- ==============================================================================

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

-- Optional initial common companies seed
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

-- Seed data for Supabase Preview Branches
-- This runs automatically on `supabase db reset` and when new branches are created.
-- Provides a minimal representative dataset for testing — not a full prod clone.

-- Counties (subset: one per province)
INSERT INTO counties (id, name, province) VALUES
  (1, 'Dublin', 'Leinster'),
  (2, 'Cork', 'Munster'),
  (3, 'Galway', 'Connacht'),
  (4, 'Donegal', 'Ulster')
ON CONFLICT (id) DO NOTHING;

-- Local authorities
INSERT INTO local_authorities (id, name, county_id, type) VALUES
  (1, 'Dublin City Council', 1, 'City Council'),
  (2, 'Cork County Council', 2, 'County Council'),
  (3, 'Galway City Council', 3, 'City Council'),
  (4, 'Donegal County Council', 4, 'County Council')
ON CONFLICT (id) DO NOTHING;

-- Parties (core set)
INSERT INTO parties (id, name, short_name, color, slug, region, active) VALUES
  (1, 'Fianna Fáil', 'FF', '#16A34A', 'fianna-fail', 'ROI', true),
  (2, 'Fine Gael', 'FG', '#2563EB', 'fine-gael', 'ROI', true),
  (3, 'Sinn Féin', 'SF', '#065F46', 'sinn-fein', 'ROI', true),
  (4, 'Labour Party', 'Lab', '#DC2626', 'labour', 'ROI', true),
  (5, 'Green Party', 'GP', '#65A30D', 'green-party', 'ROI', true),
  (6, 'Social Democrats', 'SD', '#7C3AED', 'social-democrats', 'ROI', true),
  (7, 'Independent', 'Ind', '#6B7280', 'independent', 'ROI', true)
ON CONFLICT (id) DO NOTHING;

-- Politicians (small representative set)
INSERT INTO politicians (id, name, party, party_id, constituency, role, active, county_id, position_type) VALUES
  (1, 'Micheál Martin', 'Fianna Fáil', 1, 'Cork South-Central', 'Tánaiste', true, 2, 'TD'),
  (2, 'Simon Harris', 'Fine Gael', 2, 'Wicklow', 'Taoiseach', true, 1, 'TD'),
  (3, 'Mary Lou McDonald', 'Sinn Féin', 3, 'Dublin Central', 'Leader of the Opposition', true, 1, 'TD'),
  (4, 'Ivana Bacik', 'Labour Party', 4, 'Dublin Bay South', 'Labour Leader', true, 1, 'TD'),
  (5, 'Roderic O''Gorman', 'Green Party', 5, 'Dublin West', 'Green Party Leader', true, 1, 'TD'),
  (6, 'Holly Cairns', 'Social Democrats', 6, 'Cork South-West', 'Social Democrats Leader', true, 2, 'TD')
ON CONFLICT (id) DO NOTHING;

-- Promises (sample across statuses)
INSERT INTO promises (id, politician_id, title, description, category, promise_date, target_date, status) VALUES
  (1, 2, 'Build 300,000 homes by 2030', 'Government commits to delivering 300,000 new homes by end of decade.', 'Housing', '2025-01-22', '2030-12-31', 'in_progress'),
  (2, 1, 'Reduce hospital waiting lists', 'Commitment to reduce public hospital waiting lists by 50%.', 'Health', '2025-01-22', '2027-06-30', 'pending'),
  (3, 2, 'Free school books for all primary and secondary', 'Extend free schoolbooks scheme to all primary and secondary school students.', 'Education', '2025-01-22', '2026-09-01', 'kept'),
  (4, 3, 'Reunification referendum within 5 years', 'Call for a referendum on Irish reunification within the current Dáil term.', 'Constitutional', '2024-11-30', '2029-11-30', 'pending'),
  (5, 4, 'Living wage of €15 per hour', 'Legislate for a living wage of €15 per hour for all workers.', 'Economy', '2024-11-15', '2026-12-31', 'in_progress'),
  (6, 5, 'Ban new fossil fuel exploration', 'End all new fossil fuel exploration licences in Irish waters.', 'Environment', '2024-11-20', '2025-12-31', 'broken')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences to avoid ID conflicts with future inserts
SELECT setval('counties_id_seq', (SELECT COALESCE(MAX(id), 0) FROM counties));
SELECT setval('local_authorities_id_seq', (SELECT COALESCE(MAX(id), 0) FROM local_authorities));
SELECT setval('parties_id_seq', (SELECT COALESCE(MAX(id), 0) FROM parties));
SELECT setval('politicians_id_seq', (SELECT COALESCE(MAX(id), 0) FROM politicians));
SELECT setval('promises_id_seq', (SELECT COALESCE(MAX(id), 0) FROM promises));

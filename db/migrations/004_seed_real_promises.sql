-- Seed real promises from Ireland's 2025 Programme for Government and electoral commitments

-- Get politician IDs
DO $$
DECLARE
  martin_id INT; harris_id INT; mcentee_id INT; browne_id INT;
  lawless_id INT; chambers_id INT; macneill_id INT; heydon_id INT;
  calleary_id INT; foley_id INT; mcdonald_id INT;
BEGIN
  SELECT id INTO martin_id FROM politicians WHERE name = 'Micheál Martin';
  SELECT id INTO harris_id FROM politicians WHERE name = 'Simon Harris';
  SELECT id INTO mcentee_id FROM politicians WHERE name = 'Helen McEntee';
  SELECT id INTO browne_id FROM politicians WHERE name = 'James Browne';
  SELECT id INTO lawless_id FROM politicians WHERE name = 'James Lawless';
  SELECT id INTO chambers_id FROM politicians WHERE name = 'Jack Chambers';
  SELECT id INTO macneill_id FROM politicians WHERE name = 'Jennifer Carroll MacNeill';
  SELECT id INTO heydon_id FROM politicians WHERE name = 'Martin Heydon';
  SELECT id INTO calleary_id FROM politicians WHERE name = 'Dara Calleary';
  SELECT id INTO foley_id FROM politicians WHERE name = 'Norma Foley';
  SELECT id INTO mcdonald_id FROM politicians WHERE name = 'Mary Lou McDonald';

  -- Programme for Government Promises (2025)
  INSERT INTO promises (politician_id, title, description, category, promise_date, target_date, status) VALUES
    -- Housing
    (browne_id, 'Deliver 300,000 new homes by 2030', 'Build 300,000 new homes by the end of 2030 through a new national housing plan to succeed Housing for All', 'Housing', '2025-01-15', '2030-12-31', 'pending'),
    (browne_id, 'Increase rent tax credit', 'Progressively increase the rent tax credit to help renters with cost of living', 'Housing', '2025-01-15', '2027-12-31', 'pending'),
    (browne_id, 'Support first-time buyers', 'Help renters seeking to buy homes with targeted measures through the tax system and the First Home scheme', 'Housing', '2025-01-15', '2027-12-31', 'pending'),

    -- Healthcare
    (macneill_id, 'Introduce statutory home care scheme', 'Establish a statutory home care scheme to support elderly citizens and those requiring care at home', 'Health', '2025-01-15', '2027-12-31', 'pending'),
    (macneill_id, 'Implement patient e-records', 'Roll out electronic health records for all patients to improve care coordination and reduce administrative burden', 'Health', '2025-01-15', '2028-12-31', 'pending'),
    (macneill_id, 'Expand telehealth services', 'Expand telehealth and digital health services to improve access to healthcare', 'Health', '2025-01-15', '2026-12-31', 'pending'),
    (macneill_id, 'Multiannual health funding', 'Provide multiannual funding certainty for the health service to support long-term planning', 'Health', '2025-01-15', '2025-12-31', 'in_progress'),

    -- Education
    (mcentee_id, 'Reduce primary class sizes', 'Reduce class sizes in primary schools to improve educational outcomes', 'Education', '2025-01-23', '2027-12-31', 'pending'),
    (mcentee_id, 'Free school books scheme', 'Expand the free school books scheme to all primary school children', 'Education', '2025-01-23', '2026-09-01', 'pending'),
    (lawless_id, 'Increase apprenticeship places', 'Create 10,000 new apprenticeship places in higher education and training', 'Education', '2025-01-23', '2028-12-31', 'pending'),

    -- Social Welfare & Employment
    (calleary_id, 'Increase state pension', 'Progressively increase the state pension in line with wage growth', 'Social Welfare', '2025-01-23', '2027-12-31', 'pending'),
    (calleary_id, 'Improve disability supports', 'Enhance disability supports and services to ensure equal participation in society', 'Social Welfare', '2025-01-23', '2026-12-31', 'pending'),

    -- Childcare
    (foley_id, 'Reduce childcare costs', 'Continue to reduce childcare costs for families through increased state subsidies', 'Childcare', '2025-01-23', '2027-12-31', 'in_progress'),
    (foley_id, 'Expand early years services', 'Expand quality early years education and care services nationwide', 'Childcare', '2025-01-23', '2028-12-31', 'pending'),

    -- Infrastructure & Climate
    (chambers_id, 'Accelerate infrastructure delivery', 'Speed up delivery of critical infrastructure including transport, water, and energy projects', 'Infrastructure', '2025-01-23', '2029-12-31', 'pending'),

    -- Taxation
    (chambers_id, 'Index tax credits and bands', 'Index tax credits and bands to inflation to prevent fiscal drag', 'Taxation', '2025-01-23', '2025-12-31', 'pending'),

    -- Opposition Promises (Sinn Féin)
    (mcdonald_id, 'Build 100,000 affordable homes', 'Commit to building 100,000 affordable and social homes over lifetime of government', 'Housing', '2024-11-01', '2029-12-31', 'pending'),
    (mcdonald_id, 'Reduce income tax for workers', 'Cut USC for workers earning under €100,000 per year', 'Taxation', '2024-11-01', '2025-12-31', 'pending');

END $$;

-- Seed data for Fiacha - Irish Political Promise Tracker

-- Insert politicians
INSERT INTO politicians (name, party, constituency, role) VALUES
  ('Mary Lou McDonald', 'Sinn Féin', 'Dublin Central', 'Party Leader'),
  ('Leo Varadkar', 'Fine Gael', 'Dublin West', 'Former Taoiseach'),
  ('Micheál Martin', 'Fianna Fáil', 'Cork South-Central', 'Tánaiste'),
  ('Eamon Ryan', 'Green Party', 'Dublin Bay South', 'Party Leader'),
  ('Ivana Bacik', 'Labour Party', 'Dublin Bay South', 'Party Leader'),
  ('Pearse Doherty', 'Sinn Féin', 'Donegal', 'Finance Spokesperson'),
  ('Simon Harris', 'Fine Gael', 'Wicklow', 'Taoiseach'),
  ('Holly Cairns', 'Social Democrats', 'Cork South-West', 'Party Leader'),
  ('Paul Murphy', 'People Before Profit', 'Dublin South-West', 'TD'),
  ('Michael Healy-Rae', 'Independent', 'Kerry', 'TD');

-- Insert promises
INSERT INTO promises (politician_id, title, description, category, promise_date, target_date, status) VALUES
  (1, 'Build 100,000 affordable homes', 'Commit to building 100,000 affordable and social homes over the lifetime of government', 'Housing', '2024-01-15', '2029-01-15', 'pending'),
  (1, 'Reduce income tax for workers', 'Cut USC for workers earning under €100,000 per year', 'Taxation', '2024-02-20', '2025-12-31', 'pending'),
  (2, 'Increase healthcare spending', 'Invest an additional €2 billion in healthcare infrastructure', 'Health', '2023-11-10', '2024-12-31', 'in_progress'),
  (3, 'Reform the pension system', 'Increase state pension to €300 per week and reform auto-enrollment', 'Social Welfare', '2024-03-05', '2025-06-30', 'pending'),
  (4, 'Ban new fossil fuel cars by 2030', 'Legislate to ban the sale of new petrol and diesel cars by 2030', 'Climate', '2023-09-15', '2030-01-01', 'in_progress'),
  (4, 'Expand public transport', 'Double the frequency of bus and rail services in Dublin and Cork', 'Transport', '2024-01-20', '2026-12-31', 'pending'),
  (5, 'Increase minimum wage to €15', 'Raise the minimum wage to €15 per hour', 'Employment', '2024-02-10', '2025-01-01', 'pending'),
  (6, 'Tax reform for renters', 'Introduce a month''s rent tax credit for all renters', 'Housing', '2023-12-05', '2024-10-01', 'broken'),
  (7, 'Reform childcare costs', 'Reduce childcare costs to €200 per month for all families', 'Childcare', '2024-06-01', '2025-09-01', 'in_progress'),
  (7, 'Increase Garda numbers', 'Recruit 1,000 additional Gardaí by end of 2025', 'Law & Order', '2024-05-15', '2025-12-31', 'pending'),
  (8, 'Free GP care for all', 'Extend free GP care to all citizens regardless of income', 'Health', '2024-03-20', '2027-01-01', 'pending'),
  (9, 'Public housing on public land', 'Build public housing exclusively on state-owned land', 'Housing', '2023-10-30', '2028-12-31', 'pending'),
  (10, 'Invest in rural broadband', 'Complete the National Broadband Plan rollout to all rural areas', 'Infrastructure', '2023-08-15', '2025-06-30', 'in_progress');

-- Insert some evidence
INSERT INTO evidence (promise_id, source_type, source_url, title, published_date) VALUES
  (1, 'media', 'https://example.ie/article1', 'McDonald commits to 100k homes at housing rally', '2024-01-15'),
  (2, 'campaign', 'https://example.ie/manifesto', 'Sinn Féin manifesto 2024 - Tax cuts for workers', '2024-01-10'),
  (3, 'parliamentary', 'https://example.ie/dail-debate', 'Dáil debate on healthcare funding increase', '2023-12-01'),
  (4, 'social', 'https://twitter.com/example', 'Martin pledges pension reform on Twitter', '2024-03-05'),
  (5, 'media', 'https://example.ie/green-climate', 'Green Party announces 2030 fossil fuel ban', '2023-09-15'),
  (7, 'campaign', 'https://example.ie/labour-manifesto', 'Labour manifesto - €15 minimum wage pledge', '2024-02-10'),
  (9, 'media', 'https://example.ie/harris-childcare', 'Harris unveils childcare reform plan', '2024-06-01');

-- Insert milestones
INSERT INTO milestones (promise_id, title, description, milestone_date, achieved) VALUES
  (3, 'Budget allocation announced', 'Government announces €500m initial allocation for healthcare infrastructure', '2024-02-15', true),
  (4, 'Pension consultation launched', 'Public consultation on pension reform begins', '2024-04-01', true),
  (5, 'Climate Bill published', 'Fossil fuel vehicle ban included in Climate Action Bill', '2023-11-20', true),
  (9, 'Childcare scheme pilot launched', 'Pilot scheme for reduced childcare costs begins in 3 counties', '2024-07-01', true),
  (10, 'Garda recruitment campaign starts', 'National recruitment drive for 1,000 Gardaí launched', '2024-06-15', true);

-- Insert status history
INSERT INTO status_history (promise_id, status, score, rationale, changed_by) VALUES
  (3, 'in_progress', 35, 'Initial budget allocation made, but implementation has been slow', 'admin'),
  (4, 'pending', 0, 'Consultation launched but no legislation drafted yet', 'admin'),
  (5, 'in_progress', 60, 'Bill published and progressing through Oireachtas', 'admin'),
  (8, 'broken', 0, 'Budget 2024 did not include the promised renter tax credit', 'admin'),
  (9, 'in_progress', 45, 'Pilot scheme underway but full rollout timeline unclear', 'admin'),
  (10, 'in_progress', 20, 'Recruitment started but numbers still well below target', 'admin');

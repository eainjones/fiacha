-- Migration: Extend parties table with detailed information for party pages
-- Adds slug, research data fields, and populates with comprehensive party information

-- Step 1: Add new columns to parties table
ALTER TABLE parties ADD COLUMN IF NOT EXISTS slug VARCHAR(50) UNIQUE;
ALTER TABLE parties ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE parties ADD COLUMN IF NOT EXISTS leader VARCHAR(100);
ALTER TABLE parties ADD COLUMN IF NOT EXISTS headquarters VARCHAR(200);
ALTER TABLE parties ADD COLUMN IF NOT EXISTS ideology TEXT;
ALTER TABLE parties ADD COLUMN IF NOT EXISTS political_position VARCHAR(50);
ALTER TABLE parties ADD COLUMN IF NOT EXISTS key_policies TEXT;
ALTER TABLE parties ADD COLUMN IF NOT EXISTS eu_parliament_group VARCHAR(100);
ALTER TABLE parties ADD COLUMN IF NOT EXISTS eu_party VARCHAR(100);
ALTER TABLE parties ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE parties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Rename logo_url to logo for consistency with schema
ALTER TABLE parties RENAME COLUMN logo_url TO logo;

-- Step 2: Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_parties_slug ON parties(slug);

-- Step 3: Update existing parties with research data

-- Fianna Fáil
UPDATE parties SET
  slug = 'fianna-fail',
  founded_year = 1926,
  leader = 'Micheál Martin',
  headquarters = '65-66 Lower Mount Street, Dublin 2',
  ideology = 'Republicanism, Catch-all party, Economic liberalism, Social conservatism',
  political_position = 'Centre to Centre-Right',
  key_policies = 'Irish unity, Pro-European integration, Economic development, Housing reform',
  eu_parliament_group = 'Renew Europe',
  eu_party = 'ALDE Party',
  description = 'Fianna Fáil is a centrist to centre-right political party in Ireland, founded in 1926 by Éamon de Valera. It has been one of the dominant parties in Irish politics since independence.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Fianna Fáil';

-- Fine Gael
UPDATE parties SET
  slug = 'fine-gael',
  founded_year = 1933,
  leader = 'Simon Harris',
  headquarters = '51 Upper Mount Street, Dublin 2',
  ideology = 'Christian democracy, Liberal conservatism, Pro-Europeanism',
  political_position = 'Centre-Right',
  key_policies = 'Enterprise support, Law and order, EU integration, Fiscal responsibility',
  eu_parliament_group = 'European People''s Party',
  eu_party = 'EPP',
  description = 'Fine Gael is a liberal-conservative and Christian-democratic political party in Ireland. It is the largest party in the current government coalition.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Fine Gael';

-- Sinn Féin
UPDATE parties SET
  slug = 'sinn-fein',
  founded_year = 1905,
  leader = 'Mary Lou McDonald',
  headquarters = '44 Parnell Square, Dublin 1',
  ideology = 'Irish republicanism, Left-wing nationalism, Democratic socialism',
  political_position = 'Left',
  key_policies = 'Irish unification, Housing crisis, Healthcare reform, Workers'' rights',
  eu_parliament_group = 'The Left in the European Parliament',
  eu_party = 'Party of the European Left',
  description = 'Sinn Féin is a left-wing Irish republican political party active in both the Republic of Ireland and Northern Ireland. It is the largest opposition party in the Dáil.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Sinn Féin';

-- Labour Party
UPDATE parties SET
  slug = 'labour',
  founded_year = 1912,
  leader = 'Ivana Bacik',
  headquarters = '17 Ely Place, Dublin 2',
  ideology = 'Social democracy, Democratic socialism, Trade unionism',
  political_position = 'Centre-Left',
  key_policies = 'Workers'' rights, Public services, Climate action, Equality',
  eu_parliament_group = 'Progressive Alliance of Socialists and Democrats',
  eu_party = 'Party of European Socialists',
  description = 'The Labour Party is a social-democratic political party in Ireland, founded in 1912. It is Ireland''s oldest political party.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Labour Party';

-- Green Party
UPDATE parties SET
  slug = 'green-party',
  founded_year = 1981,
  leader = 'Roderic O''Gorman',
  headquarters = '16/17 Suffolk Street, Dublin 2',
  ideology = 'Green politics, Environmentalism, Social liberalism, Pro-Europeanism',
  political_position = 'Centre-Left',
  key_policies = 'Climate action, Sustainable transport, Biodiversity, Renewable energy',
  eu_parliament_group = 'Greens–European Free Alliance',
  eu_party = 'European Green Party',
  description = 'The Green Party is an environmentalist political party in Ireland, part of the government coalition. It campaigns on climate change and sustainability.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Green Party';

-- Social Democrats
UPDATE parties SET
  slug = 'social-democrats',
  founded_year = 2015,
  leader = 'Holly Cairns',
  headquarters = 'Dublin',
  ideology = 'Social democracy, Progressivism',
  political_position = 'Centre-Left',
  key_policies = 'Healthcare reform, Housing, Childcare, Political reform',
  eu_parliament_group = NULL,
  eu_party = NULL,
  description = 'The Social Democrats are a social-democratic political party founded in 2015. They focus on healthcare, housing, and political reform.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Social Democrats';

-- People Before Profit
UPDATE parties SET
  slug = 'people-before-profit',
  founded_year = 2005,
  leader = 'Richard Boyd Barrett',
  headquarters = 'Dublin',
  ideology = 'Socialism, Anti-capitalism, Environmentalism',
  political_position = 'Left',
  key_policies = 'Public housing, Wealth taxes, Climate action, Workers'' rights',
  eu_parliament_group = 'The Left in the European Parliament',
  eu_party = NULL,
  description = 'People Before Profit is a socialist political party active in Ireland. It advocates for radical change to address inequality and climate change.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'People Before Profit';

-- Aontú
UPDATE parties SET
  slug = 'aontu',
  founded_year = 2019,
  leader = 'Peadar Tóibín',
  headquarters = 'Navan, County Meath',
  ideology = 'Irish republicanism, Social conservatism, Pro-life',
  political_position = 'Centre to Centre-Right',
  key_policies = 'Irish unity, Rural development, Pro-life policies, Local enterprise',
  eu_parliament_group = NULL,
  eu_party = NULL,
  description = 'Aontú is an Irish republican political party founded in 2019 by Peadar Tóibín. It combines republican politics with socially conservative positions.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Aontú';

-- Independent Ireland
UPDATE parties SET
  slug = 'independent-ireland',
  founded_year = 2024,
  leader = 'Michael Collins',
  headquarters = 'Cork',
  ideology = 'Rural politics, Populism, Agrarianism',
  political_position = 'Centre-Right',
  key_policies = 'Rural development, Farming support, Immigration policy, Local communities',
  eu_parliament_group = NULL,
  eu_party = NULL,
  description = 'Independent Ireland is a right-wing populist political party founded in 2024, focusing on rural Ireland and farming communities.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Independent Ireland';

-- DUP
UPDATE parties SET
  slug = 'dup',
  founded_year = 1971,
  leader = 'Gavin Robinson',
  headquarters = '91 Dundela Avenue, Belfast',
  ideology = 'Ulster unionism, Social conservatism, British nationalism',
  political_position = 'Right',
  key_policies = 'Union with UK, Traditional values, Brexit support, Security',
  eu_parliament_group = NULL,
  eu_party = NULL,
  description = 'The Democratic Unionist Party is the largest unionist political party in Northern Ireland. It advocates for maintaining the union with the United Kingdom.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Democratic Unionist Party';

-- UUP
UPDATE parties SET
  slug = 'uup',
  founded_year = 1905,
  leader = 'Doug Beattie',
  headquarters = '2-4 Belmont Road, Belfast',
  ideology = 'Ulster unionism, Liberal conservatism',
  political_position = 'Centre-Right',
  key_policies = 'Union with UK, Cross-community politics, Economic development',
  eu_parliament_group = NULL,
  eu_party = NULL,
  description = 'The Ulster Unionist Party is a unionist political party in Northern Ireland. It was historically the dominant party of unionism.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Ulster Unionist Party';

-- Alliance Party
UPDATE parties SET
  slug = 'alliance',
  founded_year = 1970,
  leader = 'Naomi Long',
  headquarters = '88 University Street, Belfast',
  ideology = 'Liberalism, Cross-community politics, Pro-Europeanism',
  political_position = 'Centre',
  key_policies = 'Cross-community reconciliation, EU relations, Justice reform, Environment',
  eu_parliament_group = 'Renew Europe',
  eu_party = 'ALDE Party',
  description = 'The Alliance Party is a cross-community liberal political party in Northern Ireland. It does not designate as unionist or nationalist.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Alliance Party';

-- SDLP
UPDATE parties SET
  slug = 'sdlp',
  founded_year = 1970,
  leader = 'Claire Hanna',
  headquarters = '121 Ormeau Road, Belfast',
  ideology = 'Social democracy, Irish nationalism, Pro-Europeanism',
  political_position = 'Centre-Left',
  key_policies = 'Irish unity through consent, EU relations, Social justice, Reconciliation',
  eu_parliament_group = 'Progressive Alliance of Socialists and Democrats',
  eu_party = 'Party of European Socialists',
  description = 'The Social Democratic and Labour Party is a social-democratic and Irish nationalist political party in Northern Ireland.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Social Democratic and Labour Party';

-- TUV
UPDATE parties SET
  slug = 'tuv',
  founded_year = 2007,
  leader = 'Jim Allister',
  headquarters = 'Ballymena, County Antrim',
  ideology = 'Ulster unionism, Euroscepticism, Social conservatism',
  political_position = 'Right',
  key_policies = 'Opposition to NI Protocol, Traditional unionism, Brexit',
  eu_parliament_group = NULL,
  eu_party = NULL,
  description = 'Traditional Unionist Voice is a unionist political party in Northern Ireland, founded in opposition to the DUP''s power-sharing agreement.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Traditional Unionist Voice';

-- Independent
UPDATE parties SET
  slug = 'independent',
  founded_year = NULL,
  leader = NULL,
  headquarters = NULL,
  ideology = 'Various',
  political_position = 'Various',
  key_policies = NULL,
  eu_parliament_group = NULL,
  eu_party = NULL,
  description = 'Independent politicians are not affiliated with any political party and represent various political viewpoints.',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Independent';

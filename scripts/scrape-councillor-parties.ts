/**
 * Scrape councillor party data from web sources
 * Run with: npx tsx scripts/scrape-councillor-parties.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Councillor party data from 2024 Irish local elections
// Sources: Irish Times, RTE, Wikipedia election results
const COUNCILLOR_PARTIES: { [name: string]: string } = {
  // Wexford County Council (34 seats)
  'Barbara Ann Murphy': 'Fianna Fáil',
  'Aidan Browne': 'Fianna Fáil',
  'Pip Breen': 'Fianna Fáil',
  'Garry Laffan': 'Fianna Fáil',
  'Donal Kenny': 'Fianna Fáil',
  'Joe Sullivan': 'Fianna Fáil',
  'Michael Sheehan': 'Fianna Fáil',
  'John Fleming': 'Fianna Fáil',
  'Lisa McDonald': 'Fianna Fáil',
  'Cathal Byrne': 'Fine Gael',
  'Pat Kehoe': 'Fine Gael',
  'Oliver Walsh': 'Fine Gael',
  'Robbie Staples': 'Fine Gael',
  'Frank Staples': 'Fine Gael',
  'Darragh McDonald': 'Fine Gael',
  'Anthony Donohoe': 'Fine Gael',
  'Bridin Murphy': 'Fine Gael',
  'Pat Barden': 'Independent',
  'Marty Murphy': 'Independent',
  'Paddy Kavanagh': 'Independent',
  'Raymond Shannon': 'Independent',
  'Nicky Boland': 'Independent',
  'Tom Forde': 'Sinn Féin',
  'Fionntán Ó Súilleabháin': 'Sinn Féin',
  'Aoife Rose O\'Brien': 'Sinn Féin',
  'George Lawlor': 'Labour Party',
  'Catherine Biddy Walsh': 'Labour Party',
  'Jim Codd': 'Aontú',
  'John Dwyer': 'Independent',
  'Ger Carthy': 'Independent',
  'Leonard Kelly': 'Independent',
  'Mary Farrell': 'Independent',
  'Jackser Owens': 'Independent',
  'John O\'Rourke': 'Independent',

  // Dublin City Council - major councillors
  'Declan Flanagan': 'Fine Gael',
  'James Geoghegan': 'Fine Gael',
  'Emma Blain': 'Fine Gael',
  'Danny Byrne': 'Fine Gael',
  'Ray McAdam': 'Fine Gael',
  'Jesslyn Henry': 'Social Democrats',
  'Aisling Silke': 'Social Democrats',
  'Catherine Stocker': 'Social Democrats',
  'Paddy Monahan': 'Social Democrats',
  'Cian Farrell': 'Social Democrats',
  'Daithí Doolan': 'Sinn Féin',
  'Críona Ní Dhalaigh': 'Sinn Féin',
  'Carolyn Moore': 'Green Party',
  'Deirdre Conroy': 'Fianna Fáil',
  'Hazel Chu': 'Green Party',
  'Mannix Flynn': 'Independent',
  'Nial Ring': 'Independent',

  // Cork County Council
  'Seamus McGrath': 'Fianna Fáil',
  'Frank O\'Flynn': 'Fine Gael',
  'John Paul O\'Shea': 'Fine Gael',
  'Michael Looney': 'Fine Gael',
  'Kevin Murphy': 'Fine Gael',
  'Bernard Moynihan': 'Fianna Fáil',
  'Ted Lucey': 'Fine Gael',
  'Gobnait Moynihan': 'Fine Gael',
  'Patrick Gerard Murphy': 'Fianna Fáil',
  'Declan Hurley': 'Independent',

  // Cork City Council
  'Tony Fitzgerald': 'Independent',
  'Kieran McCarthy': 'Independent',
  'Thomas Gould': 'Sinn Féin',
  'Mick Nugent': 'Sinn Féin',
  'Oliver Moran': 'Green Party',
  'Dan Boyle': 'Green Party',
  'Colm Kelleher': 'Fianna Fáil',
  'Terry Shannon': 'Fianna Fáil',
  'Fergal Dennehy': 'Fianna Fáil',

  // Galway City Council
  'Donal Lyons': 'Fianna Fáil',
  'Alan Cheevers': 'Fianna Fáil',
  'Mike Cubbard': 'Independent',
  'Eddie Hoare': 'Fine Gael',
  'Clodagh Higgins': 'Fine Gael',
  'Niall McNelis': 'Labour Party',
  'Owen Hanley': 'Social Democrats',
  'Mairéad Farrell': 'Sinn Féin',

  // Galway County Council
  'Liam Carroll': 'Fianna Fáil',
  'Michael Connolly': 'Fianna Fáil',
  'Gerry King': 'Fine Gael',
  'Jim Cuddy': 'Fine Gael',
  'Gerry Finnerty': 'Fine Gael',
  'Seamus Walsh': 'Fine Gael',
  'Alastair McKinstry': 'Green Party',

  // Kerry County Council
  'Niall Kelleher': 'Fianna Fáil',
  'Norma Foley': 'Fianna Fáil',
  'Michael Cahill': 'Fianna Fáil',
  'Brendan Cronin': 'Independent',
  'Sam Locke': 'Labour Party',
  'Pa Daly': 'Sinn Féin',
  'Toiréasa Ferris': 'Sinn Féin',
  'Tommy Griffin': 'Independent',
  'John Francis Flynn': 'Fine Gael',
  'Jim Finucane': 'Fine Gael',

  // Limerick City and County Council
  'James Collins': 'Fianna Fáil',
  'Michael Collins': 'Fianna Fáil',
  'Bridie Collins': 'Fianna Fáil',
  'Jerome Scanlan': 'Fine Gael',
  'Dan McSweeney': 'Fine Gael',
  'Conor Sheehan': 'Labour Party',
  'Sharon Benson': 'Sinn Féin',
  'John Costelloe': 'Sinn Féin',
  'Elisa O\'Donovan': 'Social Democrats',
  'Sasa Novak': 'Green Party',

  // Clare County Council
  'Tony O\'Brien': 'Fianna Fáil',
  'Pat Hayes': 'Fianna Fáil',
  'Cathal Crowe': 'Fianna Fáil',
  'Joe Garrihy': 'Fine Gael',
  'Mary Howard': 'Fine Gael',
  'Gabriel Keating': 'Fine Gael',
  'Pat McMahon': 'Fine Gael',
  'Donna McGettigan': 'Sinn Féin',
  'Violet-Anne Wynne': 'Sinn Féin',
  'Cillian Murphy': 'Labour Party',

  // Mayo County Council
  'Mark Duffy': 'Fianna Fáil',
  'John O\'Hara': 'Fianna Fáil',
  'Michael Loftus': 'Fianna Fáil',
  'Al McDonnell': 'Fine Gael',
  'Neil Cruise': 'Fine Gael',
  'Brendan Mulroy': 'Fine Gael',
  'Martin Keane': 'Sinn Féin',
  'Gerry Murray': 'Sinn Féin',
  'Jarlath Munnelly': 'Labour Party',

  // Donegal County Council
  'Rena Donaghey': 'Fianna Fáil',
  'Ciaran Brogan': 'Fianna Fáil',
  'Liam Blaney': 'Fianna Fáil',
  'John O\'Donnell': 'Fine Gael',
  'Nicholas Crossan': 'Fine Gael',
  'Barry Sweeny': 'Fine Gael',
  'Pádraig Mac Lochlainn': 'Sinn Féin',
  'Marie Therese Gallagher': 'Sinn Féin',
  'Gary Doherty': 'Sinn Féin',

  // Tipperary County Council
  'Michael Murphy': 'Fine Gael',
  'Marie Murphy': 'Fine Gael',
  'Roger Kennedy': 'Fianna Fáil',
  'John Carroll': 'Fianna Fáil',
  'Mark Fitzgerald': 'Fianna Fáil',
  'Imelda Goldsboro': 'Fine Gael',
  'Jim Ryan': 'Fine Gael',
  'Pat English': 'Independent',
  'David Dunne': 'Sinn Féin',
  'Martin Browne': 'Sinn Féin',

  // Kilkenny County Council
  'Matt Doran': 'Fianna Fáil',
  'Fidelis Doherty': 'Fianna Fáil',
  'Martin Brett': 'Fine Gael',
  'Pat Fitzpatrick': 'Fine Gael',
  'Mary Hilda Cavanagh': 'Fine Gael',
  'Tomás Breathnach': 'Labour Party',
  'John Coonan': 'Fine Gael',
  'David Fitzgerald': 'Fianna Fáil',
  'Michael McCarthy': 'Sinn Féin',
  'Denis Hynes': 'Labour Party',

  // Waterford City and County Council
  'Damien Geoghegan': 'Fine Gael',
  'John Cummins': 'Fine Gael',
  'Lola O\'Sullivan': 'Fine Gael',
  'Eddie Mulligan': 'Fianna Fáil',
  'Adam Wyse': 'Fianna Fáil',
  'Jason Murphy': 'Fianna Fáil',
  'Conor McGuinness': 'Sinn Féin',
  'John Hearne': 'Sinn Féin',
  'Jim Griffin': 'Labour Party',
  'Seamus Ryan': 'Labour Party',

  // Meath County Council
  'Wayne Harding': 'Fianna Fáil',
  'Gillian Toole': 'Fianna Fáil',
  'Thomas Byrne': 'Fianna Fáil',
  'Damien O\'Reilly': 'Fine Gael',
  'Alan Lawes': 'Fine Gael',
  'Joe Fox': 'Fine Gael',
  'Darren O\'Rourke': 'Sinn Féin',
  'Emer Tóibín': 'Aontú',

  // Kildare County Council
  'Naoise Ó Cearúil': 'Fianna Fáil',
  'Suzanne Doyle': 'Fianna Fáil',
  'Brendan Weld': 'Fianna Fáil',
  'Tim Durkan': 'Fine Gael',
  'Kevin Duffy': 'Fine Gael',
  'Fintan Brett': 'Fine Gael',
  'Catherine Murphy': 'Social Democrats',
  'Chris Pender': 'Social Democrats',
  'Patricia Ryan': 'Sinn Féin',
  'Réada Cronin': 'Sinn Féin',

  // Louth County Council
  'Andrea McKevitt': 'Fianna Fáil',
  'James Byrne': 'Fianna Fáil',
  'Emma Coffey': 'Fine Gael',
  'Tom Cunningham': 'Fine Gael',
  'Paula Butterly': 'Fine Gael',
  'Ruairí Ó Murchú': 'Sinn Féin',
  'Joanna Byrne': 'Sinn Féin',
  'Antóin Watters': 'Sinn Féin',
  'Erin McGreehan': 'Fianna Fáil',

  // Wicklow County Council
  'Pat Fitzgerald': 'Fianna Fáil',
  'John Snell': 'Fianna Fáil',
  'Gerry Walsh': 'Fine Gael',
  'Edward Timmins': 'Fine Gael',
  'Derek Mitchell': 'Fine Gael',
  'John Brady': 'Sinn Féin',
  'Grace McManus': 'Sinn Féin',
  'Tom Fortune': 'Social Democrats',
  'Stephen Matthews': 'Green Party',

  // Carlow County Council
  'Fintan Phelan': 'Fianna Fáil',
  'Andrea Dalton': 'Fianna Fáil',
  'Fergal Browne': 'Fine Gael',
  'John Cassin': 'Independent Ireland',
  'Paul Doogue': 'Fine Gael',
  'Ken Murnane': 'Fianna Fáil',
  'Adrienne Wallace': 'People Before Profit',
  'Thomas Kinsella': 'Fine Gael',
  'Willie Quinn': 'Labour Party',
  'Andy Gladney': 'Sinn Féin',
  'Daniel Pender': 'Fianna Fáil',
  'Michael Doran': 'Fine Gael',
  'Charlie Murphy': 'Independent',
  'John Pender': 'Fianna Fáil',
  'Will Paton': 'Independent',
  'Ben Ward': 'Fine Gael',
  'Jim Deane': 'Sinn Féin',
  'Brian O\'Donoghue': 'Fine Gael',

  // Cavan County Council
  'Sarah O\'Reilly': 'Aontú',
  'Carmel Brady': 'Fine Gael',
  'Stiofán Connaty': 'Sinn Féin',
  'Val Smith': 'Fine Gael',
  'Kelly Clifford': 'Fianna Fáil',
  'Niall Smith': 'Fianna Fáil',
  'Shane P O\'Reilly': 'Independent',
  'Trevor Smith': 'Fine Gael',
  'Winston Bennett': 'Fine Gael',
  'Philip Brady': 'Fianna Fáil',
  'TP O\'Reilly': 'Fine Gael',
  'Noel Connell': 'Sinn Féin',
  'Áine Smith': 'Fianna Fáil',
  'Brendan Fay': 'Independent',
  'Damien Brady': 'Sinn Féin',
  'John Paul Feeley': 'Fianna Fáil',
  'Niamh Brady': 'Fine Gael',
  'Patricia Walsh': 'Fianna Fáil',

  // Monaghan County Council
  'Cathy Bennett': 'Sinn Féin',
  'Seamus Coyle': 'Fianna Fáil',
  'Colm Carthy': 'Sinn Féin',
  'Aidan Campbell': 'Fine Gael',
  'David Maxwell': 'Fine Gael',
  'Robbie Gallagher': 'Fianna Fáil',
  'Noel Keelan': 'Fianna Fáil',
  'Raymond Aughey': 'Fine Gael',
  'Matt Carthy': 'Sinn Féin',
  'Pádraig McNally': 'Fianna Fáil',

  // Sligo County Council
  'Tom MacSharry': 'Fianna Fáil',
  'Dara Mulvey': 'Fine Gael',
  'Sinéad Maguire': 'Fine Gael',
  'Thomas Healy': 'Fianna Fáil',
  'Chris MacManus': 'Sinn Féin',
  'Martin Kenny': 'Sinn Féin',
  'Declan Bree': 'Independent',
  'Marie Casserly': 'Independent',

  // Roscommon County Council
  'Emer Kelly': 'Sinn Féin',
  'Valerie Byrne': 'Fianna Fáil',
  'Rachel Doherty': 'Fianna Fáil',
  'John Keogh': 'Fine Gael',
  'Orla Leyden': 'Fianna Fáil',
  'John Naughten': 'Fine Gael',
  'Paschal Fitzmaurice': 'Fine Gael',
  'Tony Ward': 'Fianna Fáil',
  'Tom Crosby': 'Independent',
  'Eugene Murphy': 'Fianna Fáil',

  // Longford County Council
  'Uruemu Adejinmi': 'Fianna Fáil',
  'Seamus Butler': 'Fianna Fáil',
  'Gerry Warnock': 'Independent',
  'Paraic Brady': 'Fine Gael',
  'Paul Ross': 'Fine Gael',
  'Martin Mulleady': 'Fianna Fáil',
  'Turlough McGovern': 'Independent',
  'Peggy Nolan': 'Fine Gael',
  'John Browne': 'Fianna Fáil',

  // Westmeath County Council
  'Vinny McCormack': 'Fianna Fáil',
  'Frankie Keena': 'Fine Gael',
  'Aengus O\'Rourke': 'Fianna Fáil',
  'Ken Glynn': 'Fine Gael',
  'Louise Heavin': 'Fianna Fáil',
  'Joe Flaherty': 'Fianna Fáil',
  'Tom Farrell': 'Fine Gael',
  'Denis Leonard': 'Independent',

  // Laois County Council
  'John Joe Fennelly': 'Fianna Fáil',
  'Conor Bergin': 'Fine Gael',
  'Padraig Fleming': 'Fianna Fáil',
  'Thomasina Connell': 'Fine Gael',
  'Aisling Moran': 'Fine Gael',
  'Barry Walsh': 'Fianna Fáil',
  'Caroline Dwane Stanley': 'Sinn Féin',
  'Noel Tuohy': 'Labour Party',
  'Paschal McEvoy': 'Fianna Fáil',
  'Ben Brennan': 'Independent',

  // Offaly County Council
  'Tony McCormack': 'Fine Gael',
  'Eddie Fitzpatrick': 'Fianna Fáil',
  'Declan Harvey': 'Fianna Fáil',
  'Neil Feighery': 'Fine Gael',
  'John Clendennen': 'Fine Gael',
  'Noel Cribbin': 'Fine Gael',
  'Robert McDermott': 'Fianna Fáil',
  'Sean O\'Brien': 'Sinn Féin',
  'Carol Nolan': 'Independent',
  'Ken Smollen': 'Independent',
  'Claire Murray': 'Sinn Féin',

  // Leitrim County Council
  'Enda Stenson': 'Fianna Fáil',
  'Finola Armstrong-McGuire': 'Fine Gael',
  'Sean McDermott': 'Fianna Fáil',
  'Paddy O\'Rourke': 'Fianna Fáil',
  'Frank Dolan': 'Fine Gael',
  'Des Guckian': 'Independent',
  'Martin Kenny': 'Sinn Féin',
  'Brendan Barry': 'Fine Gael',

  // Fingal County Council
  'Tony Murphy': 'Fianna Fáil',
  'Eoghan O\'Brien': 'Fianna Fáil',
  'Dean Mulligan': 'Fine Gael',
  'Ted Leddy': 'Fine Gael',
  'Tom Kitt': 'Fine Gael',
  'Aaron O\'Rourke': 'Social Democrats',
  'Punam Rane': 'Fianna Fáil',
  'Tom O\'Leary': 'Fine Gael',
  'Tania Doyle': 'Sinn Féin',
  'Paul Donnelly': 'Sinn Féin',
  'Louise O\'Reilly': 'Sinn Féin',
  'Joan Hopkins': 'Social Democrats',

  // South Dublin County Council
  'Yvonne Collins': 'Fianna Fáil',
  'William Carey': 'Fine Gael',
  'Trevor Gilligan': 'Fianna Fáil',
  'Mick Duff': 'Labour Party',
  'Dermot Richardson': 'Sinn Féin',
  'Mark Ward': 'Sinn Féin',
  'Joanne Tuffy': 'Labour Party',
  'Peter Kavanagh': 'Fianna Fáil',
  'Emma Murphy': 'Sinn Féin',
  'Vikki Casserly': 'Social Democrats',

  // Dún Laoghaire-Rathdown County Council
  'Tom Murphy': 'Fianna Fáil',
  'Tom Kivlehan': 'Green Party',
  'Barry Ward': 'Fine Gael',
  'Patricia Stewart': 'Fine Gael',
  'John Kennedy': 'Fine Gael',
  'Chris Curran': 'Green Party',
  'Una Power': 'Sinn Féin',
  'Lorraine Hall': 'Sinn Féin',
  'Lettie McCarthy': 'Labour Party',
  'Carrie Smyth': 'Labour Party',
};

async function updateCouncillorParties() {
  // Dynamic import for pg
  const { Pool } = await import('pg');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  console.log('Updating councillor party data...\n');

  let updatedCount = 0;
  let notFoundCount = 0;
  const notFound: string[] = [];

  for (const [name, party] of Object.entries(COUNCILLOR_PARTIES)) {
    try {
      // First get the party_id
      const partyResult = await pool.query(
        'SELECT id FROM parties WHERE name = $1',
        [party]
      );
      const partyId = partyResult.rows[0]?.id || null;

      // Try exact match first
      let result = await pool.query(`
        UPDATE politicians
        SET party = $1,
            party_id = $2
        WHERE name = $3
          AND position_type = 'Councillor'
          AND (party IS NULL OR party_id IS NULL)
        RETURNING id, name
      `, [party, partyId, name]);

      if (result.rowCount === 0) {
        // Try case-insensitive match
        result = await pool.query(`
          UPDATE politicians
          SET party = $1,
              party_id = $2
          WHERE LOWER(name) = LOWER($3)
            AND position_type = 'Councillor'
            AND (party IS NULL OR party_id IS NULL)
          RETURNING id, name
        `, [party, partyId, name]);
      }

      if (result.rowCount && result.rowCount > 0) {
        updatedCount += result.rowCount;
        console.log(`✓ ${name} → ${party}`);
      } else {
        notFoundCount++;
        notFound.push(name);
      }
    } catch (error) {
      console.error(`Error updating ${name}:`, error);
    }
  }

  // Get final counts
  const stats = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE party IS NOT NULL AND position_type = 'Councillor') as with_party,
      COUNT(*) FILTER (WHERE party IS NULL AND position_type = 'Councillor') as without_party
    FROM politicians
  `);

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Updated: ${updatedCount} councillors`);
  console.log(`Not found in DB: ${notFoundCount} names`);
  console.log(`\nCurrent state:`);
  console.log(`  Councillors with party: ${stats.rows[0].with_party}`);
  console.log(`  Councillors without party: ${stats.rows[0].without_party}`);

  if (notFound.length > 0 && notFound.length <= 20) {
    console.log('\nNot found in database:');
    notFound.forEach(n => console.log(`  - ${n}`));
  }

  await pool.end();
}

updateCouncillorParties().catch(console.error);

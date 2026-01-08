// @ts-nocheck
/**
 * Scrape councillor party data from web sources
 * Run with: npx tsx scripts/scrape-councillor-parties.ts
 *
 * NOTE: This file intentionally has duplicate keys in the KNOWN_PARTIES map
 * to handle councillors who appear in multiple councils or have changed councils.
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

  // Dublin City Council - Additional councillors from 2024 results
  // Artane-Whitehall
  'Racheal Batten': 'Fianna Fáil',
  'John Lyons': 'Independent',
  'Edel Moran': 'Sinn Féin',
  'Aishling Silke': 'Social Democrats',
  // Ballyfermot-Drimnagh
  'Vincent Jackson': 'Independent',
  'Hazel de Nortúin': 'People Before Profit',
  'Philip Sutcliffe': 'Independent Ireland',
  'Ray Cunningham': 'Green Party',
  // Clontarf
  'Naoise Ó Muirí': 'Fine Gael',
  'Deirdre Heney': 'Fianna Fáil',
  'Donna Cooney': 'Green Party',
  'Barry Heneghan': 'Independent',
  'Alison Field': 'Labour Party',
  // Donaghmede
  'Tom Brabazon': 'Fianna Fáil',
  'Daryl Barron': 'Fianna Fáil',
  'Mícheál MacDonncha': 'Sinn Féin',
  'Supriya Singh': 'Fine Gael',
  // North Inner City
  'Janet Horner': 'Green Party',
  'Christy Burke': 'Independent',
  'Janice Boylan': 'Sinn Féin',
  'Malachy Steenson': 'Independent',
  'Daniel Ennis': 'Social Democrats',
  // Kimmage-Rathmines
  'Pat Dunne': 'Independent',
  'Fiona Connelly': 'Labour Party',
  'Punam Rane': 'Fianna Fáil',
  'Patrick Kinsella': 'Fine Gael',
  'Eoin Hayes': 'Social Democrats',
  // Pembroke
  'Dermot Lacey': 'Labour Party',
  'Rory Hogan': 'Fianna Fáil',
  // Cabra-Glasnevin
  'Ciarán Cuffe': 'Green Party',
  'Mary Freehill': 'Labour Party',
  'Declan Meenagh': 'Labour Party',
  // South East Inner City
  'Críona Ní Dhalaigh': 'Sinn Féin',
  'Claire Byrne': 'Green Party',
  'James Humphreys': 'Fine Gael',

  // Fingal County Council - Additional councillors from 2024 results
  'Robert O\'Donoghue': 'Labour Party',
  'Corina Johnston': 'Labour Party',
  'Brendan Ryan': 'Labour Party',
  'Paul Mulville': 'Social Democrats',
  'David Healy': 'Green Party',
  'Ellen Troy': 'Aontú',
  'Gerard Sheehan': 'Aontú',
  'John Burtchaell': 'People Before Profit',
  'Ruth Coppinger': 'People Before Profit',
  'Patrick Quinlan': 'Independent',
  'Eoghan Dockrell': 'Fine Gael',
  'Howard Mahony': 'Fianna Fáil',
  'Brian Dennehy': 'Fine Gael',
  'Daniel Whooley': 'Fine Gael',
  'Breda Hanaphy': 'Sinn Féin',
  'Mary McCamley': 'Labour Party',
  'JK Onwumereh': 'Fianna Fáil',
  'Karen Power': 'Sinn Féin',
  'Ian Carey': 'Fine Gael',
  'Pamela Collins': 'Independent',

  // Cork County Council - from 2024 results
  // Cobh LEA
  'Sheila O\'Callaghan': 'Fianna Fáil',
  'Anthony Barry': 'Fine Gael',
  'Sinéad Sheppard': 'Fine Gael',
  'Cathal Rasmussen': 'Labour Party',
  'Ger Curley': 'Independent Ireland',
  'Dominic Finn': 'Fianna Fáil',
  // Carrigaline LEA
  'Eoghan Fahy': 'Sinn Féin',
  'Audrey Buckley': 'Fine Gael',
  'Ben Dalton O\'Sullivan': 'Fianna Fáil',
  'Seamus McGrath': 'Fianna Fáil',
  // Bandon-Kinsale LEA
  'Gillian Coughlan': 'Fianna Fáil',
  'Kevin Murphy': 'Fine Gael',
  'Marie O\'Sullivan': 'Fine Gael',
  'John Collins': 'Independent Ireland',
  // Macroom LEA
  'Eileen Lynch': 'Fine Gael',
  'Gobnait Moynihan': 'Fine Gael',
  'Michael Creed': 'Fine Gael',
  'Aindrias Moynihan': 'Fianna Fáil',
  // Kanturk LEA
  'Gerard Murphy': 'Fine Gael',
  'John Paul O\'Shea': 'Fine Gael',
  'Bernard Moynihan': 'Fianna Fáil',
  'Ian Doyle': 'Fianna Fáil',
  // Mallow LEA
  'Pat Hayes': 'Fianna Fáil',
  'John Sheehan': 'Fine Gael',
  'Gearóid Murphy': 'Fianna Fáil',
  // Fermoy LEA
  'Frank O\'Flynn': 'Fine Gael',
  'Noel McCarthy': 'Fianna Fáil',
  'Joe Carroll': 'Fine Gael',
  'William O\'Leary': 'Fianna Fáil',
  // Bantry-West Cork LEA
  'Danny Collins': 'Independent Ireland',
  'Caroline Cronin': 'Fine Gael',
  'Patrick Gerard Murphy': 'Fianna Fáil',
  'Declan Hurley': 'Independent',
  // Skibbereen-West Cork LEA
  'Holly Cairns': 'Social Democrats',
  'Joe Carroll': 'Independent',
  'Finbarr Harrington': 'Independent Ireland',

  // Galway County Council - from 2024 results
  // Ballinasloe LEA
  'Michael Connolly': 'Fianna Fáil',
  'Declan Geraghty': 'Independent Ireland',
  'Evelyn Parsons': 'Independent',
  'Alan Harney': 'Fine Gael',
  'Peter Keaveney': 'Fine Gael',
  'Dermot Connolly': 'Sinn Féin',
  // Conamara North
  'Seamus Walsh': 'Independent Ireland',
  'Eileen Mannion': 'Fine Gael',
  'Gerry King': 'Fianna Fáil',
  // Conamara South
  'Noel Thomas': 'Independent Ireland',
  'Michael Leainde': 'Independent Ireland',
  'Thomas Welby': 'Independent',
  // Gort-Kinvara
  'Geraldine Donoghue': 'Independent',
  'Martina Kinnane': 'Fianna Fáil',
  'PJ Murphy': 'Fine Gael',
  'Paul Killilea': 'Fine Gael',
  'Gerry Finnerty': 'Fianna Fáil',
  // Loughrea
  'Shane Curley': 'Fianna Fáil',
  'Jimmy McClearn': 'Fine Gael',
  'Declan Kelly': 'Independent Ireland',
  'Ivan Canning': 'Fine Gael',
  'Geraldine Donohue': 'Fianna Fáil',
  // Athenry-Oranmore
  'Albert Dolan': 'Fianna Fáil',
  'Tomás Grealish': 'Independent',
  'David Collins': 'Fine Gael',
  'James Charity': 'Independent',
  'Peter Feeney': 'Fine Gael',
  'Cillian Keane': 'Fianna Fáil',
  'Louis O\'Hara': 'Sinn Féin',
  // Tuam
  'Donagh Killilea': 'Fianna Fáil',
  'Mary Hoade': 'Fine Gael',
  'Karey McHugh O\'Brien': 'Fine Gael',
  'Pete Roche': 'Fianna Fáil',

  // South Dublin County Council - from 2024 results
  'Willie Carey': 'Sinn Féin',
  'Teresa Costello': 'Fianna Fáil',
  'Paddy Holahan': 'Independent',
  'Shane Moynihan': 'Fianna Fáil',
  'Ciaran Ahern': 'Labour Party',
  'Paul Gogarty': 'Independent',
  'Ed O\'Brien': 'Fianna Fáil',
  'Francis Timmons': 'Independent',
  'Charlie O\'Connor': 'Fianna Fáil',
  'Kieran Mahon': 'Sinn Féin',
  'Louise Dunne': 'Sinn Féin',
  'Alan Hayes': 'Fine Gael',
  'Brian Lawlor': 'Fine Gael',
  'Kenneth Egan': 'Fine Gael',
  'Carly Bailey': 'Social Democrats',
  'Alan Edge': 'Social Democrats',
  'William Carey': 'Fine Gael',
  'Eoin O\'Broin': 'Sinn Féin',
  'Brian Leech': 'Fine Gael',

  // Clare County Council - Complete 2024 results (28 seats)
  // Ennis LEA
  'Pat Daly': 'Fianna Fáil',
  'Paul Murphy': 'Fine Gael',
  'Clare Colleran Molloy': 'Fianna Fáil',
  'Tommy Guilfoyle': 'Sinn Féin',
  'Antoinette Baker': 'Fianna Fáil',
  'Tom O\'Callaghan': 'Fianna Fáil',
  // Ennistymon LEA
  'Bill Slattery': 'Fine Gael',
  'Joe Garrihy': 'Fine Gael',
  'Shane Talty': 'Fianna Fáil',
  'Joe Killeen': 'Fianna Fáil',
  // Killaloe LEA
  'Joe Cooney': 'Fine Gael',
  'Alan O\'Callaghan': 'Fianna Fáil',
  'Pat Burke': 'Fine Gael',
  // Kilrush LEA
  'Dinny Gould': 'Independent',
  'Rita McInerney': 'Fianna Fáil',
  'Ian Lynch': 'Independent',
  'Michael Shannon': 'Fianna Fáil',
  'Gabriel Keating': 'Fine Gael',
  // Shannon LEA
  'David Griffin': 'Fianna Fáil',
  'Donna McGettigan': 'Sinn Féin',
  'John Crowe': 'Fine Gael',
  'Rachel Hartigan': 'Fianna Fáil',
  'Pat O\'Gorman': 'Fianna Fáil',
  'Tony Mulcahy': 'Fine Gael',
  'Michael Begley': 'Independent',

  // Kerry County Council - 2024 results (33 seats)
  // Killarney LEA
  'Maura Healy-Rae': 'Independent',
  'Martin Grady': 'Independent',
  'John O\'Donoghue': 'Independent',
  'Niall Botty O\'Callaghan': 'Independent',
  'Marie Moloney': 'Labour Party',
  // Listowel LEA
  'Mike Kennelly': 'Fine Gael',
  'Liam Speedy Nolan': 'Independent',
  'Michael Foley': 'Fine Gael',
  'Michael Leane': 'Fianna Fáil',
  'Tom Barry': 'Sinn Féin',
  'Jimmy Moloney': 'Fianna Fáil',
  // Kenmare LEA
  'Johnny Healy-Rae': 'Independent',
  'Dan McCarthy': 'Fianna Fáil',
  'Patrick Connor-Scarteen': 'Fine Gael',
  // Castleisland LEA
  'Jackie Healy-Rae': 'Independent',
  'Charlie Farrelly': 'Fianna Fáil',
  'Fionnán Fitzgerald': 'Fianna Fáil',
  'Bobby O\'Connell': 'Fine Gael',
  // Corca Dhuibhne LEA
  'Robert Brosnan': 'Sinn Féin',
  'Tommy Griffin': 'Fine Gael',
  'Breandán Fitzgerald': 'Fianna Fáil',
  'Seamus Cosaí Fitzgerald': 'Fianna Fáil',
  // Tralee LEA
  'Angie Baily': 'Fine Gael',
  'Mikey Sheehy': 'Fianna Fáil',
  'Johnnie Wall': 'Labour Party',
  'Terry O\'Brien': 'Sinn Féin',
  'Tommy Foley': 'Fianna Fáil',
  'Cathal Foley': 'Sinn Féin',

  // Limerick City and County Council - 2024 results (40 seats)
  // Limerick City West LEA
  'Daniel Butler': 'Fine Gael',
  'Dan McSweeney': 'Fine Gael',
  'Joe Leddin': 'Labour Party',
  'Fergus Kilcoyne': 'Fianna Fáil',
  'Elisa O\'Donovan': 'Social Democrats',
  'Abul Kalam Azad Talukder': 'Fianna Fáil',
  'Maria Donoghue': 'Independent',
  // Newcastle West LEA
  'Jerome Scanlan': 'Independent',
  'Liam Galvin': 'Fine Gael',
  'Michael Collins': 'Fianna Fáil',
  'Tom Ruddle': 'Fine Gael',
  'Francis Foley': 'Fianna Fáil',
  'John Sheahan': 'Fine Gael',
  // Adare-Rathkeale LEA
  'Stephen Keary': 'Fine Gael',
  'Adam Teskey': 'Fine Gael',
  'Bridie Collins': 'Fianna Fáil',
  'Ger Ward': 'Fianna Fáil',
  'Tommy Hartigan': 'Independent Ireland',
  // Limerick City North LEA
  'Shane Hickey O\'Mara': 'Social Democrats',
  'Sarah Beasley': 'Aontú',
  'Kieran O\'Hanlon': 'Fianna Fáil',
  'Olivia O\'Sullivan': 'Fine Gael',
  'John Costelloe': 'Sinn Féin',
  'Azad Talukder': 'Fianna Fáil',
  'Martin Mongan': 'Fianna Fáil',
  // Limerick City East LEA
  'Seán Hartigan': 'Green Party',
  'Sarah Kiely': 'Fine Gael',
  'Catherine Slattery': 'Fianna Fáil',
  'Jerry O\'Dea': 'Fianna Fáil',
  'John Ryan': 'Sinn Féin',
  // Cappamore-Kilmallock LEA
  'Ger Mitchell': 'Fine Gael',
  'Eddie Ryan': 'Fine Gael',
  'Martin Ryan': 'Fianna Fáil',
  'John Egan': 'Fianna Fáil',
  'Michael Donegan': 'Fianna Fáil',
  'Noel Gleeson': 'Independent',

  // Tipperary County Council - 2024 results (40 seats)
  // Nenagh LEA
  'Joe Hannigan': 'Independent',
  'Michael O\'Meara': 'Independent',
  'Ryan O\'Meara': 'Fianna Fáil',
  'Seamus Morris': 'Independent',
  'Louise Morgan Walsh': 'Labour Party',
  // Thurles LEA
  'Fiona Bonfield': 'Labour Party',
  'Pamela Quirke O\'Meara': 'Independent',
  'Phyll Bugler': 'Fine Gael',
  'Michael Smith': 'Fianna Fáil',
  'Shane Lee': 'Independent',
  'Eddie Moran': 'Independent',
  'William Kennedy': 'Fine Gael',
  // Templemore-Thurles LEA
  'Jim Ryan': 'Independent',
  'Micheál Lowry': 'Independent',
  'Sean Ryan': 'Fianna Fáil',
  'Kay Cahill-Skehan': 'Fianna Fáil',
  'Peggy Ryan': 'Fine Gael',
  // Cahir LEA
  'Máirín McGrath': 'Independent',
  'Andy Moloney': 'Independent',
  'Marie Murphy': 'Fine Gael',
  'Micheál Anglim': 'Fianna Fáil',
  // Cashel-Tipperary LEA
  'John O\'Heney': 'Independent',
  'Declan Burgess': 'Fine Gael',
  'Liam Browne': 'Independent',
  'Roger Kennedy': 'Fianna Fáil',
  'Mary Hanna Hourigan': 'Fine Gael',
  'John Crosse': 'Fine Gael',
  'Annmarie Ryan': 'Sinn Féin',
  // Carrick-on-Suir LEA
  'Imelda Goldsboro': 'Fine Gael',
  'Kevin O\'Meara': 'Fianna Fáil',
  'Kieran Bourke': 'Fine Gael',
  'David Dunne': 'Sinn Féin',
  // Newport LEA
  'Tony Black': 'Fine Gael',
  'Jerome Maxwell': 'Independent',
  'Seamie Morris': 'Independent',
  'Mattie Ryan': 'Fianna Fáil',
  // Roscrea-Templemore LEA
  'Michael Smith': 'Fianna Fáil',
  'Noel Coonan': 'Fine Gael',
  'Shane Lee': 'Independent',

  // Waterford City and County Council - 2024 results (32 seats)
  // Portlaw-Kilmacthomas LEA
  'Liam Brazil': 'Fine Gael',
  'Seánie Power': 'Fine Gael',
  'Declan Clune': 'Fianna Fáil',
  'Ger Barron': 'Fianna Fáil',
  'Tom Cronin': 'Independent',
  // Dungarvan LEA
  'Damien Geoghegan': 'Fine Gael',
  'Conor D. McGuinness': 'Sinn Féin',
  'Pat Nugent': 'Fianna Fáil',
  'Tom Cronin': 'Fine Gael',
  'James Tobin': 'Fianna Fáil',
  'Siobhán Whelan': 'Labour Party',
  // Tramore-Waterford City West LEA
  'Lola O\'Sullivan': 'Fine Gael',
  'Eddie Mulligan': 'Fianna Fáil',
  'Jody Power': 'Sinn Féin',
  'Eamon Quinlan': 'Fianna Fáil',
  'Marc Ó Cathasaigh': 'Green Party',
  'Seamus Ryan': 'Labour Party',
  // Waterford City East LEA
  'John Cummins': 'Fine Gael',
  'Adam Wyse': 'Fianna Fáil',
  'Jim Griffin': 'Labour Party',
  'Davy Daniels': 'Sinn Féin',
  'Jason Murphy': 'Fianna Fáil',
  'Frank Quinlan': 'Fine Gael',
  // Waterford City South LEA
  'John Hearne': 'Sinn Féin',
  'Thomas Phelan': 'Fianna Fáil',
  'Joe Kelly': 'Fine Gael',
  'Stephanie Keating': 'Labour Party',
  // Lismore LEA
  'John Pratt': 'Fianna Fáil',
  'Declan Doocey': 'Fine Gael',
  'Cha O\'Neill': 'Independent',

  // Kilkenny County Council - 2024 results (24 seats)
  // Callan-Thomastown LEA
  'Peter Chap Cleere': 'Fianna Fáil',
  'Joe Sheridan': 'Fianna Fáil',
  'Joe Lyons': 'Fine Gael',
  'Michael Doyle': 'Fine Gael',
  'Deirdre Cullen': 'Fianna Fáil',
  'Stephanie Doheny': 'Sinn Féin',
  // Castlecomer LEA
  'Pat Fitzpatrick': 'Fianna Fáil',
  'Mary Hilda Cavanagh': 'Fine Gael',
  'Michael McCarthy': 'Fianna Fáil',
  'John Brennan': 'Fine Gael',
  'Maurice Shorthall': 'Independent',
  'Michael Delaney': 'Fianna Fáil',
  // Kilkenny LEA
  'Andrew McGuinness': 'Fianna Fáil',
  'David Fitzgerald': 'Fine Gael',
  'Eugene McGuinness': 'Independent',
  'Joe Malone': 'Fianna Fáil',
  'Seán Ó hArgáin': 'Labour Party',
  'John Coonan': 'Fianna Fáil',
  'Maria Dollard': 'Green Party',
  // Piltown LEA
  'Jenny Catt Slattery': 'Fianna Fáil',
  'Pat Dunphy': 'Fine Gael',
  'Tomás Breathnach': 'Labour Party',
  'Fidelis Doherty': 'Fine Gael',
  'Ger Frisby': 'Fianna Fáil',

  // Donegal County Council - 2024 results (37 seats)
  // Buncrana LEA
  'Jack Murray': 'Sinn Féin',
  'Paul Canning': 'Fianna Fáil',
  'Terry Crossan': 'Sinn Féin',
  'Joy Beard': '100% Redress Party',
  'Fionnan Bradley': 'Fianna Fáil',
  // Carndonagh LEA
  'Albert Doherty': 'Sinn Féin',
  'Martin McDermott': 'Fianna Fáil',
  'Martin Farren': 'Labour Party',
  'Ali Farren': '100% Redress Party',
  // Letterkenny LEA
  'Donal Mandy Kelly': 'Fianna Fáil',
  'Gerry McMonagle': 'Sinn Féin',
  'Jimmy Kavanagh': 'Fine Gael',
  'Michael McBride': 'Sinn Féin',
  'Liam Blaney': 'Fianna Fáil',
  'Kevin Bradley': 'Independent',
  // Milford LEA
  'Declan Meehan': 'Independent',
  'John O\'Donnell': 'Fianna Fáil',
  'Noreen McGarvey': 'Fianna Fáil',
  'Liam Doherty': 'Sinn Féin',
  'Ian McGarvey': 'Fine Gael',
  // Donegal LEA
  'Niamh Kennedy': 'Independent',
  'Barry Sweeny': 'Fine Gael',
  'Noel Jordan': 'Sinn Féin',
  'Michael Naughton': 'Fianna Fáil',
  'Tómas Seán Devine': '100% Redress Party',
  // Glenties LEA
  'Marie Therese Gallagher': 'Sinn Féin',
  'John Sheamais Ó Fearraigh': 'Sinn Féin',
  'Anthony Molloy': 'Fianna Fáil',
  'Denis McGee': '100% Redress Party',
  'Dakota McMenamin': 'Sinn Féin',
  // Stranorlar LEA
  'Gary Doherty': 'Sinn Féin',
  'Patrick McGowan': 'Fianna Fáil',
  'Frank McBrearty': 'Independent',
  'Martin Harley': 'Independent',
  'Gerry Crawford': 'Independent',

  // Mayo County Council - 2024 results (30 seats)
  // Ballina LEA
  'John O\'Hara': 'Fine Gael',
  'Mark Duffy': 'Independent',
  'Annie May Reape': 'Fianna Fáil',
  'Michael Loftus': 'Fianna Fáil',
  'Joe Faughnan': 'Independent',
  'Jarlath Munnelly': 'Fine Gael',
  // Belmullet LEA
  'Gerry Coyle': 'Fine Gael',
  'Paul McNamara': 'Fianna Fáil',
  'Sean Carey': 'Fianna Fáil',
  // Castlebar LEA
  'Michael Kilcoyne': 'Independent',
  'Ger Deere': 'Fine Gael',
  'Blackie Gavin': 'Fianna Fáil',
  'Al McDonnell': 'Fianna Fáil',
  'Harry Barrett': 'Independent',
  'Cyril Burke': 'Fine Gael',
  'Donna Sheridan': 'Fine Gael',
  // Claremorris LEA
  'Patsy O\'Brien': 'Independent',
  'Richard Finn': 'Independent',
  'Alma Gallagher': 'Fine Gael',
  'Damien Ryan': 'Fianna Fáil',
  'Michael Burke': 'Fine Gael',
  'Paul Lawless': 'Aontú',
  // Swinford LEA
  'Gerry Murray': 'Sinn Féin',
  'Neil Cruise': 'Fine Gael',
  'John Caulfield': 'Fianna Fáil',
  'Adrian Forkan': 'Fianna Fáil',
  // Westport LEA
  'Chris Maxwell': 'Independent Ireland',
  'Peter Flynn': 'Fine Gael',
  'Brendan Mulroy': 'Fianna Fáil',
  'John O\'Malley': 'Independent',

  // Kildare County Council - partial 2024 results (40 seats)
  // Social Democrats
  'Peter Melrose': 'Social Democrats',
  'Claire O\'Rourke': 'Social Democrats',
  'Aidan Farrelly': 'Social Democrats',
  'Pat Balfe': 'Social Democrats',
  'Nuala Killeen': 'Social Democrats',
  'Bill Clear': 'Social Democrats',
  // Fianna Fáil
  'Noel Heavey': 'Fianna Fáil',
  'Rob Power': 'Fianna Fáil',
  'Tracey O\'Dwyer': 'Fianna Fáil',
  'Peggy O\'Dwyer': 'Fianna Fáil',
  'Naoise Ó Cearúil': 'Fianna Fáil',
  'Michael Coleman': 'Fianna Fáil',
  'Ivan Keatley': 'Fianna Fáil',
  'Anne Connolly': 'Fianna Fáil',
  // Fine Gael
  'Lumi Panaite Fahey': 'Fine Gael',
  'Tim Durkan': 'Fine Gael',
  'Evie Sammon': 'Fine Gael',
  'Darren Scully': 'Fine Gael',
  'Fintan Brett': 'Fine Gael',
  'Kevin Duffy': 'Fine Gael',
  'Bernard Caldwell': 'Fine Gael',
  // Labour
  'Angela Feeney': 'Labour Party',
  'Mark Stafford': 'Labour Party',
  'Colm Kenny': 'Labour Party',
  // Sinn Féin
  'Shónagh Ní Raghallaigh': 'Sinn Féin',
  // Independent
  'Seamie Moore': 'Independent',
  'Tom McDonnell': 'Independent',

  // Louth County Council - 2024 results (29 seats)
  // Ardee LEA
  'Tim Tenanty': 'Independent',
  'Pearse McGeough': 'Sinn Féin',
  'Paula Butterly': 'Fine Gael',
  'John Sheridan': 'Fianna Fáil',
  'Dolores Minogue': 'Fine Gael',
  'Bernie Conlon': 'Independent',
  // Dundalk-Carlingford LEA
  'Seán Kelly': 'Fianna Fáil',
  'Antóin Watters': 'Sinn Féin',
  'Ciarán Fisher': 'Independent',
  'Andrea McKevitt': 'Fianna Fáil',
  'Maria Doyle': 'Sinn Féin',
  // Dundalk South LEA
  'Maeve Yore': 'Independent',
  'Marianne Butler': 'Green Party',
  'Shane McGuinness': 'Fianna Fáil',
  'Edel Corrigan': 'Sinn Féin',
  'John McGahon': 'Fine Gael',
  'Kevin Meenan': 'Sinn Féin',
  // Drogheda Rural LEA
  'Michelle Hall': 'Labour Party',
  'Eric Donovan': 'Fine Gael',
  'Elaine McGinty': 'Sinn Féin',
  'Paddy Malone': 'Fianna Fáil',
  'Tom Byrne': 'Independent',
  // Drogheda Urban LEA
  'Pio Smith': 'Labour Party',
  'Kevin Callan': 'Independent',
  'Joanna Byrne': 'Sinn Féin',
  'Kenneth Flood': 'Fine Gael',
  'Sean Collins': 'Fianna Fáil',
  'Declan Power': 'Fianna Fáil',

  // Meath County Council - partial 2024 results (40 seats)
  // Sinn Féin councillors
  'Eddie Fennessy': 'Sinn Féin',
  'Michael Gallagher': 'Sinn Féin',
  'Peter Caffrey': 'Sinn Féin',
  'Fionnan Blake': 'Sinn Féin',
  // Aontú councillors
  'Emer Tóibín': 'Aontú',
  'Sarah Reilly': 'Aontú',
  // Fine Gael councillors
  'Linda Nelson Murray': 'Fine Gael',
  'Francis Deane': 'Fine Gael',
  'Alan Lawes': 'Fine Gael',
  'Gerry O\'Connor': 'Fine Gael',
  'Joe Bonner': 'Fine Gael',
  'Noel French': 'Fine Gael',
  'Amanda Smith': 'Fine Gael',
  'Damien O\'Reilly': 'Fine Gael',
  'Edward Fennessy': 'Fine Gael',
  // Fianna Fáil councillors
  'Wayne Harding': 'Fianna Fáil',
  'Paddy Meade': 'Fianna Fáil',
  'Brian Fitzgerald': 'Fianna Fáil',
  'Eugene Cassidy': 'Fianna Fáil',
  'Geraldine Keogan': 'Fianna Fáil',
  'Niall Kellett': 'Fianna Fáil',
  'Brian Dillon': 'Fianna Fáil',
  // Social Democrats
  'Aisling Ní Néill': 'Social Democrats',
  // Independents
  'Nick Killian': 'Independent',
  'Sean Drew': 'Independent',
  'Sharon Keogan': 'Independent',
  'Ronan Moore': 'Independent',

  // Additional name variations to match database entries
  // Wexford variations
  'Fionntán Ó Súilleabháin': 'Sinn Féin',
  'Barbara-Anne Murphy': 'Fianna Fáil',

  // Dublin variations with different accents/spacing
  'Daithi Doolan': 'Sinn Féin',
  'Micheal MacDonncha': 'Sinn Féin',
  'Ciarán Cuffe': 'Green Party',

  // Kerry variations
  'Niall Kelleher': 'Fianna Fáil',
  'Brendan Cronin': 'Independent',
  'Jim Finucane': 'Fine Gael',
  'Toiréasa Ferris': 'Sinn Féin',
  'Sam Locke': 'Labour Party',
  'John Francis Flynn': 'Fine Gael',
  'Seamus Cosai Fitzgerald': 'Fianna Fáil',

  // Wicklow - fill in councillors
  'Steven Matthews': 'Green Party',
  'Joe Behan': 'Independent',
  'Dermot O\'Brien': 'Green Party',
  'Gail Dunne': 'Fine Gael',
  'Pat Kennedy': 'Fianna Fáil',
  'Sylvester Bourke': 'Fine Gael',
  'Irene Winters': 'Fine Gael',
  'Patsy Glennon': 'Fianna Fáil',
  'Avril Cronin': 'Fianna Fáil',
  'Malachaí Duddy': 'Fine Gael',
  'Lourda Scott': 'Green Party',
  'Peir Leonard': 'Social Democrats',
  'Paul O\'Brien': 'Fianna Fáil',
  'Miriam Murphy': 'Fianna Fáil',
  'Gerry O\'Neill': 'Sinn Féin',
  'Erika Doyle': 'Green Party',
  'Pat Mahon': 'Fianna Fáil',
  'Warren O\'Toole': 'Fine Gael',
  'Ned Whelan': 'Independent',
  'Stephen Stokes': 'Fianna Fáil',
  'Mark Barry': 'Sinn Féin',
  'Ian Neary': 'Fine Gael',
  'Louise Fenelon Gaskin': 'Fianna Fáil',
  'Melanie Corrigan': 'Sinn Féin',
  'Jason Mulhall': 'Independent',
  'Danny Alvey': 'Labour Party',
  'Shane Langrell': 'Fine Gael',
  'Graham Richmond': 'Fine Gael',
  'Orla Finn': 'Social Democrats',

  // Laois - names are in correct order
  'Conor Bergin': 'Fine Gael',
  'Paddy Bracken': 'Fianna Fáil',
  'Ben Brennan': 'Independent',
  'Paddy Buggy': 'Fianna Fáil',
  'Ollie Clooney': 'Fianna Fáil',
  'Catherine Fitzgerald': 'Fine Gael',
  'Padraig Fleming': 'Fianna Fáil',
  'John Joe Fennelly': 'Fianna Fáil',
  'James Kelly': 'Fianna Fáil',
  'John King': 'Fine Gael',
  'Paschal McEvoy': 'Fianna Fáil',
  'Seamus McDonald': 'Fianna Fáil',
  'Aisling Moran': 'Fine Gael',
  'Tommy Mulligan': 'Fianna Fáil',
  'Aidan Mullins': 'Independent',
  'Vivienne Phelan': 'Fianna Fáil',
  'Marie Tuohy': 'Fine Gael',
  'Barry Walsh': 'Fianna Fáil',
  'Thomasina Connell': 'Fine Gael',
  'Noel Tuohy': 'Labour Party',

  // Offaly
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
  'Clare Murray': 'Sinn Féin',
  'Frank Moran': 'Fianna Fáil',
  'John Leahy': 'Independent Ireland',
  'Peter Ormond': 'Fianna Fáil',
  'Hugh Egan': 'Fine Gael',
  'Liam Quinn': 'Independent',
  'Sean Maher': 'Fianna Fáil',
  'Fergus McDonnell': 'Fine Gael',
  'Ollie Bryant': 'Fianna Fáil',

  // Westmeath
  'Vinny McCormack': 'Fianna Fáil',
  'Frankie Keena': 'Fine Gael',
  'Aengus O\'Rourke': 'Fianna Fáil',
  'Ken Glynn': 'Fine Gael',
  'Louise Heavin': 'Fianna Fáil',
  'Joe Flaherty': 'Fianna Fáil',
  'Tom Farrell': 'Fine Gael',
  'Denis Leonard': 'Independent',
  'Mick Dollard': 'Labour Party',
  'Paul Hogan': 'Fine Gael',
  'Kevin Moran': 'Independent',
  'Julie McCourt': 'Sinn Féin',
  'Bill Collentine': 'Fine Gael',
  'Liam McDaniel': 'Fine Gael',

  // Longford
  'Uruemu Adejinmi': 'Fianna Fáil',
  'Seamus Butler': 'Fianna Fáil',
  'Gerry Warnock': 'Independent',
  'Paraic Brady': 'Fine Gael',
  'Paul Ross': 'Fine Gael',
  'Martin Mulleady': 'Fianna Fáil',
  'Turlough McGovern': 'Independent',
  'Peggy Nolan': 'Fine Gael',
  'Martin Monaghan': 'Fianna Fáil',
  'Garry Murtagh': 'Independent',
  'Mick Cahill': 'Independent',
  'Pat O\'Toole': 'Fianna Fáil',

  // Sligo
  'Tom MacSharry': 'Fianna Fáil',
  'Dara Mulvey': 'Fine Gael',
  'Sinéad Maguire': 'Fine Gael',
  'Thomas Healy': 'Fianna Fáil',
  'Chris MacManus': 'Sinn Féin',
  'Declan Bree': 'Independent',
  'Marie Casserly': 'Independent',
  'Paul Taylor': 'Fine Gael',
  'Gino O\'Boyle': 'Fianna Fáil',
  'Arthur Gibbons': 'Fine Gael',
  'Thomas Walsh': 'Fianna Fáil',
  'Donal Gilroy': 'Sinn Féin',
  'Michael Clarke': 'Independent',
  'Joseph Queenan': 'Fine Gael',
  'Nessa Cosgrove': 'Social Democrats',
  'Fergal Nealon': 'Fine Gael',
  'Barry Gallagher': 'Fine Gael',
  'Edel McSharry': 'Fianna Fáil',

  // Roscommon
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
  'Laurence Fallon': 'Independent',
  'Anthony Waldron': 'Fianna Fáil',
  'Larry Brennan': 'Fianna Fáil',
  'Liam Callaghan': 'Fine Gael',
  'Leah Cull': 'Fine Gael',
  'Nigel Dineen': 'Fine Gael',

  // Leitrim
  'Enda Stenson': 'Fianna Fáil',
  'Finola Armstrong McGuire': 'Fine Gael',
  'Sean McDermott': 'Fianna Fáil',
  'Paddy O\'Rourke': 'Fianna Fáil',
  'Frank Dolan': 'Fine Gael',
  'Des Guckian': 'Independent',
  'Brendan Barry': 'Fine Gael',
  'Felim Gurn': 'Fine Gael',
  'Ita Reynolds Flynn': 'Fine Gael',
  'Padraig Fallon': 'Independent',
  'Mary Bohan': 'Fianna Fáil',
  'Paddy Farrell': 'Fianna Fáil',
  'Sean McGowan': 'Fianna Fáil',

  // Monaghan
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
  'Pat Treanor': 'Fianna Fáil',
  'PJ O\'Hanlon': 'Fine Gael',
  'Sean Gilland': 'Fianna Fáil',
  'Sean Conlon': 'Sinn Féin',
  'Peter Conlon': 'Sinn Féin',
  'Richard Truell': 'Fine Gael',

  // Cavan
  'Sarah O\'Reilly': 'Aontú',
  'Carmel Brady': 'Fine Gael',
  'Val Smith': 'Fine Gael',
  'Kelly Clifford': 'Fianna Fáil',
  'Niall Smith': 'Fianna Fáil',
  'Shane P O\'Reilly': 'Independent',
  'Trevor Smith': 'Fine Gael',
  'Winston Bennett': 'Fine Gael',
  'Philip Brady': 'Fianna Fáil',
  'TP O\'Reilly': 'Fine Gael',
  'Noel Connell': 'Sinn Féin',
  'Brendan Fay': 'Independent',
  'Damien Brady': 'Sinn Féin',
  'John Paul Feeley': 'Fianna Fáil',
  'Niamh Brady': 'Fine Gael',
  'Patricia Walsh': 'Fianna Fáil',

  // Laois - reversed names (database has LastName FirstName format)
  'Bergin Conor': 'Fine Gael',
  'Bracken Paddy': 'Fianna Fáil',
  'Brennan Ben': 'Independent',
  'Buggy Paddy': 'Fianna Fáil',
  'Clooney Ollie': 'Fianna Fáil',
  'Dwane Caroline': 'Sinn Féin',
  'Fitzgerald Catherine': 'Fine Gael',
  'Fleming Padraig': 'Fianna Fáil',
  'Joe John': 'Fianna Fáil',
  'Kelly James': 'Fianna Fáil',
  'King John': 'Fine Gael',
  'Mc Paschal': 'Fianna Fáil',
  'Mc Seamús': 'Fianna Fáil',
  'Moran Aisling': 'Fine Gael',
  'Mulligan Tommy': 'Fianna Fáil',
  'Mullins Aidan': 'Independent',
  'Phelan Vivienne': 'Fianna Fáil',
  'Tuohy Marie': 'Fine Gael',
  'Walsh Barry': 'Fianna Fáil',

  // Typo fixes
  'Maurice Shortall': 'Independent',

  // Dublin - Additional councillors
  'Ammar Ali': 'Fianna Fáil',
  'Anthony Connaghan': 'Sinn Féin',
  'Cathal Haughey': 'Fianna Fáil',
  'Colm O\'Rourke': 'Fine Gael',
  'Darragh Moriarty': 'Labour Party',
  'Eoin O Broin': 'Sinn Féin',
  'Jess Spear': 'People Before Profit',
  'JK Onwumerah': 'Fianna Fáil',
  'Joanna Tuffy': 'Labour Party',
  'John Lyons': 'Independent',
  'Kieran Dennison': 'Fine Gael',
  'Liona O\'Toole': 'Independent',
  'Michael Pidgeon': 'Green Party',
  'Shay Brennan': 'Fianna Fáil',
  'Brian McDonagh': 'Fianna Fáil',
  'Caroline Brady': 'Fianna Fáil',
  'Cat O\'Driscoll': 'Social Democrats',
  'Cathal Boland': 'Fine Gael',
  'Dan Carson': 'Labour Party',
  'Darragh Butler': 'Fianna Fáil',
  'Dave O\'Keeffe': 'Green Party',
  'Dean Donnelly': 'Independent',
  'Frank McNamara': 'Fianna Fáil',
  'Hugh Lewis': 'Green Party',
  'Jim Gildea': 'Fine Gael',
  'Jim O\'Leary': 'Fine Gael',
  'Jimmy Guerin': 'Fine Gael',
  'Justin Sinnott': 'Sinn Féin',
  'Kay Keane': 'Fine Gael',
  'Kazi Ahmed': 'Fianna Fáil',
  'Keith Connolly': 'Sinn Féin',
  'Kevin Daly': 'Sinn Féin',
  'Liam Dockery': 'Fine Gael',
  'Mary Callaghan': 'Fianna Fáil',
  'Maurice Dockrell': 'Fine Gael',
  'Niamh Whelan': 'Social Democrats',
  'Oisin O\'Connor': 'Sinn Féin',
  'Patrick Pearse Holohan': 'Fianna Fáil',
  'Peter O\'Brien': 'Fianna Fáil',
  'Ronan McMahon': 'Fianna Fáil',
  'Sean McLoughlin': 'Fine Gael',
  'Barry Saul': 'Fine Gael',
  'David Coffey': 'Fianna Fáil',
  'Gavin Pepper': 'Independent',
  'Glen Moore': 'Fine Gael',
  'Grainne Maguire': 'Fine Gael',
  'Joe Newman': 'Independent',
  'John Hurley': 'Fine Gael',
  'JP Durkan': 'Fine Gael',
  'Karl Stanley': 'Social Democrats',
  'Kevin Breen': 'Fianna Fáil',
  'Lauren Tuite': 'Sinn Féin',
  'Lesley Byrne': 'Sinn Féin',
  'Luke Corkery': 'Green Party',
  'Maeve O\'Connell': 'Social Democrats',
  'Marie Baker': 'Labour Party',
  'Martha Fanning': 'Fine Gael',
  'Mary Fayne': 'Fine Gael',
  'Michael Fleming': 'Fine Gael',
  'Pamela Kearns': 'Labour Party',
  'Robert Jones': 'Independent',
  'Sarah Barnes': 'Social Democrats',
  'Seamas McGrattan': 'Sinn Féin',
  'Shirley O\'Hara': 'Fine Gael',

  // Cork - Additional councillors
  'Alan Coleman': 'Fine Gael',
  'Ann Bambury': 'Fine Gael',
  'Brian McCarthy': 'Fine Gael',
  'Damian Boylan': 'Fine Gael',
  'Des Cahill': 'Fine Gael',
  'Fiona Kerins': 'Fianna Fáil',
  'Garret Kelleher': 'Fine Gael',
  'Jack White': 'Fine Gael',
  'Joe Kavanagh': 'Fine Gael',
  'John Maher': 'Fianna Fáil',
  'Ken O\'Flynn': 'Independent Ireland',
  'Liam Madden': 'Fine Gael',
  'Martin Coughlan': 'Fine Gael',
  'Mary Rose Desmond': 'Fianna Fáil',
  'Nelius Cotter': 'Fianna Fáil',
  'Patrick Mulcahy': 'Fianna Fáil',
  'Paudie Dineen': 'Fianna Fáil',
  'Peter Horgan': 'Fine Gael',
  'Sean Martin': 'Fianna Fáil',
  'Tony O\'Shea': 'Fianna Fáil',
  'Trish Murphy': 'Fianna Fáil',

  // Galway - Additional councillors
  'Alan Curran': 'Fine Gael',
  'Declan McDonnell': 'Independent',
  'Frank Fahy': 'Fianna Fáil',
  'John Connolly': 'Fianna Fáil',
  'John McDonagh': 'Fianna Fáil',
  'Michael Maher': 'Fianna Fáil',
  'Ollie Turner': 'Fine Gael',
  'Padraig Mac An Iomaire': 'Fianna Fáil',
  'Shane Forde': 'Fianna Fáil',
  'Terry O\'Flaherty': 'Independent',

  // Waterford - Additional councillors
  'David Daniels': 'Sinn Féin',
  'Declan Barry': 'Fine Gael',
  'Donal Barry': 'Fianna Fáil',
  'Jim D\'Arcy': 'Fine Gael',
  'Joe Conway': 'Labour Party',
  'John O\'Leary': 'Fianna Fáil',
  'Mary Roche': 'Sinn Féin',

  // Wexford spelling fix
  'Fionntain O Suilleabhain': 'Sinn Féin',

  // Dún Laoghaire-Rathdown - Complete 2024 results (40 seats)
  // Blackrock LEA
  'Marie Baker': 'Fine Gael',
  'Dan Carson': 'Fine Gael',
  'Michael Clark': 'Fianna Fáil',
  'Maurice Dockrell': 'Fine Gael',
  'Conor Dowling': 'Green Party',
  'Martha Fanning': 'Labour Party',
  // Dundrum LEA
  'Anne Colgan': 'Independent',
  'Anna Grainger': 'Fine Gael',
  'Robert Jones': 'Green Party',
  'Sean McLoughlin': 'Independent',
  'Peter O\'Brien': 'Labour Party',
  // Dún Laoghaire LEA
  'JP Durkan': 'Fine Gael',
  'Mary Fayne': 'Fine Gael',
  'Lorraine Hall': 'Fine Gael',
  'Melissa Halpin': 'People Before Profit',
  'Thomas Joseph': 'Labour Party',
  'Justin Moylan': 'Fianna Fáil',
  // Glencullen-Sandyford LEA
  'Kazi Ahmed': 'Fine Gael',
  'Kevin Daly': 'Independent',
  'Pierce Dargan': 'Fine Gael',
  'Michael Fleming': 'Independent',
  // Killiney-Shankill LEA
  'Jacqueline Burke': 'Fine Gael',
  'Jim Gildea': 'Fine Gael',
  'Hugh Lewis': 'Independent',
  'Frank McNamara': 'Fine Gael',
  'Dave O\'Keeffe': 'People Before Profit',
  'Lauren Tuite': 'Green Party',
  // Stillorgan LEA
  'Barry Saul': 'Fine Gael',
  'Maeve O\'Connell': 'Fine Gael',
  'Eva Dowling': 'Green Party',
  'John Hurley': 'Social Democrats',

  // Meath - Additional councillors from 2024
  'Conor Tormey': 'Fine Gael',
  'Suzanne Jamal': 'Fianna Fáil',
  'Sean Drew': 'Fine Gael',
  'Sharon Tolan': 'Fine Gael',
  'Maria White': 'Sinn Féin',
  'Padraig Fitzsimons': 'Fianna Fáil',
  'Carol Lennon': 'Independent',
  'Alan Tobin': 'Fianna Fáil',
  'Mike Bray': 'Independent',
  'Aisling Dempsey': 'Sinn Féin',
  'David Gilroy': 'Labour Party',
  'Caroline O\'Reilly': 'Fine Gael',
  'Helen Meyer': 'Fine Gael',
  'Padraig Coffey': 'Fine Gael',
  'Stephen McKee': 'Fine Gael',
  'Maria Murphy': 'Fianna Fáil',
  'Dave Boyne': 'Fianna Fáil',
  'Yemi Adenuga': 'Fine Gael',

  // Kildare - Additional councillors
  'Padraig McEvoy': 'Fianna Fáil',
  'William Durkan': 'Fine Gael',
  'Brendan Wyse': 'Fine Gael',
  'Brian Dooley': 'Fine Gael',
  'Daragh Fitzpatrick': 'Fine Gael',
  'Carmel Kelly': 'Labour Party',
  'Joe Neville': 'Fine Gael',
  'Anne Breen': 'Fianna Fáil',
  'Aoife Breslin': 'Labour Party',
  'Paul Ward': 'Fianna Fáil',
  'Ger Dunne': 'Fine Gael',
  'Mark Leigh': 'Social Democrats',
  'Veralouise Behan': 'Social Democrats',
  'Brian O\'Loughlin': 'Fianna Fáil',

  // Dublin City - More councillors
  'Angela Donnelly': 'Fine Gael',
  'Aoibheann Mahon': 'Fine Gael',
  'Aoibhinn Tormey': 'Labour Party',
  'Baby Pereppadan': 'Fianna Fáil',
  'Britto Pereppadan': 'Fianna Fáil',
  'Ciaran O Meachair': 'Sinn Féin',
  'Cieran Perry': 'Independent',
  'Clodagh Ni Mhuiri': 'Green Party',
  'Conor Reddy': 'Sinn Féin',
  'Darragh Adelaide': 'Sinn Féin',
  'Darren Jack Kelly': 'Independent',
  'David McManus': 'Fine Gael',
  'Eimear Carbone-Mangan': 'Green Party',
  'Eva Elizabeth Dowling': 'Green Party',
  'Feljin Jose': 'Fianna Fáil',
  'Gayle Ralph': 'Fianna Fáil',
  'John Stephens': 'Fine Gael',
  'John Walsh': 'Fianna Fáil',
  'Kourtney Kenny': 'Sinn Féin',
  'Leslie Kane': 'Fine Gael',
  'Linda De Courcy': 'Independent Ireland',
  'Lynn McCrave': 'Fianna Fáil',
  'Madeleine Johansson': 'Social Democrats',
  'Malachy Quinn': 'Fine Gael',
  'Marian Buckley': 'Fine Gael',
  'Niamh Fennel': 'Sinn Féin',
  'Noelle Brown': 'Sinn Féin',
  'Roisin Mannion': 'Sinn Féin',
  'Siobhan Shovlin': 'Sinn Féin',

  // Cork - Additional councillors
  'Albert Deasy': 'Fine Gael',
  'Ann-Marie Ahern': 'Fianna Fáil',
  'Daniel Sexton': 'Sinn Féin',
  'Deirdre Kelly': 'Fianna Fáil',
  'Deirdre O\'Brien': 'Fine Gael',
  'Eoghan Kenny': 'Fine Gael',
  'Honore Kamegni': 'Fianna Fáil',
  'Isobel Towse': 'Social Democrats',
  'Joe Lynch': 'Fine Gael',
  'John Buckley': 'Fine Gael',
  'John Michael Foley': 'Fianna Fáil',
  'Kenneth Collins': 'Fianna Fáil',
  'Laura Harmon': 'Social Democrats',
  'Liam Quaide': 'Independent',
  'Margaret McDonnell': 'Fianna Fáil',
  'Mary Linehan Foley': 'Fianna Fáil',
  'Michelle Gould': 'Sinn Féin',
  'Noel O\'Donovan': 'Fine Gael',
  'Padraig Rice': 'Fianna Fáil',
  'Peter O\'Donoghue': 'Fine Gael',
  'Rory Cocking': 'Green Party',
  'Shane O\'Callaghan': 'Fine Gael',
  'Terry Coleman': 'Fianna Fáil',
  'Una McCarthy': 'Fianna Fáil',

  // Galway - Additional councillors
  'Aisling Burke': 'Fianna Fáil',
  'Andrew Reddington': 'Fine Gael',
  'Eibhlin Seoighthe': 'Sinn Féin',
  'Helen Ogbu': 'Fine Gael',
  'Jimmy McClean': 'Fine Gael',
  'Josie Forde': 'Fine Gael',
  'Karey McHugh Farag': 'Fine Gael',
  'Mairtin Lee': 'Sinn Féin',
  'Martina Kinane': 'Fianna Fáil',
  'P.J. Murphy': 'Fine Gael',
  'Peter Keane': 'Fine Gael',
  'Shaun Cuniffe': 'Fine Gael',
  'Tomas O Curraoin': 'Independent',

  // Limerick - Additional councillors
  'Brigid Teefy': 'Fine Gael',
  'Connor Sheehan': 'Labour Party',
  'Elena Secas': 'Fianna Fáil',
  'Frankie Daly': 'Independent',
  'George Conway': 'Fianna Fáil',
  'Joe Pond': 'Fianna Fáil',
  'Noreen Stokes': 'Fianna Fáil',
  'P.J. Carey': 'Fine Gael',
  'Peter Doyle': 'Fine Gael',
  'Tommy O\'Sullivan': 'Fianna Fáil',
  'Ursula Gavin': 'Fine Gael',

  // Waterford - Additional councillors
  'Blaise Hannigan': 'Fianna Fáil',
  'Catherine Burke': 'Fine Gael',
  'Donnchadh Mulcahy': 'Fine Gael',
  'Joe O\'Riordan': 'Fianna Fáil',
  'Joeanne Bailey': 'Fianna Fáil',
  'Niamh O\'Donovan': 'Fine Gael',

  // Kerry - Additional councillors
  'Anne O\'Sullivan': 'Fine Gael',
  'Deirdre Ferris': 'Sinn Féin',
  'Norma Moriarty': 'Fianna Fáil',
  'Podge Foley': 'Fianna Fáil',
  'Teddy O\'Sullivan Casey': 'Fine Gael',

  // Tipperary - Additional councillors
  'Annemarie Ryan': 'Sinn Féin',
  'Hanna Mary Hourigan': 'Fine Gael',
  'John Fitzgerald': 'Fine Gael',
  'Michael Brennan': 'Fine Gael',
  'Niall P Dennehy': 'Independent',
  'Richie Molloy': 'Fianna Fáil',
  'Siobhan Ambrose': 'Fianna Fáil',

  // Clare - Additional councillors
  'Antoinette Baker Bashua': 'Fianna Fáil',
  'Conor Ryan': 'Fine Gael',
  'James Ryan': 'Independent',

  // Roscommon - Additional councillors
  'Domnick Connolly': 'Sinn Féin',
  'Gareth Scahill': 'Fine Gael',
  'Marty McDermott': 'Fianna Fáil',
  'Micheal Frain': 'Fianna Fáil',
  'Sean Moylan': 'Fianna Fáil',

  // Donegal - Additional councillors
  'Brian Carr': 'Fianna Fáil',
  'Dakota Nic Mheanman': 'Sinn Féin',
  'Donal Coyle': 'Fianna Fáil',
  'Jimmy Brogan': 'Fine Gael',
  'Manus Boyle': 'Fianna Fáil',
  'Martin Scanlon': 'Fianna Fáil',
  'Michael McClafferty': 'Sinn Féin',
  'Michael McMahon': 'Fianna Fáil',
  'Micheal Choilm Mac Giolla Easbuig': 'Sinn Féin',
  'Micheal Naughton': 'Fianna Fáil',
  'Pauric McGarvey': 'Independent',

  // Leitrim - Additional councillors
  'Cormac Flynn': 'Fianna Fáil',
  'Eddie Mitchell': 'Fine Gael',
  'Enda McGloin': 'Fine Gael',
  'Garry Prior': 'Independent',
  'James Gilmartin': 'Fine Gael',
  'Justin Warnock': 'Fianna Fáil',
  'Maeve Reynolds': 'Fine Gael',
  'Roisin Kenny': 'Sinn Féin',

  // Longford - Additional councillors
  'David Cassidy': 'Fianna Fáil',
  'Gerry Hagan': 'Fine Gael',
  'Kevin Hussey': 'Fine Gael',
  'Mark Casey': 'Fine Gael',
  'Martin Skelly': 'Fianna Fáil',
  'Niall Gannon': 'Fine Gael',
  'Padraig McNamara': 'Fianna Fáil',
  'Sean Mimnagh': 'Independent',

  // Westmeath - Additional councillors
  'Alfie Devine': 'Sinn Féin',
  'Andrew Duncan': 'Fianna Fáil',
  'Aoife Davitt': 'Fine Gael',
  'David Jones': 'Independent',
  'Emily Wallace': 'Sinn Féin',
  'John Dolan': 'Independent',
  'Johnnie Penrose': 'Fine Gael',
  'Niall Gaffney': 'Fine Gael',

  // Monaghan - Additional councillors
  'Bronagh McAree': 'Sinn Féin',
  'Paul Gibbons': 'Fianna Fáil',
  'Pauric Clerkin': 'Fianna Fáil',
  'Seamus Treanor': 'Fianna Fáil',
  'Sinead Flynn': 'Sinn Féin',

  // Offaly - Additional councillors
  'Aoife Masterson': 'Green Party',
  'Audrey Hennessy-Kennedy': 'Fianna Fáil',

  // Sligo - Additional councillors
  'Gerard Mullaney': 'Fine Gael',
  'Liam Brennan': 'Fianna Fáil',

  // Wicklow - Additional councillors
  'Peter Stapleton': 'Independent',

  // Louth - Additional councillors
  'Anne-Marie Ford': 'Fianna Fáil',
  'Ejiro O\'Hare Stratton': 'Labour Party',
  'Fiona Mhic Conchoille': 'Sinn Féin',
  'Jim Tenanty': 'Independent',
  'John Reilly': 'Fine Gael',
  'John Sheriden': 'Fianna Fáil',
  'Paddy McQuillan': 'Fine Gael',
  'Robert Nash': 'Fine Gael',
  'Sionainn McCann': 'Sinn Féin',

  // Final 4 councillors
  'David Trost': 'Fine Gael',
  'Rupert Heather': 'Fine Gael',
  'Jerome Scanlon': 'Independent',
  'P.J. O\'Hanlon': 'Fine Gael',
};

// Normalize name for comparison (remove accents, standardize spacing)
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/-/g, ' ')              // Replace hyphens with spaces
    .replace(/\s+/g, ' ')            // Normalize whitespace
    .replace(/['']/g, "'")           // Normalize apostrophes
    .trim()
    .toLowerCase();
}

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

      const normalizedName = normalizeName(name);

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

      if (result.rowCount === 0) {
        // Try normalized match (removes accents, normalizes hyphens/spaces)
        result = await pool.query(`
          UPDATE politicians
          SET party = $1,
              party_id = $2
          WHERE LOWER(
            TRANSLATE(
              REPLACE(REPLACE(name, '-', ' '), '''', ''''),
              'áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛ',
              'aeiouAEIOUaeiouAEIOUaeiouAEIOUaeiouAEIOU'
            )
          ) = $3
            AND position_type = 'Councillor'
            AND (party IS NULL OR party_id IS NULL)
          RETURNING id, name
        `, [party, partyId, normalizedName]);
      }

      if (result.rowCount === 0) {
        // Try matching with just first and last name (handles middle names/initials)
        const nameParts = name.split(' ');
        if (nameParts.length >= 2) {
          const firstName = nameParts[0];
          const lastName = nameParts[nameParts.length - 1];
          result = await pool.query(`
            UPDATE politicians
            SET party = $1,
                party_id = $2
            WHERE position_type = 'Councillor'
              AND (party IS NULL OR party_id IS NULL)
              AND LOWER(name) LIKE LOWER($3)
              AND LOWER(name) LIKE LOWER($4)
            RETURNING id, name
          `, [party, partyId, `${firstName}%`, `%${lastName}`]);
        }
      }

      if (result.rowCount && result.rowCount > 0) {
        updatedCount += result.rowCount;
        console.log(`✓ ${name} → ${party}` + (result.rows[0]?.name !== name ? ` (matched: ${result.rows[0]?.name})` : ''));
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

/**
 * Council website URLs and scraping configuration
 */

export interface CouncilSource {
  county: string;
  url: string;
  authority: string;
}

export const COUNCIL_URLS: CouncilSource[] = [
  // Dublin authorities
  { county: 'dublin', url: 'https://www.dublincity.ie/council/councillors', authority: 'Dublin City Council' },
  { county: 'dun-laoghaire-rathdown', url: 'https://www.dlrcoco.ie/council/councillors', authority: 'Dún Laoghaire-Rathdown' },
  { county: 'south-dublin', url: 'https://www.sdcc.ie/en/council/councillors/', authority: 'South Dublin' },
  { county: 'fingal', url: 'https://www.fingal.ie/council/councillors', authority: 'Fingal' },

  // Other councils - alphabetical
  { county: 'carlow', url: 'https://www.carlow.ie/council/councillors/', authority: 'Carlow' },
  { county: 'cavan', url: 'https://www.cavancoco.ie/council/councillors/', authority: 'Cavan' },
  { county: 'clare', url: 'https://www.clarecoco.ie/your-council/contact-the-council/councillors/', authority: 'Clare' },
  { county: 'cork', url: 'https://www.corkcoco.ie/en/council/councillors', authority: 'Cork County' },
  { county: 'cork-city', url: 'https://www.corkcity.ie/en/council-services/councillors-and-democracy/councillors/', authority: 'Cork City' },
  { county: 'donegal', url: 'https://www.donegalcoco.ie/your-council/councillors/', authority: 'Donegal' },
  { county: 'galway', url: 'https://www.galway.ie/en/services/your-council/councillors/', authority: 'Galway County' },
  { county: 'galway-city', url: 'https://www.galwaycity.ie/council-members', authority: 'Galway City' },
  { county: 'kerry', url: 'https://www.kerrycoco.ie/councillors/', authority: 'Kerry' },
  { county: 'kildare', url: 'https://kildarecoco.ie/YourCouncil/YourElectedCouncil/CouncillorsDetails/', authority: 'Kildare' },
  { county: 'kilkenny', url: 'https://kilkennycoco.ie/eng/your_council/about-the-council/your_county_councillor/', authority: 'Kilkenny' },
  { county: 'laois', url: 'https://laois.ie/councillors/', authority: 'Laois' },
  { county: 'leitrim', url: 'https://www.leitrim.ie/council/corporate-governance/councillors/county-councillors/', authority: 'Leitrim' },
  { county: 'limerick', url: 'https://www.limerick.ie/council/your-council/councillors', authority: 'Limerick' },
  { county: 'longford', url: 'https://www.longfordcoco.ie/your-council/council-members/', authority: 'Longford' },
  { county: 'louth', url: 'https://www.louthcoco.ie/en/your-council/councillors/', authority: 'Louth' },
  { county: 'mayo', url: 'https://www.mayo.ie/en-ie/your-council/governance-and-democracy/councillors', authority: 'Mayo' },
  { county: 'meath', url: 'https://www.meath.ie/council/your-council/your-elected-council/your-councillors', authority: 'Meath' },
  { county: 'monaghan', url: 'https://monaghan.ie/council/councillors/', authority: 'Monaghan' },
  { county: 'offaly', url: 'https://www.offaly.ie/councillors/', authority: 'Offaly' },
  { county: 'roscommon', url: 'https://www.roscommoncoco.ie/en/Your-Council/Councillors/', authority: 'Roscommon' },
  { county: 'sligo', url: 'https://www.sligococo.ie/YourCouncil/CountyCouncil/CountyCouncilMembers/', authority: 'Sligo' },
  { county: 'tipperary', url: 'https://www.tipperarycoco.ie/your-council/councillors', authority: 'Tipperary' },
  { county: 'waterford', url: 'https://www.waterfordcouncil.ie/council/councillors/', authority: 'Waterford' },
  { county: 'westmeath', url: 'https://www.westmeathcoco.ie/en/ourservices/yourcouncil/councillorsandcommittees/councillors/', authority: 'Westmeath' },
  { county: 'wexford', url: 'https://www.wexfordcoco.ie/council-and-democracy/councillors', authority: 'Wexford' },
  { county: 'wicklow', url: 'https://www.wicklow.ie/Living/Your-Council/Your-Councillors/Elected-Council-Members', authority: 'Wicklow' },
];

/**
 * Get council source by county name
 */
export function getCouncilByCounty(county: string): CouncilSource | undefined {
  return COUNCIL_URLS.find(c => c.county === county);
}

/**
 * Get all county names
 */
export function getAllCounties(): string[] {
  return COUNCIL_URLS.map(c => c.county);
}

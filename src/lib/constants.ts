export const SERVICE_CATEGORIES = [
  { value: 'texting', label: 'SMS / Texting' },
  { value: 'digital_ads', label: 'Digital Advertising' },
  { value: 'mail', label: 'Direct Mail' },
  { value: 'polling', label: 'Polling / Research' },
  { value: 'general_consulting', label: 'General Consulting' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'field', label: 'Field / Grassroots' },
  { value: 'media_buying', label: 'Media Buying' },
  { value: 'creative', label: 'Creative / Design' },
  { value: 'opposition_research', label: 'Opposition Research' },
  { value: 'data_analytics', label: 'Data / Analytics' },
  { value: 'web_development', label: 'Web Development' },
  { value: 'video_production', label: 'Video Production' },
  { value: 'communications', label: 'Communications / PR' },
  { value: 'other', label: 'Other' },
] as const;

export const RACE_TYPES = [
  { value: 'federal_house', label: 'U.S. House' },
  { value: 'federal_senate', label: 'U.S. Senate' },
  { value: 'governor', label: 'Governor' },
  { value: 'state_leg', label: 'State Legislature' },
  { value: 'local', label: 'Local / Municipal' },
  { value: 'pac', label: 'PAC' },
  { value: 'super_pac', label: 'Super PAC' },
  { value: 'party_committee', label: 'Party Committee' },
] as const;

export const REGIONS = [
  { value: 'northeast', label: 'Northeast' },
  { value: 'southeast', label: 'Southeast' },
  { value: 'midwest', label: 'Midwest' },
  { value: 'southwest', label: 'Southwest' },
  { value: 'west', label: 'West' },
  { value: 'national', label: 'National' },
] as const;

export const BUDGET_TIERS = [
  { value: 'under_25k', label: 'Under $25K' },
  { value: '25k_50k', label: '$25K – $50K' },
  { value: '50k_100k', label: '$50K – $100K' },
  { value: '100k_250k', label: '$100K – $250K' },
  { value: '250k_500k', label: '$250K – $500K' },
  { value: '500k_1m', label: '$500K – $1M' },
  { value: 'over_1m', label: 'Over $1M' },
] as const;

export const COMMITTEE_ROLES = [
  { value: 'candidate', label: 'Candidate' },
  { value: 'campaign_manager', label: 'Campaign Manager' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'finance_director', label: 'Finance Director' },
  { value: 'other_senior_staff', label: 'Other Senior Staff' },
] as const;

export const PARTY_FOCUS = [
  { value: 'democratic', label: 'Democratic' },
  { value: 'republican', label: 'Republican' },
  { value: 'bipartisan', label: 'Bipartisan' },
  { value: 'nonpartisan', label: 'Nonpartisan' },
] as const;

export const RACE_OUTCOMES = [
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'primary_only', label: 'Primary Only' },
  { value: 'prefer_not_to_say', label: 'Prefer Not to Say' },
] as const;

export const EVIDENCE_TYPES = [
  { value: 'invoice', label: 'Invoice from vendor' },
  { value: 'contract', label: 'Contract / Agreement' },
  { value: 'fec_screenshot', label: 'FEC Filing Screenshot' },
  { value: 'state_filing_screenshot', label: 'State Filing Screenshot' },
  { value: 'other', label: 'Other documentation' },
] as const;

export const FLAG_REASONS = [
  { value: 'defamatory', label: 'Defamatory content' },
  { value: 'fake', label: 'Fake or fraudulent review' },
  { value: 'identifies_reviewer', label: 'Identifies the reviewer' },
  { value: 'policy_violation', label: 'Policy violation' },
  { value: 'other', label: 'Other' },
] as const;

export const STATE_TO_REGION: Record<string, string> = {
  CT: 'northeast', DE: 'northeast', MA: 'northeast', MD: 'northeast',
  ME: 'northeast', NH: 'northeast', NJ: 'northeast', NY: 'northeast',
  PA: 'northeast', RI: 'northeast', VT: 'northeast', DC: 'northeast',
  AL: 'southeast', AR: 'southeast', FL: 'southeast', GA: 'southeast',
  KY: 'southeast', LA: 'southeast', MS: 'southeast', NC: 'southeast',
  SC: 'southeast', TN: 'southeast', VA: 'southeast', WV: 'southeast',
  IA: 'midwest', IL: 'midwest', IN: 'midwest', KS: 'midwest',
  MI: 'midwest', MN: 'midwest', MO: 'midwest', ND: 'midwest',
  NE: 'midwest', OH: 'midwest', SD: 'midwest', WI: 'midwest',
  AZ: 'southwest', NM: 'southwest', OK: 'southwest', TX: 'southwest',
  AK: 'west', CA: 'west', CO: 'west', HI: 'west', ID: 'west',
  MT: 'west', NV: 'west', OR: 'west', UT: 'west', WA: 'west', WY: 'west',
};

export const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'D.C.' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' }, { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' }, { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' }, { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' }, { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' }, { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' }, { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' }, { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
] as const;

export const RATING_CATEGORIES = [
  { key: 'rating_overall', label: 'Overall' },
  { key: 'rating_communication', label: 'Communication' },
  { key: 'rating_budget_transparency', label: 'Budget Transparency' },
  { key: 'rating_results_vs_projections', label: 'Results vs. Projections' },
  { key: 'rating_responsiveness', label: 'Responsiveness' },
  { key: 'rating_strategic_quality', label: 'Strategic Quality' },
] as const;

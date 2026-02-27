export type UserRole = 'reviewer' | 'firm_admin' | 'platform_admin';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type ReviewStatus = 'pending' | 'published' | 'flagged' | 'removed';
export type FlagStatus = 'pending' | 'upheld' | 'dismissed';
export type ResponseStatus = 'published' | 'removed';
export type AnonymizationLevel = 'standard' | 'minimal';

export type RaceType =
  | 'federal_house'
  | 'federal_senate'
  | 'governor'
  | 'state_leg'
  | 'local'
  | 'pac'
  | 'super_pac'
  | 'party_committee';

export type Region = 'northeast' | 'southeast' | 'midwest' | 'southwest' | 'west' | 'national';

export type BudgetTier =
  | 'under_25k'
  | '25k_50k'
  | '50k_100k'
  | '100k_250k'
  | '250k_500k'
  | '500k_1m'
  | 'over_1m';

export type PartyFocus = 'democratic' | 'republican' | 'bipartisan' | 'nonpartisan';

export type CommitteeRole =
  | 'candidate'
  | 'campaign_manager'
  | 'treasurer'
  | 'finance_director'
  | 'other_senior_staff';

export type ServiceCategory =
  | 'texting'
  | 'digital_ads'
  | 'mail'
  | 'polling'
  | 'general_consulting'
  | 'fundraising'
  | 'field'
  | 'media_buying'
  | 'creative'
  | 'opposition_research'
  | 'data_analytics'
  | 'web_development'
  | 'video_production'
  | 'communications'
  | 'other';

export type EvidenceType =
  | 'invoice'
  | 'contract'
  | 'fec_screenshot'
  | 'state_filing_screenshot'
  | 'other';

export type FlagReason = 'defamatory' | 'fake' | 'identifies_reviewer' | 'policy_violation' | 'other';

export type RaceOutcome = 'won' | 'lost' | 'primary_only' | 'prefer_not_to_say';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  verification_status: VerificationStatus;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Committee {
  id: string;
  name: string;
  state: string | null;
  race_type: RaceType | null;
  cycle_year: number;
  created_at: string;
}

export interface CommitteeMember {
  id: string;
  profile_id: string;
  committee_id: string;
  role_on_committee: CommitteeRole | null;
  verified: boolean;
  committee?: Committee;
}

export interface Firm {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  services: ServiceCategory[] | null;
  is_claimed: boolean;
  claimed_by: string | null;
  party_focus: PartyFocus | null;
  year_founded: number | null;
  headquarters_state: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string | null;
  firm_id: string;
  committee_id: string | null;
  rating_overall: number;
  rating_communication: number | null;
  rating_budget_transparency: number | null;
  rating_results_vs_projections: number | null;
  rating_responsiveness: number | null;
  rating_strategic_quality: number | null;
  review_text: string;
  pros: string | null;
  cons: string | null;
  cycle_year: number;
  race_type: RaceType;
  region: Region | null;
  budget_tier: BudgetTier | null;
  services_used: string[] | null;
  would_hire_again: boolean;
  race_outcome: RaceOutcome | null;
  anonymization_level: AnonymizationLevel;
  has_invoice_evidence: boolean;
  invoice_verified_by: string | null;
  invoice_verified_at: string | null;
  evidence_notes: string | null;
  status: ReviewStatus;
  flagged_reason: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  firm?: Firm;
  firm_response?: FirmResponse;
}

export interface FirmResponse {
  id: string;
  review_id: string;
  firm_id: string;
  responder_id: string;
  response_text: string;
  status: ResponseStatus;
  created_at: string;
}

export interface ReviewFlag {
  id: string;
  review_id: string;
  flagged_by: string;
  reason: FlagReason;
  details: string | null;
  status: FlagStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  review?: Review;
}

export interface VerificationSubmission {
  id: string;
  profile_id: string;
  committee_id: string | null;
  evidence_type: EvidenceType;
  file_url: string | null;
  notes: string | null;
  status: VerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  profile?: Profile;
  committee?: Committee;
}

export interface FirmWithStats extends Firm {
  avg_rating: number;
  review_count: number;
  hire_again_pct: number;
}

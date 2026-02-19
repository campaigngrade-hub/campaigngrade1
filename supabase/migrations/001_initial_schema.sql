-- CampaignGrade Initial Schema

-- profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'reviewer', -- 'reviewer' | 'firm_admin' | 'platform_admin'
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- committees
CREATE TABLE IF NOT EXISTS committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT,
  race_type TEXT, -- 'federal_house' | 'federal_senate' | 'governor' | 'state_leg' | 'local' | 'pac' | 'super_pac' | 'party_committee'
  cycle_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- committee_members
CREATE TABLE IF NOT EXISTS committee_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
  role_on_committee TEXT, -- 'candidate' | 'campaign_manager' | 'treasurer' | 'finance_director' | 'other_senior_staff'
  verified BOOLEAN DEFAULT FALSE,
  UNIQUE(profile_id, committee_id)
);

-- firms
CREATE TABLE IF NOT EXISTS firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  services TEXT[],
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by UUID REFERENCES profiles(id),
  party_focus TEXT, -- 'democratic' | 'republican' | 'bipartisan' | 'nonpartisan'
  year_founded INTEGER,
  headquarters_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  committee_id UUID REFERENCES committees(id),

  rating_overall INTEGER NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  rating_communication INTEGER CHECK (rating_communication BETWEEN 1 AND 5),
  rating_budget_transparency INTEGER CHECK (rating_budget_transparency BETWEEN 1 AND 5),
  rating_results_vs_projections INTEGER CHECK (rating_results_vs_projections BETWEEN 1 AND 5),
  rating_responsiveness INTEGER CHECK (rating_responsiveness BETWEEN 1 AND 5),
  rating_strategic_quality INTEGER CHECK (rating_strategic_quality BETWEEN 1 AND 5),

  review_text TEXT NOT NULL,
  pros TEXT,
  cons TEXT,

  cycle_year INTEGER NOT NULL,
  race_type TEXT NOT NULL,
  region TEXT, -- 'northeast' | 'southeast' | 'midwest' | 'southwest' | 'west' | 'national'
  budget_tier TEXT,
  service_used TEXT,
  would_hire_again BOOLEAN NOT NULL,
  race_outcome TEXT, -- 'won' | 'lost' | 'primary_only' | 'prefer_not_to_say'
  anonymization_level TEXT DEFAULT 'standard', -- 'standard' | 'minimal'

  has_invoice_evidence BOOLEAN DEFAULT FALSE,
  invoice_verified_by UUID REFERENCES profiles(id),
  invoice_verified_at TIMESTAMPTZ,
  evidence_notes TEXT,

  status TEXT DEFAULT 'pending', -- 'pending' | 'published' | 'flagged' | 'removed'
  flagged_reason TEXT,
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(reviewer_id, firm_id, cycle_year)
);

-- firm_responses
CREATE TABLE IF NOT EXISTS firm_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES profiles(id),
  response_text TEXT NOT NULL,
  status TEXT DEFAULT 'published', -- 'published' | 'removed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id)
);

-- review_flags
CREATE TABLE IF NOT EXISTS review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  flagged_by UUID REFERENCES profiles(id),
  reason TEXT NOT NULL, -- 'defamatory' | 'fake' | 'identifies_reviewer' | 'policy_violation' | 'other'
  details TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'upheld' | 'dismissed'
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- verification_submissions
CREATE TABLE IF NOT EXISTS verification_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  committee_id UUID REFERENCES committees(id),
  evidence_type TEXT NOT NULL, -- 'invoice' | 'contract' | 'fec_screenshot' | 'state_filing_screenshot' | 'other'
  file_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Row Level Security
-- =====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
);

-- Committees policies
CREATE POLICY "Anyone can read committees" ON committees FOR SELECT USING (TRUE);
CREATE POLICY "Verified users can insert committees" ON committees FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- Committee members policies
CREATE POLICY "Users can view own committee memberships" ON committee_members FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can insert own committee memberships" ON committee_members FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Admins can view all committee members" ON committee_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
);

-- Firms policies
CREATE POLICY "Firms are publicly readable" ON firms FOR SELECT USING (TRUE);
CREATE POLICY "Firm admins can update own firm" ON firms FOR UPDATE USING (claimed_by = auth.uid());
CREATE POLICY "Admins can manage firms" ON firms FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
);
CREATE POLICY "Anyone can insert firms" ON firms FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- Reviews policies
CREATE POLICY "Published reviews are public" ON reviews FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can see own reviews" ON reviews FOR SELECT USING (reviewer_id = auth.uid());
CREATE POLICY "Verified users can insert reviews" ON reviews FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_verified = TRUE)
);
CREATE POLICY "Authors can update own pending reviews" ON reviews FOR UPDATE USING (
  reviewer_id = auth.uid() AND status IN ('pending', 'published')
);
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
);

-- Firm responses policies
CREATE POLICY "Published responses are public" ON firm_responses FOR SELECT USING (status = 'published');
CREATE POLICY "Firm admins can respond" ON firm_responses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM firms WHERE id = firm_id AND claimed_by = auth.uid())
);
CREATE POLICY "Admins can manage responses" ON firm_responses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
);

-- Review flags policies
CREATE POLICY "Users can insert flags" ON review_flags FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Users can see own flags" ON review_flags FOR SELECT USING (flagged_by = auth.uid());
CREATE POLICY "Admins can manage flags" ON review_flags FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
);

-- Verification submissions policies
CREATE POLICY "Users see own submissions" ON verification_submissions FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can insert own submissions" ON verification_submissions FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Admins can manage verifications" ON verification_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
);

-- =====================
-- Helper function to handle new user signup
-- =====================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER firms_updated_at BEFORE UPDATE ON firms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

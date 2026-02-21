export interface Venue {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  category: "Hotel" | "Restaurant" | "Bar";
  neighborhood: string | null;

  // Dry Score data
  dry_score: number;
  top_na_drink: string | null;
  na_drink_count: number | null;
  description: string | null;
  short_description: string | null;

  // Links
  website_url: string | null;
  menu_url: string | null;
  booking_url: string | null;
  image_url: string | null;

  // Features
  af_minibar: boolean;
  zero_proof_pairing: boolean;
  vibe_tags: string[];
  price_range: string | null;
  hours_note: string | null;

  // Pipeline & review
  google_place_id: string | null;
  status: "Draft" | "Published" | "Rejected";
  notes: string | null;
  featured: boolean;

  // Verification & source
  source: string | null;
  last_verified: string | null;
  verified_by: string | null;

  // AI context
  ai_context: string | null;

  // Location
  latitude: number | null;
  longitude: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

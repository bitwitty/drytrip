export interface Venue {
  id?: string;
  name: string;
  city: string;
  country: string;
  category: string;
  dry_score: number;
  top_na_drink: string;
  description: string;
  menu_url: string | null;
  website_url: string;
  image_url: string | null;
  af_minibar: boolean;
  zero_proof_pairing: boolean;
  status?: string;
}

export interface Vendor {
  id?: number;
  vendor_id?: string;
  name: string;
  owned_by: string;
  vendor_contact: string;
  owner_contact: string;
  status?: string;
  image_url?: string | null;
  eta?: number;
  rating?: number;
  menu_count?: number;
  registration_time?: string;
  volume_processed?: number;
  value_processed?: string;
  terms_agreed_at?: string | null;
}

export interface MenuItem {
  id?: number;
  name: string;
  price: number | string;
  description: string;
  image_url?: string | null;
  category_id?: number | null;
  vendor_id?: number | null;
  status?: string;
  date_added?: string;
}

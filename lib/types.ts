export type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | string;
  category: string;
  seller_email: string;
  image_url: string | null;
  location: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Seller = {
  email: string;
  stripe_account_id: string | null;
  display_name?: string | null;
  bio?: string | null;
  location?: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  listing_id: string | null;
  buyer_email: string;
  amount: number | string;
  created_at: string;
};

export type ListingMessage = {
  id: string;
  listing_id: string;
  buyer_email: string;
  seller_email: string;
  message: string;
  created_at: string;
};

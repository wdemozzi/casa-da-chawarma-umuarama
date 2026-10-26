export interface ProductVariation {
  id: string;
  name: string; // Ex: 'Inteira', 'Meia', 'Natural', 'Ao Leite'
  price_cents: number;
  is_default?: boolean;
}

export interface ProductAddon {
  id: string;
  name: string; // Ex: 'Adicional de queijo (+R$ 5,00)', 'Bacon (+R$ 5,00)'
  price_cents: number;
  is_available: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price_cents: number; // Preço base em centavos (ex: 3500 para R$ 35,00)
  image_url: string;
  video_url?: string; // Vídeo MP4 curto / loop gastronômico
  is_story?: boolean; // Se deve ser destacado nos Stories do cardápio
  story_badge?: string; // Ex: '🔥 Feito na Hora', '🧀 Queijo Puxando'
  story_tagline?: string; // Frase de efeito exibida no story
  needs_real_photo?: boolean; // Flag indicando que precisa de foto real pelo estabelecimento
  has_variations?: boolean;
  variations?: ProductVariation[];
  addons?: ProductAddon[];
  is_active: boolean;
  sort_order: number;
}

export interface FoodStory {
  id: string;
  title: string;
  tagline: string;
  category_name: string;
  product_id: string;
  poster_url: string;
  video_url: string;
  price_cents: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image_url: string;
  sort_order: number;
  description?: string;
  is_active: boolean;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  official_whatsapp: string; // Ex: '44999999999' ou vazio se não configurado
  address: string;
  city: string;
  state: string;
  opening_hours: string;
  instagram: string;
  banner_image_url: string;
  admin_pin: string; // PIN de acesso ao painel administrativo
}

export interface CartItem {
  id: string; // unique cart line id
  product: Product;
  quantity: number;
  selectedVariation?: ProductVariation;
  selectedAddons: ProductAddon[];
  notes?: string;
}

export interface Coupon {
  code: string;
  title: string;
  discount_cents?: number;
  discount_percent?: number;
  freebie_name?: string;
}

export interface OrderSubmission {
  id: string;
  customer_name: string;
  customer_phone?: string;
  items: CartItem[];
  subtotal_cents: number;
  total_cents: number;
  coupon?: Coupon;
  notes?: string;
  created_at: string;
}

import { Category, Product, RestaurantSettings } from '../types/menu';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialMenu';

const STORAGE_KEYS = {
  CATEGORIES: 'chawarma_categories_v3',
  PRODUCTS: 'chawarma_products_v3',
  SETTINGS: 'chawarma_settings_v3',
  CART: 'chawarma_cart_v3',
};

export const menuStorage = {
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading categories from localStorage:', e);
    }
    return INITIAL_CATEGORIES;
  },

  saveCategories(categories: Category[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories to localStorage:', e);
    }
  },

  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading products from localStorage:', e);
    }
    return INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage:', e);
    }
  },

  getSettings(): RestaurantSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          wheel_enabled: parsed.wheel_enabled !== undefined ? parsed.wheel_enabled : true,
          wheel_prizes:
            parsed.wheel_prizes &&
            parsed.wheel_prizes.length === 6 &&
            !parsed.wheel_prizes.some((p: any) => p.discount_type === 'fixed')
              ? parsed.wheel_prizes
              : INITIAL_SETTINGS.wheel_prizes,
        };
      }
    } catch (e) {
      console.error('Error loading settings from localStorage:', e);
    }
    return INITIAL_SETTINGS;
  },

  saveSettings(settings: RestaurantSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
    }
  },

  resetToOriginalPdf() {
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    return {
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      settings: INITIAL_SETTINGS,
    };
  },
};

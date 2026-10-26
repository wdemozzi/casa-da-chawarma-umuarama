import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, Product, RestaurantSettings } from '../types/menu';
import { menuStorage } from '../lib/storage';

interface MenuContextType {
  categories: Category[];
  products: Product[];
  settings: RestaurantSettings;
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  updateCategory: (category: Category) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;
  resetToOriginalMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() => menuStorage.getCategories());
  const [products, setProducts] = useState<Product[]>(() => menuStorage.getProducts());
  const [settings, setSettings] = useState<RestaurantSettings>(() => menuStorage.getSettings());

  useEffect(() => {
    menuStorage.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    menuStorage.saveProducts(products);
  }, [products]);

  useEffect(() => {
    menuStorage.saveSettings(settings);
  }, [settings]);

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const addProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
  };

  const updateCategory = (updated: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const addCategory = (newCatData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...newCatData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToOriginalMenu = () => {
    const original = menuStorage.resetToOriginalPdf();
    setCategories(original.categories);
    setProducts(original.products);
    setSettings(original.settings);
  };

  return (
    <MenuContext.Provider
      value={{
        categories,
        products,
        settings,
        updateProduct,
        addProduct,
        deleteProduct,
        toggleProductStatus,
        updateCategory,
        addCategory,
        deleteCategory,
        updateSettings,
        resetToOriginalMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

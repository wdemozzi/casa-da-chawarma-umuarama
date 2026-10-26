import { useState, useEffect } from 'react';
import { MenuProvider, useMenu } from './contexts/MenuContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './components/HomeScreen';
import { CategoryList } from './components/CategoryList';
import { CartScreen } from './components/CartScreen';
import { OrderSuccessScreen } from './components/OrderSuccessScreen';
import { ProductModal } from './components/ProductModal';
import { AdminPanel } from './components/AdminPanel';
import { BioPage } from './components/BioPage';
import { WhatsAppNoticeModal } from './components/WhatsAppNoticeModal';
import { LiveSocialProof } from './components/LiveSocialProof';
import { RewardWheelModal } from './components/RewardWheelModal';
import { CustomChawarmaBuilder } from './components/CustomChawarmaBuilder';
import type { Product } from './types/menu';

function MainApp() {
  const { categories, products } = useMenu();
  const { addItem } = useCart();

  const [currentTab, setCurrentTab] = useState<'home' | 'menu' | 'cart' | 'bio' | 'admin'>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [isOrderSuccess, setIsOrderSuccess] = useState<boolean>(false);
  const [isWhatsAppNoticeOpen, setIsWhatsAppNoticeOpen] = useState<boolean>(false);
  const [isRewardWheelOpen, setIsRewardWheelOpen] = useState<boolean>(false);
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState<boolean>(false);

  // Check URL query parameters or hash (e.g. ?admin=true or ?bio=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      if (params.has('admin') || hash === '#admin') {
        setCurrentTab('admin');
      } else if (params.has('bio') || hash === '#bio') {
        setCurrentTab('bio');
      }

      // Keyboard shortcut Ctrl + Shift + A to open Admin anywhere
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
          e.preventDefault();
          setCurrentTab('admin');
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const handleGoToMenu = (categoryId?: string) => {
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    } else {
      setSelectedCategoryId(null);
    }
    setCurrentTab('menu');
  };

  const handleBackNavigation = () => {
    if (currentTab === 'menu' && selectedCategoryId !== null) {
      setSelectedCategoryId(null);
    } else if (currentTab !== 'home') {
      setCurrentTab('home');
    }
  };

  const getHeaderTitle = () => {
    if (currentTab === 'home') return undefined;
    if (currentTab === 'cart') return 'Meu carrinho';
    if (currentTab === 'bio') return 'Link da Bio';
    if (currentTab === 'admin') return 'Painel Administrativo';
    if (currentTab === 'menu') {
      if (selectedCategoryId) {
        return categories.find((c) => c.id === selectedCategoryId)?.name || 'Cardápio';
      }
      return 'Cardápio';
    }
    return undefined;
  };

  // Dedicated Bio View without header/bottom nav for pure link-in-bio aesthetic
  if (currentTab === 'bio') {
    return (
      <div className="min-h-screen bg-[#09090c] text-gray-100 flex flex-col font-sans">
        <BioPage
          onOpenMenu={() => setCurrentTab('menu')}
          onOpenAdmin={() => setCurrentTab('admin')}
        />
        <BottomNavigation
          currentTab="bio"
          onSelectTab={(tab) => setCurrentTab(tab)}
        />
      </div>
    );
  }

  // Dedicated Isolated Admin View
  if (currentTab === 'admin') {
    return (
      <div className="min-h-screen bg-[#0d0d11] text-gray-100 flex flex-col font-sans">
        <AdminPanel onBackToMenu={() => setCurrentTab('home')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d11] text-gray-100 flex flex-col font-sans selection:bg-chawarma-gold selection:text-black">
      {/* Top Header */}
      {!isOrderSuccess && (
        <Header
          title={getHeaderTitle()}
          showBack={currentTab !== 'home' || selectedCategoryId !== null}
          onBack={handleBackNavigation}
          showSearch={currentTab === 'menu'}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAdmin={() => setCurrentTab('admin')}
          onOpenRewardWheel={() => setIsRewardWheelOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto">
        {isOrderSuccess ? (
          <OrderSuccessScreen
            onBackToMenu={() => {
              setIsOrderSuccess(false);
              setCurrentTab('menu');
            }}
            onOpenWhatsAppAlert={() => setIsWhatsAppNoticeOpen(true)}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomeScreen
                onGoToMenu={handleGoToMenu}
                onGoToCart={() => setCurrentTab('cart')}
                onOpenWhatsAppAlert={() => setIsWhatsAppNoticeOpen(true)}
                onOpenProductDetails={(prod) => setActiveModalProduct(prod)}
                onOpenCustomBuilder={() => setIsCustomBuilderOpen(true)}
                onOpenRewardWheel={() => setIsRewardWheelOpen(true)}
              />
            )}

            {currentTab === 'menu' && (
              <CategoryList
                categories={categories}
                products={products}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={(id) => {
                  setSelectedCategoryId(id);
                  setSearchQuery('');
                }}
                onOpenProductDetails={(prod) => setActiveModalProduct(prod)}
                searchQuery={searchQuery}
              />
            )}

            {currentTab === 'cart' && (
              <CartScreen
                onBackToMenu={() => setCurrentTab('menu')}
                onOrderSuccess={() => setIsOrderSuccess(true)}
                onOpenWhatsAppAlert={() => setIsWhatsAppNoticeOpen(true)}
                onOpenRewardWheel={() => setIsRewardWheelOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Live Social Proof Notification (Recent orders in Umuarama) */}
      {!isOrderSuccess && (
        <LiveSocialProof
          products={products}
          onSelectProduct={(prod) => setActiveModalProduct(prod)}
        />
      )}

      {/* Bottom Navigation Bar */}
      {!isOrderSuccess && (
        <BottomNavigation
          currentTab={currentTab as 'home' | 'menu' | 'cart' | 'bio'}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
          }}
        />
      )}

      {/* Product Detail Modal */}
      <ProductModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
        onAddToCart={(product, qty, variation, addons, notes) => {
          addItem(product, qty, variation, addons, notes);
        }}
      />

      {/* Interactive Custom Chawarma Builder Modal */}
      <CustomChawarmaBuilder
        isOpen={isCustomBuilderOpen}
        onClose={() => setIsCustomBuilderOpen(false)}
        onAddedToCart={() => {
          // Can navigate to cart or stay in place
        }}
      />

      {/* Reward Wheel Modal (Gire e Ganhe) */}
      <RewardWheelModal
        isOpen={isRewardWheelOpen}
        onClose={() => setIsRewardWheelOpen(false)}
        onCouponApplied={() => {
          // Handled inside modal and context
        }}
      />

      {/* WhatsApp Official Unset Notice Modal */}
      <WhatsAppNoticeModal
        isOpen={isWhatsAppNoticeOpen}
        onClose={() => setIsWhatsAppNoticeOpen(false)}
        onOpenAdmin={() => {
          setIsWhatsAppNoticeOpen(false);
          setCurrentTab('admin');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <MenuProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </MenuProvider>
  );
}

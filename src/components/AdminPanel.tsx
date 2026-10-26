import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Plus,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  Check,
  X,
  Camera,
  AlertTriangle,
  Phone,
  FileText,
  DollarSign,
  Layers,
  ArrowLeft,
  Star,
  Gift,
  Percent,
  AlertCircle,
} from 'lucide-react';
import { useMenu } from '../contexts/MenuContext';
import { Product, Category, ProductVariation, ProductAddon, WheelPrize } from '../types/menu';
import { DEFAULT_WHEEL_PRIZES } from '../data/initialMenu';
import { formatBRL } from '../lib/currency';

interface AdminPanelProps {
  onBackToMenu: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToMenu }) => {
  const {
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
  } = useMenu();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('chawarma_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'wheel' | 'settings' | 'audit'>('products');

  // Roleta de Descontos State
  const [wheelEnabled, setWheelEnabled] = useState<boolean>(settings.wheel_enabled ?? true);
  const [wheelPrizes, setWheelPrizes] = useState<WheelPrize[]>(() => {
    return settings.wheel_prizes && settings.wheel_prizes.length === 6
      ? settings.wheel_prizes
      : DEFAULT_WHEEL_PRIZES;
  });
  const [wheelSavedToast, setWheelSavedToast] = useState(false);

  // Search filter inside admin
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [filterStoriesOnly, setFilterStoriesOnly] = useState(false);

  // Product Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState('');

  // Form fields for editing/creating product
  const [formName, setFormName] = useState('');
  const [formCatId, setFormCatId] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formDesc, setFormDesc] = useState('');
  const [formImg, setFormImg] = useState('');
  const [formVideo, setFormVideo] = useState('');
  const [formIsStory, setFormIsStory] = useState(false);
  const [formStoryBadge, setFormStoryBadge] = useState('🔥 Feito na Hora');
  const [formStoryTagline, setFormStoryTagline] = useState('');
  const [formNeedsPhoto, setFormNeedsPhoto] = useState(false);
  const [formHasVariations, setFormHasVariations] = useState(false);
  const [formVariations, setFormVariations] = useState<ProductVariation[]>([]);
  const [formAddons, setFormAddons] = useState<ProductAddon[]>([]);

  // Settings form state
  const [settingsPhone, setSettingsPhone] = useState(settings.official_whatsapp);
  const [settingsAddress, setSettingsAddress] = useState(settings.address);
  const [settingsHours, setSettingsHours] = useState(settings.opening_hours);
  const [settingsInstagram, setSettingsInstagram] = useState(settings.instagram);
  const [settingsPin, setSettingsPin] = useState(settings.admin_pin);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // New Category form
  const [newCatName, setNewCatName] = useState('');

  // Handle PIN Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.admin_pin || pinInput === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('chawarma_admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('chawarma_admin_auth');
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsCreatingProduct(false);
    setProductFormError('');
    setFormName(prod.name);
    setFormCatId(prod.category_id);
    setFormPrice(prod.price_cents / 100);
    setFormDesc(prod.description);
    setFormImg(prod.image_url);
    setFormVideo(prod.video_url || '');
    setFormIsStory(Boolean(prod.is_story));
    setFormStoryBadge(prod.story_badge || '🔥 Feito na Hora');
    setFormStoryTagline(prod.story_tagline || '');
    setFormNeedsPhoto(Boolean(prod.needs_real_photo));
    setFormHasVariations(Boolean(prod.has_variations));
    setFormVariations(prod.variations || []);
    setFormAddons(prod.addons || []);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setIsCreatingProduct(true);
    setProductFormError('');
    setFormName('');
    setFormCatId(categories[0]?.id || '');
    setFormPrice(20);
    setFormDesc('');
    setFormImg('https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80');
    setFormVideo('');
    setFormIsStory(false);
    setFormStoryBadge('🔥 Feito na Hora');
    setFormStoryTagline('');
    setFormNeedsPhoto(true);
    setFormHasVariations(false);
    setFormVariations([]);
    setFormAddons([]);
  };

  const toggleStory = (prod: Product) => {
    updateProduct({
      ...prod,
      is_story: !prod.is_story,
      story_badge: prod.story_badge || '🔥 Feito na Hora',
    });
  };

  const saveProductModal = () => {
    // 1. Data Validation for Products
    if (!formName.trim()) {
      setProductFormError('O nome do produto é obrigatório.');
      return;
    }
    if (formName.trim().length < 2) {
      setProductFormError('O nome do produto deve ter no mínimo 2 caracteres.');
      return;
    }
    if (!formCatId) {
      setProductFormError('Selecione uma categoria para o produto.');
      return;
    }
    const numPrice = Number(formPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setProductFormError('O preço deve ser um valor numérico válido maior que R$ 0,00.');
      return;
    }
    if (formHasVariations) {
      if (formVariations.length === 0) {
        setProductFormError('Adicione ao menos uma variação ou desmarque a opção de variações.');
        return;
      }
      for (const v of formVariations) {
        if (!v.name.trim()) {
          setProductFormError('Todas as variações cadastradas devem possuir um nome.');
          return;
        }
        if (v.price_cents <= 0) {
          setProductFormError(`A variação "${v.name}" deve ter um preço maior que zero.`);
          return;
        }
      }
    }

    setProductFormError('');
    const cents = Math.round(numPrice * 100);

    if (isCreatingProduct) {
      addProduct({
        category_id: formCatId,
        name: formName.trim(),
        description: formDesc.trim(),
        price_cents: cents,
        image_url: formImg.trim() || 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80',
        video_url: formVideo.trim() || undefined,
        is_story: formIsStory,
        story_badge: formIsStory ? (formStoryBadge.trim() || '🔥 Feito na Hora') : undefined,
        story_tagline: formIsStory ? (formStoryTagline.trim() || undefined) : undefined,
        needs_real_photo: formNeedsPhoto,
        has_variations: formHasVariations,
        variations: formHasVariations ? formVariations : undefined,
        addons: formAddons.length > 0 ? formAddons : undefined,
        is_active: true,
        sort_order: products.length + 1,
      });
    } else if (editingProduct) {
      updateProduct({
        ...editingProduct,
        category_id: formCatId,
        name: formName.trim(),
        description: formDesc.trim(),
        price_cents: cents,
        image_url: formImg.trim(),
        video_url: formVideo.trim() || undefined,
        is_story: formIsStory,
        story_badge: formIsStory ? (formStoryBadge.trim() || '🔥 Feito na Hora') : undefined,
        story_tagline: formIsStory ? (formStoryTagline.trim() || undefined) : undefined,
        needs_real_photo: formNeedsPhoto,
        has_variations: formHasVariations,
        variations: formHasVariations ? formVariations : undefined,
        addons: formAddons.length > 0 ? formAddons : undefined,
      });
    }

    setEditingProduct(null);
    setIsCreatingProduct(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = settingsPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('Validação: O número do WhatsApp deve conter DDD e telefone válidos (mínimo 10 dígitos). Ex: 44999998888');
      return;
    }
    if (!settingsAddress.trim()) {
      alert('Validação: O endereço do restaurante é obrigatório.');
      return;
    }
    if (!settingsPin.trim() || settingsPin.trim().length < 4) {
      alert('Validação: O PIN de segurança deve possuir pelo menos 4 caracteres.');
      return;
    }

    updateSettings({
      official_whatsapp: settingsPhone.trim(),
      address: settingsAddress.trim(),
      opening_hours: settingsHours.trim(),
      instagram: settingsInstagram.trim(),
      admin_pin: settingsPin.trim() || '1234',
    });
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const updateWheelPrize = (index: number, updates: Partial<WheelPrize>) => {
    setWheelPrizes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleSaveWheel = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate each prize slice
    for (let i = 0; i < wheelPrizes.length; i++) {
      const p = wheelPrizes[i];
      if (!p.label.trim()) {
        alert(`Validação Roleta: A fatia #${i + 1} precisa ter um texto visível (ex: 5% OFF).`);
        return;
      }
      if (!p.code.trim()) {
        alert(`Validação Roleta: A fatia #${i + 1} precisa ter um código de cupom.`);
        return;
      }
      if (p.discount_value <= 0) {
        alert(`Validação Roleta: O desconto da fatia #${i + 1} deve ser maior que zero.`);
        return;
      }
      if (p.discount_type === 'percent' && p.discount_value > 100) {
        alert(`Validação Roleta: O percentual da fatia #${i + 1} não pode ultrapassar 100%.`);
        return;
      }
    }

    updateSettings({
      wheel_enabled: wheelEnabled,
      wheel_prizes: wheelPrizes,
    });
    setWheelSavedToast(true);
    setTimeout(() => setWheelSavedToast(false), 3000);
  };

  const handleResetDefaultWheel = () => {
    if (confirm('Deseja restaurar as 6 fatias de desconto originais da roleta (5% e 10% OFF)?')) {
      setWheelPrizes(DEFAULT_WHEEL_PRIZES);
      updateSettings({
        wheel_prizes: DEFAULT_WHEEL_PRIZES,
      });
      setWheelSavedToast(true);
      setTimeout(() => setWheelSavedToast(false), 3000);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      alert('Validação: Digite o nome da categoria que deseja adicionar.');
      return;
    }
    if (newCatName.trim().length < 2) {
      alert('Validação: O nome da categoria deve ter no mínimo 2 caracteres.');
      return;
    }

    addCategory({
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      icon: 'Utensils',
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      sort_order: categories.length + 1,
      is_active: true,
    });
    setNewCatName('');
  };

  // 1. PIN Login Screen for unauthorized users
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] max-w-sm mx-auto px-4 py-12 flex flex-col justify-center items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-chawarma-gold/15 border border-chawarma-gold/30 text-chawarma-gold flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Painel Administrativo</h2>
          <p className="text-xs text-gray-400">
            Digite o PIN de segurança para gerenciar produtos, preços e configurações.
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-3">
          <div>
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="PIN de Acesso (padrão: 1234)"
              className="w-full text-center text-lg tracking-widest bg-[#181822] text-white py-3 rounded-xl border border-chawarma-border focus:border-chawarma-gold outline-none transition font-mono"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-red-400 mt-1 font-medium">
                PIN incorreto. Tente novamente ou use o PIN padrão 1234.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-chawarma-gold text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition"
          >
            <Unlock className="w-4 h-4" />
            <span>Acessar Painel</span>
          </button>

          <button
            type="button"
            onClick={onBackToMenu}
            className="w-full py-2.5 text-xs text-gray-400 hover:text-white transition"
          >
            Voltar ao Cardápio
          </button>
        </form>
      </div>
    );
  }

  // Filter products for admin list
  const storiesCount = products.filter((p) => p.is_active && p.is_story).length;

  const filteredAdminProducts = products.filter((p) => {
    if (filterStoriesOnly && !p.is_story) return false;
    if (selectedCatFilter !== 'all' && p.category_id !== selectedCatFilter) return false;
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingPhotosCount = products.filter((p) => p.needs_real_photo).length;

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3 space-y-5">
      {/* Top Admin Header */}
      <div className="flex items-center justify-between border-b border-chawarma-border/40 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToMenu}
            className="p-1.5 -ml-1 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">
              Painel do Restaurante
            </h2>
            <p className="text-[10px] text-chawarma-gold">Sessão Autenticada</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-red-400 border border-gray-700 px-2.5 py-1 rounded-lg transition"
        >
          Sair
        </button>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-1.5 bg-[#14141c] p-1 rounded-xl border border-chawarma-border overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-bold text-center transition ${
            activeTab === 'products'
              ? 'bg-chawarma-gold text-black shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Produtos ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-bold text-center transition ${
            activeTab === 'categories'
              ? 'bg-chawarma-gold text-black shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Categorias ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('wheel')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-bold text-center transition ${
            activeTab === 'wheel'
              ? 'bg-chawarma-gold text-black shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Roleta 🎁
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-bold text-center transition ${
            activeTab === 'settings'
              ? 'bg-chawarma-gold text-black shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          WhatsApp & Dados
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-bold text-center transition ${
            activeTab === 'audit'
              ? 'bg-chawarma-gold text-black shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Auditoria {pendingPhotosCount > 0 && `(${pendingPhotosCount})`}
        </button>
      </div>

      {/* ================= TAB 1: GERENCIAR PRODUTOS ================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={openNewProduct}
              className="flex-1 py-2.5 px-3 bg-chawarma-gold hover:opacity-90 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-gold-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Produto</span>
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterStoriesOnly(false)}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  !filterStoriesOnly
                    ? 'bg-chawarma-gold/15 text-chawarma-gold border-chawarma-gold/40'
                    : 'bg-[#181822] text-gray-400 border-chawarma-border hover:text-white'
                }`}
              >
                <span>Todos ({products.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterStoriesOnly(true)}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  filterStoriesOnly
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                    : 'bg-[#181822] text-gray-400 border-chawarma-border hover:text-amber-300'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${filterStoriesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>Nos Stories ({storiesCount})</span>
              </button>
            </div>

            <input
              type="text"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              placeholder="Filtrar por nome do produto..."
              className="w-full bg-[#181822] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border border-chawarma-border focus:border-chawarma-gold outline-none"
            />

            <select
              value={selectedCatFilter}
              onChange={(e) => setSelectedCatFilter(e.target.value)}
              className="w-full bg-[#181822] text-xs text-gray-300 rounded-xl px-3 py-2 border border-chawarma-border focus:border-chawarma-gold outline-none"
            >
              <option value="all">Todas as categorias ({products.length} itens)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({products.filter((p) => p.category_id === c.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Products List */}
          <div className="space-y-2">
            {filteredAdminProducts.length === 0 && (
              <div className="p-8 text-center bg-[#16161c] rounded-2xl border border-chawarma-border space-y-2">
                <Star className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-xs text-gray-400">
                  {filterStoriesOnly
                    ? 'Nenhum produto marcado para os Stories no momento.'
                    : 'Nenhum produto encontrado com os filtros atuais.'}
                </p>
                {filterStoriesOnly && (
                  <p className="text-[11px] text-chawarma-gold">
                    Dica: Clique na estrelinha de qualquer produto abaixo para adicioná-lo aos Stories!
                  </p>
                )}
              </div>
            )}
            {filteredAdminProducts.map((p) => (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2.5 ${
                  p.is_active
                    ? 'bg-[#16161c] border-chawarma-border'
                    : 'bg-[#141418] border-red-900/30 opacity-60'
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  {p.is_story && (
                    <div className="absolute top-0.5 right-0.5 bg-amber-500 text-black p-0.5 rounded-full shadow">
                      <Star className="w-2.5 h-2.5 fill-black" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-xs text-white truncate max-w-[140px] sm:max-w-none">{p.name}</h4>
                    {p.is_story && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                        Story
                      </span>
                    )}
                    {!p.is_active && (
                      <span className="text-[9px] bg-red-900/60 text-red-300 px-1.5 py-0.2 rounded font-bold">
                        Pausado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-chawarma-gold font-mono font-bold">
                    {formatBRL(p.price_cents)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleStory(p)}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                      p.is_story
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-gray-500 hover:text-amber-300'
                    }`}
                    title={p.is_story ? 'Remover dos Stories do cardápio' : 'Colocar nos Stories do cardápio'}
                  >
                    <Star className={`w-3.5 h-3.5 ${p.is_story ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => toggleProductStatus(p.id)}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                      p.is_active
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                    title={p.is_active ? 'Produto Ativo (clique para pausar)' : 'Produto Pausado (clique para ativar)'}
                  >
                    {p.is_active ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => openEditProduct(p)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-chawarma-gold transition"
                    title="Editar produto"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja excluir "${p.name}"?`)) {
                        deleteProduct(p.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-900/40 text-gray-400 hover:text-red-400 transition"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: GERENCIAR CATEGORIAS ================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateCategory} className="p-3 bg-[#16161c] rounded-2xl border border-chawarma-border space-y-2">
            <h3 className="text-xs font-bold text-white">Criar Nova Categoria</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Sobremesas Árabes"
                className="flex-1 bg-[#181822] text-xs text-white rounded-xl px-3 py-2 border border-chawarma-border focus:border-chawarma-gold outline-none"
              />
              <button
                type="submit"
                className="py-2 px-4 bg-chawarma-gold text-black font-bold text-xs rounded-xl shadow-gold-sm"
              >
                Criar
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {categories.map((c) => {
              const count = products.filter((p) => p.category_id === c.id).length;
              return (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-[#16161c] border border-chawarma-border flex items-center justify-between gap-3"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0">
                    <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">{c.name}</h4>
                    <p className="text-[10px] text-gray-400">{count} produtos vinculados</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir a categoria "${c.name}"?`)) {
                        deleteCategory(c.id);
                      }
                    }}
                    className="text-gray-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB: CONFIGURAÇÕES DA ROLETA DE DESCONTOS ================= */}
      {activeTab === 'wheel' && (
        <form onSubmit={handleSaveWheel} className="space-y-4">
          {/* Header Card Roleta */}
          <div className="p-4 bg-gradient-to-br from-[#1c1810] to-[#14141e] rounded-2xl border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Roleta de Descontos
                  </h3>
                  <p className="text-[10px] text-gray-400">Cupons promocionais automáticos</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[11px] text-gray-300 font-medium">
                  {wheelEnabled ? 'Ativada' : 'Pausada'}
                </span>
                <input
                  type="checkbox"
                  checked={wheelEnabled}
                  onChange={(e) => setWheelEnabled(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                />
              </label>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed">
              Aqui você define os <strong>6 descontos</strong> da roleta que os clientes podem girar e ganhar no pedido.
              Todas as fatias concedem descontos financeiros no carrinho e <strong>não doam comida inteira de graça</strong>, garantindo sua margem de lucro.
            </p>
          </div>

          {/* Slices Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-chawarma-gold uppercase tracking-wider">
                6 Fatias da Roleta
              </h4>
              <button
                type="button"
                onClick={handleResetDefaultWheel}
                className="text-[10px] text-gray-400 hover:text-amber-400 flex items-center gap-1 transition underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Padrão</span>
              </button>
            </div>

            {wheelPrizes.map((prize, idx) => (
              <div
                key={prize.id || idx}
                className="p-3.5 bg-[#16161c] rounded-2xl border border-chawarma-border space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-chawarma-gold bg-black/40 px-2 py-0.5 rounded-lg border border-white/5">
                      Fatia #{idx + 1}
                    </span>
                    <span className="text-base">{prize.icon}</span>
                    <span className="text-xs font-bold text-white">{prize.label}</span>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-400">
                    <input
                      type="checkbox"
                      checked={prize.is_active}
                      onChange={(e) => updateWheelPrize(idx, { is_active: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Ativa</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">
                      Texto na Fatia (Curto):
                    </label>
                    <input
                      type="text"
                      value={prize.label}
                      onChange={(e) => updateWheelPrize(idx, { label: e.target.value })}
                      placeholder="Ex: R$ 5 OFF"
                      className="w-full bg-[#181822] text-xs text-white rounded-xl px-2.5 py-1.5 border border-chawarma-border focus:border-chawarma-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">
                      Código do Cupom:
                    </label>
                    <input
                      type="text"
                      value={prize.code}
                      onChange={(e) => updateWheelPrize(idx, { code: e.target.value.toUpperCase() })}
                      placeholder="Ex: CHAWARMA-5OFF"
                      className="w-full bg-[#181822] text-xs text-white rounded-xl px-2.5 py-1.5 border border-chawarma-border focus:border-chawarma-gold outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">
                      Tipo de Desconto:
                    </label>
                    <select
                      value={prize.discount_type}
                      onChange={(e) =>
                        updateWheelPrize(idx, {
                          discount_type: e.target.value as 'fixed' | 'percent',
                          discount_value: e.target.value === 'fixed' ? 500 : 5,
                        })
                      }
                      className="w-full bg-[#181822] text-xs text-white rounded-xl px-2 py-1.5 border border-chawarma-border focus:border-chawarma-gold outline-none"
                    >
                      <option value="fixed">R$ Fixo no Pedido</option>
                      <option value="percent">% Porcentagem</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">
                      {prize.discount_type === 'fixed' ? 'Valor (em R$):' : 'Porcentagem (%):'}
                    </label>
                    <input
                      type="number"
                      step={prize.discount_type === 'fixed' ? '0.50' : '1'}
                      min="1"
                      value={
                        prize.discount_type === 'fixed'
                          ? (prize.discount_value / 100).toFixed(2)
                          : prize.discount_value
                      }
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateWheelPrize(idx, {
                          discount_value:
                            prize.discount_type === 'fixed' ? Math.round(val * 100) : Math.round(val),
                        });
                      }}
                      className="w-full bg-[#181822] text-xs text-white rounded-xl px-2.5 py-1.5 border border-chawarma-border focus:border-chawarma-gold outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">
                    Título de Exibição do Desconto:
                  </label>
                  <input
                    type="text"
                    value={prize.title}
                    onChange={(e) => updateWheelPrize(idx, { title: e.target.value })}
                    placeholder="Ex: R$ 5,00 de Desconto no Pedido"
                    className="w-full bg-[#181822] text-xs text-white rounded-xl px-2.5 py-1.5 border border-chawarma-border focus:border-chawarma-gold outline-none"
                  />
                </div>

                {/* Ícones Rápidos */}
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">
                    Ícone da Fatia:
                  </label>
                  <div className="flex gap-1.5">
                    {['🏷️', '⭐', '🔥', '✨', '🎁', '🎉', '💰', '🌯'].map((ico) => (
                      <button
                        key={ico}
                        type="button"
                        onClick={() => updateWheelPrize(idx, { icon: ico })}
                        className={`text-sm p-1.5 rounded-lg border transition ${
                          prize.icon === ico
                            ? 'bg-amber-500/20 border-chawarma-gold scale-110'
                            : 'bg-black/30 border-white/5 hover:border-white/20'
                        }`}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-chawarma-gold text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-gold-sm transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações da Roleta</span>
          </button>

          {wheelSavedToast && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-bold rounded-xl text-center">
              ✓ Descontos da roleta salvos com sucesso!
            </div>
          )}
        </form>
      )}

      {/* ================= TAB 3: CONFIGURAÇÕES E WHATSAPP ================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="p-4 bg-[#16161c] rounded-2xl border border-chawarma-border space-y-3">
            <div className="flex items-center gap-2 text-chawarma-gold">
              <Phone className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                WhatsApp Oficial do Estabelecimento
              </h3>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Informe o número oficial (com DDD) onde os pedidos dos clientes serão recebidos.
            </p>

            <div>
              <label className="text-[11px] text-gray-300 block mb-1">
                Número do WhatsApp (apenas números):
              </label>
              <input
                type="text"
                value={settingsPhone}
                onChange={(e) => setSettingsPhone(e.target.value)}
                placeholder="Ex: 44999998888"
                className="w-full bg-[#181822] text-xs text-white rounded-xl px-3 py-2.5 border border-chawarma-border focus:border-chawarma-gold outline-none font-mono"
              />
            </div>
          </div>

          <div className="p-4 bg-[#16161c] rounded-2xl border border-chawarma-border space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Informações do Restaurante
            </h3>

            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 block">Endereço:</label>
              <input
                type="text"
                value={settingsAddress}
                onChange={(e) => setSettingsAddress(e.target.value)}
                placeholder="Ex: Av. Paraná, 1234 - Centro, Umuarama - PR"
                className="w-full bg-[#181822] text-xs text-white rounded-xl px-3 py-2 border border-chawarma-border outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 block">Horário de Atendimento:</label>
              <input
                type="text"
                value={settingsHours}
                onChange={(e) => setSettingsHours(e.target.value)}
                placeholder="Ex: Terça a Domingo, das 18h às 23h30"
                className="w-full bg-[#181822] text-xs text-white rounded-xl px-3 py-2 border border-chawarma-border outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 block">Instagram Oficial:</label>
              <input
                type="text"
                value={settingsInstagram}
                onChange={(e) => setSettingsInstagram(e.target.value)}
                placeholder="Ex: @casadachawarmaumuarama"
                className="w-full bg-[#181822] text-xs text-white rounded-xl px-3 py-2 border border-chawarma-border outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 block">PIN de Segurança do Admin:</label>
              <input
                type="text"
                value={settingsPin}
                onChange={(e) => setSettingsPin(e.target.value)}
                placeholder="1234"
                className="w-full bg-[#181822] text-xs text-white rounded-xl px-3 py-2 border border-chawarma-border outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-chawarma-gold text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-gold-sm transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>

          {settingsSavedToast && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-bold rounded-xl text-center">
              ✓ Configurações atualizadas com sucesso!
            </div>
          )}
        </form>
      )}

      {/* ================= TAB 4: AUDITORIA E RELATÓRIO DO CARDÁPIO ================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#16161c] rounded-2xl border border-chawarma-border space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Resumo do Cardápio Cadastrado
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                <span className="text-gray-400 block">Total de Produtos:</span>
                <span className="text-base font-extrabold text-chawarma-gold">{products.length}</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                <span className="text-gray-400 block">Total de Categorias:</span>
                <span className="text-base font-extrabold text-chawarma-gold">{categories.length}</span>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-bold text-gray-300 block">Produtos por Categoria:</span>
              {categories.map((c) => {
                const count = products.filter((p) => p.category_id === c.id).length;
                return (
                  <div key={c.id} className="flex justify-between text-[11px] text-gray-400 py-0.5 border-b border-white/5">
                    <span>{c.name}</span>
                    <span className="font-bold text-white">{count} itens</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Photos List */}
          <div className="p-4 bg-[#16161c] rounded-2xl border border-chawarma-border space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Camera className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Produtos que Precisam de Fotos Reais ({pendingPhotosCount})
              </h3>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Estes produtos estão utilizando imagens ilustrativas de referência gastronômica e aguardam fotografia original enviada pelo estabelecimento:
            </p>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {products
                .filter((p) => p.needs_real_photo)
                .map((p) => (
                  <div
                    key={p.id}
                    className="p-2 bg-black/30 rounded-lg text-xs text-gray-300 flex items-center justify-between"
                  >
                    <span className="truncate">{p.name}</span>
                    <button
                      onClick={() => openEditProduct(p)}
                      className="text-[10px] text-chawarma-gold underline flex-shrink-0 ml-2"
                    >
                      Inserir Foto
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Reset to Original PDF Button */}
          <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase">Restaurar Original do PDF</h4>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Caso deseje desfazer qualquer modificação acidental, este botão restaura com 1 clique todas as categorias, ingredientes, preços e produtos originais extraídos do PDF da Casa da Chawarma.
            </p>
            <button
              onClick={() => {
                if (
                  confirm(
                    'ATENÇÃO: Deseja restaurar o cardápio exatamente ao estado original do PDF? Quaisquer itens customizados serão resetados.'
                  )
                ) {
                  resetToOriginalMenu();
                  alert('Cardápio restaurado com sucesso para a versão oficial do PDF!');
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-bold flex items-center justify-center gap-2 transition w-full"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Cardápio Oficial do PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL DE EDIÇÃO / CADASTRO DE PRODUTO ================= */}
      {(editingProduct || isCreatingProduct) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#16161f] border border-chawarma-border rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-chawarma-border flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {isCreatingProduct ? 'Cadastrar Novo Produto' : `Editar: ${editingProduct?.name}`}
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsCreatingProduct(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {productFormError && (
                <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{productFormError}</span>
                </div>
              )}
              <div>
                <label className="text-gray-400 block mb-1">Nome do Produto:</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#1c1c27] text-white px-3 py-2 rounded-xl border border-chawarma-border outline-none focus:border-chawarma-gold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Categoria:</label>
                <select
                  value={formCatId}
                  onChange={(e) => setFormCatId(e.target.value)}
                  className="w-full bg-[#1c1c27] text-white px-3 py-2 rounded-xl border border-chawarma-border outline-none focus:border-chawarma-gold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Preço (R$):</label>
                <input
                  type="number"
                  step="0.50"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full bg-[#1c1c27] text-white px-3 py-2 rounded-xl border border-chawarma-border outline-none focus:border-chawarma-gold font-mono"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Descrição e Ingredientes:</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#1c1c27] text-white px-3 py-2 rounded-xl border border-chawarma-border outline-none focus:border-chawarma-gold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">URL da Imagem:</label>
                <input
                  type="text"
                  value={formImg}
                  onChange={(e) => setFormImg(e.target.value)}
                  className="w-full bg-[#1c1c27] text-white px-3 py-2 rounded-xl border border-chawarma-border outline-none focus:border-chawarma-gold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Vídeo do Produto (MP4 / Reels):</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={formVideo}
                    onChange={(e) => setFormVideo(e.target.value)}
                    placeholder="URL direta (ex: /videos/meu-video.mp4 ou link)"
                    className="w-full bg-[#1c1c27] text-white px-3 py-2 rounded-xl border border-chawarma-border outline-none focus:border-chawarma-gold"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer py-1.5 px-3 bg-[#222230] hover:bg-[#2a2a3a] border border-chawarma-border rounded-lg text-[11px] text-chawarma-gold font-bold inline-flex items-center gap-1.5 transition">
                      <span>📁 Enviar Vídeo do Celular/PC</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const localUrl = URL.createObjectURL(file);
                            setFormVideo(localUrl);
                            alert(`Vídeo "${file.name}" selecionado com sucesso! Clique em "Salvar Produto" para aplicar.`);
                          }
                        }}
                      />
                    </label>
                    {formVideo && (
                      <span className="text-[10px] text-emerald-400 font-medium">✓ Vídeo anexado</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="needsPhotoCheck"
                  checked={formNeedsPhoto}
                  onChange={(e) => setFormNeedsPhoto(e.target.checked)}
                  className="rounded text-chawarma-gold focus:ring-chawarma-gold"
                />
                <label htmlFor="needsPhotoCheck" className="text-gray-300">
                  Marcar como "Aguardando fotografia real"
                </label>
              </div>

              {/* Story Configuration Section */}
              <div className="p-3.5 bg-gradient-to-br from-[#1c1912] to-[#14141e] rounded-2xl border border-amber-500/40 space-y-2.5 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                      <Star className="w-4 h-4 fill-amber-300" />
                    </div>
                    <div>
                      <label htmlFor="isStoryCheck" className="text-white font-bold text-xs cursor-pointer block">
                        Colocar nos Stories do Cardápio
                      </label>
                      <p className="text-[10px] text-gray-400">
                        Exibe no topo do cardápio em formato de Stories animados
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="isStoryCheck"
                    checked={formIsStory}
                    onChange={(e) => setFormIsStory(e.target.checked)}
                    className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                  />
                </div>

                {formIsStory && (
                  <div className="space-y-2.5 pt-2 border-t border-amber-500/20">
                    <div>
                      <label className="text-gray-300 text-[11px] block mb-1">
                        Selo / Badge do Story:
                      </label>
                      <input
                        type="text"
                        value={formStoryBadge}
                        onChange={(e) => setFormStoryBadge(e.target.value)}
                        placeholder="Ex: 🔥 Feito na Hora"
                        className="w-full bg-[#1c1c27] text-white px-3 py-2 rounded-xl border border-chawarma-border outline-none focus:border-chawarma-gold text-xs"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['🔥 Feito na Hora', '🧀 Queijo Puxando', '🍔 Na Chapa Quente', '⭐ Mais Pedido', '❄️ Trincando', '🌯 Especial da Casa'].map((badge) => (
                          <button
                            key={badge}
                            type="button"
                            onClick={() => setFormStoryBadge(badge)}
                            className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-white/10 transition"
                          >
                            {badge}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-300 text-[11px] block mb-1">
                        Frase de Destaque no Story (opcional):
                      </label>
                      <input
                        type="text"
                        value={formStoryTagline}
                        onChange={(e) => setFormStoryTagline(e.target.value)}
                        placeholder="Deixe em branco para usar a descrição original"
                        className="w-full bg-[#1c1c27] text-white px-3 py-2 rounded-xl border border-chawarma-border outline-none focus:border-chawarma-gold text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#101015] border-t border-chawarma-border flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsCreatingProduct(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveProductModal}
                className="flex-1 py-2.5 rounded-xl bg-chawarma-gold text-black font-extrabold text-xs shadow-gold-sm"
              >
                Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

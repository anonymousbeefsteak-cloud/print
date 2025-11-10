import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { MenuItem, MenuCategory, Addon, CartItem, OrderData, OptionsData, CustomerInfo, OrderType } from './types';
import { apiService } from './services/apiService';
import { MENU_DATA, ADDONS } from './constants';
import Menu from './components/Menu';
import ItemModal from './components/ItemModal';
import Cart, { CartPanel } from './components/Cart';
import OrderQueryModal from './components/OrderQueryModal';
import { AdminDashboard } from './components/AdminDashboard';
import WelcomeModal from './components/WelcomeModal';
import AIAssistantModal from './components/AIAssistantModal';
import { CartIcon, RefreshIcon, SearchIcon, SparklesIcon } from './components/icons';
import { PrintableOrder } from './components/PrintableOrder';

const App: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ item: MenuItem, category: MenuCategory } | null>(null);
    const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
    const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
    const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
    const [isEditingFromCart, setIsEditingFromCart] = useState(false);
    const [printContent, setPrintContent] = useState<React.ReactNode | null>(null);
    const [clearCartAfterPrint, setClearCartAfterPrint] = useState<boolean>(false);
    const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [menuData, setMenuData] = useState<MenuCategory[]>([]);
    const [addons, setAddons] = useState<Addon[]>([]);
    const [options, setOptions] = useState<OptionsData>({ sauces: [], dessertsA: [], dessertsB: [], pastasA: [], pastasB: [], coldNoodles: [] });
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    
    // Lifted state from Cart component
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '', tableNumber: '' });
    const [orderType, setOrderType] = useState<OrderType>('內用');
    const [validationError, setValidationError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setNotification(null);
        const { menu, addons, options: apiOptions, from } = await apiService.getMenuAndAddons();

        if (from === 'api' && (!menu || menu.length === 0 || menu.every(cat => cat.items.length === 0))) {
            setMenuData(MENU_DATA);
            setAddons(ADDONS);
            setNotification('成功連接伺服器，但菜單是空的。請檢查後台 Google Sheet 是否已填入資料，或執行「一鍵設定工作表」。');
        } else {
            setMenuData(menu);
            setAddons(addons);
        }

        setOptions(apiOptions);

        if (from === 'fallback') {
            setNotification('無法連接伺服器，目前顯示的是離線菜單。');
        }
    }, []);
    
    useEffect(() => {
        if (printContent) {
            const handleAfterPrint = () => {
                setPrintContent(null);
                 if (clearCartAfterPrint) {
                    window.location.reload();
                }
            };

            window.addEventListener('afterprint', handleAfterPrint, { once: true });
            
            const timer = setTimeout(() => {
                window.print();
            }, 100); 

            return () => {
                clearTimeout(timer);
                window.removeEventListener('afterprint', handleAfterPrint);
            };
        }
    }, [printContent, clearCartAfterPrint]);

    const handlePrintRequest = (content: React.ReactNode, clearCart: boolean = false) => {
        setClearCartAfterPrint(clearCart);
        setPrintContent(content);
    };


    useEffect(() => {
        const initialLoad = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
            if (sessionStorage.getItem('welcomeAgreed') !== 'true') {
                setIsWelcomeModalOpen(true);
            }
        };
        initialLoad();
    }, [fetchData]);

    const handleWelcomeAgree = () => {
        sessionStorage.setItem('welcomeAgreed', 'true');
        setIsWelcomeModalOpen(false);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    };

    const handleSelectItem = (item: MenuItem, category: MenuCategory) => {
        if (!item.isAvailable) return;
        setSelectedItem({ item, category });
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
        setEditingCartItem(null);
        setIsEditingFromCart(false); 
    };
    
    const handleEditItem = (cartId: string) => {
        const itemToEdit = cart.find(i => i.cartId === cartId);
        if(itemToEdit) {
            const category = menuData.find(c => c.title === itemToEdit.categoryTitle) || { title: itemToEdit.categoryTitle, items: [] };
            setIsEditingFromCart(true);
            setEditingCartItem(itemToEdit);
            setSelectedItem({ item: itemToEdit.item, category });
        }
    };

    const createCartItemObject = (item: MenuItem, quantity: number, options: any, category: MenuCategory): Omit<CartItem, 'cartId'> => {
        const { donenesses, drinks, addons, notes, sauces, desserts, pastas, singleChoiceAddon, multiChoice, componentChoices, sideChoices } = options;
        
        const generateStableObjectString = (obj: object) => {
            if (!obj || Object.keys(obj).length === 0) return '';
            return JSON.stringify(Object.fromEntries(Object.entries(obj).filter(([, val]) => val && Number(val) > 0).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))));
        };
        
        const singleChoicePrice = singleChoiceAddon && item.customizations.singleChoiceAddon ? item.customizations.singleChoiceAddon.price : 0;
        const totalAddonPrice = (addons || []).reduce((sum: number, addon: { price: number; quantity: number; }) => sum + (addon.price * addon.quantity), 0);
        const totalPrice = (item.price + singleChoicePrice) * quantity + totalAddonPrice;

        const cartKeyFields = {
            id: item.id,
            donenesses: generateStableObjectString(donenesses),
            drinks: generateStableObjectString(drinks),
            sideChoices: generateStableObjectString(sideChoices),
            multiChoice: generateStableObjectString(multiChoice),
            componentChoices: generateStableObjectString(componentChoices),
            notes: notes,
            addons: (addons || []).map((a: { id: string; quantity: any; }) => `${a.id}:${a.quantity}`).sort().join(','),
            sauces: (sauces || []).map((s: { name: string; quantity: any; }) => `${s.name}:${s.quantity}`).sort().join(','),
            desserts: (desserts || []).map((d: { name: string; quantity: any; }) => `${d.name}:${d.quantity}`).sort().join(','),
            pastas: (pastas || []).map((p: { name: string; quantity: any; }) => `${p.name}:${p.quantity}`).sort().join(','),
            singleChoiceAddon: singleChoiceAddon || 'none',
        };
        const cartKey = JSON.stringify(cartKeyFields);

        return {
            cartKey,
            item,
            quantity,
            categoryTitle: category.title,
            selectedDonenesses: donenesses,
            selectedDrinks: drinks,
            selectedSideChoices: sideChoices,
            selectedAddons: addons || [],
            selectedSauces: sauces || [],
            selectedDesserts: desserts || [],
            selectedPastas: pastas || [],
            selectedComponent: componentChoices,
            selectedNotes: notes,
            selectedSingleChoiceAddon: singleChoiceAddon,
            selectedMultiChoice: multiChoice,
            totalPrice,
        };
    };
    
    const handleConfirmSelection = (item: MenuItem, quantity: number, options: any, category: MenuCategory) => {
        const newOrUpdatedCartItem = createCartItemObject(item, quantity, options, category);

        if (editingCartItem && cart.some(i => i.cartId === editingCartItem.cartId)) {
            setCart(prevCart => prevCart.map(cartItem =>
                cartItem.cartId === editingCartItem.cartId
                    ? { ...newOrUpdatedCartItem, cartId: editingCartItem.cartId }
                    : cartItem
            ));
        } else {
            setCart(prevCart => {
                const existingItemIndex = prevCart.findIndex(cartItem => cartItem.cartKey === newOrUpdatedCartItem.cartKey);
                if (existingItemIndex > -1) {
                    const updatedCart = [...prevCart];
                    const existingItem = updatedCart[existingItemIndex];
                    const newQuantity = existingItem.quantity + quantity;

                    const singleChoicePrice = existingItem.selectedSingleChoiceAddon && item.customizations.singleChoiceAddon ? item.customizations.singleChoiceAddon.price : 0;
                    const totalAddonPrice = (existingItem.selectedAddons || []).reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
                    const newTotalPrice = (item.price + singleChoicePrice) * newQuantity + totalAddonPrice;

                    updatedCart[existingItemIndex] = { ...existingItem, quantity: newQuantity, totalPrice: newTotalPrice };
                    return updatedCart;
                } else {
                    const finalCartItem = { ...newOrUpdatedCartItem, cartId: `${newOrUpdatedCartItem.cartKey}-${Date.now()}` };
                    return [...prevCart, finalCartItem];
                }
            });
        }

        if (isEditingFromCart) {
            setIsCartOpen(true);
        }
    };
    
    const handleUpdateQuantity = (cartId: string, newQuantity: number) => {
        setCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => item.cartId !== cartId);
            }
            return prevCart.map(item => {
                if (item.cartId === cartId) {
                    const singleChoicePrice = item.selectedSingleChoiceAddon && item.item.customizations.singleChoiceAddon ? item.item.customizations.singleChoiceAddon.price : 0;
                    const totalAddonPrice = (item.selectedAddons || []).reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
                    const newTotalPrice = (item.item.price + singleChoicePrice) * newQuantity + totalAddonPrice;
                    return { ...item, quantity: newQuantity, totalPrice: newTotalPrice };
                }
                return item;
            });
        });
    };

    const handleRemoveFromCart = (cartId: string) => {
        setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
    };
    
    const cartItemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
    const cartTotalPrice = useMemo(() => cart.reduce((total, item) => total + item.totalPrice, 0), [cart]);

    const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
        if (validationError) setValidationError(null);

        if (field === 'phone') {
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue.length <= 10) {
                setCustomerInfo(prev => ({ ...prev, phone: numericValue }));
            }
        } else {
            setCustomerInfo(prev => ({ ...prev, [field]: value }));
        }
    };
    
    useEffect(() => {
        if (orderType === '外帶') setCustomerInfo(prev => ({ ...prev, tableNumber: '' }));
    }, [orderType]);

    const handleCheckout = () => {
        setValidationError(null);
        if (cart.length === 0) { setValidationError('您的購物車是空的'); return; }
        if (!customerInfo.name.trim()) { setValidationError('請填寫您的姓名'); return; }
        if (!customerInfo.phone.trim()) { setValidationError('請填寫您的電話'); return; }
        if (!/^[0-9]{10}$/.test(customerInfo.phone)) { setValidationError('請輸入有效的手機號碼（10位數字）'); return; }

        const orderData: OrderData = { items: cart, totalPrice: cartTotalPrice, customerInfo, orderType };
        handleSubmitAndPrint(orderData);
    };

    const handleSubmitAndPrint = async (orderData: OrderData) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setNotification(null);
        try {
            const result = await apiService.submitOrder(orderData);
            if (result.success && result.orderId) {
                handlePrintRequest(<PrintableOrder order={orderData} orderId={result.orderId} />, true);
            } else {
                setNotification(`訂單提交失敗: ${result.message || '未知錯誤'}`);
                setTimeout(() => setNotification(null), 5000);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '請檢查網路連線';
            setNotification(`訂單提交時發生錯誤: ${errorMessage}`);
            setTimeout(() => setNotification(null), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const cartPanelProps = {
        cartItems: cart,
        onUpdateQuantity: handleUpdateQuantity,
        onRemoveItem: handleRemoveFromCart,
        onEditItem: handleEditItem,
        customerInfo: customerInfo,
        onInfoChange: handleCustomerInfoChange,
        totalPrice: cartTotalPrice,
        handleCheckout: handleCheckout,
        isSubmitting: isSubmitting,
        orderType: orderType,
        setOrderType: setOrderType,
        validationError: validationError,
        setValidationError: setValidationError,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-700"></div>
                <p className="mt-4 text-slate-600 text-lg">正在載入菜單...</p>
            </div>
        );
    }

    return (
        <>
            {isWelcomeModalOpen && <WelcomeModal onAgree={handleWelcomeAgree} />}
            <div className="print-area">
              {printContent}
            </div>
            <div className="min-h-screen bg-slate-100 text-slate-800 no-print">
                 {notification && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-center" role="alert">
                        <p className="font-bold">{notification}</p>
                    </div>
                )}
                <header className="bg-white shadow-md sticky top-0 z-20">
                    <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-green-800 tracking-wider">無名牛排點餐系統</h1>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsAdminDashboardOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                                <span>管理後台</span>
                            </button>
                            <button onClick={() => setIsQueryModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                                <SearchIcon className="h-4 w-4"/>
                                <span>查詢訂單</span>
                            </button>
                            <button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium disabled:opacity-50">
                                <RefreshIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}/>
                                <span>{isRefreshing ? '刷新中' : '刷新'}</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto">
                    <div className="lg:flex lg:gap-x-8">
                        <main className="w-full lg:w-3/5 xl:w-2/3 lg:pr-4">
                             <Menu menuData={menuData} onSelectItem={handleSelectItem} />
                        </main>
                        
                        <aside className="hidden lg:block lg:w-2/5 xl:w-1/3">
                            <div className="sticky top-[88px] h-[calc(100vh-112px)]">
                               <div className="bg-white rounded-lg shadow-lg h-full border">
                                    <CartPanel {...cartPanelProps} showCloseButton={false} onClose={() => {}} />
                               </div>
                            </div>
                        </aside>
                    </div>
                </div>


                <footer className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
                    <div className="border-t border-slate-200 pt-8 space-y-2">
                        <p>＊店內最低消費為一份餐點</p>
                        <p>＊不收服務費，用完餐請回收餐具</p>
                        <p>＊用餐限九十分鐘請勿飲酒</p>
                        <p>＊餐點內容以現場出餐為準，餐點現點現做請耐心等候</p>
                    </div>
                </footer>

                <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="fixed bottom-24 right-6 lg:bottom-28 lg:right-10 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 h-16 w-16"
                    aria-label="開啟 AI 點餐小幫手"
                >
                    <SparklesIcon className="h-8 w-8" />
                </button>

                {cartItemCount > 0 && (
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="lg:hidden fixed bottom-6 right-6 flex items-center justify-center bg-green-700 text-white rounded-full shadow-lg hover:bg-green-800 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50 h-16 w-16"
                        aria-label={`查看購物車，共有 ${cartItemCount} 項商品`}
                    >
                        <CartIcon className="h-8 w-8" />
                        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold">{cartItemCount}</span>
                    </button>
                )}

                <div className="lg:hidden">
                    <Cart
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                        {...cartPanelProps}
                    />
                </div>

                {selectedItem && (
                    <ItemModal
                        selectedItem={selectedItem}
                        editingItem={editingCartItem}
                        addons={addons}
                        options={options}
                        onClose={handleCloseModal}
                        onConfirmSelection={handleConfirmSelection}
                    />
                )}
                
                <OrderQueryModal
                    isOpen={isQueryModalOpen}
                    onClose={() => setIsQueryModalOpen(false)}
                />
                
                <AdminDashboard 
                    isOpen={isAdminDashboardOpen}
                    onClose={() => setIsAdminDashboardOpen(false)}
                    onPrintRequest={handlePrintRequest}
                    onAvailabilityUpdate={fetchData}
                />
                
                <AIAssistantModal
                    isOpen={isAiModalOpen}
                    onClose={() => setIsAiModalOpen(false)}
                    menuData={menuData}
                    addons={addons}
                />
            </div>
        </>
    );
};

export default App;

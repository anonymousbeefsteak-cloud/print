

import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { CartItem, CustomerInfo, OrderData, OrderType, SelectedSauce } from '../types';
import { CloseIcon, CartIcon, MinusIcon, PlusIcon, TrashIcon, SparklesIcon } from './icons';
import { PrintableOrder } from './PrintableOrder';

interface CartMainViewProps {
    onClose: () => void;
    cartItems: CartItem[];
    onUpdateQuantity: (cartId: string, newQuantity: number) => void;
    onRemoveItem: (cartId: string) => void;
    onEditItem: (cartId: string) => void;
    customerInfo: CustomerInfo;
    onInfoChange: (field: keyof CustomerInfo, value: string) => void;
    totalPrice: number;
    handleCheckout: () => void;
    isSubmitting: boolean;
    orderType: OrderType;
    setOrderType: (type: OrderType) => void;
    validationError: string | null;
    setValidationError: (error: string | null) => void;
    // AI Check props
    isChecking: boolean;
    isAiDisabled: boolean;
    aiSuggestion: string | null;
    handleAiCheck: () => void;
    setAiSuggestion: (suggestion: string | null) => void;
}

const CartMainView: React.FC<CartMainViewProps> = ({ onClose, cartItems, onUpdateQuantity, onRemoveItem, onEditItem, customerInfo, onInfoChange, totalPrice, handleCheckout, isSubmitting, orderType, setOrderType, validationError, setValidationError, isChecking, isAiDisabled, aiSuggestion, handleAiCheck, setAiSuggestion }) => {
    const aggregatedOptions = useMemo(() => {
        const drinks: { [key: string]: number } = {};
        const sauces: { [key: string]: number } = {};
        const desserts: { [key: string]: number } = {};
        const pastas: { [key: string]: number } = {};
        const components: { [key: string]: number } = {};
        const sideChoices: { [key: string]: number } = {};
        const addons: { [key: string]: { quantity: number; price: number; } } = {};
        cartItems.forEach(cartItem => {
            // FIX: Explicitly convert quantity to a number to prevent operating on 'unknown'.
            if (cartItem.selectedDrinks) Object.entries(cartItem.selectedDrinks).forEach(([name, quantity]) => drinks[name] = (drinks[name] || 0) + Number(quantity));
            if (cartItem.selectedSauces) (cartItem.selectedSauces as SelectedSauce[]).forEach(sauce => sauces[sauce.name] = (sauces[sauce.name] || 0) + sauce.quantity);
            if (cartItem.selectedDesserts) cartItem.selectedDesserts.forEach(dessert => desserts[dessert.name] = (desserts[dessert.name] || 0) + dessert.quantity);
            if (cartItem.selectedPastas) cartItem.selectedPastas.forEach(pasta => pastas[pasta.name] = (pastas[pasta.name] || 0) + pasta.quantity);
            // FIX: Explicitly convert quantity to a number to prevent operating on 'unknown'.
            if (cartItem.selectedComponent) Object.entries(cartItem.selectedComponent).forEach(([name, quantity]) => components[name] = (components[name] || 0) + Number(quantity));
            // FIX: Explicitly convert quantity to a number to prevent operating on 'unknown'.
            if (cartItem.selectedSideChoices) Object.entries(cartItem.selectedSideChoices).forEach(([name, quantity]) => sideChoices[name] = (sideChoices[name] || 0) + Number(quantity));
            if (cartItem.selectedAddons) cartItem.selectedAddons.forEach(addon => addons[addon.name] = { quantity: (addons[addon.name]?.quantity || 0) + addon.quantity, price: addon.price });
        });
        return { drinks, sauces, addons, desserts, pastas, components, sideChoices };
    }, [cartItems]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-5 border-b"><h2 className="text-2xl font-bold text-slate-800">我的購物車</h2><button onClick={onClose} className="text-slate-500 hover:text-slate-800"><CloseIcon /></button></div>
            {cartItems.length === 0 ? (<div className="flex-grow flex flex-col justify-center items-center text-slate-500 p-4"><CartIcon className="w-24 h-24 mb-4 text-slate-300"/><p className="text-lg">您的購物車是空的</p></div>) : (<>
                <div className="flex-grow overflow-y-auto">
                    <div className="p-5 space-y-6">
                        <div className="bg-slate-50 rounded-lg p-4"><h3 className="text-lg font-bold text-slate-700 mb-3 pb-2 border-b">餐點列表</h3><div className="space-y-4">{cartItems.map((item, index) => (<div key={item.cartId} className="flex items-start gap-3"><div className="pt-1 font-semibold text-slate-500">{index + 1}.</div><div className="flex-grow"><button onClick={() => onEditItem(item.cartId)} className="font-semibold text-left hover:text-blue-600 hover:underline transition-colors focus:outline-none">{item.item.name.replace(/半全餐|半套餐/g, '套餐')} <span className="font-normal text-slate-500">(${item.item.price}) x{item.quantity}</span></button><div className="text-sm text-slate-600 mt-1 space-y-0.5">{item.selectedDonenesses && Object.keys(item.selectedDonenesses).length > 0 && <p>熟度: {Object.entries(item.selectedDonenesses).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}{item.selectedComponent && Object.keys(item.selectedComponent).length > 0 && <p>炸物選擇: {Object.entries(item.selectedComponent).map(([c, q]) => `${c}x${q}`).join(', ')}</p>}{item.selectedSideChoices && Object.keys(item.selectedSideChoices).length > 0 && <p>簡餐附餐: {Object.entries(item.selectedSideChoices).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}{item.selectedMultiChoice && Object.keys(item.selectedMultiChoice).length > 0 && <p>口味: {Object.entries(item.selectedMultiChoice).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}{item.selectedSingleChoiceAddon && <p>單點加購: {item.selectedSingleChoiceAddon}</p>}{item.selectedAddons && item.selectedAddons.length > 0 && <p>加購: {item.selectedAddons.map(a => `${a.name} ($${a.price}) x${a.quantity}`).join(', ')}</p>}{item.selectedDesserts && item.selectedDesserts.length > 0 && <p>甜品: {item.selectedDesserts.map(d => `${d.name}x${d.quantity}`).join(', ')}</p>}{item.selectedPastas && item.selectedPastas.length > 0 && <p>義麵: {item.selectedPastas.map(p => `${p.name}x${p.quantity}`).join(', ')}</p>}{item.selectedNotes && <p className="text-blue-600">備註: {item.selectedNotes}</p>}</div></div><div className="text-right flex flex-col items-end"><p className="font-bold text-lg">${item.totalPrice}</p><div className="flex items-center gap-2 mt-3"><button onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)} className="p-1 rounded-full bg-slate-200 hover:bg-slate-300"><MinusIcon className="h-4 w-4" /></button><span className="font-semibold w-8 text-center">{item.quantity}</span><button onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)} className="p-1 rounded-full bg-slate-200 hover:bg-slate-300"><PlusIcon className="h-4 w-4" /></button><button onClick={() => onRemoveItem(item.cartId)} className="text-red-500 hover:text-red-700 ml-1"><TrashIcon className="h-5 w-5"/></button></div></div></div>))}</div></div>
                        <div className="bg-slate-100 rounded-lg p-4">
                            <h3 className="text-md font-bold text-slate-600 border-b pb-2 mb-3">訂單選項總覽</h3>
                            <dl className="text-sm text-slate-700 space-y-2">
                                {(Object.entries(aggregatedOptions) as [keyof typeof aggregatedOptions, any][]).map(([key, value]) => {
                                    if (!value || Object.keys(value).length === 0) return null;
                                    
                                    const titleMap: Record<keyof typeof aggregatedOptions, string> = {
                                        components: '炸物選擇',
                                        drinks: '飲料',
                                        sideChoices: '簡餐附餐',
                                        sauces: '沾醬',
                                        desserts: '甜品',
                                        pastas: '義麵',
                                        addons: '加購項目'
                                    };
                                    const title = titleMap[key];
                                    if (!title) return null;

                                    return (
                                        <div key={key}>
                                            <dt className="font-semibold text-slate-500">{title}</dt>
                                            <dd className="pl-2 mt-0.5 text-slate-800">
                                                {key === 'addons'
                                                    ? (
                                                        <ul className="list-disc list-inside">
                                                            {Object.entries(value as { [key: string]: { quantity: number, price: number } }).map(([name, addonData]) => (
                                                                <li key={name}>{name} ($${addonData.price}) x{addonData.quantity} (+${addonData.price * addonData.quantity})</li>
                                                            ))}
                                                        </ul>
                                                    )
                                                    : Object.entries(value).map(([name, q]) => `${name} x${q}`).join('、')
                                                }
                                            </dd>
                                        </div>
                                    );
                                })}
                            </dl>
                        </div>
                    </div>
                    <div className="p-5 border-t bg-slate-100">
                        <div className="mb-4"><h3 className="text-lg font-semibold mb-2 text-slate-700">用餐方式</h3><div className="flex w-full bg-slate-200 rounded-lg p-1"><button onClick={() => setOrderType('內用')} className={`flex-1 py-2 rounded-md font-semibold transition-colors ${orderType === '內用' ? 'bg-green-600 text-white shadow' : 'text-slate-600'}`}>內用</button><button onClick={() => setOrderType('外帶')} className={`flex-1 py-2 rounded-md font-semibold transition-colors ${orderType === '外帶' ? 'bg-green-600 text-white shadow' : 'text-slate-600'}`}>外帶</button></div></div>
                        <h3 className="text-lg font-semibold mb-3 text-slate-700">顧客資訊</h3>
                        <div className="space-y-3">
                            <input type="text" placeholder="姓名 *" value={customerInfo.name} onChange={(e) => onInfoChange('name', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md" required />
                            <input type="tel" placeholder="電話 * (10位數字)" value={customerInfo.phone} onChange={(e) => onInfoChange('phone', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md" pattern="[0-9]{10}" maxLength={10} required />
                            {orderType === '內用' && (<input type="text" placeholder="桌號 (可選)" value={customerInfo.tableNumber} onChange={(e) => onInfoChange('tableNumber', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md" />)}
                        </div>
                    </div>
                </div>
                <div className="p-5 border-t bg-slate-50">
                    <div className="flex justify-between items-center mb-4"><span className="text-xl font-medium">總計</span><span className="text-3xl font-bold text-green-700">${totalPrice}</span></div>
                    {aiSuggestion && (
                        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-3 mb-3 rounded-md text-left relative" role="alert">
                            <div className="flex gap-2">
                                <SparklesIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm pr-6">{aiSuggestion}</p>
                            </div>
                            <button onClick={() => setAiSuggestion(null)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-blue-500 hover:bg-blue-200 rounded-lg transition-colors" aria-label="關閉提示">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                    {validationError && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-3 rounded-md text-left relative" role="alert">
                            <p className="font-bold pr-8">{validationError}</p>
                            <button onClick={() => setValidationError(null)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-red-500 hover:bg-red-200 rounded-lg transition-colors" aria-label="關閉提示">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleAiCheck} disabled={isChecking || isSubmitting || isAiDisabled} className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-blue-700 transition-colors text-lg flex justify-center items-center disabled:bg-slate-400 disabled:cursor-not-allowed">
                             <SparklesIcon className="h-5 w-5 mr-2" />
                            {isChecking ? '檢查中...' : 'AI 訂單檢查'}
                        </button>
                        <button onClick={handleCheckout} disabled={isSubmitting || isChecking} className="w-full bg-green-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-green-700 transition-colors text-lg flex justify-center items-center disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {isSubmitting ? '處理中...' : '送出訂單'}
                        </button>
                    </div>
                </div>
            </>)}
        </div>
    );
};

interface CartProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onUpdateQuantity: (cartId: string, newQuantity: number) => void;
    onRemoveItem: (cartId: string) => void;
    onEditItem: (cartId: string) => void;
    onSubmitAndPrint: (orderData: OrderData) => void;
    isSubmitting: boolean;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onEditItem, onSubmitAndPrint, isSubmitting }) => {
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '', tableNumber: '' });
    const [orderType, setOrderType] = useState<OrderType>('內用');
    const [validationError, setValidationError] = useState<string | null>(null);

    // AI Check State
    const [isChecking, setIsChecking] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [isAiDisabled, setIsAiDisabled] = useState(false);

    useEffect(() => {
        if (isOpen && !process.env.API_KEY) {
            setIsAiDisabled(true);
        }
    }, [isOpen]);


    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setOrderType('內用');
                setValidationError(null);
                setAiSuggestion(null);
            }, 300);
        }
    }, [isOpen]);

    useEffect(() => {
        if (orderType === '外帶') setCustomerInfo(prev => ({ ...prev, tableNumber: '' }));
    }, [orderType]);

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

    const totalPrice = useMemo(() => cartItems.reduce((total, item) => total + item.totalPrice, 0), [cartItems]);
    
    const handleAiCheck = async () => {
        if (isChecking || isAiDisabled || cartItems.length === 0) return;
        setIsChecking(true);
        setAiSuggestion(null);
        setValidationError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const simplifiedCart = cartItems.map(item => {
                const options = [
                    item.selectedDonenesses && Object.keys(item.selectedDonenesses).length > 0 ? `熟度: ${Object.entries(item.selectedDonenesses).map(([d, q]) => `${d}x${q}`).join(',')}` : null,
                    item.selectedSauces && item.selectedSauces.length > 0 ? `醬料: ${item.selectedSauces.map(s => `${s.name}x${s.quantity}`).join(',')}` : null,
                    item.selectedDrinks && Object.keys(item.selectedDrinks).length > 0 ? `飲料: ${Object.entries(item.selectedDrinks).map(([d, q]) => `${d}x${q}`).join(',')}` : null,
                    item.selectedDesserts && item.selectedDesserts.length > 0 ? `甜品: ${item.selectedDesserts.map(d => `${d.name}x${d.quantity}`).join(',')}` : null,
                    item.selectedPastas && item.selectedPastas.length > 0 ? `義大利麵: ${item.selectedPastas.map(p => `${p.name}x${p.quantity}`).join(',')}` : null,
                    item.selectedComponent && Object.keys(item.selectedComponent).length > 0 ? `主餐附餐: ${Object.keys(item.selectedComponent).join(',')}` : null,
                    item.selectedSideChoices && Object.keys(item.selectedSideChoices).length > 0 ? `簡餐附餐: ${Object.keys(item.selectedSideChoices).join(',')}` : null,
                    item.selectedMultiChoice && Object.keys(item.selectedMultiChoice).length > 0 ? `口味: ${Object.keys(item.selectedMultiChoice).join(',')}` : null,
                    item.selectedAddons && item.selectedAddons.length > 0 ? `加購: ${item.selectedAddons.map(a => `${a.name}x${a.quantity}`).join(',')}` : null,
                    item.selectedNotes ? `備註: ${item.selectedNotes}`: null
                ].filter(Boolean);

                return {
                    餐點: item.item.name,
                    數量: item.quantity,
                    總價: item.totalPrice,
                    選項: options.join('; ')
                };
            });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `這是我的購物車內容：${JSON.stringify(simplifiedCart)}。總金額是 $${totalPrice}。請檢查我的訂單並提供一兩個有用的建議。`,
                config: {
                    systemInstruction: `你是一位專業且友善的「無名牛排」點餐小幫手。你的任務是分析顧客的購物車 JSON 資料，並根據常見搭配或可能的遺漏，提供簡短、友善且有幫助的建議，以提升顧客的用餐體驗。例如，如果顧客點了牛排但沒有選醬料，可以推薦醬料。如果點了套餐卻沒有選飲料，可以提醒他們。如果點了很多炸物，可以推薦飲料解膩。分析「選項」欄位來了解顧客的選擇。請保持建議的建設性與禮貌，不要強迫推銷。回答請使用繁體中文，並以「小提醒：」開頭。`,
                },
            });

            setAiSuggestion(response.text);

        } catch (error) {
            console.error("AI check failed:", error);
            setValidationError("AI 檢查時發生錯誤，請稍後再試。");
        } finally {
            setIsChecking(false);
        }
    };

    const handleCheckout = () => {
        setValidationError(null);
        setAiSuggestion(null);
        if (cartItems.length === 0) { setValidationError('您的購物車是空的'); return; }
        if (!customerInfo.name.trim()) { setValidationError('請填寫您的姓名'); return; }
        if (!customerInfo.phone.trim()) { setValidationError('請填寫您的電話'); return; }
        if (!/^[0-9]{10}$/.test(customerInfo.phone)) { setValidationError('請輸入有效的手機號碼（10位數字）'); return; }

        const orderData: OrderData = { items: cartItems, totalPrice, customerInfo, orderType };
        onSubmitAndPrint(orderData);
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <CartMainView 
                    onClose={onClose} 
                    cartItems={cartItems} 
                    onUpdateQuantity={onUpdateQuantity} 
                    onRemoveItem={onRemoveItem} 
                    onEditItem={onEditItem} 
                    customerInfo={customerInfo} 
                    onInfoChange={handleCustomerInfoChange} 
                    orderType={orderType} 
                    setOrderType={setOrderType} 
                    totalPrice={totalPrice} 
                    handleCheckout={handleCheckout} 
                    isSubmitting={isSubmitting}
                    validationError={validationError} 
                    setValidationError={setValidationError}
                    isChecking={isChecking}
                    isAiDisabled={isAiDisabled}
                    aiSuggestion={aiSuggestion}
                    handleAiCheck={handleAiCheck}
                    setAiSuggestion={setAiSuggestion}
                />
            </div>
        </>
    );
};

export default Cart;

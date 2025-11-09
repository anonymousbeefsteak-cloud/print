import React from 'react';
import type { Order, CartItem, OrderData, SelectedAddon, SelectedDessert, SelectedPasta, SelectedSauce } from '../types';

type PrintableOrderProps = {
    order: Order | OrderData | null;
    orderId?: string | null;
};

// Helper function to render a summary list for a given category of options
const renderSummaryList = (title: string, items: { [key: string]: number | { quantity: number; price?: number } }) => {
    const entries = Object.entries(items);
    if (entries.length === 0) return null;

    return (
        <div className="mt-2">
            <p className="font-semibold text-sm">{title}:</p>
            <p className="text-xs pl-2">
                {entries.map(([name, data]) => {
                    const quantity = typeof data === 'number' ? data : data.quantity;
                    return `${name} x${quantity}`;
                }).join(', ')}
            </p>
        </div>
    );
};


export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    if (!order) return null;

    // 1. Aggregate identical items (智慧合併)
    const groupedItems = new Map<string, { itemData: CartItem; quantity: number; totalPrice: number }>();
    for (const cartItem of order.items) {
        // cartKey is a pre-computed string based on item and its customizations
        const key = cartItem.cartKey; 
        if (groupedItems.has(key)) {
            const existing = groupedItems.get(key)!;
            existing.quantity += cartItem.quantity;
            existing.totalPrice += cartItem.totalPrice;
        } else {
            groupedItems.set(key, {
                itemData: cartItem,
                quantity: cartItem.quantity,
                totalPrice: cartItem.totalPrice
            });
        }
    }

    // 2. Aggregate all options for the summary list (選項總計清單)
    const optionAggregates = {
        doneness: {} as { [key: string]: number },
        sauces: {} as { [key: string]: number },
        drinks: {} as { [key: string]: number },
        desserts: {} as { [key: string]: number },
        pastas: {} as { [key: string]: number },
        components: {} as { [key: string]: number },
        sideChoices: {} as { [key: string]: number },
        multiChoice: {} as { [key:string]: number },
        addons: {} as { [key: string]: { quantity: number; price: number } }
    };

    for (const item of order.items) {
        if (item.selectedDonenesses) {
            for (const [level, count] of Object.entries(item.selectedDonenesses)) {
                optionAggregates.doneness[level] = (optionAggregates.doneness[level] || 0) + (count || 0);
            }
        }
        if (item.selectedSauces) {
            for (const sauce of item.selectedSauces as SelectedSauce[]) {
                optionAggregates.sauces[sauce.name] = (optionAggregates.sauces[sauce.name] || 0) + sauce.quantity;
            }
        }
        if (item.selectedDrinks) {
            for (const [drink, count] of Object.entries(item.selectedDrinks)) {
                optionAggregates.drinks[drink] = (optionAggregates.drinks[drink] || 0) + (count || 0);
            }
        }
        if (item.selectedDesserts) {
            for (const dessert of item.selectedDesserts as SelectedDessert[]) {
                optionAggregates.desserts[dessert.name] = (optionAggregates.desserts[dessert.name] || 0) + dessert.quantity;
            }
        }
        if (item.selectedPastas) {
            for (const pasta of item.selectedPastas as SelectedPasta[]) {
                optionAggregates.pastas[pasta.name] = (optionAggregates.pastas[pasta.name] || 0) + pasta.quantity;
            }
        }
        if (item.selectedComponent) {
            for (const [component, count] of Object.entries(item.selectedComponent)) {
                optionAggregates.components[component] = (optionAggregates.components[component] || 0) + (count || 0);
            }
        }
         if (item.selectedSideChoices) {
            for (const [choice, count] of Object.entries(item.selectedSideChoices)) {
                optionAggregates.sideChoices[choice] = (optionAggregates.sideChoices[choice] || 0) + (count || 0);
            }
        }
        if (item.selectedMultiChoice) {
            for (const [choice, count] of Object.entries(item.selectedMultiChoice)) {
                optionAggregates.multiChoice[choice] = (optionAggregates.multiChoice[choice] || 0) + (count || 0);
            }
        }
        if (item.selectedAddons) {
            for (const addon of item.selectedAddons as SelectedAddon[]) {
                const existing = optionAggregates.addons[addon.name] || { quantity: 0, price: addon.price };
                existing.quantity += addon.quantity;
                optionAggregates.addons[addon.name] = existing;
            }
        }
    }

    const finalOrderId = 'id' in order ? order.id : orderId;
    
    return (
        <div className="p-4 bg-white text-black font-sans text-base" style={{ width: '100%', fontFamily: 'sans-serif' }}>
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold">無名牛排 - 訂單明細</h2>
                <p className="text-sm">{new Date().toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                    <p><strong>顧客:</strong> {order.customerInfo.name}</p>
                    <p><strong>電話:</strong> {order.customerInfo.phone}</p>
                </div>
                <div className="text-right">
                    <p><strong>訂單號:</strong> ...{finalOrderId?.slice(-6)}</p>
                    <p><strong>類型:</strong> {order.orderType} {order.customerInfo.tableNumber && `(${order.customerInfo.tableNumber}桌)`}</p>
                </div>
            </div>

            <hr className="my-2 border-black border-dashed" />
            <h3 className="text-lg font-bold text-center my-2">餐點列表</h3>
            <hr className="my-2 border-black border-dashed" />
            
            <ul className="text-sm space-y-2">
                {Array.from(groupedItems.values()).map(({ itemData, quantity, totalPrice }, index) => (
                    <li key={index} className="flex justify-between items-start">
                        <div className="flex-grow">
                             <p className="font-bold">{itemData.item.name.replace(/半全餐|半套餐/g, '套餐')} x{quantity}</p>
                             <div className="text-xs pl-2 text-slate-600">
                                {itemData.selectedDonenesses && Object.keys(itemData.selectedDonenesses).length > 0 && <p>熟度: {Object.entries(itemData.selectedDonenesses).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
                                {itemData.selectedComponent && Object.keys(itemData.selectedComponent).length > 0 && <p>炸物: {Object.entries(itemData.selectedComponent).map(([c, q]) => `${c}x${q}`).join(', ')}</p>}
                                {itemData.selectedSideChoices && Object.keys(itemData.selectedSideChoices).length > 0 && <p>附餐: {Object.entries(itemData.selectedSideChoices).map(([c, q]) => `${c}x${q}`).join(', ')}</p>}
                                {itemData.selectedMultiChoice && Object.keys(itemData.selectedMultiChoice).length > 0 && <p>口味: {Object.entries(itemData.selectedMultiChoice).map(([c, q]) => `${c}x${q}`).join(', ')}</p>}
                                {itemData.selectedDrinks && Object.keys(itemData.selectedDrinks).length > 0 && <p>飲料: {Object.entries(itemData.selectedDrinks).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
                                {itemData.selectedSauces && itemData.selectedSauces.length > 0 && <p>醬料: {itemData.selectedSauces.map(s => `${s.name}x${s.quantity}`).join(', ')}</p>}
                                {itemData.selectedDesserts && itemData.selectedDesserts.length > 0 && <p>甜品: {itemData.selectedDesserts.map(d => `${d.name}x${d.quantity}`).join(', ')}</p>}
                                {itemData.selectedPastas && itemData.selectedPastas.length > 0 && <p>義麵: {itemData.selectedPastas.map(p => `${p.name}x${p.quantity}`).join(', ')}</p>}
                                {itemData.selectedSingleChoiceAddon && <p>單點: {itemData.selectedSingleChoiceAddon}</p>}
                                {itemData.selectedAddons && itemData.selectedAddons.length > 0 && <p>加購: {itemData.selectedAddons.map(a => `${a.name} x${a.quantity}`).join(', ')}</p>}
                                {itemData.selectedNotes && <p className="font-semibold">備註: {itemData.selectedNotes}</p>}
                            </div>
                        </div>
                        <p className="font-semibold pl-2">${totalPrice}</p>
                    </li>
                ))}
            </ul>
            
            <hr className="my-2 border-black border-dashed" />
            <h3 className="text-lg font-bold text-center my-2">選項總計清單</h3>
            <hr className="my-2 border-black border-dashed" />

            <div className="text-sm">
                {renderSummaryList('熟度總計', optionAggregates.doneness)}
                {renderSummaryList('炸物總計', optionAggregates.components)}
                {renderSummaryList('簡餐附餐總計', optionAggregates.sideChoices)}
                {renderSummaryList('涼麵口味總計', optionAggregates.multiChoice)}
                {renderSummaryList('醬料總計', optionAggregates.sauces)}
                {renderSummaryList('飲料總計', optionAggregates.drinks)}
                {renderSummaryList('甜品總計', optionAggregates.desserts)}
                {renderSummaryList('義麵總計', optionAggregates.pastas)}
                {renderSummaryList('加購總計', optionAggregates.addons)}
            </div>

            <hr className="my-3 border-black" />
            <div className="flex justify-end items-baseline">
                <p className="text-xl font-bold">總計: ${order.totalPrice}</p>
            </div>
            <div className="text-center mt-4 text-xs">
                <p>謝謝光臨！</p>
            </div>
        </div>
    );
};

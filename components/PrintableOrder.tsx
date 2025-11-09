import React from 'react';
import type { Order, CartItem, OrderData, SelectedAddon, SelectedDessert, SelectedPasta, SelectedSauce } from '../types';

type PrintableOrderProps = {
    order: Order | OrderData | null;
    orderId?: string | null;
};

// Helper to render a summary list, optimized for kitchen readability.
const renderSummaryList = (title: string, items: { [key: string]: number | { quantity: number; price?: number } }) => {
    const entries = Object.entries(items).filter(([, data]) => {
        const quantity = typeof data === 'number' ? data : data.quantity;
        return quantity > 0;
    });

    if (entries.length === 0) return null;

    const summaryString = entries
        .map(([name, data]) => {
            const quantity = typeof data === 'number' ? data : data.quantity;
            return `${name} x${quantity}`;
        })
        .join('、');

    return (
        <div className="mt-3">
            <p className="font-bold text-lg border-b border-black border-dashed pb-1 mb-1">{title}:</p>
            <p className="text-base leading-relaxed">{summaryString}</p>
        </div>
    );
};

export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    if (!order) return null;

    // 1. 智慧合併: Aggregate identical items based on a unique key representing the item and all its customizations.
    const groupedItems = new Map<string, { itemData: CartItem; quantity: number; totalPrice: number }>();
    for (const cartItem of order.items) {
        const key = cartItem.cartKey; // cartKey is a pre-computed string based on item and its customizations.
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

    // 2. 選項總計清單: Aggregate all options for the summary list.
    const optionAggregates = {
        doneness: {} as { [key: string]: number },
        sauces: {} as { [key: string]: number },
        drinks: {} as { [key: string]: number },
        desserts: {} as { [key: string]: number },
        pastas: {} as { [key: string]: number },
        components: {} as { [key: string]: number },
        sideChoices: {} as { [key: string]: number },
        multiChoice: {} as { [key: string]: number },
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

    // A helper to format details for an item, making it more compact.
    const formatItemDetails = (item: CartItem) => {
        const details = [];
        if (item.selectedDonenesses && Object.keys(item.selectedDonenesses).length > 0) details.push(`熟度: ${Object.entries(item.selectedDonenesses).map(([d, q]) => `${d}x${q}`).join(',')}`);
        if (item.selectedComponent && Object.keys(item.selectedComponent).length > 0) details.push(`炸物: ${Object.entries(item.selectedComponent).map(([c, q]) => `${c}x${q}`).join(',')}`);
        if (item.selectedSideChoices && Object.keys(item.selectedSideChoices).length > 0) details.push(`附餐: ${Object.entries(item.selectedSideChoices).map(([c, q]) => `${c}x${q}`).join(',')}`);
        if (item.selectedMultiChoice && Object.keys(item.selectedMultiChoice).length > 0) details.push(`口味: ${Object.entries(item.selectedMultiChoice).map(([c, q]) => `${c}x${q}`).join(',')}`);
        if (item.selectedDrinks && Object.keys(item.selectedDrinks).length > 0) details.push(`飲料: ${Object.entries(item.selectedDrinks).map(([d, q]) => `${d}x${q}`).join(',')}`);
        if (item.selectedSauces && item.selectedSauces.length > 0) details.push(`醬料: ${item.selectedSauces.map(s => `${s.name}x${s.quantity}`).join(',')}`);
        if (item.selectedDesserts && item.selectedDesserts.length > 0) details.push(`甜品: ${item.selectedDesserts.map(d => `${d.name}x${d.quantity}`).join(',')}`);
        if (item.selectedPastas && item.selectedPastas.length > 0) details.push(`義麵: ${item.selectedPastas.map(p => `${p.name}x${p.quantity}`).join(',')}`);
        if (item.selectedSingleChoiceAddon) details.push(`單點: ${item.selectedSingleChoiceAddon}`);
        if (item.selectedAddons && item.selectedAddons.length > 0) details.push(`加購: ${item.selectedAddons.map(a => `${a.name}x${a.quantity}`).join(',')}`);
        if (item.selectedNotes) details.push(`備註: ${item.selectedNotes}`);
        return details.join('; ');
    };

    return (
        <div className="p-4 bg-white text-black text-lg" style={{ width: '100%', fontFamily: '"KaiTi", "BiauKai", "DFKai-SB", serif' }}>
            <header className="text-center mb-4">
                <h1 className="text-3xl font-bold">廚房工單</h1>
                <p className="text-sm">{new Date().toLocaleString('zh-TW', { hour12: false })}</p>
            </header>

            <section className="text-lg mb-4 space-y-1">
                <div className="flex justify-between">
                    <p><strong>單號:</strong> <span className="font-mono">...{finalOrderId?.slice(-6)}</span></p>
                    <p className="font-bold text-xl">{order.orderType} {order.customerInfo.tableNumber && `(${order.customerInfo.tableNumber}桌)`}</p>
                </div>
                <div className="flex justify-between">
                    <p><strong>顧客:</strong> {order.customerInfo.name}</p>
                    <p><strong>總額:</strong> <span className="font-mono font-bold">${order.totalPrice}</span></p>
                </div>
            </section>

            <hr className="my-3 border-black border-dashed" />
            <h2 className="text-2xl font-bold text-center my-2">餐點列表</h2>
            <hr className="my-3 border-black border-dashed" />

            <div className="space-y-3">
                {Array.from(groupedItems.values()).map(({ itemData, quantity }, index) => (
                    <div key={index}>
                        <p className="text-xl font-bold">{itemData.item.name.replace(/半全餐|半套餐/g, '套餐')} x{quantity}</p>
                        <p className="text-base pl-4" style={{ color: '#333' }}>
                            {formatItemDetails(itemData)}
                        </p>
                    </div>
                ))}
            </div>

            <hr className="my-4 border-black border-dashed" />
            <h2 className="text-2xl font-bold text-center my-2">選項總計</h2>
            <hr className="my-4 border-black border-dashed" />

            <div className="space-y-1">
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
            
            <footer className="text-center mt-6">
                <p>--- 謝謝 ---</p>
            </footer>
        </div>
    );
};

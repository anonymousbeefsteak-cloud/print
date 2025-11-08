import React, { useMemo } from 'react';
import type { Order, OrderData, CartItem, SelectedSauce } from '../types';

type PrintableOrderProps = {
    order: Order | OrderData | null;
    orderId?: string | null;
};

export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    if (!order) {
        return null;
    }

    // Merge items with the same configuration to show a consolidated list
    const mergedItems = useMemo(() => {
        if (!order?.items) return [];

        const itemMap = new Map<string, CartItem>();
        order.items.forEach(cartItem => {
            const key = cartItem.cartKey;
            const existing = itemMap.get(key);
            
            if (existing) {
                const newQuantity = existing.quantity + cartItem.quantity;
                const singleChoicePrice = existing.selectedSingleChoiceAddon && existing.item.customizations.singleChoiceAddon ? existing.item.customizations.singleChoiceAddon.price : 0;
                const totalAddonPrice = (existing.selectedAddons || []).reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
                const newTotalPrice = (existing.item.price + singleChoicePrice) * newQuantity + totalAddonPrice;
                
                itemMap.set(key, { ...existing, quantity: newQuantity, totalPrice: newTotalPrice });
            } else {
                itemMap.set(key, { ...cartItem });
            }
        });
        return Array.from(itemMap.values());
    }, [order?.items]);

    // Calculate the total summary of all options across all items in the order
    const summary = useMemo(() => {
        if (!order?.items) return {};
        const donenesses: { [key: string]: number } = {};
        const sauces: { [key: string]: number } = {};
        const drinks: { [key: string]: number } = {};
        const desserts: { [key: string]: number } = {};
        const pastas: { [key: string]: number } = {};
        const components: { [key: string]: number } = {};
        const sideChoices: { [key: string]: number } = {};
        const addons: { [key: string]: number } = {};

        order.items.forEach(cartItem => {
            if (cartItem.selectedDonenesses) Object.entries(cartItem.selectedDonenesses).forEach(([name, quantity]) => donenesses[name] = (donenesses[name] || 0) + Number(quantity));
            if (cartItem.selectedDrinks) Object.entries(cartItem.selectedDrinks).forEach(([name, quantity]) => drinks[name] = (drinks[name] || 0) + Number(quantity));
            if (cartItem.selectedSauces) (cartItem.selectedSauces as SelectedSauce[]).forEach(sauce => sauces[sauce.name] = (sauces[sauce.name] || 0) + Number(sauce.quantity));
            if (cartItem.selectedDesserts) cartItem.selectedDesserts.forEach(dessert => desserts[dessert.name] = (desserts[dessert.name] || 0) + Number(dessert.quantity));
            if (cartItem.selectedPastas) cartItem.selectedPastas.forEach(pasta => pastas[pasta.name] = (pastas[pasta.name] || 0) + Number(pasta.quantity));
            if (cartItem.selectedComponent) Object.entries(cartItem.selectedComponent).forEach(([name, quantity]) => components[name] = (components[name] || 0) + Number(quantity));
            if (cartItem.selectedSideChoices) Object.entries(cartItem.selectedSideChoices).forEach(([name, quantity]) => sideChoices[name] = (sideChoices[name] || 0) + Number(quantity));
            if (cartItem.selectedAddons) cartItem.selectedAddons.forEach(addon => addons[addon.name] = (addons[addon.name] || 0) + Number(addon.quantity));
        });
        
        const result: { [key: string]: { [key: string]: number } } = { donenesses, components, drinks, sideChoices, sauces, desserts, pastas, addons };
        
        Object.keys(result).forEach(key => {
            if (Object.keys(result[key]).length === 0) {
                delete result[key];
            }
        });
        return result;
    }, [order?.items]);

    const summaryTitles: { [key: string]: string } = {
        donenesses: "熟度總計",
        components: "炸物總計",
        drinks: "飲料總計",
        sideChoices: "簡餐附餐總計",
        sauces: "醬料總計",
        desserts: "甜品總計",
        pastas: "義麵總計",
        addons: "加購總計",
    };
    
    // Defines the order in which summary sections will appear on the ticket
    const summaryOrder = ['donenesses', 'components', 'drinks', 'sideChoices', 'sauces', 'desserts', 'pastas', 'addons'];
    
    const finalOrderId = 'id' in order ? order.id : orderId;
    const separator = (text: string) => <p className="text-center font-bold my-2">- {text} -</p>;

    return (
        <div className="p-2 bg-white text-black" style={{ width: '280px', margin: '0 auto', fontFamily: 'monospace', fontSize: '20px', lineHeight: '1.5' }}>
            <div className="font-bold">
                {finalOrderId && <p>單號: {finalOrderId.slice(-6)} 餐點內容 -</p>}
                <p>餐點總計:${order.totalPrice}</p>
            </div>
            
            <hr className="border-black border-dashed my-2" />

            <div className="my-2 space-y-1">
                {mergedItems.map((item) => (
                    <div key={item.cartKey}>
                        <p>
                            {item.item.name.replace(/半全餐|半套餐/g, '套餐')} x{item.quantity} (${item.totalPrice})
                        </p>
                    </div>
                ))}
            </div>
            
            {Object.keys(summary).length > 0 && (
                <>
                    {separator("總計列表")}
                    <div className="my-2 space-y-2 font-semibold">
                        {summaryOrder.map(key => {
                             if (summary[key]) {
                                return (
                                    <div key={key}>
                                        <p>{summaryTitles[key]}:</p>
                                        {Object.entries(summary[key]).map(([name, quantity]) => (
                                            <p key={name} className="pl-2">- {name} x{quantity}</p>
                                        ))}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

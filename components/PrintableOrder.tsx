import React, { useMemo } from 'react';
import type { Order, CartItem, OrderData } from '../types';

type PrintableOrderProps = {
    order: Order | OrderData | null;
    orderId?: string | null;
};

const renderOrderItem = (item: CartItem) => (
    <li key={item.cartId} className="mb-2 text-left">
        <p className="font-semibold">{item.item.name} (${item.item.price}) x{item.quantity}</p>
        <div className="text-xs text-slate-500 pl-2 mt-1 space-y-0.5">
            {item.selectedDonenesses && Object.keys(item.selectedDonenesses).length > 0 && <p>熟度: {Object.entries(item.selectedDonenesses).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
            {item.selectedSideChoices && Object.keys(item.selectedSideChoices).length > 0 && <p>簡餐附餐: {Object.entries(item.selectedSideChoices).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
            {item.selectedMultiChoice && Object.keys(item.selectedMultiChoice).length > 0 && <p>口味: {Object.entries(item.selectedMultiChoice).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
            {item.selectedDrinks && Object.keys(item.selectedDrinks).length > 0 && <p>飲料: {Object.entries(item.selectedDrinks).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
            {item.selectedSauces && item.selectedSauces.length > 0 && <p>醬料: {item.selectedSauces.map(s => `${s.name}x${s.quantity}`).join(', ')}</p>}
            {item.selectedDesserts && item.selectedDesserts.length > 0 && <p>甜品: {item.selectedDesserts.map(d => `${d.name}x${d.quantity}`).join(', ')}</p>}
            {item.selectedPastas && item.selectedPastas.length > 0 && <p>義麵: {item.selectedPastas.map(p => `${p.name}x${p.quantity}`).join(', ')}</p>}
            {item.selectedSingleChoiceAddon && <p>單點加購: {item.selectedSingleChoiceAddon}</p>}
            {item.selectedAddons && item.selectedAddons.length > 0 && <p>其他加購: {item.selectedAddons.map(a => `${a.name} ($${a.price}) x${a.quantity}`).join(', ')}</p>}
            {item.selectedNotes && <p>備註: {item.selectedNotes}</p>}
        </div>
    </li>
);


export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    if (!order) {
        return null; // Safety check to prevent crashing if order data is missing.
    }
    
    const comboSummary = useMemo(() => {
        const summary = {
            mainCourses: 0,
            fries: 0,
            soups: 0,
            breads: 0,
            drinks: 0,
        };

        const comboItems = order.items.filter(
            item => item.categoryTitle === '套餐' || item.categoryTitle === '組合餐'
        );

        if (comboItems.length === 0) return null;

        comboItems.forEach(cartItem => {
            const desc = cartItem.item.description || '';
            const quantity = cartItem.quantity;
            const customs = cartItem.item.customizations;

            // Main courses
            summary.mainCourses += quantity;

            // Drinks are often a choice
            if (customs.drinkChoice) {
                const drinkCount = Object.values(cartItem.selectedDrinks || {}).reduce((a, b) => a + (b || 0), 0);
                summary.drinks += drinkCount;
            }

            // Handle items with explicit side choices
            if (customs.sideChoice) {
                const sideChoices = cartItem.selectedSideChoices || {};
                for (const [side, count] of Object.entries(sideChoices)) {
                    if (side.includes('日湯')) summary.soups += count;
                    if (side.includes('脆薯')) summary.fries += count;
                    if (side.includes('飲料')) summary.drinks += count; // Can also be a side choice
                }
            } else {
                // Handle standard combos with implicit sides from description
                if (desc.includes('日湯')) summary.soups += quantity;
                if (desc.includes('麵包')) summary.breads += quantity;
                if (desc.includes('脆薯')) summary.fries += quantity;
                // If drink is not a choice, it might be an implicit inclusion
                if (!customs.drinkChoice && desc.includes('飲料')) {
                     summary.drinks += quantity;
                }
            }
        });
        
        if (Object.values(summary).every(v => v === 0)) {
            return null;
        }

        return summary;
    }, [order]);
    
    const finalOrderId = 'id' in order ? order.id : orderId;
    
    return (
        <div className="p-4 bg-white">
            <h3 className="text-lg font-bold text-center mb-2">訂單摘要</h3>
            {finalOrderId && <p><strong>訂單號:</strong> {finalOrderId}</p>}
            <p><strong>顧客:</strong> {order.customerInfo.name} ({order.customerInfo.phone})</p>
            <p><strong>類型:</strong> {order.orderType} {order.customerInfo.tableNumber && `(${order.customerInfo.tableNumber}桌)`}</p>
            <hr className="my-2" />
            <ul className="text-sm">
                {order.items.map(renderOrderItem)}
            </ul>
            <hr className="my-2" />
            <p className="text-right font-bold text-lg">總計: ${order.totalPrice}</p>

            {comboSummary && (
                <>
                    <hr className="my-2 border-dashed" />
                    <h4 className="font-bold text-center mb-1">套餐附餐總覽</h4>
                    <ul className="text-sm">
                        {comboSummary.mainCourses > 0 && <li className="flex justify-between"><span>主餐:</span> <span>{comboSummary.mainCourses} 份</span></li>}
                        {comboSummary.soups > 0 && <li className="flex justify-between"><span>湯品:</span> <span>{comboSummary.soups} 份</span></li>}
                        {comboSummary.breads > 0 && <li className="flex justify-between"><span>麵包:</span> <span>{comboSummary.breads} 份</span></li>}
                        {comboSummary.fries > 0 && <li className="flex justify-between"><span>脆薯:</span> <span>{comboSummary.fries} 份</span></li>}
                        {comboSummary.drinks > 0 && <li className="flex justify-between"><span>飲料:</span> <span>{comboSummary.drinks} 份</span></li>}
                    </ul>
                </>
            )}
        </div>
    );
};

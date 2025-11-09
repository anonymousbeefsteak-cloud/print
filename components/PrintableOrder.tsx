import React from 'react';
import type { Order, CartItem, OrderData } from '../types';

type PrintableOrderProps = {
    order: Order | OrderData | null;
    orderId?: string | null;
};

// 收集所有項目並格式化為緊湊單行
const formatOrderToCompactLines = (order: Order | OrderData, orderId?: string | null) => {
    const finalOrderId = 'id' in order ? order.id : orderId;
    
    // 合併主餐
    const mainItemsMap = new Map();
    order.items.forEach(item => {
        const mainItemName = item.item.name.replace(/半全餐|半套餐/g, '套餐');
        if (mainItemsMap.has(mainItemName)) {
            const existing = mainItemsMap.get(mainItemName);
            existing.quantity += item.quantity;
            existing.totalPrice += parseFloat(item.totalPrice);
        } else {
            mainItemsMap.set(mainItemName, {
                name: mainItemName,
                quantity: item.quantity,
                totalPrice: parseFloat(item.totalPrice)
            });
        }
    });

    // 格式化主餐
    const mainItemsText = Array.from(mainItemsMap.values())
        .map(item => `${item.name} x${item.quantity}($${item.totalPrice})`)
        .join('');

    // 收集所有配料
    const allIngredients = [];
    
    order.items.forEach(item => {
        // 熟度
        if (item.selectedDonenesses) {
            Object.entries(item.selectedDonenesses).forEach(([name, quantity]) => {
                for (let i = 0; i < quantity; i++) {
                    allIngredients.push(`板腱${name}熟`);
                }
            });
        }

        // 炸物
        if (item.selectedComponent) {
            Object.entries(item.selectedComponent).forEach(([name, quantity]) => {
                for (let i = 0; i < quantity; i++) {
                    allIngredients.push(name);
                }
            });
        }

        // 飲料
        if (item.selectedDrinks) {
            Object.entries(item.selectedDrinks).forEach(([name, quantity]) => {
                for (let i = 0; i < quantity; i++) {
                    allIngredients.push(name);
                }
            });
        }

        // 醬料
        if (item.selectedSauces) {
            item.selectedSauces.forEach(sauce => {
                for (let i = 0; i < sauce.quantity; i++) {
                    allIngredients.push(sauce.name);
                }
            });
        }

        // 加購
        if (item.selectedAddons) {
            item.selectedAddons.forEach(addon => {
                for (let i = 0; i < addon.quantity; i++) {
                    const name = addon.weight ? `${addon.name} ${addon.weight}` : addon.name;
                    allIngredients.push(name);
                }
            });
        }
    });

    // 計算配料數量
    const ingredientCounts = new Map();
    allIngredients.forEach(ingredient => {
        ingredientCounts.set(ingredient, (ingredientCounts.get(ingredient) || 0) + 1);
    });

    // 格式化配料
    const ingredientsText = Array.from(ingredientCounts.entries())
        .map(([name, count]) => `-${name} x${count}`)
        .join('');

    return {
        line1: `單號:${finalOrderId}總計:$${order.totalPrice}`,
        line2: mainItemsText,
        line3: ingredientsText
    };
};

export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    if (!order) {
        return null;
    }
    
    const compactLines = formatOrderToCompactLines(order, orderId);
    
    return (
        <div style={{ 
            width: '72mm', // 熱感紙標準寬度
            margin: '0 auto', 
            lineHeight: '1.1',
            padding: '2mm',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            wordWrap: 'break-word',
            whiteSpace: 'pre-line'
        }}>
            {/* 第一行：單號和總計 */}
            <div style={{ marginBottom: '1mm' }}>
                {compactLines.line1}
            </div>

            {/* 第二行：主餐項目 */}
            <div style={{ marginBottom: '1mm' }}>
                {compactLines.line2}
            </div>

            {/* 第三行：所有配料 */}
            <div>
                {compactLines.line3}
            </div>
        </div>
    );
};

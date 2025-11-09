import React from 'react';
import type { Order, CartItem, OrderData } from '../types';

type PrintableOrderProps = {
    order: Order | OrderData | null;
    orderId?: string | null;
};

// 收集所有項目並按類別分組
const formatOrderByCategory = (order: Order | OrderData, orderId?: string | null) => {
    const finalOrderId = 'id' in order ? order.id : orderId;
    
    // 合併主餐
    const mainItemsMap = new Map();
    order.items.forEach(item => {
        const name = item.item.name.replace(/半全餐|半套餐/g, '套餐').replace(/組合餐/g, '組合餐');
        const key = name;
        if (mainItemsMap.has(key)) {
            const existing = mainItemsMap.get(key);
            existing.quantity += item.quantity;
            existing.totalPrice += parseFloat(item.totalPrice);
        } else {
            mainItemsMap.set(key, {
                name,
                quantity: item.quantity,
                totalPrice: parseFloat(item.totalPrice)
            });
        }
    });

    // 按類別收集配料
    const categories = {
        主餐: Array.from(mainItemsMap.values()).map(item => 
            `${item.name}x${item.quantity}$${item.totalPrice}`
        ),
        炸物: new Map(),
        飲料: new Map(),
        醬料: new Map(),
        加購: new Map(),
        熟度: new Map(),
        附餐: new Map()
    };

    order.items.forEach(item => {
        // 炸物
        if (item.selectedComponent) {
            Object.entries(item.selectedComponent).forEach(([name, quantity]) => {
                const current = categories.炸物.get(name) || 0;
                categories.炸物.set(name, current + quantity);
            });
        }

        // 飲料
        if (item.selectedDrinks) {
            Object.entries(item.selectedDrinks).forEach(([name, quantity]) => {
                const current = categories.飲料.get(name) || 0;
                categories.飲料.set(name, current + quantity);
            });
        }

        // 醬料
        if (item.selectedSauces) {
            item.selectedSauces.forEach(sauce => {
                const current = categories.醬料.get(sauce.name) || 0;
                categories.醬料.set(sauce.name, current + sauce.quantity);
            });
        }

        // 加購
        if (item.selectedAddons) {
            item.selectedAddons.forEach(addon => {
                const name = addon.weight ? `${addon.name}${addon.weight}` : addon.name;
                const current = categories.加購.get(name) || 0;
                categories.加購.set(name, current + addon.quantity);
            });
        }

        // 熟度
        if (item.selectedDonenesses) {
            Object.entries(item.selectedDonenesses).forEach(([name, quantity]) => {
                const current = categories.熟度.get(name) || 0;
                categories.熟度.set(name, current + quantity);
            });
        }

        // 單點加購
        if (item.selectedSingleChoiceAddon) {
            const current = categories.加購.get(item.selectedSingleChoiceAddon) || 0;
            categories.加購.set(item.selectedSingleChoiceAddon, current + item.quantity);
        }
    });

    // 格式化每個類別
    const formatCategory = (itemsMap: Map<string, number>, prefix: string = '') => {
        if (itemsMap.size === 0) return '';
        return Array.from(itemsMap.entries())
            .map(([name, count]) => `${prefix}${name}x${count}`)
            .join('.');
    };

    // 組合成單行文字
    const parts = [
        `單號:${finalOrderId}`,
        categories.主餐.join('.'),
        formatCategory(categories.炸物),
        formatCategory(categories.飲料),
        formatCategory(categories.醬料),
        formatCategory(categories.加購),
        formatCategory(categories.熟度),
        `總金額:$${order.totalPrice}`
    ].filter(part => part !== '');

    return parts.join('.');
};

export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    if (!order) {
        return null;
    }
    
    const compactText = formatOrderByCategory(order, orderId);
    
    return (
        <div className="bg-white text-black" style={{ 
            width: '350px', 
            margin: '0 auto', 
            lineHeight: '1.2',
            padding: '2px',
            fontSize: '18px'
        }}>
            {/* 標頭 - 緊湊 */}
            <div className="text-center" style={{ marginBottom: '2px' }}>
                <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold',
                    marginBottom: '1px'
                }}>
                    無名牛排
                </div>
                <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    marginBottom: '2px'
                }}>
                    廚房工作單
                </div>
            </div>

            {/* 單行訂單內容 - 無留白 */}
            <div style={{
                fontWeight: 'bold',
                lineHeight: '1.1',
                wordWrap: 'break-word',
                fontSize: '16px',
                padding: '0',
                margin: '0'
            }}>
                {compactText}
            </div>

            {/* 頁尾 - 緊湊 */}
            <div className="text-center" style={{ marginTop: '3px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    感謝您的訂購！
                </div>
            </div>
        </div>
    );
};

import React, { useMemo } from 'react';
import type { OrderData } from '../types';

interface PrintableOrderProps {
    order: OrderData;
    orderId?: string;
}

export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    // 合併相同項目
    const mergedItems = useMemo(() => {
        const merged: any = {};
        
        order.items.forEach(item => {
            const key = `${item.item.id}-${JSON.stringify(item.selectedDonenesses)}-${JSON.stringify(item.selectedAddons)}-${JSON.stringify(item.selectedSauces)}-${JSON.stringify(item.selectedDrinks)}`;
            
            if (!merged[key]) {
                merged[key] = { ...item };
            } else {
                merged[key].quantity += item.quantity;
                merged[key].totalPrice += item.totalPrice;
            }
        });
        
        return Object.values(merged);
    }, [order.items]);

    // 計算總計
    const summary = useMemo(() => {
        const result: any = {
            sauces: {},
            drinks: {},
            addons: {},
            desserts: {},
            pastas: {},
            doneness: {}
        };

        order.items.forEach(item => {
            // 醬料統計
            Object.entries(item.selectedSauces || {}).forEach(([sauce, quantity]) => {
                result.sauces[sauce] = (result.sauces[sauce] || 0) + quantity;
            });

            // 飲料統計
            Object.entries(item.selectedDrinks || {}).forEach(([drink, quantity]) => {
                result.drinks[drink] = (result.drinks[drink] || 0) + quantity;
            });

            // 加購統計
            (item.selectedAddons || []).forEach(addon => {
                result.addons[addon.name] = (result.addons[addon.name] || 0) + addon.quantity;
            });

            // 熟度統計
            Object.entries(item.selectedDonenesses || {}).forEach(([doneness, quantity]) => {
                result.doneness[doneness] = (result.doneness[doneness] || 0) + quantity;
            });
        });

        return result;
    }, [order.items]);

    // 格式化熟度顯示
    const formatDoneness = (donenesses: any) => {
        return Object.entries(donenesses || {})
            .filter(([, count]) => Number(count) > 0)
            .map(([name, count]) => `${name}分x${count}`)
            .join('. ');
    };

    // 格式化加購項目
    const formatAddons = (addons: any[]) => {
        return addons
            .filter(addon => addon.quantity > 0)
            .map(addon => `${addon.name} x${addon.quantity}`)
            .join(', ');
    };

    const displayOrderId = orderId ? orderId.slice(-6) : '------';

    return (
        <div className="p-4 text-sm font-mono">
            {/* 訂單頭部 */}
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold mb-2">無名牛排</h2>
                <div className="flex justify-between">
                    <span>訂單號: {displayOrderId}</span>
                    <span>類型: {order.orderType === 'dineIn' ? '內用' : '外帶'}</span>
                    <span>共計{order.total}</span>
                </div>
            </div>

            {/* 主餐項目 */}
            <div className="mb-4">
                {mergedItems.map((item, index) => (
                    <div key={index} className="mb-2">
                        <div className="flex justify-between">
                            <span>
                                {item.item.name}
                                {item.selectedAddons?.length > 0 && `($${item.item.price})`}
                                {!item.selectedAddons?.length && ` x ${item.quantity}`}
                                {item.selectedAddons?.length > 0 && ` x${item.quantity}($${item.totalPrice})`}
                            </span>
                        </div>
                        {item.selectedDonenesses && Object.keys(item.selectedDonenesses).length > 0 && (
                            <div className="text-xs text-gray-600 ml-4">
                                / {formatDoneness(item.selectedDonenesses)}
                            </div>
                        )}
                        {item.selectedAddons?.length > 0 && (
                            <div className="text-xs text-gray-600 ml-4">
                                {formatAddons(item.selectedAddons)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 醬料總計 */}
            {Object.keys(summary.sauces).length > 0 && (
                <div className="mb-2">
                    {Object.entries(summary.sauces)
                        .filter(([, count]) => Number(count) > 0)
                        .map(([sauce, count]) => `${sauce} x${count}`)
                        .join(', ')}
                </div>
            )}

            {/* 飲料總計 */}
            {Object.keys(summary.drinks).length > 0 && (
                <div className="mb-2">
                    {Object.entries(summary.drinks)
                        .filter(([, count]) => Number(count) > 0)
                        .map(([drink, count]) => `${drink} x${count}`)
                        .join(', ')}
                </div>
            )}

            {/* 加購總計 */}
            {Object.keys(summary.addons).length > 0 && (
                <div className="mb-2">
                    {Object.entries(summary.addons)
                        .filter(([, count]) => Number(count) > 0)
                        .map(([addon, count]) => `${addon} x${count}`)
                        .join(', ')}
                </div>
            )}

            <div className="border-t border-dashed border-gray-400 mt-4 pt-2 text-center">
                <div>謝謝光臨</div>
                <div>{new Date().toLocaleString('zh-TW')}</div>
            </div>
        </div>
    );
};

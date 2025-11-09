import React, { useMemo } from 'react';
import type { Order, CartItem, OrderData } from '../types';

type PrintableOrderProps = {
    order: Order | OrderData | null;
    orderId?: string | null;
};

export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    if (!order) {
        return null;
    }

    // Aggregates sauces, drinks, and addons from the entire order
    const aggregated = useMemo(() => {
        const sauces = new Map<string, number>();
        const drinks = new Map<string, number>();
        const addons = new Map<string, { quantity: number; price: number }>();

        const addToMap = (map: Map<string, number>, key: string, value: number) => {
            if (key && value > 0) map.set(key, (map.get(key) || 0) + value);
        };

        const addToAddonsMap = (name: string, quantity: number, price: number) => {
            if (name && quantity > 0) {
                const existing = addons.get(name);
                if (existing) {
                    existing.quantity += quantity;
                } else {
                    // Price is per-unit price
                    addons.set(name, { quantity, price });
                }
            }
        };

        for (const item of order.items) {
            if (item.selectedSauces) {
                item.selectedSauces.forEach(s => addToMap(sauces, s.name, s.quantity));
            }
            if (item.selectedDrinks) {
                Object.entries(item.selectedDrinks).forEach(([k, v]) => addToMap(drinks, k, Number(v) || 0));
            }
            if (item.selectedAddons) {
                item.selectedAddons.forEach(a => addToAddonsMap(a.name, a.quantity, a.price));
            }
        }

        const formatMap = (map: Map<string, number>) =>
            Array.from(map.entries()).map(([name, quantity]) => `${name} x${quantity}`).join(', ');

        const formatAddonsMap = (map: Map<string, { quantity: number; price: number }>) =>
            Array.from(map.entries()).map(([name, data]) => `${name} x${data.quantity}(${data.price * data.quantity})`).join(', ');

        return {
            sauces: formatMap(sauces),
            drinks: formatMap(drinks),
            addons: formatAddonsMap(addons),
        };
    }, [order.items]);

    // Generates the descriptive name for a cart item
    const getItemDisplayName = (item: CartItem): string => {
        let name = item.item.name.replace(/半全餐|半套餐/g, '套餐');

        if (item.selectedComponent && Object.keys(item.selectedComponent).length > 0) {
            const componentChoice = Object.keys(item.selectedComponent)[0];
            name = name.replace(/\(.*\)/, `+${componentChoice}`);
        }
        
        if (item.selectedPastas && item.selectedPastas.length > 0) {
            const pastaMain = item.selectedPastas.find(p => p.name.includes('天使義麵'));
            const pastaSauce = item.selectedPastas.find(p => p.name.includes('索士'));
            if (pastaMain && pastaSauce) {
                name = `(${pastaSauce.name.replace('索士','')})${pastaMain.name.replace('天使義麵','')}義麵`;
            }
        }
        
        if (item.selectedDesserts && item.selectedDesserts.length > 0) {
            name = item.selectedDesserts.map(d => d.name).join(' + ');
        }
        
        if (item.selectedMultiChoice && Object.keys(item.selectedMultiChoice).length > 0) {
            const flavor = Object.keys(item.selectedMultiChoice)[0];
             name = `(${flavor})${name}`;
        }

        return name;
    };

    // Formats the doneness string for an item
    const formatDoneness = (item: CartItem): string | null => {
        if (item.selectedDonenesses && Object.keys(item.selectedDonenesses).length > 0) {
            return Object.entries(item.selectedDonenesses)
                .map(([d, q]) => `${d.replace('分熟', '分')}x${q}`)
                .join('. ');
        }
        return null;
    };

    const finalOrderId = 'id' in order ? order.id : orderId;
    const orderTypeString = order.orderType;

    const mainMealLines = order.items.map(item => {
        const name = getItemDisplayName(item);
        const quantity = item.quantity;
        const lineTotalPrice = item.item.price * quantity;
        const doneness = formatDoneness(item);

        let mainPart;
        if (item.item.customizations.doneness) {
            mainPart = `${name} x ${quantity} ($${lineTotalPrice})`;
        } else {
            mainPart = `${name}(${item.item.price}) x${quantity}(${lineTotalPrice})`;
        }

        return (
            <p key={item.cartId} style={{ margin: 0, padding: '0.25mm 0' }}>
                {mainPart}
                {doneness && ` / ${doneness}`}
            </p>
        );
    });

    return (
        <div style={{ width: '58mm', padding: '1mm', backgroundColor: 'white', color: 'black', fontFamily: 'monospace', fontSize: '28px', lineHeight: 1.2 }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
                訂單號: {finalOrderId?.slice(-6) || 'xxx'} 類型: {orderTypeString} 共計 ${order.totalPrice}
            </p>
            
            <div>{mainMealLines}</div>

            {aggregated.sauces && <p style={{ margin: 0 }}>{aggregated.sauces}</p>}
            {aggregated.drinks && <p style={{ margin: 0 }}>{aggregated.drinks}</p>}
            {aggregated.addons && <p style={{ margin: 0 }}>{aggregated.addons}</p>}
        </div>
    );
};

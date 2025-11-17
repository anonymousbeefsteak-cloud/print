import React, { useMemo } from 'react';
import type { Order, CartItem, OrderData } from '../types';

type PrintableOrderProps = {
    order: Order | OrderData | null;
    orderId?: string | null;
};

interface AggregatedMeal {
    name: string;
    totalQuantity: number;
    donenesses: Map<string, number>;
}

export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    if (!order) {
        return null;
    }

    const aggregated = useMemo(() => {
        const sauces = new Map<string, number>();
        const drinks = new Map<string, number>();
        const addons = new Map<string, { quantity: number }>();
        const meals = new Map<string, AggregatedMeal>();

        const getItemDisplayName = (item: CartItem): string => {
            let name = item.item.itemShortName || item.item.name.replace(/半全餐|半套餐/g, '套餐');
    
            if (item.selectedComponent && Object.keys(item.selectedComponent).length > 0) {
                const componentChoiceKey = Object.keys(item.selectedComponent)[0];
                const shortComponentKey = componentChoiceKey.replace('脆皮炸雞', '雞').replace('炸魚','魚');
                if (name.includes('雞/魚')) {
                    name = name.replace('雞/魚', shortComponentKey);
                }
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
                 name = `(${flavor.replace('涼麵', '')})${name}`;
            }
    
            return name;
        };


        for (const item of order.items) {
            const key = getItemDisplayName(item);
            const existingMeal = meals.get(key);

            if (existingMeal) {
                existingMeal.totalQuantity += item.quantity;
                if (item.selectedDonenesses) {
                    for (const [level, count] of Object.entries(item.selectedDonenesses)) {
                        existingMeal.donenesses.set(level, (existingMeal.donenesses.get(level) || 0) + (Number(count) || 0));
                    }
                }
            } else {
                const donenessMap = new Map<string, number>();
                if (item.selectedDonenesses) {
                    for (const [level, count] of Object.entries(item.selectedDonenesses)) {
                        donenessMap.set(level, Number(count) || 0);
                    }
                }
                meals.set(key, {
                    name: key,
                    totalQuantity: item.quantity,
                    donenesses: donenessMap,
                });
            }

            // Aggregate other options
            if (item.selectedSauces) {
                item.selectedSauces.forEach(s => sauces.set(s.name, (sauces.get(s.name) || 0) + s.quantity));
            }
            if (item.selectedDrinks) {
                Object.entries(item.selectedDrinks).forEach(([k, v]) => drinks.set(k, (drinks.get(k) || 0) + Number(v)));
            }
            if (item.selectedAddons) {
                item.selectedAddons.forEach(a => {
                    const existing = addons.get(a.name);
                    if (existing) {
                        existing.quantity += a.quantity;
                    } else {
                        addons.set(a.name, { quantity: a.quantity });
                    }
                });
            }
        }

        const formatMap = (map: Map<string, number>) =>
            Array.from(map.entries()).map(([name, quantity]) => `${name} x${quantity}`).join(', ');

        const formatAddonsMap = (map: Map<string, { quantity: number }>) =>
            Array.from(map.entries()).map(([name, data]) => `${name.replace(/\s/g, '')} x${data.quantity}`).join(', ');

        return {
            sauces: formatMap(sauces),
            drinks: formatMap(drinks),
            addons: formatAddonsMap(addons),
            meals: Array.from(meals.values()),
        };
    }, [order.items]);

    const finalOrderId = 'id' in order ? order.id : orderId;
    const orderTypeDisplay = order.orderType === '內用' 
        ? `內用: ${order.customerInfo.tableNumber || '未指定'}`
        : '外帶';
    
    const pStyle: React.CSSProperties = { margin: 0, whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '28px', lineHeight: 1.2 };
    const headerStyle: React.CSSProperties = { textAlign: 'center', margin: '2px 0', padding: '2px 0', borderTop: '1px dashed black', fontSize: '28px', lineHeight: 1.2, fontWeight: 'bold' };

    const mainMealLines = aggregated.meals.map((meal, index) => {
        const donenessStr = Array.from(meal.donenesses.entries())
            .map(([level, count]) => `${level.replace('分熟', '分')}x${count}`)
            .join('. ');

        return (
            <p key={index} style={pStyle}>
                {`${meal.name} x ${meal.totalQuantity}`}
                {donenessStr && ` / ${donenessStr}`}
            </p>
        );
    });

    return (
        <div style={{ width: '58mm', padding: '0', backgroundColor: 'white', color: 'black', fontFamily: 'monospace' }}>
            <p style={{...pStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '32px', borderBottom: '1px dashed black', marginBottom: '4px'}}>{orderTypeDisplay}</p>
            <p style={pStyle}>
                {`訂單號: ${finalOrderId?.slice(-6) || 'xxx'}`}
            </p>
             <p style={pStyle}>
                {`時間: ${new Date('createdAt' in order ? order.createdAt : Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`}
            </p>
            
            {mainMealLines.length > 0 && (
                <>
                    <p style={headerStyle}>主餐</p>
                    {mainMealLines}
                </>
            )}
            
            {aggregated.addons && (
                <>
                    <p style={headerStyle}>加購</p>
                    <p style={pStyle}>{aggregated.addons}</p>
                </>
            )}

            {aggregated.sauces && (
                <>
                    <p style={headerStyle}>醬料</p>
                    <p style={pStyle}>{aggregated.sauces}</p>
                </>
            )}

            {aggregated.drinks && (
                <>
                    <p style={headerStyle}>飲料</p>
                    <p style={pStyle}>{aggregated.drinks}</p>
                </>
            )}
        </div>
    );
};

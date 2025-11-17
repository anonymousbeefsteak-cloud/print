import React, { useMemo } from 'react';
import type { Order, CartItem, OrderData } from '../types';

type PrintableOrderProps = {
    order: Order | OrderData | null;
    orderId?: string | null;
};

const getItemDisplayName = (item: CartItem): string => {
    let name = item.item.itemShortName || item.item.name.replace(/半全餐|半套餐/g, '套餐');

    if (item.selectedComponent && Object.keys(item.selectedComponent).length > 0) {
        const componentChoiceKey = Object.keys(item.selectedComponent)[0];
        const shortComponentKey = componentChoiceKey.replace('脆皮炸雞', '雞').replace('炸魚','魚');
        if (name.includes('雞/魚')) {
            name = name.replace('雞/魚', shortComponentKey);
        }
    }
    
    if (item.item.id.startsWith('dessert-choice')) {
        if (item.selectedDesserts && item.selectedDesserts.length > 0) {
            // Returns a descriptive name like "布蕾+鬆餅" instead of "任選甜品"
            return item.selectedDesserts.map(d => d.name).join(' + ');
        }
    }
    
    if (item.item.id.startsWith('pasta-choice')) {
        if (item.selectedPastas && item.selectedPastas.length > 0) {
            const pastaMain = item.selectedPastas.find(p => p.name.includes('天使義麵'));
            const pastaSauce = item.selectedPastas.find(p => p.name.includes('索士'));
            if (pastaMain && pastaSauce) {
                // Returns a name like "(青醬)日豬義麵"
                return `(${pastaSauce.name.replace('索士','')})${pastaMain.name.replace('天使義麵','')}義麵`;
            }
        }
    }
    
    if (item.item.id.startsWith('cold-noodle')) {
        if (item.selectedMultiChoice && Object.keys(item.selectedMultiChoice).length > 0) {
            const flavor = Object.keys(item.selectedMultiChoice)[0];
             // Returns a name like "(日式)涼麵"
             return `(${flavor.replace('涼麵', '')})${name}`;
        }
    }

    return name;
};

export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    if (!order) {
        return null;
    }

    // Aggregate sauces and drinks for a final summary, useful for drink/sauce stations
    const summary = useMemo(() => {
        const sauces = new Map<string, number>();
        const drinks = new Map<string, number>();

        for (const item of order.items) {
            if (item.selectedSauces) {
                item.selectedSauces.forEach(s => sauces.set(s.name, (sauces.get(s.name) || 0) + s.quantity));
            }
            if (item.selectedDrinks) {
                Object.entries(item.selectedDrinks).forEach(([k, v]) => drinks.set(k, (drinks.get(k) || 0) + Number(v)));
            }
        }

        const formatMap = (map: Map<string, number>) =>
            Array.from(map.entries()).map(([name, quantity]) => `${name}x${quantity}`).join('、');

        return {
            sauces: formatMap(sauces),
            drinks: formatMap(drinks),
        };
    }, [order.items]);

    const finalOrderId = 'id' in order ? order.id : orderId;
    const orderTypeDisplay = order.orderType === '內用' 
        ? `內用: ${order.customerInfo.tableNumber || '未指定'}`
        : '外帶';
    
    const pStyle: React.CSSProperties = { margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '28px', lineHeight: 1.2, fontFamily: 'monospace' };
    const subPStyle: React.CSSProperties = { ...pStyle, paddingLeft: '1em', fontSize: '24px' };
    const headerStyle: React.CSSProperties = { textAlign: 'center', margin: '4px 0', padding: '2px 0', borderTop: '1px dashed black', fontSize: '28px', lineHeight: 1.2, fontWeight: 'bold', fontFamily: 'monospace' };

    const mainMealLines = order.items.map((cartItem, index) => {
        const displayName = getItemDisplayName(cartItem);
        const details: string[] = [];

        if (cartItem.selectedDonenesses && Object.keys(cartItem.selectedDonenesses).length > 0) {
            details.push(Object.entries(cartItem.selectedDonenesses).map(([level, count]) => `${level.replace('分熟', '分')}x${count}`).join(' '));
        }
        if (cartItem.selectedSauces && cartItem.selectedSauces.length > 0) {
            details.push(`醬: ${cartItem.selectedSauces.map(s => `${s.name}x${s.quantity}`).join(' ')}`);
        }
        if (cartItem.selectedAddons && cartItem.selectedAddons.length > 0) {
            details.push(`加: ${cartItem.selectedAddons.map(a => `${a.name.replace(/\s/g, '')}x${a.quantity}`).join(' ')}`);
        }
        if (cartItem.selectedNotes) {
            details.push(`註: ${cartItem.selectedNotes}`);
        }

        return (
            <div key={cartItem.cartId} style={{ borderBottom: '1px solid #ccc', paddingTop: '2px', paddingBottom: '2px' }}>
                <p style={pStyle}>
                    {`${index + 1}. ${displayName} x ${cartItem.quantity}`}
                </p>
                {details.map((detail, i) => (
                    <p key={i} style={subPStyle}>- {detail}</p>
                ))}
            </div>
        );
    });

    return (
        <div style={{ width: '58mm', padding: '2mm', boxSizing: 'border-box', backgroundColor: 'white', color: 'black' }}>
            <p style={{...pStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '32px', borderBottom: '1px dashed black', marginBottom: '4px'}}>{orderTypeDisplay}</p>
            <p style={pStyle}>
                {`單號: ${finalOrderId?.slice(-6) || 'xxx'}`}
            </p>
             <p style={pStyle}>
                {`時間: ${new Date('createdAt' in order ? order.createdAt : Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`}
            </p>
            
            {mainMealLines.length > 0 && (
                <>
                    <p style={headerStyle}>餐點明細</p>
                    {mainMealLines}
                </>
            )}
            
            {summary.sauces && (
                <>
                    <p style={headerStyle}>醬料總覽</p>
                    <p style={pStyle}>{summary.sauces}</p>
                </>
            )}

            {summary.drinks && (
                <>
                    <p style={headerStyle}>飲料總覽</p>
                    <p style={pStyle}>{summary.drinks}</p>
                </>
            )}
        </div>
    );
};

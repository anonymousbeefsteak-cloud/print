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

    const aggregated = useMemo(() => {
        const details = {
            doneness: new Map<string, number>(),
            components: new Map<string, number>(),
            sideChoices: new Map<string, number>(),
            multiChoice: new Map<string, number>(),
            drinks: new Map<string, number>(),
            sauces: new Map<string, number>(),
            desserts: new Map<string, number>(),
            pastas: new Map<string, number>(),
            singleChoiceAddon: new Map<string, number>(),
            addons: new Map<string, number>(),
            notes: [] as string[],
        };

        const addToMap = (map: Map<string, number>, key: string, value: number) => {
            if (value > 0) map.set(key, (map.get(key) || 0) + value);
        };

        for (const item of order.items) {
            // FIX: Explicitly cast `v` to Number to handle potential `undefined` values and resolve type errors.
            if (item.selectedDonenesses) Object.entries(item.selectedDonenesses).forEach(([k, v]) => addToMap(details.doneness, k, Number(v)));
            // FIX: Explicitly cast `v` to Number to handle potential `undefined` values and resolve type errors.
            if (item.selectedComponent) Object.entries(item.selectedComponent).forEach(([k, v]) => addToMap(details.components, k, Number(v)));
            // FIX: Explicitly cast `v` to Number to handle potential `undefined` values and resolve type errors.
            if (item.selectedSideChoices) Object.entries(item.selectedSideChoices).forEach(([k, v]) => addToMap(details.sideChoices, k, Number(v)));
            // FIX: Explicitly cast `v` to Number to handle potential `undefined` values and resolve type errors.
            if (item.selectedMultiChoice) Object.entries(item.selectedMultiChoice).forEach(([k, v]) => addToMap(details.multiChoice, k, Number(v)));
            // FIX: Explicitly cast `v` to Number to handle potential `undefined` values and resolve type errors.
            if (item.selectedDrinks) Object.entries(item.selectedDrinks).forEach(([k, v]) => addToMap(details.drinks, k, Number(v)));
            if (item.selectedSauces) item.selectedSauces.forEach(s => addToMap(details.sauces, s.name, s.quantity));
            if (item.selectedDesserts) item.selectedDesserts.forEach(d => addToMap(details.desserts, d.name, d.quantity));
            if (item.selectedPastas) item.selectedPastas.forEach(p => addToMap(details.pastas, p.name, p.quantity));
            if (item.selectedAddons) item.selectedAddons.forEach(a => addToMap(details.addons, a.name, a.quantity));
            if (item.selectedSingleChoiceAddon) addToMap(details.singleChoiceAddon, item.selectedSingleChoiceAddon, item.quantity);
            if (item.selectedNotes) details.notes.push(item.selectedNotes);
        }

        const mapToString = (map: Map<string, number>) => {
            if (map.size === 0) return null;
            return Array.from(map.entries()).map(([key, value]) => `${key}x${value}`).join(', ');
        };

        return {
            doneness: mapToString(details.doneness),
            components: mapToString(details.components),
            sideChoices: mapToString(details.sideChoices),
            multiChoice: mapToString(details.multiChoice),
            drinks: mapToString(details.drinks),
            sauces: mapToString(details.sauces),
            desserts: mapToString(details.desserts),
            pastas: mapToString(details.pastas),
            singleChoiceAddon: mapToString(details.singleChoiceAddon),
            addons: mapToString(details.addons),
            notes: details.notes.length > 0 ? details.notes : null,
        };
    }, [order.items]);

    const finalOrderId = 'id' in order ? order.id : orderId;
    const createdAt = 'createdAt' in order ? new Date(order.createdAt) : new Date();

    const detailSections: { label: string; value: string | string[] | null }[] = [
        { label: '熟度', value: aggregated.doneness },
        { label: '炸物', value: aggregated.components },
        { label: '附餐', value: aggregated.sideChoices },
        { label: '飲料', value: aggregated.drinks },
        { label: '醬料', value: aggregated.sauces },
        { label: '口味', value: aggregated.multiChoice },
        { label: '義麵', value: aggregated.pastas },
        { label: '甜品', value: aggregated.desserts },
        { label: '單點', value: aggregated.singleChoiceAddon },
        { label: '加購', value: aggregated.addons },
        { label: '備註', value: aggregated.notes },
    ];
    
    return (
        <div style={{ width: '72mm', padding: '1mm', backgroundColor: 'white', color: 'black', fontFamily: 'monospace', fontSize: '9pt', lineHeight: 1.2 }}>
            <h3 style={{ fontSize: '12pt', fontWeight: 'bold', textAlign: 'center', margin: '0 0 1mm 0' }}>無名牛排</h3>
            <div style={{ fontSize: '8pt', margin: 0 }}>
                <p style={{ margin: 0 }}>顧客: {order.customerInfo.name} ({order.customerInfo.phone})</p>
                <p style={{ margin: 0 }}>類型: {order.orderType} {order.customerInfo.tableNumber && `(${order.customerInfo.tableNumber}桌)`}</p>
                <p style={{ margin: 0 }}>時間: {createdAt.toLocaleString('zh-TW', { hour12: false })}</p>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px dashed black', margin: '1mm 0' }} />
            
            {/* Section 1: Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '10pt', margin: 0 }}>
                <span>單號: {finalOrderId?.slice(-6)}</span>
                <span>總計: ${order.totalPrice}</span>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px dashed black', margin: '1mm 0' }} />

            {/* Section 2: Main Courses */}
            <div style={{ margin: '0' }}>
                {order.items.map(item => (
                    <p key={item.cartId} style={{ margin: 0 }}>
                        {item.item.name} x{item.quantity}
                    </p>
                ))}
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px dashed black', margin: '1mm 0' }} />

            {/* Section 3: Details */}
            <div style={{ margin: '0', fontSize: '8pt' }}>
                {detailSections.map(({ label, value }) => {
                    if (!value) return null;
                    if (Array.isArray(value)) {
                         return (
                            <div key={label} style={{ margin: 0 }}>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{label}:</p>
                                {value.map((note, i) => <p key={i} style={{ margin: 0, paddingLeft: '2mm' }}>- {note}</p>)}
                            </div>
                        );
                    }
                    return (
                        <p key={label} style={{ margin: 0 }}>
                            <strong style={{ minWidth: '12mm', display: 'inline-block' }}>{label}:</strong> {value}
                        </p>
                    );
                })}
            </div>
        </div>
    );
};

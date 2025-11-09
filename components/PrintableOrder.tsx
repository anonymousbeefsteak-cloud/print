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
        const mainMeals = new Map<string, { quantity: number; totalPrice: number; }>();
        const doneness = new Map<string, number>();
        const drinks = new Map<string, number>();
        const sauces = new Map<string, number>();
        const addons = new Map<string, number>();
        const notes: string[] = [];

        const addToMap = (map: Map<string, number>, key: string, value: number) => {
            if (key && value > 0) map.set(key, (map.get(key) || 0) + value);
        };

        for (const item of order.items) {
            const mealName = item.item.name.replace(/半全餐|半套餐/g, '套餐');
            const meal = mainMeals.get(mealName);
            if (meal) {
                meal.quantity += item.quantity;
            } else {
                mainMeals.set(mealName, {
                    quantity: item.quantity,
                    totalPrice: 0, // Will be calculated later
                });
            }

            if (item.selectedDonenesses) Object.entries(item.selectedDonenesses).forEach(([k, v]) => addToMap(doneness, k, Number(v) || 0));
            if (item.selectedDrinks) Object.entries(item.selectedDrinks).forEach(([k, v]) => addToMap(drinks, k, Number(v) || 0));
            if (item.selectedSauces) item.selectedSauces.forEach(s => addToMap(sauces, s.name, s.quantity));
            
            // Group all other things into addons for the summary
            if (item.selectedAddons) item.selectedAddons.forEach(a => addToMap(addons, a.name, a.quantity));
            if (item.selectedComponent) Object.entries(item.selectedComponent).forEach(([k, v]) => addToMap(addons, k, Number(v) || 0));
            if (item.selectedSideChoices) Object.entries(item.selectedSideChoices).forEach(([k, v]) => addToMap(addons, k, Number(v) || 0));
            if (item.selectedMultiChoice) Object.entries(item.selectedMultiChoice).forEach(([k, v]) => addToMap(addons, k, Number(v) || 0));
            if (item.selectedDesserts) item.selectedDesserts.forEach(d => addToMap(addons, d.name, d.quantity));
            if (item.selectedPastas) item.selectedPastas.forEach(p => addToMap(addons, p.name, p.quantity));
            if (item.selectedSingleChoiceAddon) addToMap(addons, item.selectedSingleChoiceAddon, item.quantity);

            if(item.selectedNotes) notes.push(`${mealName}: ${item.selectedNotes}`);
        }

        mainMeals.forEach((value, key) => {
            const itemsForThisMeal = order.items.filter(i => i.item.name.replace(/半全餐|半套餐/g, '套餐') === key);
            value.totalPrice = itemsForThisMeal.reduce((acc, i) => acc + i.totalPrice, 0);
        });

        return { mainMeals, doneness, drinks, sauces, addons, notes };
    }, [order]);

    const finalOrderId = 'id' in order ? order.id : orderId;

    const renderSummarySection = (title: string, data: Map<string, number>) => {
        if (data.size === 0) return null;
        return (
            <div style={{ marginTop: '1mm' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{title}:</p>
                {Array.from(data.entries()).map(([name, quantity]) => (
                    <p key={name} style={{ margin: 0, paddingLeft: '1mm' }}>
                        - {name} x{quantity}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div style={{ width: '58mm', padding: '1mm', backgroundColor: 'white', color: 'black', fontFamily: 'monospace', fontSize: '9pt', lineHeight: 1.1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '10pt' }}>
                <p style={{ margin: 0 }}>單號: {finalOrderId?.slice(-6)} 餐點內容 -</p>
                <p style={{ margin: 0 }}>餐點總計: ${order.totalPrice}</p>
            </div>

            <div style={{ margin: '1mm 0', borderTop: '1px dotted black', height: 0 }}></div>

            <div style={{ margin: '1mm 0' }}>
                {Array.from(aggregated.mainMeals.entries()).map(([name, data]) => (
                    <p key={name} style={{ margin: '0.5mm 0' }}>
                        {name} x{data.quantity} (${data.totalPrice})
                    </p>
                ))}
            </div>
            
            <div style={{ margin: '1mm 0', textAlign: 'center' }}>- 總計列表 -</div>
            
            {renderSummarySection('熟度總計', aggregated.doneness)}
            {renderSummarySection('飲料總計', aggregated.drinks)}
            {renderSummarySection('醬料總計', aggregated.sauces)}
            {renderSummarySection('加購總計', aggregated.addons)}
            
            {aggregated.notes.length > 0 && (
                <div style={{ marginTop: '1mm' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>備註總計:</p>
                    {aggregated.notes.map((note, i) => (
                        <p key={i} style={{ margin: 0, paddingLeft: '1mm' }}>- {note}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

import React from 'react';
import type { Order, CartItem, OrderData } from '../types';

type PrintableOrderProps = {
    order: Order | OrderData | null;
    orderId?: string | null;
};

export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    if (!order) {
        return null;
    }
    
    const finalOrderId = 'id' in order ? order.id : orderId;
    
    return (
        <div className="bg-white text-black" style={{ 
            width: '350px', 
            margin: '0 auto', 
            lineHeight: '1.2',
            padding: '5px',
            fontSize: '18px',
            fontWeight: 'bold'
        }}>
            {/* 單號 */}
            <div style={{ marginBottom: '8px' }}>
                單號: {finalOrderId} 餐點內容 -
            </div>

            {/* 餐點內容 1 */}
            <div style={{ marginBottom: '8px' }}>
                <div>數量</div>
                <div>x3</div>
                <div>小計</div>
                <div>$1737</div>
                <div>板腱牛排+脆皮炸雞(炸魚)套餐</div>
            </div>

            {/* 餐點內容 2 */}
            <div style={{ marginBottom: '8px' }}>
                <div>數量</div>
                <div>x2</div>
                <div>小計</div>
                <div>$500</div>
                <div>英式炸魚套餐</div>
            </div>

            {/* 分隔線 */}
            <div style={{ marginBottom: '8px' }}>- 總計列表 -</div>

            {/* 炸物總計 */}
            <div style={{ marginBottom: '6px' }}>
                炸物總計:
                <div>- 炸魚 x3</div>
            </div>

            {/* 飲料總計 */}
            <div style={{ marginBottom: '6px' }}>
                飲料總計:
                <div>- 無糖紅茶 x3</div>
                <div>- 冰涼可樂 x2</div>
            </div>

            {/* 醬料總計 */}
            <div style={{ marginBottom: '6px' }}>
                醬料總計:
                <div>- 泡菜 x4</div>
                <div>- 生蒜片 x2</div>
                <div>- 黑胡椒 x2</div>
                <div>- 巴薩米克醋 x1</div>
                <div>- 蒜味醬 x1</div>
            </div>

            {/* 加購總計 */}
            <div style={{ marginBottom: '6px' }}>
                加購總計:
                <div>- 豬排加購 5oz x2</div>
            </div>
        </div>
    );
};

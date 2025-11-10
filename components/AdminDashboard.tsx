import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Order, OrderStatus, CartItem, SalesStatistics } from '../types';
import { apiService } from '../services/apiService';
import { CloseIcon, RefreshIcon } from './icons';
import { PrintableOrder } from './PrintableOrder';
import AvailabilityManager from './AvailabilityManager';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case '待店長確認': return 'bg-orange-100 text-orange-800 border-orange-300';
        case '待處理': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case '製作中': return 'bg-blue-100 text-blue-800 border-blue-300';
        case '可以取餐': return 'bg-purple-100 text-purple-800 border-purple-300';
        case '已完成': return 'bg-green-100 text-green-800 border-green-300';
        default: return 'bg-red-100 text-red-800 border-red-300';
    }
};

const ORDER_STATUSES: OrderStatus[] = ['待店長確認', '待處理', '製作中', '可以取餐', '已完成'];

const OrderDetailModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const renderOrderItem = (item: CartItem, index: number) => (
    <div key={item.cartId || index} className="py-2 border-b border-slate-200 last:border-b-0">
      <p className="font-semibold text-slate-800">{item.item.name.replace(/半全餐|半套餐/g, '套餐')} (${item.item.price}) <span className="font-normal">x{item.quantity}</span></p>
      <div className="text-xs text-slate-500 pl-2 mt-1 space-y-0.5">
        {item.selectedDonenesses && Object.keys(item.selectedDonenesses).length > 0 && <p>熟度: {Object.entries(item.selectedDonenesses).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
        {item.selectedComponent && Object.keys(item.selectedComponent).length > 0 && <p>炸物選擇: {Object.entries(item.selectedComponent).map(([c, q]) => `${c}x${q}`).join(', ')}</p>}
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
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="p-5 relative border-b">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><CloseIcon /></button>
                <h2 className="text-2xl font-bold text-slate-800">訂單內容</h2>
            </header>
            <main className="px-6 py-4 space-y-4 overflow-y-auto bg-slate-50">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">訂單編號:</span><span className="font-mono font-bold text-slate-800">{order.id}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">顧客:</span><span className="font-semibold">{order.customerInfo.name} ({order.customerInfo.phone})</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">類型:</span><span className="font-semibold">{order.orderType}{order.orderType === '內用' && order.customerInfo.tableNumber ? ` (${order.customerInfo.tableNumber}桌)`: ''}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">狀態:</span><span className={`px-2 py-0.5 font-semibold leading-tight rounded-full text-xs ${getStatusColor(order.status)}`}>{order.status}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">時間:</span><span className="font-semibold">{new Date(order.createdAt).toLocaleString()}</span></div>
                </div>
                <div className="border-t border-slate-300 pt-3 mt-3">
                    <h4 className="text-base font-bold text-slate-700 mb-2">餐點內容</h4>
                    <div className="bg-white p-3 rounded-md border">
                        {order.items.map(renderOrderItem)}
                    </div>
                </div>
            </main>
            <footer className="p-4 border-t bg-slate-100">
                <button 
                    onClick={onClose} 
                    className="w-full bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    關閉
                </button>
            </footer>
        </div>
    </div>
  );
};

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    onPrintRequest: (content: React.ReactNode) => void;
    onStoreUpdate: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, onPrintRequest, onStoreUpdate }) => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<SalesStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    const fetchAllOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const result = await apiService.getAllOrders();
        if (result.success && result.orders) {
            setOrders(result.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
            setError(result.message || '無法取得訂單');
        }
        setIsLoading(false);
    }, []);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const result = await apiService.getSalesStatistics(dateRange.startDate, dateRange.endDate);
        if (result.success && result.stats) {
            setStats(result.stats);
        } else {
            setError(result.message || '無法取得統計資料');
            setStats(null);
        }
        setIsLoading(false);
    }, [dateRange]);

    useEffect(() => {
        if (isOpen && activeTab === 'orders') {
            fetchAllOrders();
        }
    }, [isOpen, activeTab, fetchAllOrders]);
    
    // Note: fetchStats is now called on-demand via the search button, not via useEffect on tab change.

    useEffect(() => {
        if (isOpen && activeTab === 'orders') {
            const interval = setInterval(fetchAllOrders, 30000);
            return () => clearInterval(interval);
        }
    }, [isOpen, activeTab, fetchAllOrders]);

    const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
        const originalOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        const result = await apiService.updateOrderStatus(orderId, status);
        if (!result.success) {
            setOrders(originalOrders);
            alert(`狀態更新失敗: ${result.message}`);
        }
    };

    const activeOrders = useMemo(() => orders.filter(o => o.status !== '已完成' && o.status !== '錯誤'), [orders]);

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-2 sm:p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="bg-white rounded-lg shadow-2xl w-full h-full flex flex-col">
                <header className="p-4 relative border-b flex justify-between items-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">管理後台</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800"><CloseIcon /></button>
                </header>

                <div className="border-b border-slate-200">
                    <nav className="flex space-x-2 sm:space-x-4 px-4">
                        <button onClick={() => setActiveTab('orders')} className={`py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base ${activeTab === 'orders' ? 'border-b-2 border-green-600 text-green-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            即時訂單 <span className="bg-green-100 text-green-700 text-xs font-bold rounded-full px-2 py-0.5">{activeOrders.length}</span>
                        </button>
                        <button onClick={() => setActiveTab('stats')} className={`py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base ${activeTab === 'stats' ? 'border-b-2 border-green-600 text-green-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            銷售統計
                        </button>
                        <button onClick={() => setActiveTab('availability')} className={`py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base ${activeTab === 'availability' ? 'border-b-2 border-green-600 text-green-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            商店管理
                        </button>
                    </nav>
                </div>

                <main className="flex-1 overflow-auto bg-slate-50 p-2 sm:p-6">
                    {error && <p className="text-red-500 bg-red-100 p-3 rounded-md text-center">{error}</p>}
                    
                    {activeTab === 'orders' && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button onClick={fetchAllOrders} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium disabled:bg-slate-400">
                                    <RefreshIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}/>
                                    <span>{isLoading ? '刷新中' : '刷新'}</span>
                                </button>
                            </div>
                            {isLoading && !orders.length ? (
                                <p className="text-center text-slate-500 py-10">讀取中...</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {ORDER_STATUSES.filter(s => s !== '已完成').map(status => (
                                        <div key={status} className="bg-slate-100 rounded-lg p-2 h-full">
                                            <h3 className={`font-bold text-md text-center p-2 rounded-t-md ${getStatusColor(status)}`}>{status}</h3>
                                            <div className="space-y-3 pt-2">
                                                {orders.filter(o => o.status === status).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map(order => (
                                                    <div key={order.id} className="bg-white p-3 rounded-md shadow-sm border">
                                                        <div className="flex justify-between items-start">
                                                            <p className="font-bold text-slate-800">{order.customerInfo.name} ({order.orderType === '內用' ? `${order.customerInfo.tableNumber || '?'}桌` : '外帶'})</p>
                                                            <p className="font-mono text-xs text-slate-500">{order.id.slice(-6)}</p>
                                                        </div>
                                                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        <div className="mt-2 border-t pt-2 max-h-24 overflow-y-auto">
                                                            {order.items.map(item => ( <p key={item.cartId} className="text-xs text-slate-700 truncate">{item.item.name.replace(/半全餐|半套餐/g, '套餐')} x{item.quantity}</p> ))}
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2 border-t pt-2">
                                                            <p className="font-bold text-lg text-green-700">${order.totalPrice}</p>
                                                            <button onClick={() => setSelectedOrder(order)} className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200">詳情</button>
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            <select value={order.status} onChange={e => handleUpdateStatus(order.id, e.target.value as OrderStatus)} className="w-full p-1 text-xs border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none">
                                                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                            </select>
                                                            <button onClick={() => onPrintRequest(<PrintableOrder order={order} />)} className="w-full text-xs p-1.5 border rounded-md hover:bg-slate-100 transition-colors">列印</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'stats' && (
                         <div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 p-4 bg-white rounded-lg shadow mb-6">
                                <label className="text-sm font-medium">從 <input type="date" value={dateRange.startDate} onChange={e => setDateRange(p => ({...p, startDate: e.target.value}))} className="p-2 border rounded-md" /></label>
                                <label className="text-sm font-medium">到 <input type="date" value={dateRange.endDate} onChange={e => setDateRange(p => ({...p, endDate: e.target.value}))} className="p-2 border rounded-md" /></label>
                                <button onClick={fetchStats} disabled={isLoading} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-slate-400">
                                    {isLoading ? '查詢中...' : '查詢'}
                                </button>
                            </div>
                            {isLoading ? (
                                <p className="text-center text-slate-500 py-10">讀取中...</p>
                            ) : stats ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-slate-500">總收入</p><p className="text-3xl font-bold text-slate-800">${stats.totalRevenue.toLocaleString()}</p></div>
                                        <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-slate-500">總訂單數</p><p className="text-3xl font-bold text-slate-800">{stats.orderCount}</p></div>
                                    </div>
                                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                                        <h3 className="font-bold text-lg mb-4 text-slate-700">熱門品項</h3>
                                        <ul className="space-y-2 max-h-80 overflow-y-auto">
                                            {stats.popularItems.map(item => (
                                                <li key={item.name} className="flex flex-wrap justify-between items-center text-sm border-b pb-2">
                                                    <span className="font-medium text-slate-800">{item.name}</span>
                                                    <span className="font-semibold text-slate-600">售出 {item.quantity} 份 (營收 ${item.revenue.toLocaleString()})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-white p-6 rounded-lg shadow">
                                        <h3 className="font-bold text-lg mb-4 text-slate-700">銷售趨勢</h3>
                                        <ul className="space-y-1 text-sm max-h-80 overflow-y-auto">
                                            {stats.salesTrend.map(trend => (
                                                <li key={trend.date} className="flex justify-between border-b pb-1">
                                                    <span className="text-slate-600">{trend.date}</span>
                                                    <span className="font-semibold text-slate-800">${trend.revenue.toLocaleString()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-slate-500 py-10">請選擇日期範圍以查看統計資料。</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'availability' && <AvailabilityManager isOpen={isOpen} onStoreUpdate={onStoreUpdate} />}

                </main>
            </div>
            {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </div>
    );
};
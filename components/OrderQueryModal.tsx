import React, { useState, useEffect, useCallback } from 'react';
import type { Order, CartItem, OrderSummary } from '../types';
import { apiService } from '../services/apiService';
import { CloseIcon, SearchIcon } from './icons';

interface OrderQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderQueryModal: React.FC<OrderQueryModalProps> = ({ isOpen, onClose }) => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [searchResult, setSearchResult] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<string[]>([]);
  
  // State for advanced search
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [advSearchParams, setAdvSearchParams] = useState({ name: '', phone: '', startDate: '', endDate: '' });
  const [advSearchResults, setAdvSearchResults] = useState<OrderSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const resetState = useCallback(() => {
    setOrderIdInput('');
    setSearchResult(null);
    setError(null);
    setIsLoading(false);
    setIsAdvancedSearchOpen(false);
    setAdvSearchParams({ name: '', phone: '', startDate: '', endDate: '' });
    setAdvSearchResults([]);
    setIsSearching(false);
  }, []);
  
  useEffect(() => {
    if (isOpen) {
        const savedOrders = JSON.parse(localStorage.getItem('steakhouse-orders') || '[]');
        setRecentOrders(savedOrders);
    } else {
        setTimeout(resetState, 300); // Delay reset to allow for closing animation
    }
  }, [isOpen, resetState]);

  const handleGetOrderDetails = async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    // Clear advanced search results when looking up a specific ID
    setAdvSearchResults([]);
    const result = await apiService.getOrder(id.trim());
    if (result.success && result.order) {
      setSearchResult(result.order);
      setOrderIdInput(id); // Sync the input field
    } else {
      setError(result.message || '找不到此訂單，請確認訂單編號。');
    }
    setIsLoading(false);
  };
  
  const handleAdvancedSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSearching(true);
      setError(null);
      // Clear other search states
      setSearchResult(null);
      setOrderIdInput('');
      
      const result = await apiService.searchOrders(advSearchParams);
      
      if (result.success && result.orders) {
          setAdvSearchResults(result.orders);
          if (result.orders.length === 0) {
              setError("找不到符合條件的訂單。");
          }
      } else {
          setAdvSearchResults([]); // Clear results on error
          setError(result.message || "搜尋時發生錯誤。");
      }
      setIsSearching(false);
  }

  const renderOrderItem = (item: CartItem, index: number) => (
    <div key={item.cartId || index} className="py-2 border-b border-slate-200">
      <p className="font-semibold text-slate-800">{item.item.name.replace(/半全餐|半套餐/g, '套餐')} (${item.item.price}) <span className="font-normal">x{item.quantity}</span></p>
      <div className="text-xs text-slate-500 pl-2">
        {item.selectedDonenesses && Object.keys(item.selectedDonenesses).length > 0 && <p>熟度: {Object.entries(item.selectedDonenesses).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
        {item.selectedSideChoices && Object.keys(item.selectedSideChoices).length > 0 && <p>簡餐附餐: {Object.entries(item.selectedSideChoices).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
        {item.selectedDrinks && Object.keys(item.selectedDrinks).length > 0 && <p>飲料: {Object.entries(item.selectedDrinks).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
        {item.selectedSauces && item.selectedSauces.length > 0 && <p>醬料: {item.selectedSauces.map(s => `${s.name}x${s.quantity}`).join(', ')}</p>}
        {item.selectedPastas && item.selectedPastas.length > 0 && <p>義麵: {item.selectedPastas.map(p => `${p.name}x${p.quantity}`).join(', ')}</p>}
        {item.selectedAddons && item.selectedAddons.length > 0 && <p>加購: {item.selectedAddons.map(a => `${a.name} ($${a.price}) x${a.quantity}`).join(', ')}</p>}
        {item.selectedNotes && <p>備註: {item.selectedNotes}</p>}
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="p-5 relative border-b">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><CloseIcon /></button>
                <h2 className="text-2xl font-bold text-slate-800">查詢訂單</h2>
            </header>
            <main className="px-6 py-4 space-y-4 overflow-y-auto">
                {/* Search by ID */}
                <form onSubmit={(e) => { e.preventDefault(); handleGetOrderDetails(orderIdInput); }} className="flex gap-2">
                    <input type="text" value={orderIdInput} onChange={(e) => setOrderIdInput(e.target.value)} placeholder="依訂單編號查詢" className="flex-grow p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center justify-center disabled:bg-slate-400">{isLoading && !isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <SearchIcon />}</button>
                </form>
                
                {/* Recent Orders */}
                {recentOrders.length > 0 && (
                    <div className="text-sm"><h3 className="font-semibold text-slate-500 mb-2">最近的訂單:</h3><div className="flex flex-wrap gap-2">{recentOrders.map(id => (<button key={id} onClick={() => handleGetOrderDetails(id)} className="bg-slate-100 text-slate-700 font-mono px-3 py-1 rounded-full hover:bg-slate-200">{id}</button>))}</div></div>
                )}

                {/* Advanced Search Toggle */}
                <div className="text-center"><button onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)} className="text-sm text-blue-600 hover:underline">{isAdvancedSearchOpen ? '隱藏進階搜尋' : '進階搜尋'}</button></div>

                {/* Advanced Search Form */}
                {isAdvancedSearchOpen && (
                    <form onSubmit={handleAdvancedSearch} className="p-4 bg-slate-50 rounded-lg border space-y-3">
                        <h3 className="font-semibold text-slate-700">進階搜尋</h3>
                        <input type="text" value={advSearchParams.name} onChange={e => setAdvSearchParams(p => ({...p, name: e.target.value}))} placeholder="顧客姓名 (完全符合)" className="w-full p-2 border rounded" />
                        <input
                            type="tel"
                            value={advSearchParams.phone}
                            onChange={e => {
                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                if (numericValue.length <= 10) {
                                    setAdvSearchParams(p => ({...p, phone: numericValue}));
                                }
                            }}
                            placeholder="顧客電話 (10位數字)"
                            className="w-full p-2 border rounded"
                            maxLength={10}
                        />
                        <div className="flex gap-2 items-center"><label className="text-sm">日期:</label><input type="date" value={advSearchParams.startDate} onChange={e => setAdvSearchParams(p => ({...p, startDate: e.target.value}))} className="w-full p-2 border rounded" /><span className="text-sm">到</span><input type="date" value={advSearchParams.endDate} onChange={e => setAdvSearchParams(p => ({...p, endDate: e.target.value}))} className="w-full p-2 border rounded" /></div>
                        <button type="submit" disabled={isSearching} className="w-full mt-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center justify-center disabled:bg-slate-400">{isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : '執行搜尋'}</button>
                    </form>
                )}

                {/* Search Results Area */}
                {advSearchResults.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                        <h3 className="font-semibold text-slate-800 mb-2">搜尋結果:</h3>
                        <ul className="max-h-48 overflow-y-auto bg-white border rounded-lg divide-y">
                            {advSearchResults.map(order => (
                                <li key={order.id}><button onClick={() => handleGetOrderDetails(order.id)} className="w-full text-left p-3 hover:bg-slate-100"><div className="flex justify-between font-mono text-sm"><span>{order.id}</span><span>${order.totalAmount}</span></div><div className="text-xs text-slate-500">{order.customerName} - {new Date(order.timestamp).toLocaleDateString()}</div></button></li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {error && <p className="text-red-500 text-center font-semibold py-2">{error}</p>}
                
                {searchResult && (
                    <div className="bg-slate-50 p-4 rounded-lg border space-y-2 mt-4 animate-fade-in">
                        <h3 className="text-lg font-bold text-slate-800 text-center mb-3">訂單詳情</h3>
                        <div className="flex justify-between items-baseline"><p className="text-sm text-slate-600">訂單編號:</p><p className="font-mono font-bold text-slate-800">{searchResult.id}</p></div>
                        <div className="flex justify-between items-baseline"><p className="text-sm text-slate-600">顧客:</p><p className="font-semibold">{searchResult.customerInfo.name} ({searchResult.customerInfo.phone})</p></div>
                        <div className="flex justify-between items-baseline"><p className="text-sm text-slate-600">類型:</p><p className="font-semibold">{searchResult.orderType}{searchResult.orderType === '內用' && searchResult.customerInfo.tableNumber ? ` (${searchResult.customerInfo.tableNumber}桌)`: ''}</p></div>
                        <div className="flex justify-between items-baseline"><p className="text-sm text-slate-600">狀態:</p><p className="font-semibold text-green-700">{searchResult.status}</p></div>
                        <div className="flex justify-between items-baseline"><p className="text-sm text-slate-600">時間:</p><p className="font-semibold text-sm">{new Date(searchResult.createdAt).toLocaleString()}</p></div>
                        <div className="border-t border-slate-300 pt-2 mt-2"><h4 className="text-base font-bold text-slate-700 mb-2">餐點內容</h4>{searchResult.items.map(renderOrderItem)}</div>
                        <div className="flex justify-between items-center border-t border-slate-300 pt-2 mt-3"><p className="text-lg font-bold">總金額:</p><p className="text-xl font-bold text-green-700">${searchResult.totalPrice}</p></div>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
};

export default OrderQueryModal;

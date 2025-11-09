import React from 'react';
import type { OrderData } from '../types';
import { CloseIcon, CheckIcon } from './icons';
import { PrintableOrder } from './PrintableOrder';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  lastSuccessfulOrder: OrderData | null;
  onPrintRequest: (content: React.ReactNode) => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, orderId, lastSuccessfulOrder, onPrintRequest }) => {

  if (!isOpen) return null;

  const handleLineShare = () => {
    if (!orderId) return;
    const text = `您好，我已送出訂單，訂單編號為【${orderId}】，請您盡快確認，謝謝！`;
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  
  const handlePrint = () => {
      if (lastSuccessfulOrder) {
          onPrintRequest(<PrintableOrder order={lastSuccessfulOrder} orderId={orderId} />);
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">訂單請求已送出</h2>
            <p className="text-slate-600 mt-2">您的訂單編號為：</p>
            <p className="font-mono text-2xl font-bold text-slate-800 my-2 bg-slate-100 py-2 rounded-md">{orderId}</p>
            
            <div className="text-sm bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg p-3 mt-4">
                <p><strong>重要提示：</strong></p>
                <p className="mt-1">此訂單需由店家回覆確認後才算正式成立。請點擊下方按鈕，透過 LINE 分享您的訂單編號以完成訂購程序。</p>
            </div>
        </div>
        <footer className="px-6 pb-6 space-y-2">
            <button 
                onClick={handleLineShare} 
                className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 font-bold text-lg"
            >
                LINE 分享提醒
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button 
                  onClick={handlePrint} 
                  disabled={!lastSuccessfulOrder}
                  className="w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
              >
                  列印訂單摘要
              </button>
              <button 
                  onClick={onClose} 
                  className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors"
              >
                  關閉
              </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmationModal;
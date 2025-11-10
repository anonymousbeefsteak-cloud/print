import React from 'react';

interface WelcomeModalProps {
  onAgree: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onAgree }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">顧客須知</h2>
          <div className="text-slate-600 space-y-3 my-6">
            <p>＊店內最低消費為一份餐點($175)</p>
            <p>＊不收服務費，用完餐請回收餐具</p>
            <p>＊用餐限九十分鐘請勿飲酒</p>
            <p>＊餐點內容以現場出餐為準，餐點現點現做請耐心等候</p>
          </div>
        </div>
        <footer className="px-6 pb-6">
          <button
            onClick={onAgree}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-lg"
          >
            我同意
          </button>
        </footer>
      </div>
    </div>
  );
};

export default WelcomeModal;

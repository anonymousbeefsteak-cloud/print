import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { MenuCategory, Addon } from '../types';
import { CloseIcon, SendIcon, SparklesIcon } from './icons';

// Simple Markdown-to-HTML renderer
const SimpleMarkdown: React.FC<{ text: string }> = React.memo(({ text }) => {
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')     // Italic
        .replace(/`([^`]+)`/g, '<code class="bg-slate-200 text-slate-800 rounded px-1 py-0.5 font-mono text-sm">$1</code>') // Inline code
        .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>') // List items
        .replace(/(\<li.*\>.*<\/li\>)/gs, '<ul>$1</ul>') // Wrap lists in ul
        .replace(/\n/g, '<br />'); // Newlines

    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formattedText }} />;
});

interface Message {
    role: 'user' | 'model';
    content: string;
}

interface AIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuData: MenuCategory[];
    addons: Addon[];
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, menuData, addons }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: '您好！我是您的點餐小幫手，請問有什麼可以為您服務的嗎？\n\n您可以問我像是：\n- *今天有什麼推薦的嗎?*\n- *14oz 的上蓋牛排套餐多少錢?*\n- *哪些餐點不含牛肉?*' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const aiRef = useRef<GoogleGenAI | null>(null);
    const [isAiDisabled, setIsAiDisabled] = useState(false);

    useEffect(() => {
        if (isOpen && !process.env.API_KEY) {
            setIsAiDisabled(true);
        }
    }, [isOpen]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);
    
    const getAiInstance = (): GoogleGenAI | null => {
        if (aiRef.current) return aiRef.current;
        if (isAiDisabled) return null;

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.warn("Google GenAI API Key is not configured. AI Assistant will be disabled.");
            setIsAiDisabled(true);
            return null;
        }

        try {
            const instance = new GoogleGenAI({ apiKey });
            aiRef.current = instance;
            return instance;
        } catch (e) {
            console.error("Failed to initialize GoogleGenAI:", e);
            setError("AI 小幫手初始化失敗。");
            setIsAiDisabled(true);
            return null;
        }
    };
    
    const menuContext = React.useMemo(() => {
        const simplifiedMenu = menuData.map(category => ({
            ...category,
            items: category.items.map(({ id, name, weight, price, isAvailable }) => ({ id, name, weight, price, isAvailable }))
        }));
        const simplifiedAddons = addons.map(({ id, name, price, category, isAvailable }) => ({ id, name, price, category, isAvailable }));
        return `這是餐廳的菜單資料 (JSON格式):\n\n菜單: ${JSON.stringify(simplifiedMenu)}\n\n加購項目: ${JSON.stringify(simplifiedAddons)}`;
    }, [menuData, addons]);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading || isAiDisabled) return;

        setError(null);
        const newUserMessage: Message = { role: 'user', content: trimmedInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        
        const ai = getAiInstance();

        if (!ai) {
            const errorMessage = "AI 小幫手目前無法使用，請確認 API 金鑰是否已正確設定。";
            setError(errorMessage);
            setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: trimmedInput,
                config: {
                    systemInstruction: `你是一位專業且友善的「無名牛排」點餐小幫手。你的任務是根據我提供的菜單JSON資料，回答顧客的問題。請務必只使用提供的菜單資料來回答，不要杜撰任何菜單上沒有的品項、價格或資訊。如果顧客詢問有關售罄 (isAvailable: false) 的商品，請告知他們該商品目前無法提供。回答時請使用繁體中文，語氣親切有禮，並盡量用條列式或重點式的方式清楚呈現，讓顧客一目了然。\n\n${menuContext}`,
                },
            });

            const aiResponse: Message = { role: 'model', content: response.text };
            setMessages(prev => [...prev, aiResponse]);
        } catch (err) {
            console.error("Gemini API call failed:", err);
            const errorMessage = "抱歉，我現在無法回答問題，請稍後再試。";
            setError(errorMessage);
            setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    }, [userInput, isLoading, menuContext, isAiDisabled]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-slate-800">AI 小幫手</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800"><CloseIcon /></button>
                </header>
                
                <main className="flex-1 p-4 overflow-y-auto bg-slate-100 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><SparklesIcon className="w-5 h-5"/></div>}
                            <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none shadow-sm'}`}>
                                <SimpleMarkdown text={msg.content} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><SparklesIcon className="w-5 h-5"/></div>
                            <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-white text-slate-800 rounded-bl-none shadow-sm flex items-center gap-2">
                                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t bg-white rounded-b-2xl">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={isAiDisabled ? "AI 小幫手目前無法使用" : "問我任何關於菜單的問題..."}
                            className="flex-grow p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                            disabled={isLoading || isAiDisabled}
                        />
                        <button type="submit" disabled={isLoading || !userInput.trim() || isAiDisabled} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                            <SendIcon className="h-6 w-6" />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default AIAssistantModal;
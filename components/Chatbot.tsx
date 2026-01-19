import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola! Soy Exaltín 🐞. ¿Tienes dudas sobre la EBV 2026? ¡Estoy aquí para ayudarte!',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model' as 'user' | 'model',
        parts: [{ text: m.text }]
      }));

      const responseText = await sendMessageToGemini(userMsg.text, history);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 max-w-[calc(100vw-2rem)] h-[450px] md:h-[500px] rounded-2xl md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden mb-4 border-4 border-violet-100 animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header - Updated to Violet/Sky Gradient */}
          <div className="bg-gradient-to-r from-violet-600 to-sky-500 p-4 md:p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full border border-white/30">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base font-display tracking-wide">Ayuda EBV</h3>
                <p className="text-xs text-violet-100 font-medium">En línea</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 scrollbar-hide">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-violet-600 text-white rounded-tr-none shadow-md' 
                      : 'bg-white text-slate-700 shadow-sm border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 flex items-center gap-2">
                  <Loader2 className="animate-spin text-sky-500" size={18} />
                  <span className="text-xs text-slate-400 font-bold">Escribiendo...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2 md:py-3 border-2 border-slate-200 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-50 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu duda..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 font-medium placeholder:text-slate-400"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="text-violet-600 hover:text-sky-600 transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button - Updated gradient */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'rotate-90 opacity-0 scale-50 hidden' : 'rotate-0 opacity-100 scale-100 flex'
        } bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-700 hover:to-sky-600 text-white p-4 md:p-5 rounded-full shadow-[0_8px_16px_rgba(124,58,237,0.4)] transition-all duration-300 transform hover:scale-110 items-center justify-center gap-2 group border-4 border-white/20`}
      >
        <MessageCircle size={28} className="md:w-8 md:h-8 group-hover:animate-bounce" />
        <span className="font-display font-bold pr-2 hidden group-hover:block transition-all animate-in fade-in slide-in-from-right-2 text-base md:text-lg">¿Ayuda?</span>
      </button>
    </div>
  );
};
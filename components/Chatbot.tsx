import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

interface ChatBotProps {
  language: Language;
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

// System instruction with all event details
const SYSTEM_INSTRUCTION = `
You are the friendly and helpful virtual assistant for the "Iglesia Bautista Más Vida" Vacation Bible School (EBV/VBS) registration app.
Your goal is to answer parents' questions about the event accurately and warmly.

Key Event Details:
- **Event Name**: EBV (Escuela Bíblica de Vacaciones) / VBS.
- **Dates**: July 13 to July 17, 2026.
- **Time**: 10:00 AM to 2:00 PM (10:00 - 14:00).
- **Theme/Verse**: "Descubramos la grandeza de Dios en las cosas pequeñas" (Psalm 34:3).
- **Cost**: 20€ per child (20 Euros).
- **What's Included in Cost**: T-shirt (Camiseta), Materials/Crafts (Materiales), and Snacks (Merienda). It includes everything needed for the week.
- **Location**: Iglesia Bautista Más Vida.
- **Age Groups**:
  1. Bichitos (4-6 years old).
  2. Escarabajos (7-9 years old).
  3. Escorpiones (10-12 years old).
- **Food**: Snacks are provided (Merienda). Parents must list allergies in the form.
- **Clothing**: Comfortable clothes and sneakers for playing.
- **Parents**: Parents drop off children and pick them up; they do not stay during the event.
- **Requirements**: Children must be registered by a legal guardian via this web application.

Behavior:
- Answer concisely.
- Be enthusiastic!
- Detect the language of the user's question (Spanish, English, or Portuguese) and reply in the same language.
- If asked about the cost, clearly state it is 20€ and mention that it includes the t-shirt, materials, and snacks.
- If asked about something not listed here, politely say you don't have that information and suggest contacting the church administration.
`;

export const ChatBot: React.FC<ChatBotProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Ref to store the chat session
  const chatSessionRef = useRef<any>(null);

  // Initialize chat session
  useEffect(() => {
    try {
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });
      }
    } catch (e) {
      console.error("Failed to initialize AI", e);
    }
  }, []);

  // Initial welcome message based on language
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeTexts = {
        es: "¡Hola! 🤖 Soy el asistente inteligente de la EBV. Pregúntame sobre fechas, grupos o lo que necesites.",
        en: "Hello! 🤖 I'm the VBS smart assistant. Ask me about dates, groups, or anything you need.",
        pt: "Olá! 🤖 Sou o assistente inteligente da EBF. Pergunte-me sobre datas, grupos ou o que precisar."
      };
      
      setMessages([
        {
          id: 'welcome',
          text: welcomeTexts[language],
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasOpened(true);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = "";
      
      if (chatSessionRef.current) {
        const result = await chatSessionRef.current.sendMessage({ message: userText });
        responseText = result.text;
      } else {
        // Fallback simulation if no API key is present (for demo purposes)
        await new Promise(r => setTimeout(r, 1000));
        responseText = "Lo siento, no puedo conectar con mi cerebro de IA en este momento (Falta API Key). Pero recuerda: ¡La EBV es del 13 al 17 de Julio, cuesta 20€ e incluye todo!";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'es' ? "Lo siento, tuve un error de conexión." : "Sorry, connection error.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className={`
          fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110
          ${isOpen ? 'bg-slate-700 rotate-90' : 'bg-violet-600 hover:bg-violet-500'}
          text-white flex items-center justify-center
        `}
        aria-label="Chat with AI"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        
        {/* Notification dot */}
        {!hasOpened && !isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce"></span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[90vw] md:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden font-sans">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white flex items-center gap-3 shadow-md">
            <div className="bg-white/20 p-2 rounded-full relative">
              <Bot size={24} />
              <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Asistente IA</h3>
              <p className="text-xs text-violet-200">Powered by Gemini</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.sender === 'user' 
                      ? 'bg-violet-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'}
                  `}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-[10px] block mt-1 ${msg.sender === 'user' ? 'text-violet-200' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-violet-500" />
                  <span className="text-xs text-slate-500 font-medium">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'en' ? "Ask something..." : language === 'pt' ? "Pergunte algo..." : "Pregunta algo..."}
              className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-violet-600 text-white p-3 rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors shadow-sm"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
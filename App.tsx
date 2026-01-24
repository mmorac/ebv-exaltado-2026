import React, { useState } from 'react';
import { RegistrationForm } from './components/RegistrationForm';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatBot } from './components/Chatbot';
import { Language } from './types';
import { ShieldCheck, LockKeyhole } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('es');
  const [view, setView] = useState<'form' | 'success' | 'admin'>('form');

  const handleSuccess = () => {
    setView('success');
  };

  const handleBack = () => {
    setView('form');
  };

  if (view === 'admin') {
    return <AdminDashboard onLogout={() => setView('form')} />;
  }

  if (view === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4 border-t-8 border-violet-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {language === 'es' ? '¡Registro Completado!' : language === 'en' ? 'Registration Complete!' : 'Registro Concluído!'}
          </h2>
          <p className="text-slate-600">
            {language === 'es' 
              ? 'Hemos enviado un SMS de confirmación. ¡Nos vemos pronto!' 
              : language === 'en' 
              ? 'We have sent a confirmation SMS. See you soon!' 
              : 'Enviamos um SMS de confirmação. Até breve!'}
          </p>
          <button 
            onClick={handleBack}
            className="mt-6 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors"
          >
            {language === 'es' ? 'Volver al inicio' : language === 'en' ? 'Back to home' : 'Voltar ao início'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-slate-100 relative">
      {/* Botón de acceso Admin (Discreto) */}
      <button 
        onClick={() => setView('admin')}
        className="fixed top-4 right-4 z-50 p-2 text-slate-300 hover:text-slate-600 transition-colors rounded-full hover:bg-white/50 backdrop-blur-sm"
        title="Acceso Admin"
      >
        <LockKeyhole size={16} />
      </button>

      <RegistrationForm 
        onBack={() => console.log('Back clicked')} 
        onSuccess={handleSuccess}
        language={language}
        setLanguage={setLanguage}
      />
      <ChatBot language={language} />
    </div>
  );
}
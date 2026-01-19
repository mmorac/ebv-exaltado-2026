import React, { useState, useEffect } from 'react';
import { AppView, AgeGroup, Language } from './types';
import { Button } from './components/Button';
import { RegistrationForm } from './components/RegistrationForm';
import { Chatbot } from './components/Chatbot';
import { AdminDashboard } from './components/AdminDashboard';
import { Countdown } from './components/Countdown';
import { getSpotsLeft } from './services/registrationService';
import { Calendar, MapPin, Search, Bug, Smile, CheckCircle2, Ticket, Lock, Shirt, Palette, Cookie, Mail, Phone } from 'lucide-react';

const homeTranslations = {
  es: {
    nav_home: "Inicio",
    nav_details: "Detalles",
    nav_register: "¡Inscríbete!",
    badge_dates: "13 - 17 DE JULIO, 2026",
    badge_price: "¡SOLO 20",
    hero_title: "¡EXALTADO!",
    hero_slogan: "Descubramos la grandeza de Dios en las cosas pequeñas.",
    hero_verse: "Salmo 34:3",
    hero_includes_label: "Tu inscripción incluye:",
    hero_cta: "¡Inscríbete!",
    info_when_title: "¿Cuándo?",
    info_when_text: "Del 13 al 17 de Julio\nde 2026.",
    info_groups_title: "Grupos",
    info_bichitos: "Bichitos",
    info_escarabajos: "Escarabajos",
    info_escorpiones: "Escorpiones",
    info_reg_title: "Inscripción",
    info_reg_includes: "Incluye todo:",
    info_reg_shirt: "Camiseta",
    info_reg_materials: "Materiales",
    info_reg_snack: "Merienda",
    banner_title: "¡No dejes que se lo pierdan!",
    banner_cta: "¡Inscríbete!",
    footer_desc: "Escuela Bíblica de Verano 2026. Un tiempo para aprender, jugar y crecer descubriendo a Dios.",
    footer_loc_title: "Ubicación",
    footer_contact_title: "Contacto",
    success_title: "¡Inscripción Exitosa!",
    success_msg: "Hemos registrado los datos correctamente y enviado un SMS de confirmación.",
    success_see_you: "¡Nos vemos en",
    success_btn_home: "Volver al Inicio",
    success_btn_another: "Inscribir a otro niño",
    spots_free: "libres",
    spots_full: "Lleno",
    countdown_label: "CIERRE DE INSCRIPCIONES",
    countdown_days: "DÍAS",
    countdown_hours: "HRS",
    countdown_minutes: "MIN",
    countdown_seconds: "SEG"
  },
  en: {
    nav_home: "Home",
    nav_details: "Details",
    nav_register: "Sign Up!",
    badge_dates: "JULY 13 - 17, 2026",
    badge_price: "ONLY 20",
    hero_title: "MAGNIFIED!",
    hero_slogan: "Let's discover God's greatness in small things.",
    hero_verse: "Psalm 34:3",
    hero_includes_label: "Registration includes:",
    hero_cta: "Sign Up!",
    info_when_title: "When?",
    info_when_text: "July 13th to 17th\n2026.",
    info_groups_title: "Groups",
    info_bichitos: "Bugs",
    info_escarabajos: "Beetles",
    info_escorpiones: "Scorpions",
    info_reg_title: "Registration",
    info_reg_includes: "Includes everything:",
    info_reg_shirt: "T-Shirt",
    info_reg_materials: "Materials",
    info_reg_snack: "Snack",
    banner_title: "Don't let them miss out!",
    banner_cta: "Sign Up!",
    footer_desc: "Summer Bible School 2026. A time to learn, play, and grow discovering God.",
    footer_loc_title: "Location",
    footer_contact_title: "Contact",
    success_title: "Registration Successful!",
    success_msg: "We have registered the data and sent a confirmation SMS.",
    success_see_you: "See you at",
    success_btn_home: "Back to Home",
    success_btn_another: "Register another child",
    spots_free: "left",
    spots_full: "Full",
    countdown_label: "REGISTRATION CLOSES IN",
    countdown_days: "DAYS",
    countdown_hours: "HRS",
    countdown_minutes: "MIN",
    countdown_seconds: "SEC"
  },
  pt: {
    nav_home: "Início",
    nav_details: "Detalhes",
    nav_register: "Inscreva-se!",
    badge_dates: "13 - 17 DE JULHO, 2026",
    badge_price: "SÓ 20",
    hero_title: "EXALTADO!",
    hero_slogan: "Vamos descobrir a grandeza de Deus nas pequenas coisas.",
    hero_verse: "Salmos 34:3",
    hero_includes_label: "A inscrição inclui:",
    hero_cta: "Inscreva-se!",
    info_when_title: "Quando?",
    info_when_text: "De 13 a 17 de Julho\nde 2026.",
    info_groups_title: "Grupos",
    info_bichitos: "Bichinhos",
    info_escarabajos: "Besouros",
    info_escorpiones: "Escorpiões",
    info_reg_title: "Inscrição",
    info_reg_includes: "Inclui tudo:",
    info_reg_shirt: "Camiseta",
    info_reg_materials: "Materiais",
    info_reg_snack: "Lanche",
    banner_title: "Não deixe que eles percam!",
    banner_cta: "Inscreva-se!",
    footer_desc: "Escola Bíblica de Verão 2026. Um tempo para aprender, brincar e crescer descobrindo a Deus.",
    footer_loc_title: "Localização",
    footer_contact_title: "Contato",
    success_title: "Inscrição com Sucesso!",
    success_msg: "Registramos os dados e enviamos um SMS de confirmação.",
    success_see_you: "Nos vemos no",
    success_btn_home: "Voltar ao Início",
    success_btn_another: "Inscrever outra criança",
    spots_free: "livres",
    spots_full: "Lotado",
    countdown_label: "ENCERRAMENTO DAS INSCRIÇÕES",
    countdown_days: "DIAS",
    countdown_hours: "HRS",
    countdown_minutes: "MIN",
    countdown_seconds: "SEG"
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [language, setLanguage] = useState<Language>('es');
  const [spots, setSpots] = useState<Record<AgeGroup, number>>({
    'Bichitos': 15,
    'Escarabajos': 15,
    'Escorpiones': 15
  });

  const t = homeTranslations[language];

  useEffect(() => {
    if (view === AppView.HOME) {
      setSpots(getSpotsLeft());
    }
  }, [view]);

  const handleRegisterClick = () => {
    setView(AppView.REGISTER);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegistrationSuccess = () => {
    setView(AppView.SUCCESS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setView(AppView.HOME);
    setTimeout(() => {
      const element = document.getElementById('info');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: 'url("background.png")',
        backgroundColor: '#4c1d95' 
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b from-violet-900/30 via-white/20 to-sky-900/30 fixed z-0 pointer-events-none ${view === AppView.ADMIN ? 'hidden' : ''}`}></div>

      {view !== AppView.ADMIN && (
        <nav className="sticky top-0 z-40 bg-violet-900/95 backdrop-blur-md border-b border-violet-700 shadow-lg relative transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20 md:h-24">
              <div 
                className="flex items-center gap-2 md:gap-3 cursor-pointer group" 
                onClick={() => setView(AppView.HOME)}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform border-2 border-white flex-shrink-0">
                  <Search size={20} className="md:w-[26px] md:h-[26px]" strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-3xl font-display text-white drop-shadow-md tracking-wide leading-none text-stroke">
                    {t.hero_title}
                  </span>
                  <span className="text-[10px] md:text-xs text-sky-300 font-bold tracking-widest uppercase">EBV 2026</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-6">
                <a href="#" onClick={(e) => { e.preventDefault(); setView(AppView.HOME); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-violet-200 hover:text-white font-bold transition-colors font-display tracking-wide text-xl hover:scale-105 transform">{t.nav_home}</a>
                <a href="#info" onClick={handleDetailsClick} className="text-violet-200 hover:text-white font-bold transition-colors font-display tracking-wide text-xl hover:scale-105 transform">{t.nav_details}</a>
                
                <div className="flex gap-4 mx-4 border-l border-violet-700 pl-6 items-center">
                    <button onClick={() => setLanguage('es')} className={`flex flex-col items-center group transition-transform duration-300 ${language === 'es' ? 'scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`} title="Español">
                        <span className={`font-display font-bold text-sm tracking-wider mb-1 ${language === 'es' ? 'text-white' : 'text-violet-200 group-hover:text-white'}`}>ES</span>
                        <img src="https://flagcdn.com/w40/es.png" alt="España" className="w-6 h-4 object-cover rounded shadow-sm border border-white/20" />
                    </button>
                    <button onClick={() => setLanguage('en')} className={`flex flex-col items-center group transition-transform duration-300 ${language === 'en' ? 'scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`} title="English (USA)">
                        <span className={`font-display font-bold text-sm tracking-wider mb-1 ${language === 'en' ? 'text-white' : 'text-violet-200 group-hover:text-white'}`}>EN</span>
                        <img src="https://flagcdn.com/w40/us.png" alt="USA" className="w-6 h-4 object-cover rounded shadow-sm border border-white/20" />
                    </button>
                    <button onClick={() => setLanguage('pt')} className={`flex flex-col items-center group transition-transform duration-300 ${language === 'pt' ? 'scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`} title="Português">
                        <span className={`font-display font-bold text-sm tracking-wider mb-1 ${language === 'pt' ? 'text-white' : 'text-violet-200 group-hover:text-white'}`}>PT</span>
                        <img src="https://flagcdn.com/w40/br.png" alt="Brasil" className="w-6 h-4 object-cover rounded shadow-sm border border-white/20" />
                    </button>
                </div>

                <Button 
                    variant="primary" 
                    onClick={handleRegisterClick}
                    className={`${view === AppView.REGISTER ? 'opacity-0 pointer-events-none' : 'opacity-100'} font-display tracking-wider border-2 border-white/20 px-5 py-2 text-base md:text-xl md:px-8 md:py-3 shadow-lg hover:scale-105 active:scale-95 transition-all`}
                >
                    <span className="drop-shadow-sm">{t.nav_register}</span>
                </Button>
              </div>

              <div className="flex md:hidden gap-3 items-center mr-2">
                 <button onClick={() => setLanguage('es')} className={`flex flex-col items-center ${language === 'es' ? '' : 'opacity-60'}`}>
                    <span className="text-[10px] text-white font-bold mb-0.5">ES</span>
                    <img src="https://flagcdn.com/w20/es.png" alt="ES" className="w-5 h-3 object-cover rounded-sm" />
                 </button>
                 <button onClick={() => setLanguage('en')} className={`flex flex-col items-center ${language === 'en' ? '' : 'opacity-60'}`}>
                    <span className="text-[10px] text-white font-bold mb-0.5">EN</span>
                    <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 h-3 object-cover rounded-sm" />
                 </button>
                 <button onClick={() => setLanguage('pt')} className={`flex flex-col items-center ${language === 'pt' ? '' : 'opacity-60'}`}>
                    <span className="text-[10px] text-white font-bold mb-0.5">PT</span>
                    <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-5 h-3 object-cover rounded-sm" />
                 </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-grow relative z-10">
        
        {view === AppView.HOME && (
          <>
            <div className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center py-12 md:py-20">
               
               <div className="relative z-10 max-w-6xl mx-auto text-center px-4 w-full">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="inline-block bg-amber-400 text-violet-900 px-6 py-2 md:px-8 md:py-3 rounded-full shadow-[0_4px_0_rgb(180,83,9)] border-4 border-white transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                      <span className="font-display tracking-widest text-lg md:text-2xl font-black whitespace-nowrap">{t.badge_dates}</span>
                    </div>
                    <div className="inline-block bg-sky-400 text-violet-900 px-6 py-2 md:px-8 md:py-3 rounded-full shadow-[0_4px_0_rgb(14,165,233)] border-4 border-white transform rotate-1 hover:rotate-0 transition-transform duration-300 delay-100">
                      <span className="font-display tracking-widest text-lg md:text-2xl font-black flex items-center">
                        {t.badge_price}
                        <span className="text-xl md:text-2xl ml-1 font-sans font-bold">€</span>
                        <span>!</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* HERO TITLE - Removed animations to guarantee visibility */}
                  <div className="mb-2 relative z-20 mt-8 mb-4">
                      <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-display tracking-wide leading-none stroke-black text-stroke text-stroke-lg text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] md:drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-300"
                          style={{ textShadow: '4px 4px 0px #0ea5e9, 8px 8px 0px #4c1d95' }}>
                        {t.hero_title}
                      </h1>
                  </div>

                  {/* COUNTDOWN - Cleaned of animations and z-index issues */}
                  <div className="mt-8 mb-6 relative z-50 flex flex-col items-center">
                     <p className="text-white bg-violet-900/70 backdrop-blur-sm inline-block px-4 py-1 rounded-full font-black tracking-[0.2em] text-sm md:text-base uppercase drop-shadow-md border border-white/30">
                        {t.countdown_label}
                     </p>
                     
                     <div className="mt-3 w-full flex justify-center">
                        <Countdown 
                            targetDate="2026-07-01T00:00:00+02:00" 
                            labels={{
                                days: t.countdown_days,
                                hours: t.countdown_hours,
                                minutes: t.countdown_minutes,
                                seconds: t.countdown_seconds
                            }}
                        />
                     </div>
                  </div>
                  
                  <div className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl max-w-4xl mx-auto mb-8 md:mb-12 border-b-[12px] border-sky-500 mt-4 relative overflow-visible z-10 animate-fade-up">
                    <p className="text-2xl md:text-4xl font-display text-violet-900 leading-tight">
                      {t.hero_slogan}
                    </p>
                    <div className="flex justify-center items-center gap-2 mt-4 mb-6">
                      <div className="h-1.5 w-8 md:w-16 bg-amber-400 rounded-full"></div>
                      <span className="text-sky-600 font-display text-xl md:text-3xl tracking-wide">{t.hero_verse}</span>
                      <div className="h-1.5 w-8 md:w-16 bg-amber-400 rounded-full"></div>
                    </div>

                    {/* New "Included" 3D Badges */}
                    <div className="relative pt-6 border-t-2 border-slate-100">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs md:text-sm mb-6">{t.hero_includes_label}</p>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                            {/* Shirt Badge */}
                            <div className="flex flex-col items-center gap-2 group transform hover:-translate-y-2 transition-all duration-300">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-[0_8px_0_rgb(6,95,70)] border-4 border-white flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform">
                                    <Shirt size={40} className="text-white drop-shadow-md md:w-12 md:h-12" strokeWidth={2.5} />
                                </div>
                                <span className="font-display text-emerald-700 text-lg md:text-xl tracking-wide">{t.info_reg_shirt}</span>
                            </div>

                             {/* Materials Badge */}
                             <div className="flex flex-col items-center gap-2 group transform hover:-translate-y-2 transition-all duration-300 delay-75">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-[0_8px_0_rgb(159,18,57)] border-4 border-white flex items-center justify-center rotate-2 group-hover:rotate-0 transition-transform">
                                    <Palette size={40} className="text-white drop-shadow-md md:w-12 md:h-12" strokeWidth={2.5} />
                                </div>
                                <span className="font-display text-rose-700 text-lg md:text-xl tracking-wide">{t.info_reg_materials}</span>
                            </div>

                             {/* Snack Badge */}
                             <div className="flex flex-col items-center gap-2 group transform hover:-translate-y-2 transition-all duration-300 delay-150">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-[0_8px_0_rgb(154,52,18)] border-4 border-white flex items-center justify-center -rotate-2 group-hover:rotate-0 transition-transform">
                                    <Cookie size={40} className="text-white drop-shadow-md md:w-12 md:h-12" strokeWidth={2.5} />
                                </div>
                                <span className="font-display text-amber-700 text-lg md:text-xl tracking-wide">{t.info_reg_snack}</span>
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 animate-fade-up">
                    <Button onClick={handleRegisterClick} className="text-2xl md:text-4xl px-10 py-5 md:px-16 md:py-8 bg-sky-500 hover:bg-sky-400 text-white shadow-[0_6px_0_rgb(14,165,233)] md:shadow-[0_8px_0_rgb(14,165,233)] hover:shadow-[0_4px_0_rgb(14,165,233)] hover:translate-y-[4px] font-display border-[5px] border-white tracking-widest rounded-2xl w-full sm:w-auto transform hover:scale-105 transition-all">
                      {t.hero_cta}
                    </Button>
                  </div>
               </div>
            </div>

            <div id="info" className="py-16 md:py-24 bg-violet-900/10 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                  {/* Card 1: When */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl border-b-8 border-sky-500 hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 mb-6 mx-auto shadow-inner border-4 border-sky-50">
                      <Calendar size={40} className="md:w-12 md:h-12" strokeWidth={3} />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display text-center mb-4 text-violet-900">{t.info_when_title}</h3>
                    <p className="text-center text-slate-600 font-bold text-lg md:text-xl leading-relaxed whitespace-pre-line">
                      {t.info_when_text}
                      <br/>
                      <span className="text-sky-600 font-black block mt-2 text-xl md:text-2xl font-display tracking-wide">10:00 - 14:00</span>
                    </p>
                  </div>

                  {/* Card 2: Groups */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl border-b-8 border-violet-500 hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 mb-6 mx-auto shadow-inner border-4 border-violet-50">
                      <Smile size={40} className="md:w-12 md:h-12" strokeWidth={3} />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display text-center mb-6 text-violet-900">{t.info_groups_title}</h3>
                    
                    <ul className="space-y-3 md:space-y-4">
                      <li className="flex justify-between items-center bg-sky-50 p-3 rounded-xl border border-sky-100">
                        <span className="text-sky-800 font-black text-base md:text-lg flex items-center gap-2">🐞 {t.info_bichitos} <span className="text-xs md:text-sm opacity-75 font-bold">(4-6)</span></span>
                        <span className={`text-[10px] md:text-xs px-2 md:px-3 py-1.5 rounded-full font-black uppercase ${spots.Bichitos > 0 ? 'bg-sky-200 text-sky-800' : 'bg-red-200 text-red-800'}`}>
                          {spots.Bichitos > 0 ? `${spots.Bichitos} ${t.spots_free}` : t.spots_full}
                        </span>
                      </li>
                      <li className="flex justify-between items-center bg-violet-50 p-3 rounded-xl border border-violet-100">
                        <span className="text-violet-800 font-black text-base md:text-lg flex items-center gap-2">🪲 {t.info_escarabajos} <span className="text-xs md:text-sm opacity-75 font-bold">(7-9)</span></span>
                        <span className={`text-[10px] md:text-xs px-2 md:px-3 py-1.5 rounded-full font-black uppercase ${spots.Escarabajos > 0 ? 'bg-violet-200 text-violet-800' : 'bg-red-200 text-red-800'}`}>
                          {spots.Escarabajos > 0 ? `${spots.Escarabajos} ${t.spots_free}` : t.spots_full}
                        </span>
                      </li>
                      <li className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <span className="text-amber-800 font-black text-base md:text-lg flex items-center gap-2">🦂 {t.info_escorpiones} <span className="text-xs md:text-sm opacity-75 font-bold">(10-12)</span></span>
                        <span className={`text-[10px] md:text-xs px-2 md:px-3 py-1.5 rounded-full font-black uppercase ${spots.Escorpiones > 0 ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'}`}>
                          {spots.Escorpiones > 0 ? `${spots.Escorpiones} ${t.spots_free}` : t.spots_full}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Card 3: Registration */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl border-b-8 border-amber-400 hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6 mx-auto shadow-inner border-4 border-amber-50">
                      <Ticket size={40} className="md:w-12 md:h-12" strokeWidth={3} />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display text-center mb-4 text-violet-900">{t.info_reg_title}</h3>
                    <div className="text-center">
                       <span className="block text-4xl md:text-5xl font-display text-sky-500 mb-2 drop-shadow-sm">20€</span>
                       <p className="text-slate-600 font-bold text-base md:text-lg mb-4">{t.info_reg_includes}</p>
                       <div className="inline-flex flex-wrap justify-center gap-2">
                          <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs md:text-sm font-black flex items-center gap-1 border border-emerald-200"><Shirt size={14}/> {t.info_reg_shirt}</span>
                          <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs md:text-sm font-black flex items-center gap-1 border border-rose-200"><Palette size={14}/> {t.info_reg_materials}</span>
                          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs md:text-sm font-black flex items-center gap-1 border border-amber-200"><Cookie size={14}/> {t.info_reg_snack}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="mt-16 md:mt-24 bg-violet-800 rounded-3xl md:rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl border-4 md:border-8 border-white/20">
                  <div className="relative z-10">
                    <h2 className="text-4xl md:text-7xl font-display text-white mb-6 md:mb-8 drop-shadow-lg text-stroke">
                      {t.banner_title}
                    </h2>
                    <Button variant="primary" onClick={handleRegisterClick} className="text-xl md:text-2xl border-none font-display py-4 md:py-6 px-8 md:px-12 shadow-[0_4px_0_rgb(180,83,9)] md:shadow-[0_6px_0_rgb(180,83,9)] hover:shadow-[0_4px_0_rgb(180,83,9)] hover:translate-y-[2px] w-full sm:w-auto mx-auto">
                      {t.banner_cta}
                    </Button>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-sky-500 mix-blend-multiply opacity-50 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-56 h-56 md:w-80 md:h-80 bg-amber-500 mix-blend-multiply opacity-50 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl"></div>
                </div>
              </div>
            </div>
          </>
        )}

        {view === AppView.REGISTER && (
          <div className="min-h-screen px-4 py-8 md:py-12 bg-white/80 backdrop-blur-md">
            <RegistrationForm 
              onBack={() => setView(AppView.HOME)} 
              onSuccess={handleRegistrationSuccess}
              language={language}
              setLanguage={setLanguage}
            />
          </div>
        )}

        {view === AppView.SUCCESS && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center bg-white/80 backdrop-blur-md">
             <div className="bg-white p-8 md:p-12 rounded-3xl md:rounded-[3rem] shadow-2xl max-w-lg mx-auto border-4 md:border-8 border-sky-100">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-sky-100 rounded-full flex items-center justify-center text-sky-500 mb-6 md:mb-8 animate-in zoom-in duration-500 mx-auto border-4 border-white shadow-lg">
                  <CheckCircle2 size={48} className="md:w-16 md:h-16" strokeWidth={3} />
                </div>
                <h2 className="text-4xl md:text-6xl font-display text-violet-900 mb-4 md:mb-6">{t.success_title}</h2>
                <p className="text-lg md:text-xl text-slate-600 mb-8 md:mb-10 font-bold leading-relaxed">
                  {t.success_msg} <br/>{t.success_see_you} <span className="font-display text-sky-600 text-2xl">{t.hero_title}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => setView(AppView.HOME)} variant="outline" className="font-display text-base md:text-lg">
                    {t.success_btn_home}
                  </Button>
                  <Button onClick={() => setView(AppView.REGISTER)} variant="primary" className="font-display text-base md:text-lg">
                    {t.success_btn_another}
                  </Button>
                </div>
            </div>
          </div>
        )}

        {view === AppView.ADMIN && (
          <AdminDashboard onBack={() => setView(AppView.HOME)} />
        )}

      </main>

      {view !== AppView.ADMIN && (
        <footer className="bg-violet-950 text-violet-200 py-12 md:py-20 relative z-10 border-t-[10px] border-sky-500">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-10 md:gap-12">
            
            {/* Col 1 */}
            <div className="flex flex-col items-center text-center">
              <h4 className="text-white font-display text-3xl md:text-4xl mb-4 md:mb-6 flex items-center justify-center gap-3 text-stroke-sm drop-shadow-md">
                <Search className="text-sky-400 drop-shadow-sm" strokeWidth={4} size={32} /> {t.hero_title}
              </h4>
              <p className="text-lg font-medium leading-relaxed text-violet-200/90 max-w-xs">
                {t.footer_desc}
              </p>
            </div>
            
            {/* Col 2 */}
            <div className="flex flex-col items-center text-center w-full px-4 md:px-0">
              <h4 className="text-white font-display text-2xl md:text-3xl mb-4 md:mb-6 tracking-wide">{t.footer_loc_title}</h4>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Iglesia+Bautista+Más+Vida+Calle+Sahagún+28+Alcorcón" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 bg-violet-900 rounded-full flex items-center justify-center border-2 border-violet-700 group-hover:border-sky-400 group-hover:bg-sky-500 transition-all duration-300 shadow-lg">
                    <MapPin size={24} className="text-sky-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-lg font-medium text-violet-200 group-hover:text-white transition-colors leading-relaxed">
                  Iglesia Bautista Más Vida<br/>
                  Calle Sahagún 28, 28925<br/>
                  Alcorcón, Madrid
                </span>
              </a>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col items-center text-center">
              <h4 className="text-white font-display text-2xl md:text-3xl mb-4 md:mb-6 tracking-wide">{t.footer_contact_title}</h4>
              <div className="flex flex-col gap-4">
                 <a href="mailto:iglesiabautistamasvida@gmail.com" className="text-lg font-medium text-violet-200 hover:text-sky-400 transition-colors flex items-center gap-2">
                    <Mail size={20} className="text-sky-500" /> iglesiabautistamasvida@gmail.com
                 </a>
                 <a href="tel:622792097" className="inline-flex items-center justify-center gap-2 bg-violet-900 border-2 border-violet-800 hover:border-sky-500 hover:bg-sky-500 text-white px-8 py-3 rounded-full transition-all duration-300 font-bold shadow-md mx-auto group">
                    <Phone size={20} className="group-hover:animate-bounce" /> 622 792 097
                 </a>
              </div>
            </div>

          </div>
          <div className="mt-12 md:mt-20 text-center text-sm md:text-base border-t border-violet-800 pt-8 font-black tracking-wider opacity-60 flex justify-between items-center px-4 max-w-7xl mx-auto">
            <span>© 2026 EBV {language === 'en' ? 'MAGNIFIED' : 'EXALTADO'}.</span>
            <button onClick={() => setView(AppView.ADMIN)} className="text-violet-800 hover:text-violet-500 transition-colors p-2">
              <Lock size={16} />
            </button>
          </div>
        </footer>
      )}

      {view !== AppView.ADMIN && <Chatbot />}

    </div>
  );
};

export default App;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GuardianInfo, ChildInput, AgeGroup, Language } from '../types';
import { Button } from './Button';
import { Check, ChevronLeft, ChevronDown, AlertCircle, ShieldCheck, Loader2, Plus, Trash2, User, Phone, Utensils, Calendar, Ticket, Shirt, Palette, Cookie, Smile, MapPin, Sparkles, Droplet, Search, Camera, Mail, ExternalLink, Clock } from 'lucide-react';
import { calculateAge, determineGroup, getSpotsLeft, registerFamily, isDuplicate, GROUP_CONFIG } from '../services/registrationService';
import { sendConfirmationSMS } from '../services/smsService';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

// Tipos para códigos de teléfono
interface PhoneCode {
  code: string;
  country: string;
  flag: string;
}

// Datos de códigos telefónicos internacionales
const PHONE_CODES: PhoneCode[] = [
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+1', country: 'EE.UU./Canadá', flag: '🇺🇸' },
  { code: '+33', country: 'Francia', flag: '🇫🇷' },
  { code: '+49', country: 'Alemania', flag: '🇩🇪' },
  { code: '+39', country: 'Italia', flag: '🇮🇹' },
  { code: '+7', country: 'Rusia', flag: '🇷🇺' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
];

const LEGAL_CONTENT = {
  es: {
    privacyTitle: "Política de Privacidad y Protección de Datos (Texto Completo)",
    privacyText: "RESPONSABLE DEL TRATAMIENTO: Iglesia Bautista Más Vida.\n\nFINALIDAD DEL TRATAMIENTO: Los datos personales facilitados a través del presente formulario serán tratados con la finalidad de gestionar la inscripción y participación del menor en la actividad, la gestión administrativa derivada de la misma, así como para mantener la comunicación con los padres o tutores legales sobre aspectos organizativos y de desarrollo del evento. Asimismo, se tratarán los datos de salud (alergias, medicación) por razones de interés público vital y seguridad del participante.\n\nLEGITIMACIÓN: La base legal para el tratamiento de sus datos es la ejecución de la solicitud de inscripción y el consentimiento expreso otorgado para el tratamiento de datos de categorías especiales (salud).\n\nCONSERVACIÓN DE LOS DATOS: Los datos proporcionados se conservarán durante el tiempo necesario para cumplir con la finalidad para la que se recaban y para determinar las posibles responsabilidades que se pudieran derivar de la finalidad, además de los períodos establecidos en la normativa de archivo y documentación.\n\nDESTINATARIOS: No se cederán datos a terceros salvo obligación legal o en caso de emergencia médica a los servicios sanitarios correspondientes.\n\nDERECHOS DE LOS INTERESADOS: Puede ejercer sus derechos de acceso, rectificación, supresión y portabilidad de sus datos, de limitación y oposición a su tratamiento, así como a no ser objeto de decisiones basadas únicamente en el tratamiento automatizado de sus datos, cuando procedan, ante la Iglesia Bautista Más Vida.",
  },
  en: {
    privacyTitle: "Privacy and Data Protection Policy (Full Text)",
    privacyText: "DATA CONTROLLER: Iglesia Bautista Más Vida.\n\nPURPOSE OF PROCESSING: Personal data provided in this form will be processed for the purpose of managing the minor's registration and participation in the activity, derived administrative management, and to maintain communication with parents or legal guardians regarding organizational and developmental aspects of the event. Furthermore, health data (allergies, medication) will be processed for reasons of vital public interest and participant safety.\n\nLEGAL BASIS: The legal basis for processing your data is the execution of the registration request and the express consent granted for processing special category data (health).\n\nDATA RETENTION: Provided data will be kept for the time necessary to fulfill the purpose for which they are collected and to determine possible liabilities that may arise from said purpose, in addition to periods established in archiving and documentation regulations.\n\nRECIPIENTS: Data will not be shared with third parties unless legally required or in case of medical emergency to corresponding health services.\n\nDATA SUBJECT RIGHTS: You may exercise your rights of access, rectification, deletion, and portability of your data, of limitation and opposition to their processing, as well as not being subject to decisions based solely on automated processing of your data, where applicable, before Iglesia Bautista Más Vida.",
  },
  pt: {
    privacyTitle: "Política de Privacidade e Proteção de Dados (Texto Completo)",
    privacyText: "RESPONSÁVEL PELO TRATAMENTO: Iglesia Bautista Más Vida.\n\nFINALIDADE DO TRATAMENTO: Os dados pessoais fornecidos neste formulário serão tratados com a finalidade de gerir a inscrição e participação do menor na atividade, a gestão administrativa derivada da mesma, bem como para manter a comunicação com os pais ou tutores legais sobre aspetos organizacionais e de desenvolvimento do evento. Além disso, serão tratados dados de saúde (alergias, medicação) por razões de interesse público vital e segurança do participante.\n\nLEGITIMAÇÃO: A base legal para o tratamento dos seus dados é a execução do pedido de inscrição e o consentimento expresso outorgado para o tratamento de dados de categorias especiais (saúde).\n\nCONSERVAÇÃO DOS DADOS: Os dados fornecidos serão conservados durante o tempo necessário para cumprir com a finalidade para a qual são recolhidos e para determinar as possíveis responsabilidades que se possam derivar da referida finalidade, além dos períodos estabelecidos na normativa de arquivo e documentação.\n\nDESTINATÁRIOS: Não serão cedidos dados a terceiros salvo obrigação legal ou em caso de emergência médica aos serviços sanitários correspondentes.\n\nDIREITOS DOS INTERESSADOS: Pode exercer os seus direitos de acesso, retificação, supressão e portabilidade dos seus dados, de limitação e oposição ao seu tratamento, bem como a não ser objeto de decisões baseadas unicamente no tratamento automatizado dos seus dados, quando procedam, perante a Iglesia Bautista Más Vida.",
  }
};

const IMAGE_RIGHTS_TEXT = {
  es: {
    title: "Derechos de Imagen del Menor:",
    subtitle: "En cumplimiento de la Ley Orgánica 1/1982 sobre el derecho al honor y la propia imagen.",
    option1: "1. Autorizo la captación y uso de imágenes/video del menor para uso interno de la iglesia (recuerdos, proyecciones durante el evento, resúmenes pedagógicos).",
    option2: "2. Autorizo el uso de imágenes/video del menor en medios públicos de la iglesia (página web, redes sociales, folletos impresos) con fines exclusivamente informativos y de promoción de las actividades.",
    yes: "Sí, autorizo",
    no: "No autorizo"
  },
  en: {
    title: "Minor's Image Rights:",
    subtitle: "In compliance with Organic Law 1/1982 on the right to honor and own image.",
    option1: "1. I authorize the capture and use of images/video of the minor for internal church use (memories, projections during the event, pedagogical summaries).",
    option2: "2. I authorize the use of images/video of the minor in public church media (website, social networks, printed brochures) for exclusively informational and promotional purposes.",
    yes: "Yes, I authorize",
    no: "I do not authorize"
  },
  pt: {
    title: "Direitos de Imagem do Menor:",
    subtitle: "Em cumprimento da Lei Orgânica 1/1982 sobre o direito à honra e à própria imagem.",
    option1: "1. Autorizo a captação e uso de imagens/vídeo do menor para uso interno da igreja (memórias, projeções durante o evento, resumos pedagógicos).",
    option2: "2. Autorizo o uso de imagens/vídeo do menor em meios públicos da igreja (site, redes sociais, folhetos impressos) com fins exclusivamente informativos e de promoção das atividades.",
    yes: "Sim, autorizo",
    no: "Não autorizo"
  }
};

// Common Allergies Data
const ALLERGY_OPTIONS = {
  es: ["Ninguna", "Gluten", "Lactosa", "Frutos Secos", "Huevo", "Marisco"],
  en: ["None", "Gluten", "Lactose", "Nuts", "Egg", "Seafood"],
  pt: ["Nenhuma", "Glúten", "Lactose", "Frutos Secos", "Ovo", "Marisco"]
};

// Utilidad de normalización (Senior Logic)
const normalizeText = (text: string): string => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// Componente para el contador regresivo
const CountdownTimer = ({ language }: { language: Language }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Fecha objetivo: 13 de Julio de 2026 (Mes es base 0, por lo tanto Julio es 6)
    const targetDate = new Date(2026, 6, 13); 
    const targetTime = targetDate.getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const translations = {
    es: { title: 'Comienza en:', days: 'días', hours: 'horas', minutes: 'min', seconds: 'seg' },
    en: { title: 'Starts in:', days: 'days', hours: 'hours', minutes: 'min', seconds: 'sec' },
    pt: { title: 'Começa em:', days: 'dias', hours: 'horas', minutes: 'min', seconds: 'seg' }
  };

  const t = translations[language];

  return (
    <div className="bg-white/10 backdrop-blur-md text-white p-6 rounded-[2rem] border border-white/20 shadow-2xl relative overflow-hidden group transform hover:scale-[1.02] transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50"></div>
      
      <h3 className="text-center text-sm md:text-base uppercase tracking-[0.2em] font-black mb-5 text-brand-50 drop-shadow-sm flex items-center justify-center gap-2">
         <Clock size={16} className="text-amber-300 animate-pulse" /> {t.title}
      </h3>
      
      <div className="flex justify-center gap-3 md:gap-4 relative z-10">
        {[
          { val: timeLeft.days, label: t.days },
          { val: timeLeft.hours, label: t.hours },
          { val: timeLeft.minutes, label: t.minutes },
          { val: timeLeft.seconds, label: t.seconds }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2 group/item">
            <div className="bg-white text-brand-700 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-b-4 border-brand-200 relative overflow-hidden transition-all duration-300 group-hover/item:-translate-y-1">
              <span className="text-3xl md:text-4xl font-display font-black relative z-10 tracking-tight">{item.val.toString().padStart(2, '0')}</span>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
              {/* Glossy shine */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-gradient-to-br from-white/80 to-transparent rounded-full blur-xl pointer-events-none opacity-60"></div>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest bg-black/10 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/5">
                {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de Información del Evento (Rediseñado)
const EventInfoSection = ({ language, spotsLeft }: { language: Language, spotsLeft: Record<AgeGroup, number> }) => {
  const t = {
    es: {
      whenTitle: "¿CUÁNDO?",
      date: "13 - 17 Julio '26",
      time: "10:00 - 14:00",
      groupsTitle: "GRUPOS",
      spots: "LIBRES",
      full: "AGOTADO",
      priceTitle: "INSCRIPCIÓN",
      price: "20€",
      includes: "Incluye todo:",
      items: { shirt: "Camiseta", materials: "Materiales", snack: "Merienda" }
    },
    en: {
      whenTitle: "WHEN?",
      date: "July 13 - 17, '26",
      time: "10:00 - 14:00",
      groupsTitle: "GROUPS",
      spots: "SPOTS",
      full: "FULL",
      priceTitle: "REGISTRATION",
      price: "20€",
      includes: "All inclusive:",
      items: { shirt: "T-Shirt", materials: "Materials", snack: "Snacks" }
    },
    pt: {
      whenTitle: "QUANDO?",
      date: "13 - 17 Julho '26",
      time: "10:00 - 14:00",
      groupsTitle: "GRUPOS",
      spots: "VAGAS",
      full: "ESGOTADO",
      priceTitle: "INSCRIÇÃO",
      price: "20€",
      includes: "Inclui tudo:",
      items: { shirt: "Camiseta", materials: "Materiais", snack: "Lanche" }
    }
  }[language];

  return (
    <div className="grid md:grid-cols-3 gap-6 p-6 md:p-8 -mt-8 relative z-10">
       {/* Card 1: When */}
       <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 text-center hover:scale-[1.02] transition-transform duration-300 border border-slate-100">
          <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto text-sky-600 mb-4 shadow-sm rotate-3">
            <Calendar size={32} strokeWidth={2.5} />
          </div>
          <h3 className="font-display font-black text-2xl text-slate-800 tracking-tight mb-2">{t.whenTitle}</h3>
          <p className="font-bold text-slate-500 text-lg leading-tight">{t.date}</p>
          <div className="mt-3 inline-block bg-sky-50 text-sky-600 font-black px-4 py-2 rounded-full text-lg">
            {t.time}
          </div>
       </div>

       {/* Card 2: Groups */}
       <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 text-center hover:scale-[1.02] transition-transform duration-300 border border-slate-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto text-brand-600 mb-4 shadow-sm -rotate-3">
             <Smile size={32} strokeWidth={2.5} />
          </div>
          <h3 className="font-display font-black text-2xl text-slate-800 tracking-tight mb-4">{t.groupsTitle}</h3>
          <div className="w-full space-y-2.5">
             {(['Bichitos', 'Escarabajos', 'Escorpiones'] as AgeGroup[]).map(group => {
                const config = GROUP_CONFIG[group];
                const ageRange = group === 'Bichitos' ? '(4-6)' : group === 'Escarabajos' ? '(7-9)' : '(10-12)';
                const isFull = spotsLeft[group] === 0;

                return (
                  <div key={group} className="bg-slate-50 rounded-xl p-2 flex justify-between items-center border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xl filter drop-shadow-sm">{config.icon}</span>
                        <div className="text-left">
                          <span className="font-bold text-slate-700 text-sm block leading-none">{group}</span>
                          <span className="text-[10px] font-bold text-slate-400">{ageRange}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg shadow-sm border ${isFull ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-800 border-slate-100'}`}>
                        {isFull ? t.full : `${spotsLeft[group]} ${t.spots}`}
                      </span>
                  </div>
                );
             })}
          </div>
       </div>

       {/* Card 3: Price */}
       <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 text-center hover:scale-[1.02] transition-transform duration-300 border border-slate-100">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-500 mb-4 shadow-sm rotate-3">
             <Ticket size={32} strokeWidth={2.5} />
          </div>
          <h3 className="font-display font-black text-2xl text-slate-800 tracking-tight mb-1">{t.priceTitle}</h3>
          <div className="text-5xl font-black text-amber-400 mb-3 tracking-tighter drop-shadow-sm rotate-2 inline-block">{t.price}</div>
          <p className="font-bold text-slate-400 text-xs uppercase tracking-wide mb-4">{t.includes}</p>
          <div className="flex justify-center gap-2">
             {[
               { icon: <Shirt size={18}/>, label: t.items.shirt, col: "bg-green-100 text-green-600" },
               { icon: <Palette size={18}/>, label: t.items.materials, col: "bg-pink-100 text-pink-600" },
               { icon: <Cookie size={18}/>, label: t.items.snack, col: "bg-orange-100 text-orange-600" }
             ].map((item, idx) => (
               <div key={idx} className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 ${item.col} rounded-xl flex items-center justify-center shadow-sm`}>{item.icon}</div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{item.label}</span>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}

// Componente de Dirección Inteligente Mejorado (Senior JS Logic + Normalización + Fallback)
const AddressAutocomplete = ({ 
  data, 
  onChange 
}: { 
  data: GuardianInfo, 
  onChange: (field: keyof GuardianInfo, value: any) => void 
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Nuevo estado para contexto geográfico
  const [biasLocation, setBiasLocation] = useState<{lat: string, lon: string} | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const STREET_TYPES = ['Calle', 'Avenida', 'Plaza', 'Camino', 'Carretera', 'Paseo', 'Travesía'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Detectar CP y rellenar Ciudad + Guardar Lat/Lon para contexto
  const handleCPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    
    onChange('postalCode', val);

    if (val.length === 5) {
      try {
        const res = await fetch(`https://api.zippopotam.us/es/${val}`);
        if (res.ok) {
          const json = await res.json();
          const place = json.places[0];
          onChange('city', place['place name']);
          onChange('province', place['state']);
          
          // Senior Logic: Guardar latitud/longitud para sesgar la búsqueda de Photon
          if (place.latitude && place.longitude) {
             setBiasLocation({ lat: place.latitude, lon: place.longitude });
          }
        }
      } catch (error) {
        console.error("CP Error", error);
      }
    } else {
        if (data.city) {
           onChange('city', '');
           onChange('province', '');
           setBiasLocation(null);
           onChange('address', ''); // Limpiar dirección si cambia el CP
        }
    }
  };

  // 2. Buscador de Calles con Lógica Avanzada
  const handleAddressInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    onChange('address', rawVal); // Permitir escritura libre siempre

    if (rawVal.length > 3 && data.city) {
      setIsLoading(true);
      setShowNoResults(false);
      try {
        // NORMALIZACIÓN: Eliminar tildes y caracteres especiales
        const normalizedInput = normalizeText(rawVal);
        const normalizedCity = normalizeText(data.city);
        const normalizedType = normalizeText(data.addressType);

        // INTENTO 1: Búsqueda estricta con contexto de ciudad
        // "calle julian camarillo, madrid"
        const strictQuery = `${normalizedType} ${normalizedInput}, ${normalizedCity}`;
        
        let apiUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(strictQuery)}&limit=5&lang=es`;
        
        // Inyectar bias geográfico si existe (Priorización por CP)
        if (biasLocation) {
            apiUrl += `&lat=${biasLocation.lat}&lon=${biasLocation.lon}`;
        }
        
        let res = await fetch(apiUrl);
        let json = await res.json();
        let features = json.features || [];
        
        // INTENTO 2 (FALLBACK): Búsqueda Fuzzy solo por nombre de calle + Proximidad
        // Si la búsqueda estricta falla (ej: error en nombre ciudad), buscamos solo la calle
        // pero FORZAMOS la cercanía a las coordenadas del CP.
        if (features.length === 0 && biasLocation) {
            console.log("Strict search failed, trying proximity fallback...");
            const fuzzyQuery = `${normalizedInput}`; // Solo la calle
            // Usamos las coordenadas para priorizar resultados cercanos al CP
            const fallbackUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(fuzzyQuery)}&limit=5&lang=es&lat=${biasLocation.lat}&lon=${biasLocation.lon}`;
            
            res = await fetch(fallbackUrl);
            json = await res.json();
            features = json.features || [];
        }

        setSuggestions(features);
        setShowSuggestions(true);
        
        // UX: Mostrar fallback visual solo si tras ambos intentos no hay nada
        if (features.length === 0) {
            setShowNoResults(true);
        }

      } catch (error) {
        console.error("Photon Error", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setShowNoResults(false);
    }
  };

  const handleSelect = (s: any) => {
      let cleanName = s.properties.name;
      
      // Senior Logic: Limpieza inteligente de prefijo
      // Comparamos versiones normalizadas para detectar duplicados tipo "Calle Calle..."
      const normalizedResultName = normalizeText(cleanName);
      const normalizedType = normalizeText(data.addressType);

      if (normalizedResultName.startsWith(normalizedType)) {
          // Si el resultado empieza por el tipo seleccionado (ej: "calle"), lo cortamos
          // Usamos una Regex insensible a mayúsculas/acentos basada en el input original
          // para preservar el formateo del resto del nombre devuelto por la API.
          const replaceRegex = new RegExp(`^${data.addressType}\\s*`, 'i'); 
          // Si la regex simple falla por tildes (ej: Type="Calle", Result="C/"), 
          // recurrimos a cortar por longitud si la normalización coincidió.
          if (replaceRegex.test(cleanName)) {
             cleanName = cleanName.replace(replaceRegex, '').trim();
          } else {
             // Fallback manual: cortar la longitud del tipo + espacio
             // Esto es arriesgado si la API devuelve abreviaturas, así que confiamos en la regex primero
             // o simplemente dejamos el nombre tal cual si la regex estricta no machea.
          }
      }

      const number = s.properties.housenumber ? `, ${s.properties.housenumber}` : '';
      onChange('address', cleanName + number);
      setShowSuggestions(false);
  };

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {/* Row 1: CP */}
      <div>
         <label className="block text-sm font-bold text-slate-600 mb-1.5 ml-1">Código Postal</label>
         <input 
           value={data.postalCode} 
           onChange={handleCPChange}
           maxLength={5}
           placeholder="Ej: 28001"
           className="w-full p-3 md:p-4 border rounded-2xl outline-none bg-slate-50 focus:bg-white border-slate-200 focus:ring-4 focus:ring-brand-100 transition-all font-medium text-slate-800"
         />
      </div>

      {/* Row 2: City & Province */}
      <div className="flex gap-4">
         <div className="flex-[2]">
            <label className="block text-sm font-bold text-slate-600 mb-1.5 ml-1">Población</label>
            <input 
              value={data.city} 
              readOnly 
              className="w-full p-3 md:p-4 border rounded-2xl bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
              placeholder="Se rellena solo..."
            />
         </div>
         <div className="flex-1">
            <label className="block text-sm font-bold text-slate-600 mb-1.5 ml-1">Provincia</label>
            <input 
               value={data.province} 
               readOnly 
               className="w-full p-3 md:p-4 border rounded-2xl bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
            />
         </div>
      </div>

      {/* Row 3: Address Type & Street */}
      <div>
         <label className="block text-sm font-bold text-slate-600 mb-1.5 ml-1">Dirección (Calle y Número)</label>
         <div className={`flex items-center w-full border rounded-2xl bg-slate-50 relative border-slate-200 focus-within:ring-4 focus-within:ring-brand-100 transition-all ${!data.city ? 'opacity-70' : ''}`}>
             <select 
                value={data.addressType}
                onChange={(e) => onChange('addressType', e.target.value)}
                disabled={!data.city}
                className="appearance-none bg-transparent py-3 md:py-4 pl-3 pr-8 font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 rounded-l-2xl border-r border-slate-200 disabled:cursor-not-allowed"
             >
                {STREET_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
             </select>
             <ChevronDown className="absolute left-[70px] md:left-[80px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />

             <input 
                value={data.address}
                onChange={handleAddressInput}
                disabled={!data.city} // Dependency: Locked until city exists
                placeholder={!data.city ? "Rellena el CP primero..." : "Empieza a escribir..."}
                className="flex-1 w-full p-3 md:p-4 outline-none bg-transparent font-medium text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                autoComplete="off"
             />
             
             {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin text-brand-500"/>
                </div>
             )}

             {/* Suggestions Dropdown */}
             {showSuggestions && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {suggestions.length > 0 ? (
                    suggestions.map((s, i) => (
                        <button
                        key={i} 
                        type="button"
                        className="w-full text-left p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors flex items-start gap-3"
                        onClick={() => handleSelect(s)}
                        >
                        <div className="mt-1 text-slate-400"><MapPin size={14}/></div>
                        <div>
                            <div className="font-bold text-slate-700 text-sm">
                                {s.properties.name} {s.properties.housenumber && <span className="text-brand-600">Nº {s.properties.housenumber}</span>}
                            </div>
                            <div className="text-xs text-slate-400">
                                {s.properties.city || data.city}, {s.properties.state || data.province}
                            </div>
                        </div>
                        </button>
                    ))
                  ) : showNoResults ? (
                      // Manual Entry Fallback UI - Does not block input
                      <div className="p-4 text-center cursor-default" onClick={() => setShowSuggestions(false)}>
                          <p className="text-sm font-bold text-slate-600 mb-1">No se encontraron sugerencias</p>
                          <p className="text-xs text-slate-400">Puedes escribir la dirección manualmente.</p>
                      </div>
                  ) : null}
                  
                  {suggestions.length > 0 && (
                      <div className="bg-slate-50 px-3 py-1 text-[10px] text-right text-slate-400 font-mono">
                          Powered by Photon / OSM
                      </div>
                  )}
               </div>
             )}
         </div>
      </div>
    </div>
  );
};

// Componente mejorado para inputs de teléfono
const PhoneInputWithCode = ({ 
  name, 
  value, 
  onChange, 
  placeholder, 
  hasError,
  selectedCode = '+34',
  onCodeChange
}: any) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState(PHONE_CODES.find(c => c.code === selectedCode) || PHONE_CODES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: PhoneCode) => {
    setSelected(code);
    setShowDropdown(false);
    if (onCodeChange) onCodeChange(code.code);
  };

  return (
    <div className="relative w-full group" ref={dropdownRef}>
      <div className={`
        flex items-stretch w-full border rounded-2xl transition-all bg-slate-50 relative overflow-hidden
        ${hasError 
          ? 'border-red-300 bg-red-50' 
          : 'border-slate-200 group-hover:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100 focus-within:border-brand-400'}
      `}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center px-3 gap-2 bg-slate-100 border-r border-slate-200 text-slate-700 font-bold hover:bg-slate-200 transition-colors shrink-0 outline-none"
        >
          <span className="text-xl leading-none">{selected.flag}</span>
          <span className="text-sm">{selected.code}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
        <input
          type="tel"
          name={name}
          value={value}
          onChange={onChange}
          className="flex-1 w-full p-3 md:p-4 outline-none bg-transparent font-medium text-slate-800 placeholder:text-slate-400 min-w-0"
          placeholder={placeholder}
          onClick={() => showDropdown && setShowDropdown(false)}
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto w-72 animate-in fade-in zoom-in-95 duration-200">
          {PHONE_CODES.map((code) => (
            <button
              key={code.code}
              type="button"
              onClick={() => handleSelect(code)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-b-0 transition-colors"
            >
              <span className="text-2xl">{code.flag}</span>
              <div className="flex-1">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  {code.code}
                  {selected.code === code.code && <Check size={16} className="text-brand-500" />}
                </div>
                <div className="text-xs text-slate-500 font-medium">{code.country}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para dropdown de grupo sanguíneo
const BloodGroupSelect = ({ value, onChange, hasError = false }: any) => {
  const BLOOD_GROUPS = [
    { value: "", label: "Seleccione..." },
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "Desconocido", label: "No lo sé" }
  ];

  return (
    <div className="relative group">
      <select
        name="bloodGroup"
        value={value}
        onChange={onChange}
        className={`w-full p-3 md:p-4 border rounded-2xl outline-none transition-all font-medium text-slate-800 bg-slate-50 appearance-none
        ${hasError ? 'border-red-300 bg-red-50' : 'border-slate-200 group-hover:border-brand-300 focus:ring-4 focus:ring-brand-100 focus:border-brand-400'}`}
      >
        {BLOOD_GROUPS.map((bg) => (
          <option key={bg.value} value={bg.value}>
            {bg.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
    </div>
  );
};

const translations = {
  es: {
    title: "Escuela Bíblica de Verano 2026",
    subtitle: "Registro oficial IBMV",
    themeVerse: "Descubramos la grandeza de Dios en las cosas pequeñas. Salmo 34:3",
    sectionGuardian: "Datos del Tutor",
    sectionChildren: "Niños a Inscribir",
    sectionLegal: "Legal y Permisos",
    addChildBtn: "Añadir Niño",
    addedChildrenTitle: "Niños listos para inscribir:",
    childFormTitle: "Nuevo Niño",
    childName: "Nombre completo *",
    birthDate: "Fecha nacimiento *",
    assignedGroup: "Grupo Asignado",
    guardianName: "Nombre Tutor Legal *",
    address: "Domicilio",
    workPhone: "Tel. Trabajo",
    cellPhone: "Móvil * (SMS)",
    email: "Email",
    lastGrade: "Curso escolar",
    bloodGroup: "Grupo Sanguíneo",
    bloodGroupPlaceholder: "Selecciona...",
    medicalInfo: "Información Médica",
    medicalPlaceholder: "¿Enfermedades, medicación?",
    foodAllergies: "Alergias / Intolerancias",
    foodPlaceholder: "Gluten, Lactosa, etc.",
    emergencyName: "Contacto Emergencia *",
    pickupName: "Autorizado Recogida",
    sundaySchool: "¿Asiste Escuela Dominical?",
    where: "¿Dónde?",
    invitedBy: "Si es visitante, ¿quién lo invitó?",
    lopdTitle: "Protección de Datos",
    lopdConsent: "He leído y acepto la política de privacidad (Obligatorio)",
    imageRights: "Derechos de Imagen",
    imageInternal: "Uso Interno",
    imagePublic: "Uso Público",
    yes: "Sí",
    no: "No",
    submit: "Finalizar Inscripción",
    sending: "Enviando...",
    duplicateError: "Este niño ya está registrado.",
    alreadyAdded: "Ya está en la lista.",
    groupFull: "Grupo lleno / Agotado.",
    ageError: "Edad inválida (4-12).",
    reqFields: "Faltam campos.",
    guardianReq: "Faltan datos tutor.",
    noChildren: "Añade al menos un niño.",
    authYes: "Sí, autorizo",
    authNo: "No autorizo",
    footer: {
      aboutTitle: "SOBRE NOSOTROS",
      aboutText: "Escuela Bíblica de Verano 2026. Un tiempo para aprender, jugar y crecer descubriendo a Dios.",
      locationTitle: "UBICACIÓN",
      contactTitle: "CONTACTO",
      churchName: "Iglesia Bautista Más Vida",
      address1: "Calle Sahagún 28, 28925",
      address2: "Alcorcón, Madrid"
    }
  },
  en: {
    title: "Vacation Bible School 2026",
    subtitle: "Official IBMV Registration",
    themeVerse: "Let us discover the greatness of God in small things. Psalm 34:3",
    sectionGuardian: "Guardian Info",
    sectionChildren: "Children",
    sectionLegal: "Legal & Permissions",
    addChildBtn: "Add Child",
    addedChildrenTitle: "Children ready:",
    childFormTitle: "New Child",
    childName: "Full Name *",
    birthDate: "Birth Date *",
    assignedGroup: "Group",
    guardianName: "Guardian Name *",
    address: "Address",
    workPhone: "Work Phone",
    cellPhone: "Mobile * (SMS)",
    email: "Email",
    lastGrade: "Grade",
    bloodGroup: "Blood Type",
    bloodGroupPlaceholder: "Select...",
    medicalInfo: "Medical Info",
    medicalPlaceholder: "Conditions, meds?",
    foodAllergies: "Allergies",
    foodPlaceholder: "Gluten, Dairy, etc.",
    emergencyName: "Emergency Contact *",
    pickupName: "Pickup Person",
    sundaySchool: "Sunday School?",
    where: "Where?",
    invitedBy: "Invited by?",
    lopdTitle: "Data Protection",
    lopdConsent: "I have read and accept the privacy policy (Mandatory)",
    imageRights: "Image Rights",
    imageInternal: "Internal Use",
    imagePublic: "Public Use",
    yes: "Yes",
    no: "No",
    submit: "Complete Registration",
    sending: "Sending...",
    duplicateError: "Already registered.",
    alreadyAdded: "Already in list.",
    groupFull: "Group is full.",
    ageError: "Invalid age (4-12).",
    reqFields: "Missing fields.",
    guardianReq: "Missing guardian info.",
    noChildren: "Add a child.",
    authYes: "Authorize",
    authNo: "Don't authorize",
    footer: {
      aboutTitle: "ABOUT US",
      aboutText: "Vacation Bible School 2026. A time to learn, play, and grow discovering God.",
      locationTitle: "LOCATION",
      contactTitle: "CONTACT",
      churchName: "Iglesia Bautista Más Vida",
      address1: "Calle Sahagún 28, 28925",
      address2: "Alcorcón, Madrid"
    }
  },
  pt: {
    title: "Escola Bíblica de Férias 2026",
    subtitle: "Registro Oficial IBMV",
    themeVerse: "Descubramos a grandeza de Deus nas pequenas coisas. Salmos 34:3",
    sectionGuardian: "Dados do Responsável",
    sectionChildren: "Crianças",
    sectionLegal: "Legal",
    addChildBtn: "Adicionar Criança",
    addedChildrenTitle: "Crianças prontas:",
    childFormTitle: "Nova Criança",
    childName: "Nome Completo *",
    birthDate: "Data Nascimento *",
    assignedGroup: "Grupo",
    guardianName: "Nome Responsável *",
    address: "Endereço",
    workPhone: "Tel. Trabalho",
    cellPhone: "Celular * (SMS)",
    email: "Email",
    lastGrade: "Ano escolar",
    bloodGroup: "Tipo Sanguíneo",
    bloodGroupPlaceholder: "Selecione...",
    medicalInfo: "Info Médica",
    medicalPlaceholder: "Doenças, medicação?",
    foodAllergies: "Alergias",
    foodPlaceholder: "Glúten, Lactose, etc.",
    emergencyName: "Contato Emergência *",
    pickupName: "Autorizado Buscar",
    sundaySchool: "Escola Dominical?",
    where: "Onde?",
    invitedBy: "Convidado por?",
    lopdTitle: "Protección de Dados",
    lopdConsent: "Li e aceito a política de privacidade (Obrigatório)",
    imageRights: "Direitos Imagem",
    imageInternal: "Uso Interno",
    imagePublic: "Uso Público",
    yes: "Sim",
    no: "Não",
    submit: "Finalizar",
    sending: "Enviando...",
    duplicateError: "Já registrado.",
    alreadyAdded: "Já na lista.",
    groupFull: "Grupo cheio.",
    ageError: "Idade inválida (4-12).",
    reqFields: "Faltam campos.",
    guardianReq: "Faltam dados.",
    noChildren: "Adicione uma criança.",
    authYes: "Autorizo",
    authNo: "Não autorizo",
    footer: {
      aboutTitle: "SOBRE NÓS",
      aboutText: "Escola Bíblica de Férias 2026. Um tempo para aprender, brincar e crescer descobrindo a Deus.",
      locationTitle: "LOCALIZAÇÃO",
      contactTitle: "CONTATO",
      churchName: "Iglesia Bautista Más Vida",
      address1: "Calle Sahagún 28, 28925",
      address2: "Alcorcón, Madrid"
    }
  }
};

const initialGuardian: GuardianInfo = {
  guardianName: '',
  addressType: 'Calle',
  address: '',
  postalCode: '',
  city: '',
  province: '',
  workPhone: '',
  cellPhone: '',
  email: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  pickupPersonName: '',
  pickupPersonPhone: '',
  invitedBy: '',
  photoPermission: 'No', // Default to No (Safe default)
  promoPermission: 'No', // Default to No (Safe default)
  lopdConsent: false
};

const initialChild: ChildInput = {
  childName: '',
  birthDate: '',
  bloodGroup: '',
  lastGradeCompleted: '',
  medicalInfo: '',
  foodAllergies: '',
  attendsSundaySchool: '',
  sundaySchoolLocation: ''
};

export const RegistrationForm: React.FC<Props> = ({ onBack, onSuccess, language, setLanguage }) => {
  const [guardianData, setGuardianData] = useState<GuardianInfo>(initialGuardian);
  const [addedChildren, setAddedChildren] = useState<ChildInput[]>([]);
  const [currentChild, setCurrentChild] = useState<ChildInput>(initialChild);
  
  const [phoneCodes, setPhoneCodes] = useState({
    cellPhone: '+34',
    workPhone: '+34',
    emergencyContactPhone: '+34',
    pickupPersonPhone: '+34'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [childErrors, setChildErrors] = useState<Record<string, string>>({});
  const [currentChildGroup, setCurrentChildGroup] = useState<AgeGroup | null>(null);
  const [spotsLeft, setSpotsLeft] = useState<Record<AgeGroup, number>>({
    'Bichitos': 0, 'Escarabajos': 0, 'Escorpiones': 0
  });

  const t = translations[language];

  useEffect(() => {
    setSpotsLeft(getSpotsLeft());
  }, []);

  useEffect(() => {
    if (currentChild.birthDate) {
      const age = calculateAge(currentChild.birthDate);
      const group = determineGroup(age);
      setCurrentChildGroup(group);
      
      if (!group) {
        setChildErrors(prev => ({ ...prev, birthDate: t.ageError }));
      } else {
        setChildErrors(prev => {
          const newErrs = { ...prev };
          delete newErrs.birthDate;
          return newErrs;
        });
      }
    } else {
      setCurrentChildGroup(null);
    }
  }, [currentChild.birthDate, language]);

  const handleGuardianChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Type checking for checkbox since HTMLSelectElement doesn't have it
    const checked = (e.target as HTMLInputElement).checked;

    setGuardianData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddressChange = (field: keyof GuardianInfo, value: any) => {
    setGuardianData(prev => ({ ...prev, [field]: value }));
  };

  const handleChildChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentChild(prev => ({ ...prev, [name]: value }));
    if (childErrors[name]) setChildErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Helper for direct updates from non-standard inputs (like the new allergy dropdown)
  const handleDirectChildChange = (name: keyof ChildInput, value: any) => {
    setCurrentChild(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneCodeChange = (field: keyof typeof phoneCodes, code: string) => {
    setPhoneCodes(prev => ({ ...prev, [field]: code }));
  };

  const handleAddChild = () => {
    const newChildErrors: Record<string, string> = {};
    if (!currentChild.childName) newChildErrors.childName = "Requerido";
    if (!currentChild.birthDate) newChildErrors.birthDate = "Requerido";
    if (!guardianData.guardianName) {
        setErrors(prev => ({ ...prev, guardianName: t.guardianReq }));
        newChildErrors.guardianName = t.guardianReq;
    }
    if (currentChildGroup === null) newChildErrors.birthDate = t.ageError;

    if (currentChildGroup) {
        const spotsTakenInSession = addedChildren.filter(c => {
            const g = determineGroup(calculateAge(c.birthDate));
            return g === currentChildGroup;
        }).length;
        
        const realSpots = spotsLeft[currentChildGroup] - spotsTakenInSession;
        if (realSpots <= 0) {
            newChildErrors.birthDate = t.groupFull;
        }
    }

    if (currentChild.childName && currentChild.birthDate && guardianData.guardianName) {
        if (isDuplicate(currentChild.childName, currentChild.birthDate, guardianData.guardianName)) {
            newChildErrors.duplicate = t.duplicateError;
        }
    }

    const isAlreadyInList = addedChildren.some(c => 
        c.childName.trim().toLowerCase() === currentChild.childName.trim().toLowerCase() && 
        c.birthDate === currentChild.birthDate
    );
    if (isAlreadyInList) {
        newChildErrors.duplicate = t.alreadyAdded;
    }

    if (Object.keys(newChildErrors).length > 0) {
      setChildErrors(newChildErrors);
      return;
    }

    setAddedChildren(prev => [...prev, currentChild]);
    setCurrentChild(initialChild);
    setChildErrors({});
  };

  const removeChild = (index: number) => {
    setAddedChildren(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalErrors: Record<string, string> = {};

    if (!guardianData.guardianName) finalErrors.guardianName = "Requerido";
    if (!guardianData.cellPhone) finalErrors.cellPhone = "Requerido";
    if (!guardianData.emergencyContactName) finalErrors.emergencyContactName = "Requerido";
    if (!guardianData.lopdConsent) finalErrors.lopdConsent = "Requerido";
    
    // Photo Permissions are explicitly handled by radio buttons now, no need for error check as they have defaults or are set.
    // However, if we wanted to enforce selection if they were null, we would check here.
    // Since default is 'No', they are always set.

    if (addedChildren.length === 0) {
        finalErrors.children = t.noChildren;
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    const result = registerFamily(guardianData, addedChildren);
    
    if (result.success) {
      const mockRegistration = { ...addedChildren[0], ...guardianData, age: 0, group: undefined } as any;
      await sendConfirmationSMS(mockRegistration);
      setIsSubmitting(false);
      onSuccess();
    } else {
      setIsSubmitting(false);
      alert(result.message);
    }
  };

  const labelClass = "block text-sm font-bold text-slate-600 mb-1.5 ml-1";
  const inputClass = "w-full p-3 md:p-4 border rounded-2xl outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white placeholder:text-slate-400 border-slate-200 hover:border-brand-300 focus:ring-4 focus:ring-brand-100 focus:border-brand-400";
  const errorInputClass = "w-full p-3 md:p-4 border border-red-300 bg-red-50 rounded-2xl focus:border-red-500 outline-none transition-all font-medium text-red-900";

  // Allergy Logic
  const currentOptions = ALLERGY_OPTIONS[language];
  const currentAllergy = currentChild.foodAllergies;
  const isCustomAllergy = currentAllergy && !currentOptions.includes(currentAllergy) && currentAllergy !== '';
  
  // Calculate value for the Select
  let selectValue = "";
  if (currentOptions.includes(currentAllergy)) {
    selectValue = currentAllergy;
  } else if (isCustomAllergy || currentAllergy === ' ') {
    selectValue = "OTHER_Selection";
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden my-4 md:my-8 relative">
      {/* Decorative top shape */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 via-sky-400 to-amber-300"></div>

      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-8 pb-16 text-white relative overflow-hidden">
         {/* Abstract shapes in background */}
         <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-sky-500/20 rounded-full blur-2xl"></div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 relative z-10">
          <div className="flex items-center gap-5">
            <button onClick={onBack} className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all backdrop-blur-sm" type="button">
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
            <div className="flex flex-col items-center lg:items-start">
              <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight mb-2 text-center lg:text-left drop-shadow-sm">{t.title}</h2>
              
              {/* Centered Subtitle */}
              <div className="w-full flex justify-center mb-3">
                  <p className="bg-white/20 backdrop-blur-md border border-white/20 px-6 py-1.5 rounded-full text-white text-sm md:text-base font-bold flex items-center gap-2 shadow-sm animate-in fade-in zoom-in duration-500">
                    <Sparkles size={16} className="text-amber-300 fill-amber-300 animate-pulse"/> 
                    {t.subtitle}
                  </p>
              </div>

              <p className="text-white/90 text-sm md:text-base italic font-medium font-display leading-tight max-w-lg text-center lg:text-left opacity-90">
                 "{t.themeVerse}"
              </p>
            </div>
          </div>
          
          <div className="lg:w-auto w-full max-w-sm">
            <CountdownTimer language={language} />
          </div>
          
          <div className="flex gap-4">
            {(['es', 'en', 'pt'] as Language[]).map(lang => (
              <button 
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)} 
                className={`flex flex-col items-center gap-1.5 transition-all ${language === lang ? 'opacity-100 scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
              >
                <img 
                  src={`https://flagcdn.com/w40/${lang === 'en' ? 'us' : lang === 'pt' ? 'br' : 'es'}.png`} 
                  alt={lang} 
                  className={`w-9 h-6 rounded-lg shadow-md object-cover ${language === lang ? 'ring-2 ring-white shadow-lg' : ''}`} 
                />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider font-display">
                    {lang.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <EventInfoSection language={language} spotsLeft={spotsLeft} />

      <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10">
        
        {/* SECTION 1: GUARDIAN */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
              <User size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-800">{t.sectionGuardian}</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>{t.guardianName}</label>
              <input 
                  name="guardianName" 
                  value={guardianData.guardianName} 
                  onChange={handleGuardianChange} 
                  className={errors.guardianName ? errorInputClass : inputClass}
                  placeholder="Ej. María García"
                />
            </div>
            
            <div>
              <label className={labelClass}>{t.cellPhone}</label>
              <PhoneInputWithCode 
                name="cellPhone"
                value={guardianData.cellPhone}
                onChange={handleGuardianChange}
                selectedCode={phoneCodes.cellPhone}
                onCodeChange={(code: string) => handlePhoneCodeChange('cellPhone', code)}
                hasError={!!errors.cellPhone}
                placeholder="600 123 456"
              />
            </div>
            
            <div>
              <label className={labelClass}>{t.workPhone}</label>
              <PhoneInputWithCode 
                name="workPhone"
                value={guardianData.workPhone}
                onChange={handleGuardianChange}
                selectedCode={phoneCodes.workPhone}
                onCodeChange={(code: string) => handlePhoneCodeChange('workPhone', code)}
                placeholder="910 000 000"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className={labelClass}>{t.email}</label>
              <input name="email" value={guardianData.email} onChange={handleGuardianChange} className={inputClass} type="email" placeholder="ejemplo@email.com"/>
            </div>
            
            <div className="md:col-span-2">
              <AddressAutocomplete 
                data={guardianData}
                onChange={handleAddressChange}
              />
            </div>

            {/* Emergency & Pickup Cards */}
            <div className="bg-orange-50 p-5 rounded-3xl border border-orange-100 md:col-span-2 grid md:grid-cols-2 gap-6">
                <div>
                   <label className="text-orange-800 font-bold text-sm mb-2 block flex items-center gap-2"><AlertCircle size={16}/> {t.emergencyName}</label>
                   <div className="space-y-3">
                     <input 
                        name="emergencyContactName" 
                        value={guardianData.emergencyContactName} 
                        onChange={handleGuardianChange} 
                        className={errors.emergencyContactName ? errorInputClass : "w-full p-3 border border-orange-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-200 outline-none text-sm"} 
                        placeholder="Nombre contacto" 
                      />
                      <PhoneInputWithCode 
                        name="emergencyContactPhone"
                        value={guardianData.emergencyContactPhone}
                        onChange={handleGuardianChange}
                        selectedCode={phoneCodes.emergencyContactPhone}
                        onCodeChange={(code: string) => handlePhoneCodeChange('emergencyContactPhone', code)}
                        placeholder="Teléfono"
                      />
                   </div>
                </div>
                <div>
                   <label className="text-slate-700 font-bold text-sm mb-2 block flex items-center gap-2"><User size={16}/> {t.pickupName}</label>
                   <div className="space-y-3">
                     <input name="pickupPersonName" value={guardianData.pickupPersonName} onChange={handleGuardianChange} className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-slate-200 outline-none text-sm" placeholder="Nombre persona" />
                     <PhoneInputWithCode 
                        name="pickupPersonPhone"
                        value={guardianData.pickupPersonPhone}
                        onChange={handleGuardianChange}
                        selectedCode={phoneCodes.pickupPersonPhone}
                        onCodeChange={(code: string) => handlePhoneCodeChange('pickupPersonPhone', code)}
                        placeholder="Teléfono"
                      />
                   </div>
                </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: CHILDREN */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
              <Smile size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-800">{t.sectionChildren}</h3>
          </div>

          {/* LIST OF ADDED CHILDREN */}
          {addedChildren.length > 0 && (
            <div className="mb-8 grid gap-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{t.addedChildrenTitle}</p>
              {addedChildren.map((child, idx) => {
                const age = calculateAge(child.birthDate);
                const group = determineGroup(age);
                const config = group ? GROUP_CONFIG[group] : null;
                
                return (
                  <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                        {config?.icon || '👶'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg leading-tight">{child.childName}</h4>
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold mt-1 uppercase tracking-wide">
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{age} Años</span>
                          {config && <span className={`${config.color.replace('border', '')} px-2 py-0.5 rounded-full border-0`}>{group}</span>}
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeChild(idx)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
          {errors.children && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-center font-bold mb-6 animate-pulse">{errors.children}</div>}

          {/* ADD CHILD FORM */}
          <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

            <div className="relative z-10">
              <h4 className="font-display font-bold text-xl text-slate-700 mb-6 flex items-center gap-2">
                 <span className="bg-brand-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md"><Plus size={14} strokeWidth={4}/></span> 
                 {t.childFormTitle}
              </h4>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>{t.childName}</label>
                  <input 
                    name="childName" 
                    value={currentChild.childName} 
                    onChange={handleChildChange} 
                    className={childErrors.childName || childErrors.duplicate ? errorInputClass : inputClass} 
                    placeholder="Nombre y Apellidos"
                  />
                  {childErrors.childName && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{childErrors.childName}</p>}
                </div>

                <div>
                  <label className={labelClass}>{t.birthDate}</label>
                  <input 
                    type="date" 
                    name="birthDate" 
                    value={currentChild.birthDate} 
                    onChange={handleChildChange} 
                    className={childErrors.birthDate ? errorInputClass : inputClass} 
                  />
                  {childErrors.birthDate && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{childErrors.birthDate}</p>}
                </div>

                <div>
                  <label className={labelClass}>{t.assignedGroup}</label>
                   <div className={`w-full p-3 md:p-4 border rounded-2xl flex items-center gap-3 transition-all h-[52px] md:h-[58px] ${
                      currentChildGroup 
                        ? 'bg-white border-brand-200 shadow-sm'
                        : 'border-slate-200 bg-slate-100 text-slate-400'
                   }`}>
                      {currentChildGroup ? (
                        <>
                          <span className="text-xl md:text-2xl filter drop-shadow-sm">{GROUP_CONFIG[currentChildGroup].icon}</span>
                          <span className="font-display font-bold text-slate-700">{currentChildGroup}</span>
                        </>
                      ) : (
                        <span className="text-sm font-medium italic opacity-60 pl-1">---</span>
                      )}
                   </div>
                </div>
                
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-2">
                       <Droplet size={18} className="text-red-500 fill-red-100" /> 
                       {t.bloodGroup}
                    </span>
                  </label>
                  <BloodGroupSelect 
                    value={currentChild.bloodGroup} 
                    onChange={handleChildChange} 
                    hasError={!!childErrors.bloodGroup}
                  />
                </div>

                 <div>
                  <label className={labelClass}>
                     <span className="flex items-center gap-2">
                         <Utensils size={18} className="text-orange-500" /> 
                         {t.foodAllergies}
                     </span>
                  </label>
                  <div className="relative group">
                    <select
                        value={selectValue}
                        onChange={(e) => {
                            if (e.target.value === 'OTHER_Selection') {
                                handleDirectChildChange('foodAllergies', ' '); 
                            } else {
                                handleDirectChildChange('foodAllergies', e.target.value);
                            }
                        }}
                        className={`w-full p-3 md:p-4 border rounded-2xl outline-none transition-all font-medium text-slate-800 bg-slate-50 appearance-none border-slate-200 focus:ring-4 focus:ring-brand-100 focus:border-brand-400`}
                    >
                        <option value="">{t.bloodGroupPlaceholder}</option>
                        {currentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        <option value="OTHER_Selection">{language === 'es' ? 'Otras (Especificar)...' : language === 'pt' ? 'Outras (Especificar)...' : 'Other (Specify)...'}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                  
                  {/* Manual Input for Other Allergies */}
                  {((isCustomAllergy || currentAllergy === ' ') && selectValue === 'OTHER_Selection') && (
                     <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                        <input 
                           value={currentAllergy === ' ' ? '' : currentAllergy}
                           onChange={(e) => {
                               const val = e.target.value;
                               handleDirectChildChange('foodAllergies', val === '' ? ' ' : val);
                           }}
                           className="w-full p-3 border border-orange-200 bg-orange-50 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none text-sm text-slate-800 font-medium"
                           placeholder={language === 'es' ? "Escribe la alergia..." : language === 'pt' ? "Digite a alergia..." : "Type the allergy..."}
                           autoFocus
                        />
                     </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>{t.medicalInfo}</label>
                  <textarea name="medicalInfo" value={currentChild.medicalInfo} onChange={handleChildChange} className={inputClass} rows={2} placeholder={t.medicalPlaceholder} />
                </div>

                <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="text-lg">⛪</span> {t.sundaySchool}
                  </p>
                  <div className="flex gap-4">
                    {(['Si', 'No'] as const).map((option) => (
                      <label 
                        key={option} 
                        className={`
                          flex-1 cursor-pointer relative p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 font-bold select-none
                          ${currentChild.attendsSundaySchool === option 
                            ? 'border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-200' 
                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-brand-200 hover:bg-white'}
                        `}
                      >
                        <input 
                          type="radio" 
                          name="attendsSundaySchool" 
                          value={option} 
                          checked={currentChild.attendsSundaySchool === option} 
                          onChange={handleChildChange} 
                          className="sr-only"
                        />
                        {currentChild.attendsSundaySchool === option && <Check size={18} strokeWidth={3} />}
                        {option === 'Si' ? t.yes : t.no}
                      </label>
                    ))}
                  </div>
                  
                  {currentChild.attendsSundaySchool === 'Si' && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                       <input 
                         name="sundaySchoolLocation" 
                         value={currentChild.sundaySchoolLocation} 
                         onChange={handleChildChange} 
                         className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                         placeholder={language === 'en' ? "Church name" : "Nombre de la iglesia"}
                       />
                     </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button 
                  type="button" 
                  onClick={handleAddChild} 
                  className={`border-0 shadow-lg px-8 py-3.5 rounded-2xl text-base font-bold tracking-wide transform transition-all ${
                    currentChildGroup && spotsLeft[currentChildGroup] <= 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-200 hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
                  }`}
                  disabled={!!currentChildGroup && spotsLeft[currentChildGroup] <= 0}
                >
                  <Plus size={20} strokeWidth={3} /> {t.addChildBtn}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: LEGAL */}
        <section className="pt-8 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-800">{t.sectionLegal}</h3>
          </div>

          <div className="grid gap-6">
            {/* Privacy */}
             <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                   <ShieldCheck size={18} className="text-brand-600"/>
                   <h4 className="font-bold text-slate-700">{t.lopdTitle}</h4>
                </div>
                
                <p className="text-sm text-slate-600 mb-3">
                  {language === 'es' ? "Los datos recabados serán utilizados exclusivamente para la gestión y logística de la EBV 2026 y seguridad del menor." : 
                   language === 'en' ? "Collected data will be used exclusively for VBS 2026 management and logistics and child safety." :
                   "Os dados recolhidos serão utilizados exclusivamente para a gestão e logística da EBF 2026 e segurança do menor."}
                </p>

                <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 h-32 overflow-y-auto mb-3 leading-relaxed shadow-inner">
                  <p className="font-bold text-slate-700 mb-1">{LEGAL_CONTENT[language].privacyTitle}</p>
                  <p className="whitespace-pre-line">{LEGAL_CONTENT[language].privacyText}</p>
                </div>

                <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all border ${errors.lopdConsent ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-brand-300'}`}>
                  <input 
                    type="checkbox" 
                    name="lopdConsent" 
                    checked={guardianData.lopdConsent} 
                    onChange={handleGuardianChange}
                    className="w-5 h-5 accent-brand-600 rounded cursor-pointer shrink-0" 
                  />
                  <span className="text-sm font-bold text-slate-700">{t.lopdConsent}</span>
                </label>
             </div>

             {/* Image Rights - New Two Block Design */}
             <div className="space-y-4">
               <div>
                  <h4 className="text-lg font-bold text-slate-800">{IMAGE_RIGHTS_TEXT[language].title}</h4>
                  <p className="text-xs text-slate-400 mb-3">{IMAGE_RIGHTS_TEXT[language].subtitle}</p>
               </div>

               {/* Block 1: Internal Use */}
               <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <p className="text-slate-700 font-medium mb-4 text-sm leading-relaxed">
                    {IMAGE_RIGHTS_TEXT[language].option1}
                  </p>
                  <div className="flex gap-6">
                    {(['Si', 'No'] as const).map((option) => (
                      <label key={`photo-${option}`} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${guardianData.photoPermission === option ? 'border-slate-700' : 'border-slate-300 group-hover:border-slate-400'}`}>
                             {guardianData.photoPermission === option && <div className="w-2.5 h-2.5 bg-slate-700 rounded-full" />}
                          </div>
                          <input 
                            type="radio" 
                            name="photoPermission" 
                            value={option} 
                            checked={guardianData.photoPermission === option} 
                            onChange={handleGuardianChange} 
                            className="sr-only" 
                          />
                          <span className={`font-bold text-sm ${guardianData.photoPermission === option ? 'text-slate-800' : 'text-slate-500'}`}>
                            {option === 'Si' ? IMAGE_RIGHTS_TEXT[language].yes : IMAGE_RIGHTS_TEXT[language].no}
                          </span>
                      </label>
                    ))}
                  </div>
               </div>

               {/* Block 2: Public Use */}
               <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <p className="text-slate-700 font-medium mb-4 text-sm leading-relaxed">
                    {IMAGE_RIGHTS_TEXT[language].option2}
                  </p>
                  <div className="flex gap-6">
                    {(['Si', 'No'] as const).map((option) => (
                      <label key={`promo-${option}`} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${guardianData.promoPermission === option ? 'border-slate-700' : 'border-slate-300 group-hover:border-slate-400'}`}>
                             {guardianData.promoPermission === option && <div className="w-2.5 h-2.5 bg-slate-700 rounded-full" />}
                          </div>
                          <input 
                            type="radio" 
                            name="promoPermission" 
                            value={option} 
                            checked={guardianData.promoPermission === option} 
                            onChange={handleGuardianChange} 
                            className="sr-only" 
                          />
                          <span className={`font-bold text-sm ${guardianData.promoPermission === option ? 'text-slate-800' : 'text-slate-500'}`}>
                            {option === 'Si' ? IMAGE_RIGHTS_TEXT[language].yes : IMAGE_RIGHTS_TEXT[language].no}
                          </span>
                      </label>
                    ))}
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* SUBMIT */}
        <div className="pt-4">
          <Button 
            type="submit" 
            fullWidth 
            className={`text-lg py-4 rounded-2xl shadow-xl shadow-brand-200 transition-all ${isSubmitting || !guardianData.lopdConsent ? 'opacity-50 cursor-not-allowed bg-slate-400 shadow-none' : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0'}`}
            disabled={isSubmitting || !guardianData.lopdConsent}
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin" /> {t.sending}</>
            ) : (
              <><Check size={24} strokeWidth={3} /> {t.submit}</>
            )}
          </Button>
          {!guardianData.lopdConsent && (
            <p className="text-center text-xs text-slate-400 mt-2 font-bold animate-pulse">
               * {language === 'es' ? "Debes aceptar la política de privacidad para continuar" : language === 'en' ? "You must accept the privacy policy to continue" : "Você deve aceitar a política de privacidade para continuar"}
            </p>
          )}
        </div>
      </form>

      {/* FOOTER */}
      <footer className="bg-indigo-950 text-white p-10 md:p-12 mt-8 -mx-px -mb-px relative z-10">
         <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {/* Col 1 */}
            <div className="text-center md:text-left space-y-4">
               <div className="flex items-center justify-center md:justify-start gap-2 text-sky-400 mb-2">
                  <Search size={28} strokeWidth={3} />
                  <h3 className="font-display font-black text-2xl tracking-tight">{t.footer.aboutTitle}</h3>
               </div>
               <p className="text-indigo-200 text-sm leading-relaxed font-medium max-w-xs mx-auto md:mx-0">
                  {t.footer.aboutText}
               </p>
            </div>

            {/* Col 2 */}
            <div className="text-center space-y-4">
                <h3 className="font-display font-black text-2xl tracking-tight">{t.footer.locationTitle}</h3>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Iglesia+Bautista+Más+Vida+Calle+Sahagún+28+Alcorcón+Madrid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block"
                >
                   <div className="w-12 h-12 bg-indigo-800 rounded-full flex items-center justify-center mx-auto text-indigo-300 group-hover:bg-brand-500 group-hover:text-white transition-all mb-3">
                      <MapPin size={24} />
                   </div>
                   <p className="font-bold text-white text-lg group-hover:text-sky-300 transition-colors">
                      <a href="https://masvidamadrid.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">{t.footer.churchName}</a>
                   </p>
                   <p className="text-indigo-300 text-sm mt-1">{t.footer.address1}</p>
                   <p className="text-indigo-300 text-sm">{t.footer.address2}</p>
                </a>
            </div>

            {/* Col 3 */}
            <div className="text-center md:text-right space-y-4">
                <h3 className="font-display font-black text-2xl tracking-tight">{t.footer.contactTitle}</h3>
                
                <div className="flex flex-col items-center md:items-end gap-3">
                   <a href="mailto:iglesiabautistamasvida@gmail.com" className="flex items-center gap-2 text-indigo-200 hover:text-white transition-colors group">
                      <Mail size={16} />
                      <span className="text-sm font-bold border-b border-transparent group-hover:border-white">iglesiabautistamasvida@gmail.com</span>
                   </a>
                   
                   <a href="tel:+34622792097" className="bg-indigo-800 hover:bg-brand-600 px-6 py-2 rounded-full text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/50">
                      <Phone size={18} />
                      622 792 097
                   </a>

                   <a href="https://masvidamadrid.com/" target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-indigo-400 hover:text-sky-300 flex items-center gap-1">
                      masvidamadrid.com <ExternalLink size={10} />
                   </a>
                </div>
            </div>
         </div>
         
         <div className="mt-12 pt-8 border-t border-indigo-900/50 text-center">
            <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">
               © 2026 Iglesia Bautista Más Vida • Alcorcón
            </p>
         </div>
      </footer>
    </div>
  );
};
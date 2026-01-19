import React, { useState, useEffect } from 'react';
import { RegistrationData, AgeGroup, Language } from '../types';
import { Button } from './Button';
import { Check, ChevronLeft, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { calculateAge, determineGroup, getSpotsLeft, registerChild, GROUP_CONFIG } from '../services/registrationService';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const translations = {
  es: {
    title: "Inscripción",
    subtitle: "Por favor completa todos los campos requeridos (*)",
    section1: "Datos Básicos",
    section2: "Contacto",
    section3: "Detalles",
    section4: "Seguridad",
    section5: "Permisos y Legal",
    childName: "Nombre completo del niño *",
    childNamePlaceholder: "Ej. Juanito Pérez",
    birthDate: "Fecha de nacimiento * (Asigna grupo)",
    guardianName: "Nombre del padre/madre *",
    address: "Domicilio",
    workPhone: "Teléfono Trabajo",
    cellPhone: "Móvil *",
    email: "Correo electrónico",
    lastGrade: "Último grado escolar terminado",
    lastGradePlaceholder: "Ej. 3ro Primaria",
    bloodGroup: "Grupo Sanguíneo",
    bloodGroupPlaceholder: "Ej. O+, A-",
    medicalInfo: "Información Médica Importante",
    medicalPlaceholder: "Describa CUALQUIER alergia (alimentos, picaduras, medicamentos) o condición médica que debamos conocer...",
    emergencyName: "Contacto de Emergencia *",
    emergencyNamePlaceholder: "Nombre completo *",
    emergencyPhonePlaceholder: "Teléfono",
    pickupName: "Persona autorizada para recoger al niño",
    pickupNamePlaceholder: "Nombre y Relación",
    pickupPhonePlaceholder: "Teléfono",
    sundaySchool: "¿Asiste el niño a la Escuela Dominical?",
    where: "¿Dónde?",
    invitedBy: "Si es visitante, ¿quién lo invitó?",
    lopdTitle: "Protección de Datos y Derechos de Imagen",
    lopdClauseTitle: "Cláusula Informativa (RGPD/LOPD España):",
    lopdText: "De conformidad con la normativa vigente de Protección de Datos, le informamos que los datos facilitados serán tratados por la Iglesia Bautista Más Vida con la finalidad de gestionar la inscripción y participación en la Escuela Bíblica de Verano.",
    lopdConsent: "He leído y acepto la política de privacidad y doy mi consentimiento expreso para el tratamiento de los datos personales del menor con la finalidad de gestionar la actividad. *",
    imageRights: "Derechos de Imagen del Menor:",
    imageRightsLegal: "En cumplimiento de la Ley Orgánica 1/1982 sobre el derecho al honor y la propia imagen.",
    imageInternal: "1. Autorizo la captación y uso de imágenes/video del menor para uso interno de la iglesia (recuerdos, proyecciones durante el evento, resúmenes pedagógicos).",
    imagePublic: "2. Autorizo el uso de imágenes/video del menor en medios públicos de la iglesia (página web, redes sociales, folletos impresos) con fines exclusivamente informativos y de promoción de las actividades.",
    yes: "Sí",
    no: "No",
    submit: "Completar Inscripción",
    groupFull: "Grupo Completo",
    assignedGroup: "Grupo Asignado",
    spots: "Plazas",
    available: "disponibles",
    soldOut: "¡AGOTADO!",
    errors: {
      childName: "Nombre del niño es obligatorio",
      guardianName: "Nombre del padre/madre es obligatorio",
      cellPhone: "Móvil es obligatorio",
      birthDate: "Fecha de nacimiento es obligatoria",
      emergencyContact: "Contacto de emergencia requerido",
      lopd: "Debe aceptar la política de privacidad",
      ageError: (age: number) => `Edad calculada al inicio del evento: ${age} años. La EBV es para niños de 4 a 12 años (cumplidos para el 13 de Julio 2026).`,
      groupFull: "El grupo para esta edad está lleno"
    },
    authYes: "Sí, autorizo",
    authNo: "No autorizo"
  },
  en: {
    title: "Registration",
    subtitle: "Please complete all required fields (*)",
    section1: "Basic Info",
    section2: "Contact",
    section3: "Details",
    section4: "Safety",
    section5: "Permissions & Legal",
    childName: "Child's Full Name *",
    childNamePlaceholder: "Ex. John Doe",
    birthDate: "Date of Birth * (Assigns Group)",
    guardianName: "Parent/Guardian Name *",
    address: "Address",
    workPhone: "Work Phone",
    cellPhone: "Mobile Phone *",
    email: "Email Address",
    lastGrade: "Last Grade Completed",
    lastGradePlaceholder: "Ex. 3rd Grade",
    bloodGroup: "Blood Group",
    bloodGroupPlaceholder: "Ex. O+, A-",
    medicalInfo: "Important Medical Information",
    medicalPlaceholder: "Describe ANY allergies (food, stings, medication) or medical conditions we should know about...",
    emergencyName: "Emergency Contact *",
    emergencyNamePlaceholder: "Full Name *",
    emergencyPhonePlaceholder: "Phone",
    pickupName: "Person Authorized for Pickup",
    pickupNamePlaceholder: "Name and Relationship",
    pickupPhonePlaceholder: "Phone",
    sundaySchool: "Does the child attend Sunday School?",
    where: "Where?",
    invitedBy: "If visiting, who invited them?",
    lopdTitle: "Data Protection & Image Rights",
    lopdClauseTitle: "Information Clause (GDPR/LOPD Spain):",
    lopdText: "In accordance with current Data Protection regulations, we inform you that the provided data will be processed by Iglesia Bautista Más Vida for the purpose of managing registration and participation in the Summer Bible School.",
    lopdConsent: "I have read and accept the privacy policy and give my express consent for the processing of the minor's personal data for the purpose of managing the activity. *",
    imageRights: "Minor's Image Rights:",
    imageRightsLegal: "In compliance with Organic Law 1/1982 on the right to honor and own image.",
    imageInternal: "1. I authorize the capture and use of images/video of the minor for internal church use (memories, projections during the event, pedagogical summaries).",
    imagePublic: "2. I authorize the use of images/video of the minor in public church media (website, social networks, printed brochures) for exclusively informational and promotional purposes.",
    yes: "Yes",
    no: "No",
    submit: "Complete Registration",
    groupFull: "Group Full",
    assignedGroup: "Assigned Group",
    spots: "Spots",
    available: "available",
    soldOut: "SOLD OUT!",
    errors: {
      childName: "Child's name is required",
      guardianName: "Parent/Guardian name is required",
      cellPhone: "Mobile phone is required",
      birthDate: "Date of birth is required",
      emergencyContact: "Emergency contact is required",
      lopd: "You must accept the privacy policy",
      ageError: (age: number) => `Calculated age at start of event: ${age}. VBS is only for children aged 4 to 12 (by July 13, 2026).`,
      groupFull: "The group for this age is full"
    },
    authYes: "Yes, I authorize",
    authNo: "I do not authorize"
  },
  pt: {
    title: "Inscrição",
    subtitle: "Por favor, preencha todos os campos obrigatórios (*)",
    section1: "Dados Básicos",
    section2: "Contato",
    section3: "Detalhes",
    section4: "Segurança",
    section5: "Permissões e Legal",
    childName: "Nome Completo da Criança *",
    childNamePlaceholder: "Ex. João Silva",
    birthDate: "Data de Nascimento * (Atribui Grupo)",
    guardianName: "Nome do Pai/Mãe *",
    address: "Endereço",
    workPhone: "Telefone Trabalho",
    cellPhone: "Celular *",
    email: "E-mail",
    lastGrade: "Último ano escolar concluído",
    lastGradePlaceholder: "Ex. 3º Ano",
    bloodGroup: "Grupo Sanguíneo",
    bloodGroupPlaceholder: "Ex. O+, A-",
    medicalInfo: "Informações Médicas Importantes",
    medicalPlaceholder: "Descreva QUALQUER alergia (alimentos, picadas, medicamentos) ou condição médica que devamos saber...",
    emergencyName: "Contato de Emergência *",
    emergencyNamePlaceholder: "Nome Completo *",
    emergencyPhonePlaceholder: "Telefone",
    pickupName: "Pessoa Autorizada para Buscar",
    pickupNamePlaceholder: "Nome e Parentesco",
    pickupPhonePlaceholder: "Telefone",
    sundaySchool: "A criança frequenta a Escola Dominical?",
    where: "Onde?",
    invitedBy: "Se for visitante, quem convidou?",
    lopdTitle: "Proteção de Dados e Direitos de Imagem",
    lopdClauseTitle: "Cláusula Informativa (RGPD/LOPD Espanha):",
    lopdText: "De acordo com a normativa vigente de Proteção de Dados, informamos que os dados fornecidos serão tratados pela Iglesia Bautista Más Vida com a finalidade de gerenciar a inscrição e participação na Escola Bíblica de Verão.",
    lopdConsent: "Li e aceito a política de privacidade e dou meu consentimento expresso para o tratamento dos dados pessoais do menor com a finalidade de gerenciar a atividade. *",
    imageRights: "Direitos de Imagem do Menor:",
    imageRightsLegal: "Em cumprimento da Lei Orgânica 1/1982 sobre o direito à honra e à própria imagem.",
    imageInternal: "1. Autorizo a captação e uso de imagens/vídeo do menor para uso interno da igreja (lembranças, projeções durante o evento, resumos pedagógicos).",
    imagePublic: "2. Autorizo o uso de imagens/vídeo do menor em meios públicos da igreja (site, redes sociais, folhetos impressos) com fins exclusivamente informativos e de promoção das atividades.",
    yes: "Sim",
    no: "Não",
    submit: "Concluir Inscrição",
    groupFull: "Grupo Lotado",
    assignedGroup: "Grupo Atribuído",
    spots: "Vagas",
    available: "disponíveis",
    soldOut: "ESGOTADO!",
    errors: {
      childName: "Nome da criança é obrigatório",
      guardianName: "Nome do pai/mãe é obrigatório",
      cellPhone: "Celular é obrigatório",
      birthDate: "Data de nascimento é obrigatória",
      emergencyContact: "Contato de emergência é obrigatório",
      lopd: "Você deve aceitar a política de privacidade",
      ageError: (age: number) => `Idade calculada no início do evento: ${age} anos. A EBV é apenas para crianças de 4 a 12 anos (até 13 Julho 2026).`,
      groupFull: "O grupo para esta idade está lotado"
    },
    authYes: "Sim, autorizo",
    authNo: "Não autorizo"
  }
};

const initialData: RegistrationData = {
  childName: '',
  guardianName: '',
  address: '',
  workPhone: '',
  cellPhone: '',
  email: '',
  birthDate: '',
  lastGradeCompleted: '',
  bloodGroup: '',
  medicalInfo: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  pickupPersonName: '',
  pickupPersonPhone: '',
  attendsSundaySchool: '',
  sundaySchoolLocation: '',
  invitedBy: '',
  photoPermission: '',
  promoPermission: '',
  lopdConsent: false
};

export const RegistrationForm: React.FC<Props> = ({ onBack, onSuccess, language, setLanguage }) => {
  const [formData, setFormData] = useState<RegistrationData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});
  const [calculatedGroup, setCalculatedGroup] = useState<AgeGroup | null>(null);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);

  const t = translations[language];

  // Clear errors when language changes to avoid stale error messages
  useEffect(() => {
    setErrors({});
  }, [language]);

  useEffect(() => {
    if (formData.birthDate) {
      const age = calculateAge(formData.birthDate);
      const group = determineGroup(age);
      
      if (group) {
        setCalculatedGroup(group);
        setAgeError(null);
        const spots = getSpotsLeft()[group];
        setSpotsLeft(spots);
        setFormData(prev => ({ ...prev, age, group }));
      } else {
        setCalculatedGroup(null);
        setSpotsLeft(null);
        setAgeError(t.errors.ageError(age));
        setFormData(prev => ({ ...prev, age, group: undefined }));
      }
    }
  }, [formData.birthDate, language]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
       // Handled separately below
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name as keyof RegistrationData]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof RegistrationData, string>> = {};
    if (!formData.childName) newErrors.childName = t.errors.childName;
    if (!formData.guardianName) newErrors.guardianName = t.errors.guardianName;
    if (!formData.cellPhone) newErrors.cellPhone = t.errors.cellPhone;
    if (!formData.birthDate) newErrors.birthDate = t.errors.birthDate;
    if (!formData.emergencyContactName) newErrors.emergencyContactName = t.errors.emergencyContact;
    if (!formData.lopdConsent) newErrors.lopdConsent = t.errors.lopd;
    
    if (ageError) newErrors.birthDate = ageError;
    if (calculatedGroup && spotsLeft === 0) newErrors.birthDate = t.errors.groupFull;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const result = registerChild(formData);
      if (result.success) {
        onSuccess();
      } else {
        alert(result.message);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Standard input class for consistency across all sections
  const standardInputClass = "w-full p-3 md:p-4 border-2 border-slate-200 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-violet-100 focus:border-violet-400 outline-none transition-all font-medium text-black bg-white";
  
  // Class for inputs that might have errors
  const getErrorInputClass = (hasError: boolean) => 
    `w-full p-3 md:p-4 border-2 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-violet-100 focus:border-violet-400 outline-none transition-all font-medium text-black ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`;

  // Neutral container class for uniformity
  const sectionContainerClass = "bg-slate-50 p-4 md:p-6 rounded-2xl border-2 border-slate-100";
  const sectionLabelClass = "block text-sm font-bold text-slate-700 mb-2";

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden border-4 border-violet-100 my-4 md:my-8 animate-in slide-in-from-bottom-8 duration-500">
      {/* Header: Violet Gradient */}
      <div className="bg-gradient-to-r from-violet-700 to-violet-600 p-6 md:p-8 flex items-center justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
            <button onClick={onBack} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <ChevronLeft size={28} className="md:w-8 md:h-8" strokeWidth={3} />
            </button>
            <div>
            <h2 className="text-2xl md:text-3xl font-display tracking-wide">{t.title}</h2>
            <p className="text-violet-100 text-xs md:text-sm font-medium">{t.subtitle}</p>
            </div>
        </div>

        {/* Language Selector */}
        <div className="flex gap-4 relative z-10 items-center">
            <button 
                onClick={() => setLanguage('es')} 
                className={`flex flex-col items-center group transition-transform duration-300 ${language === 'es' ? 'scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                title="Español"
            >
                <span className={`font-display font-bold text-sm tracking-wider mb-1 ${language === 'es' ? 'text-white' : 'text-violet-200 group-hover:text-white'}`}>ES</span>
                <img src="https://flagcdn.com/w40/es.png" alt="España" className="w-6 h-4 object-cover rounded shadow-sm border border-white/20" />
            </button>
            <button 
                onClick={() => setLanguage('en')} 
                className={`flex flex-col items-center group transition-transform duration-300 ${language === 'en' ? 'scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                title="English (USA)"
            >
                <span className={`font-display font-bold text-sm tracking-wider mb-1 ${language === 'en' ? 'text-white' : 'text-violet-200 group-hover:text-white'}`}>EN</span>
                <img src="https://flagcdn.com/w40/us.png" alt="USA" className="w-6 h-4 object-cover rounded shadow-sm border border-white/20" />
            </button>
            <button 
                onClick={() => setLanguage('pt')} 
                className={`flex flex-col items-center group transition-transform duration-300 ${language === 'pt' ? 'scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                title="Português"
            >
                <span className={`font-display font-bold text-sm tracking-wider mb-1 ${language === 'pt' ? 'text-white' : 'text-violet-200 group-hover:text-white'}`}>PT</span>
                <img src="https://flagcdn.com/w40/br.png" alt="Brasil" className="w-6 h-4 object-cover rounded shadow-sm border border-white/20" />
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-8 md:space-y-10">
        
        {/* Section 1: Basic Info */}
        <section className="space-y-4 md:space-y-6">
          <h3 className="text-lg md:text-xl font-display text-sky-600 border-b-2 border-sky-100 pb-2 flex items-center gap-3">
            <span className="bg-sky-100 text-sky-700 w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span> {t.section1}
          </h3>
          
          <div className="grid md:grid-cols-1 gap-4 md:gap-5">
            <div>
              <label className={sectionLabelClass}>{t.childName}</label>
              <input 
                name="childName" 
                value={formData.childName} 
                onChange={handleChange}
                className={getErrorInputClass(!!errors.childName)}
                placeholder={t.childNamePlaceholder}
              />
              {errors.childName && <p className="text-red-500 text-sm mt-1 font-bold">{errors.childName}</p>}
            </div>

            <div className={sectionContainerClass}>
              <label className={sectionLabelClass}>{t.birthDate}</label>
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className={getErrorInputClass(!!errors.birthDate)} />
              
              {ageError && (
                <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm font-bold">
                  <AlertCircle size={20} />
                  {ageError}
                </div>
              )}

              {calculatedGroup && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm gap-2">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-black tracking-widest">{t.assignedGroup}</span>
                      <div className={`text-xl md:text-2xl font-display flex items-center gap-2 ${GROUP_CONFIG[calculatedGroup].color}`}>
                        {GROUP_CONFIG[calculatedGroup].icon} {calculatedGroup}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 uppercase font-black tracking-widest">{t.spots}</span>
                      <div className={`font-bold text-base md:text-lg ${spotsLeft === 0 ? 'text-red-500' : 'text-slate-700'}`}>
                        {spotsLeft === 0 ? t.soldOut : `${spotsLeft} ${t.available}`}
                      </div>
                    </div>
                  </div>
                  {spotsLeft === 0 && (
                     <p className="text-red-500 text-sm mt-2 font-bold text-center bg-red-50 p-2 rounded-lg">{t.errors.groupFull}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className={sectionLabelClass}>{t.guardianName}</label>
              <input 
                name="guardianName" 
                value={formData.guardianName} 
                onChange={handleChange}
                className={getErrorInputClass(!!errors.guardianName)}
              />
               {errors.guardianName && <p className="text-red-500 text-sm mt-1 font-bold">{errors.guardianName}</p>}
            </div>

            <div>
              <label className={sectionLabelClass}>{t.address}</label>
              <input 
                name="address" 
                value={formData.address} 
                onChange={handleChange}
                className={standardInputClass}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Contact */}
        <section className="space-y-4 md:space-y-6">
          <h3 className="text-lg md:text-xl font-display text-sky-600 border-b-2 border-sky-100 pb-2 flex items-center gap-3">
            <span className="bg-sky-100 text-sky-700 w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span> {t.section2}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            <div className="md:col-span-1">
              <label className={sectionLabelClass}>{t.workPhone}</label>
              <input name="workPhone" value={formData.workPhone} onChange={handleChange} className={standardInputClass} />
            </div>
            <div className="md:col-span-1">
              <label className={sectionLabelClass}>{t.cellPhone}</label>
              <input 
                name="cellPhone" 
                value={formData.cellPhone} 
                onChange={handleChange} 
                className={getErrorInputClass(!!errors.cellPhone)}
                placeholder="600 000 000"
              />
              {errors.cellPhone && <p className="text-red-500 text-sm mt-1 font-bold">{errors.cellPhone}</p>}
            </div>
            <div className="md:col-span-2">
              <label className={sectionLabelClass}>{t.email}</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={standardInputClass} />
            </div>
          </div>
        </section>

        {/* Section 3: Personal & Medical */}
        <section className="space-y-4 md:space-y-6">
          <h3 className="text-lg md:text-xl font-display text-sky-600 border-b-2 border-sky-100 pb-2 flex items-center gap-3">
             <span className="bg-sky-100 text-sky-700 w-8 h-8 flex items-center justify-center rounded-full text-sm">3</span> {t.section3}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            <div>
              <label className={sectionLabelClass}>{t.lastGrade}</label>
              <input name="lastGradeCompleted" value={formData.lastGradeCompleted} onChange={handleChange} className={standardInputClass} placeholder={t.lastGradePlaceholder} />
            </div>
            <div>
              <label className={sectionLabelClass}>{t.bloodGroup}</label>
              <input name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className={standardInputClass} placeholder={t.bloodGroupPlaceholder} />
            </div>
          </div>
          {/* Changed container style to neutral to match request */}
          <div className={sectionContainerClass}>
            <label className={`${sectionLabelClass} flex items-center gap-2`}>
               <Info size={20}/> {t.medicalInfo}
            </label>
            <textarea 
               name="medicalInfo" 
               value={formData.medicalInfo} 
               onChange={handleChange} 
               rows={3} 
               className={standardInputClass} 
               placeholder={t.medicalPlaceholder} 
            />
          </div>
        </section>

        {/* Section 4: Emergency & Pickup */}
        <section className="space-y-4 md:space-y-6">
          <h3 className="text-lg md:text-xl font-display text-sky-600 border-b-2 border-sky-100 pb-2 flex items-center gap-3">
            <span className="bg-sky-100 text-sky-700 w-8 h-8 flex items-center justify-center rounded-full text-sm">4</span> {t.section4}
          </h3>
          {/* Changed container style to neutral */}
          <div className={sectionContainerClass}>
            <h4 className={`${sectionLabelClass} text-base`}>{t.emergencyName}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder={t.emergencyNamePlaceholder} className={getErrorInputClass(!!errors.emergencyContactName)} />
              <input name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} placeholder={t.emergencyPhonePlaceholder} className={standardInputClass} />
            </div>
          </div>
          {/* Changed container style to neutral */}
          <div className={sectionContainerClass}>
            <h4 className={`${sectionLabelClass} text-base`}>{t.pickupName}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <input name="pickupPersonName" value={formData.pickupPersonName} onChange={handleChange} placeholder={t.pickupNamePlaceholder} className={standardInputClass} />
              <input name="pickupPersonPhone" value={formData.pickupPersonPhone} onChange={handleChange} placeholder={t.pickupPhonePlaceholder} className={standardInputClass} />
            </div>
          </div>
        </section>

        {/* Section 5: Permissions & LOPD */}
        <section className="space-y-4 md:space-y-6">
          <h3 className="text-lg md:text-xl font-display text-sky-600 border-b-2 border-sky-100 pb-2 flex items-center gap-3">
            <span className="bg-sky-100 text-sky-700 w-8 h-8 flex items-center justify-center rounded-full text-sm">5</span> {t.section5}
          </h3>
          
          <div className="space-y-6 text-sm text-slate-700 font-medium">
             <div className={`grid md:grid-cols-2 gap-4 items-center ${sectionContainerClass}`}>
                <p>{t.sundaySchool}</p>
                <div className="flex gap-4">
                   <label className="flex items-center gap-2 cursor-pointer font-bold"><input type="radio" name="attendsSundaySchool" value="Si" checked={formData.attendsSundaySchool === 'Si'} onChange={handleChange} className="w-5 h-5 accent-sky-500" /> {t.yes}</label>
                   <label className="flex items-center gap-2 cursor-pointer font-bold"><input type="radio" name="attendsSundaySchool" value="No" checked={formData.attendsSundaySchool === 'No'} onChange={handleChange} className="w-5 h-5 accent-sky-500" /> {t.no}</label>
                </div>
             </div>
             
             {formData.attendsSundaySchool === 'Si' && (
                <input name="sundaySchoolLocation" value={formData.sundaySchoolLocation} onChange={handleChange} placeholder={t.where} className={standardInputClass} />
             )}
             
             <input name="invitedBy" value={formData.invitedBy} onChange={handleChange} placeholder={t.invitedBy} className={standardInputClass} />

             {/* LOPD & Image Rights Section */}
             <div className="border-t-2 border-slate-100 pt-6 md:pt-8 space-y-6">
                <div className="flex items-center gap-2 text-violet-900 mb-2">
                   <ShieldCheck size={24} />
                   <h4 className="font-display text-lg md:text-xl">{t.lopdTitle}</h4>
                </div>
                
                {/* LOPD Info Box */}
                <div className={`${sectionContainerClass} text-xs text-slate-600 leading-relaxed`}>
                   <p className="font-bold mb-2 uppercase text-slate-700">{t.lopdClauseTitle}</p>
                   <p className="mb-2">
                     {t.lopdText}
                   </p>
                </div>

                {/* LOPD Consent Checkbox */}
                <label className={`flex items-start gap-3 cursor-pointer p-3 md:p-4 rounded-xl transition-all border-2 ${errors.lopdConsent ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input 
                    type="checkbox" 
                    name="lopdConsent" 
                    checked={formData.lopdConsent} 
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, lopdConsent: e.target.checked }));
                      if (errors.lopdConsent) setErrors(prev => ({ ...prev, lopdConsent: undefined }));
                    }} 
                    className="mt-1 w-6 h-6 accent-sky-500 rounded focus:ring-sky-500 cursor-pointer flex-shrink-0" 
                  />
                  <span className="text-slate-800 text-sm">
                    {t.lopdConsent}
                  </span>
                </label>
                {errors.lopdConsent && <p className="text-red-500 text-xs pl-4 font-bold uppercase tracking-wide">{errors.lopdConsent}</p>}

                {/* Image Rights */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                   <p className="font-bold text-slate-800 text-base md:text-lg">{t.imageRights}</p>
                   <p className="text-xs text-slate-500 mb-4">{t.imageRightsLegal}</p>
                   
                   <div className="bg-white border-2 border-slate-100 p-4 md:p-5 rounded-2xl shadow-sm hover:border-violet-200 transition-colors">
                     <p className="mb-4 text-sm">{t.imageInternal}</p>
                     <div className="flex flex-col sm:flex-row gap-2 sm:gap-8">
                        <label className="flex items-center gap-2 cursor-pointer font-bold hover:text-sky-600"><input type="radio" name="photoPermission" value="Si" checked={formData.photoPermission === 'Si'} onChange={handleChange} className="w-5 h-5 accent-sky-500" /> {t.authYes}</label>
                        <label className="flex items-center gap-2 cursor-pointer font-bold hover:text-red-600"><input type="radio" name="photoPermission" value="No" checked={formData.photoPermission === 'No'} onChange={handleChange} className="w-5 h-5 accent-sky-500" /> {t.authNo}</label>
                     </div>
                   </div>

                   <div className="bg-white border-2 border-slate-100 p-4 md:p-5 rounded-2xl shadow-sm hover:border-violet-200 transition-colors">
                     <p className="mb-4 text-sm">{t.imagePublic}</p>
                     <div className="flex flex-col sm:flex-row gap-2 sm:gap-8">
                        <label className="flex items-center gap-2 cursor-pointer font-bold hover:text-sky-600"><input type="radio" name="promoPermission" value="Si" checked={formData.promoPermission === 'Si'} onChange={handleChange} className="w-5 h-5 accent-sky-500" /> {t.authYes}</label>
                        <label className="flex items-center gap-2 cursor-pointer font-bold hover:text-red-600"><input type="radio" name="promoPermission" value="No" checked={formData.promoPermission === 'No'} onChange={handleChange} className="w-5 h-5 accent-sky-500" /> {t.authNo}</label>
                     </div>
                   </div>
                </div>

             </div>
          </div>
        </section>

        <div className="pt-8">
          <Button 
            type="submit" 
            fullWidth 
            className={`text-lg md:text-xl py-4 md:py-5 shadow-[0_8px_0_rgb(14,165,233)] active:shadow-none active:translate-y-2 border-4 border-white ${(calculatedGroup && spotsLeft === 0) ? 'opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400 shadow-none' : ''}`}
            disabled={calculatedGroup !== null && spotsLeft === 0}
          >
             {(calculatedGroup && spotsLeft === 0) ? t.groupFull : <><Check size={24} className="md:w-7 md:h-7" strokeWidth={3} /> {t.submit}</>}
          </Button>
        </div>

      </form>
    </div>
  );
};
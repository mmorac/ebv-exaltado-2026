import React, { useState, useEffect } from 'react';
import { RegistrationData, AgeGroup } from '../types';
import { getRegisteredChildren, deleteChild, getSpotsLeft, GROUP_CONFIG } from '../services/registrationService';
import { Button } from './Button';
import { Trash2, Lock, ArrowLeft, Download, Phone, Calendar, User, FileSpreadsheet } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [filterGroup, setFilterGroup] = useState<AgeGroup | 'ALL'>('ALL');
  const [spots, setSpots] = useState<Record<AgeGroup, number>>({
    'Bichitos': 15, 'Escarabajos': 15, 'Escorpiones': 15
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = () => {
    setRegistrations(getRegisteredChildren());
    setSpots(getSpotsLeft());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'exaltado2026') {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleDelete = (index: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta inscripción? Esta acción no se puede deshacer.')) {
      deleteChild(index);
      loadData();
    }
  };

  const filteredRegistrations = registrations.map((r, i) => ({ ...r, originalIndex: i }))
    .filter(r => filterGroup === 'ALL' || r.group === filterGroup);

  const exportToCSV = () => {
    const headers = ['Nombre Niño', 'Edad', 'Grupo', 'Padre/Madre', 'Móvil', 'Grupo Sang.', 'Alergias', 'Emergencia', 'Tel. Emergencia'];
    const csvContent = [
      headers.join(','),
      ...registrations.map(r => [
        `"${r.childName}"`,
        r.age,
        r.group,
        `"${r.guardianName}"`,
        r.cellPhone,
        `"${r.bloodGroup || ''}"`,
        `"${r.medicalInfo.replace(/\n/g, ' ')}"`,
        `"${r.emergencyContactName}"`,
        r.emergencyContactPhone
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'inscripciones_ebv_2026.csv';
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-900 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border-4 border-sky-500">
          <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6 text-violet-600">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-display text-violet-900 mb-6">Acceso Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-violet-500 text-center text-lg"
              autoFocus
            />
            <Button fullWidth type="submit">Entrar</Button>
          </form>
          <button onClick={onBack} className="mt-6 text-slate-500 hover:text-slate-800 font-bold underline">
            Volver a la web
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-violet-900 text-white p-6 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft />
            </button>
            <h1 className="text-2xl font-display tracking-wide">Panel de Administración</h1>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" onClick={exportToCSV} className="bg-white/10 border-white text-white hover:bg-white hover:text-violet-900 text-sm py-2">
                <FileSpreadsheet size={18} /> Exportar CSV
             </Button>
             <div className="bg-sky-500 px-4 py-2 rounded-full font-bold shadow-lg">
               Total: {registrations.length} Niños
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(Object.keys(GROUP_CONFIG) as AgeGroup[]).map(group => {
            const total = 15;
            const left = spots[group];
            const taken = total - left;
            const config = GROUP_CONFIG[group];
            
            return (
              <div key={group} className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className={`font-display text-xl ${config.color} mb-1 flex items-center gap-2`}>
                    {config.icon} {group}
                  </h3>
                  <p className="text-slate-500 text-sm font-bold">{config.min}-{config.max} años</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-display text-slate-800">{taken}</span>
                  <span className="text-slate-400 text-sm font-bold"> / {total}</span>
                  <div className="w-24 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full ${left === 0 ? 'bg-red-500' : 'bg-sky-500'}`} 
                      style={{ width: `${(taken/total)*100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setFilterGroup('ALL')}
            className={`px-6 py-2 rounded-full font-bold transition-colors ${filterGroup === 'ALL' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-violet-50'}`}
          >
            Todos
          </button>
          {(Object.keys(GROUP_CONFIG) as AgeGroup[]).map(group => (
            <button 
              key={group}
              onClick={() => setFilterGroup(group)}
              className={`px-6 py-2 rounded-full font-bold transition-colors ${filterGroup === group ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 hover:bg-sky-50'}`}
            >
              {GROUP_CONFIG[group].icon} {group}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-6 font-black">Niño/a</th>
                  <th className="p-6 font-black">Edad/Grupo</th>
                  <th className="p-6 font-black">Contacto</th>
                  <th className="p-6 font-black">Médico</th>
                  <th className="p-6 font-black text-center">Permisos</th>
                  <th className="p-6 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="p-12 text-center text-slate-400 font-bold text-lg">
                       No hay inscripciones en este grupo todavía.
                     </td>
                   </tr>
                ) : (
                  filteredRegistrations.map((row) => (
                    <tr key={row.originalIndex} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <div className="font-bold text-violet-900 text-lg">{row.childName}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <User size={14}/> {row.guardianName}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          row.group === 'Bichitos' ? 'bg-sky-100 text-sky-700' :
                          row.group === 'Escarabajos' ? 'bg-violet-100 text-violet-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {row.group ? GROUP_CONFIG[row.group].icon : ''} {row.group}
                        </span>
                        <div className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
                          <Calendar size={12}/> {new Date(row.birthDate).toLocaleDateString()} ({row.age} años)
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <Phone size={14} className="text-sky-500"/> {row.cellPhone}
                        </div>
                        {row.emergencyContactPhone && (
                           <div className="text-xs text-red-500 mt-1 font-medium" title={`Emergencia: ${row.emergencyContactName}`}>
                             SOS: {row.emergencyContactPhone}
                           </div>
                        )}
                      </td>
                      <td className="p-6 max-w-xs">
                        {row.medicalInfo ? (
                          <div className="bg-red-50 text-red-700 p-2 rounded-lg text-xs font-medium border border-red-100">
                            {row.medicalInfo}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Ninguna</span>
                        )}
                        {row.bloodGroup && (
                          <div className="text-xs text-sky-600 font-bold mt-1">
                            Sangre: {row.bloodGroup}
                          </div>
                        )}
                      </td>
                      <td className="p-6 text-center space-y-1">
                         <div className="text-xs font-bold">
                            Fotos: <span className={row.photoPermission === 'Si' ? 'text-green-600' : 'text-red-600'}>{row.photoPermission}</span>
                         </div>
                         <div className="text-xs font-bold">
                            Promo: <span className={row.promoPermission === 'Si' ? 'text-green-600' : 'text-red-600'}>{row.promoPermission}</span>
                         </div>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => handleDelete(row.originalIndex)}
                          className="p-3 bg-white border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-all shadow-sm hover:shadow-md"
                          title="Eliminar inscripción"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
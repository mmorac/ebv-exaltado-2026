import React, { useState, useEffect, useMemo } from 'react';
import { FlatRegistration, AgeGroup } from '../types';
import { getDashboardData, GROUP_CONFIG, exportToCSV } from '../services/registrationService';
import { Search, Download, LogOut, Lock, Users, Phone, MapPin, Camera, AlertCircle, Calendar } from 'lucide-react';
import { Button } from './Button';

interface Props {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [data, setData] = useState<FlatRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<AgeGroup | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setData(getDashboardData());
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple client-side protection
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const counts = {
      total: data.length,
      'Bichitos': 0,
      'Escarabajos': 0,
      'Escorpiones': 0
    };
    
    data.forEach(item => {
      if (item.group !== 'Sin Grupo') {
        counts[item.group as AgeGroup]++;
      }
    });

    return counts;
  }, [data]);

  // --- FILTERING & SORTING ---
  const filteredData = useMemo(() => {
    let filtered = data;

    // 1. Tab Filter
    if (activeTab !== 'All') {
      filtered = filtered.filter(item => item.group === activeTab);
    }

    // 2. Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.childName.toLowerCase().includes(lower) ||
        item.guardianName.toLowerCase().includes(lower) ||
        item.addressType.toLowerCase().includes(lower) ||
        item.address.toLowerCase().includes(lower)
      );
    }

    // 3. Sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, activeTab, searchTerm, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    exportToCSV(filteredData, `Inscripciones_EBV2026_${activeTab}`);
  };

  // --- LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Administrativo</h2>
          <p className="text-slate-500 mb-6 text-sm">Introduce la clave para ver los datos.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Contraseña..."
              autoFocus
            />
            <Button type="submit" fullWidth className="bg-slate-800 hover:bg-slate-700">Entrar</Button>
            <button type="button" onClick={onLogout} className="text-xs text-slate-400 hover:text-slate-600 underline">Volver a la App</button>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold">
               EBV
             </div>
             <div>
               <h1 className="text-xl font-bold text-slate-900 leading-none">Panel de Gestión</h1>
               <span className="text-xs text-slate-500 font-medium">Inscripciones 2026</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium">
               <Users size={16} className="text-slate-400"/>
               <span>Total: <strong className="text-slate-900">{stats.total}</strong> niños</span>
             </div>
             <button onClick={onLogout} className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
               <LogOut size={16}/> Salir
             </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['Bichitos', 'Escarabajos', 'Escorpiones'] as AgeGroup[]).map(group => (
               <div key={group} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white ${GROUP_CONFIG[group].color.replace('text-', 'border-').split(' ')[2]}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{group}</p>
                      <p className="text-2xl font-black text-slate-800">{stats[group]}</p>
                    </div>
                    <span className="text-2xl">{GROUP_CONFIG[group].icon}</span>
                  </div>
               </div>
            ))}
             <div className="p-4 rounded-xl border-l-4 border-slate-400 shadow-sm bg-slate-800 text-white">
                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Total</p>
                <p className="text-2xl font-black">{stats.total}</p>
             </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
          
          {/* TABS */}
          <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm w-full md:w-auto overflow-x-auto">
             <button 
               onClick={() => setActiveTab('All')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'All' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               Todos
             </button>
             {(['Bichitos', 'Escarabajos', 'Escorpiones'] as AgeGroup[]).map(group => (
               <button 
                key={group}
                onClick={() => setActiveTab(group)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === group ? 'bg-white shadow ring-1 ring-black/5 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                 <span>{GROUP_CONFIG[group].icon}</span> {group}
               </button>
             ))}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar niño, tutor..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium shadow-sm"
              />
            </div>
            <Button onClick={handleExport} className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-500">
               <Download size={18} /> Exportar {activeTab !== 'All' ? activeTab : 'Lista'}
            </Button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => requestSort('group')}>Grupo</th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => requestSort('childName')}>Nombre Niño</th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => requestSort('age')}>Edad</th>
                  <th className="p-4">Tutor & Contacto</th>
                  <th className="p-4">Dirección</th>
                  <th className="p-4 text-center">Fotos</th>
                  <th className="p-4">Salud</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 whitespace-nowrap">
                        {row.group !== 'Sin Grupo' ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${GROUP_CONFIG[row.group as AgeGroup].color}`}>
                             {GROUP_CONFIG[row.group as AgeGroup].icon} {row.group}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sin grupo</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {row.childName}
                        <div className="text-[10px] font-normal text-slate-400 mt-0.5">Reg: {new Date(row.registrationDate).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {row.age} años
                        <div className="text-xs text-slate-400">{new Date(row.birthDate).getFullYear()}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-700">{row.guardianName}</div>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                          <Phone size={12}/> {row.cellPhone}
                        </div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-600" title={`${row.addressType} ${row.address}, ${row.city}`}>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="shrink-0 text-slate-400"/>
                          <span className="truncate">{row.addressType} {row.address}</span>
                        </div>
                        <div className="pl-4.5 text-xs text-slate-400">{row.postalCode} {row.city}</div>
                      </td>
                      <td className="p-4 text-center">
                         <div className="flex flex-col gap-1 items-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${row.photoPermission === 'Si' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                              Interno: {row.photoPermission.toUpperCase()}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${row.promoPermission === 'Si' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                              Público: {row.promoPermission.toUpperCase()}
                            </span>
                         </div>
                      </td>
                      <td className="p-4">
                        {row.foodAllergies && row.foodAllergies !== 'Ninguna' && row.foodAllergies.trim() !== '' ? (
                           <div className="flex items-start gap-1 text-red-600 font-bold text-xs mb-1">
                             <AlertCircle size={12} className="mt-0.5 shrink-0"/> {row.foodAllergies}
                           </div>
                        ) : (
                          <span className="text-slate-400 text-xs block mb-1">Sin alergias</span>
                        )}
                        {row.medicalInfo && (
                           <div className="text-xs text-slate-500 italic max-w-[150px] truncate" title={row.medicalInfo}>
                             Info: {row.medicalInfo}
                           </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <p className="font-bold text-lg mb-2">No se encontraron inscripciones</p>
                      <p className="text-sm">Intenta cambiar los filtros de búsqueda.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
             <span>Mostrando {filteredData.length} registros</span>
             <span>Ordenado por: {sortConfig ? `${sortConfig.key} (${sortConfig.direction})` : 'Defecto'}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { storage } from '../services/storageService';
import { ServiceStatus } from '../types';

const Reports: React.FC = () => {
  const [viewType, setViewType] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const services = storage.getServices().filter(s => s.status === ServiceStatus.FINISHED);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // Calculate available years from services to populate the selector
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear()); // Always include current year
    services.forEach(s => {
      const year = new Date(s.entryDate).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [services]);

  const consolidatedData = useMemo(() => {
    if (viewType === 'monthly') {
      const data = Array(12).fill(0).map((_, i) => ({ label: months[i], value: 0, count: 0 }));
      services.forEach(s => {
        const date = new Date(s.entryDate);
        if (date.getFullYear() === selectedYear) {
          const month = date.getMonth();
          data[month].value += s.value;
          data[month].count += 1;
        }
      });
      return data;
    }

    if (viewType === 'quarterly') {
      const data = [
        { label: '1º Trimestre (Jan-Mar)', value: 0, count: 0 },
        { label: '2º Trimestre (Abr-Jun)', value: 0, count: 0 },
        { label: '3º Trimestre (Jul-Set)', value: 0, count: 0 },
        { label: '4º Trimestre (Out-Dez)', value: 0, count: 0 },
      ];
      services.forEach(s => {
        const date = new Date(s.entryDate);
        if (date.getFullYear() === selectedYear) {
          const quarter = Math.floor(date.getMonth() / 3);
          data[quarter].value += s.value;
          data[quarter].count += 1;
        }
      });
      return data;
    }

    if (viewType === 'annual') {
      const yearsMap: Record<number, { label: string, value: number, count: number }> = {};
      services.forEach(s => {
        const year = new Date(s.entryDate).getFullYear();
        if (!yearsMap[year]) yearsMap[year] = { label: year.toString(), value: 0, count: 0 };
        yearsMap[year].value += s.value;
        yearsMap[year].count += 1;
      });
      return Object.values(yearsMap).sort((a, b) => Number(b.label) - Number(a.label));
    }

    return [];
  }, [services, viewType, selectedYear]);

  const totalValue = consolidatedData.reduce((acc, curr) => acc + curr.value, 0);
  const maxValue = Math.max(...consolidatedData.map(d => d.value), 1);

  const exportToExcel = () => {
    const fileName = `Relatorio_Financeiro_WJ_${viewType}_${viewType === 'annual' ? 'Historico' : selectedYear}.csv`;
    
    // CSV Header
    const headers = ['Periodo', 'Volume de Servicos', 'Faturamento Bruto (R$)', 'Participacao (%)'];
    
    // CSV Content Rows
    const rows = consolidatedData.map(item => [
      item.label,
      item.count.toString(),
      item.value.toFixed(2).replace('.', ','),
      (totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : '0').replace('.', ',')
    ]);

    // Build CSV string
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    // Create Blob and Trigger Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Resumo de Faturamento</h2>
          <p className="text-sm text-gray-500">
            {viewType === 'annual' 
              ? 'Desempenho financeiro histórico da oficina.' 
              : `Desempenho financeiro da oficina em ${selectedYear}.`}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Excel Export Button */}
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
            title="Exportar dados para Excel (.csv)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Exportar Excel</span>
          </button>

          {/* Year Selector - only relevant for non-annual views */}
          {viewType !== 'annual' && (
            <div className="flex items-center space-x-2 mr-2">
              <label htmlFor="yearSelect" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ano:</label>
              <select
                id="yearSelect"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-gray-100 border-none text-sm font-bold text-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex p-1 bg-gray-100 rounded-lg">
            {(['monthly', 'quarterly', 'annual'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewType === type 
                  ? 'bg-white text-rose-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type === 'monthly' ? 'Mensal' : type === 'quarterly' ? 'Trimestral' : 'Anual'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-6 rounded-xl text-white shadow-lg shadow-emerald-100">
          <p className="text-xs font-bold uppercase opacity-80 mb-1 tracking-wider">Total Consolidado</p>
          <p className="text-3xl font-black">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl text-white shadow-lg shadow-gray-200">
          <p className="text-xs font-bold uppercase opacity-80 mb-1 tracking-wider">Serviços Finalizados</p>
          <p className="text-3xl font-black">{consolidatedData.reduce((acc, curr) => acc + curr.count, 0)}</p>
        </div>
        <div className="bg-rose-600 p-6 rounded-xl text-white shadow-lg shadow-rose-100">
          <p className="text-xs font-bold uppercase opacity-80 mb-1 tracking-wider">Ticket Médio</p>
          <p className="text-3xl font-black">
            {totalValue > 0 
              ? (totalValue / consolidatedData.reduce((acc, curr) => acc + curr.count, 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : 'R$ 0,00'}
          </p>
        </div>
      </div>

      {/* Consolidation List & Visualization */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-md font-bold text-gray-800">
            Detalhamento {viewType === 'monthly' ? 'Mensal' : viewType === 'quarterly' ? 'Trimestral' : 'Anual'}
          </h3>
          {viewType !== 'annual' && <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">Exercício {selectedYear}</span>}
        </div>
        <div className="p-6 space-y-6">
          {consolidatedData.map((item, idx) => (
            <div key={idx} className="group">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-sm font-bold text-gray-800">{item.label}</span>
                  <span className="ml-2 text-xs text-gray-400 font-medium">{item.count} serviços</span>
                </div>
                <span className="text-sm font-black text-emerald-600">
                  {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out group-hover:bg-rose-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}

          {consolidatedData.length === 0 || (viewType !== 'annual' && totalValue === 0) ? (
            <div className="py-20 text-center text-gray-400">
              <p>Nenhum faturamento registrado para {viewType === 'annual' ? 'o histórico' : `o ano de ${selectedYear}`}.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Table Version for Precision */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Período</th>
              <th className="px-6 py-4 text-center">Volume de Serviços</th>
              <th className="px-6 py-4 text-right">Faturamento Bruto</th>
              <th className="px-6 py-4 text-right">Partic. no Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {consolidatedData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-700">{item.label}</td>
                <td className="px-6 py-4 text-center text-gray-600">{item.count}</td>
                <td className="px-6 py-4 text-right font-black text-gray-800">
                  {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 text-right text-gray-400 font-mono">
                  {totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;

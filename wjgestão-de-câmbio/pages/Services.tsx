
import React, { useState, useMemo } from 'react';
import { storage } from '../services/storageService';
import { ServiceOrder, ServiceStatus, Vehicle, PaymentMethod } from '../types';
import { Icons } from '../constants';
import Modal from '../components/Modal';

const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceOrder[]>(storage.getServices());
  const [vehicles] = useState<Vehicle[]>(storage.getVehicles());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceOrder | null>(null);

  // Helper function to format dates correctly without timezone shifts
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    // Split and recreate to avoid UTC/Local time issues
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const vehicle = vehicles.find(v => v.id === s.vehicleId);
      return s.type.toLowerCase().includes(search.toLowerCase()) || 
             vehicle?.plate.toLowerCase().includes(search.toLowerCase()) ||
             s.description.toLowerCase().includes(search.toLowerCase());
    });
  }, [services, vehicles, search]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const serviceData: ServiceOrder = {
      id: editingService?.id || Date.now().toString(),
      vehicleId: formData.get('vehicleId') as string,
      type: formData.get('type') as string,
      description: formData.get('description') as string,
      entryDate: formData.get('entryDate') as string,
      exitDate: formData.get('exitDate') as string || undefined,
      status: formData.get('status') as ServiceStatus,
      value: Number(formData.get('value')),
      paymentMethod: formData.get('paymentMethod') as PaymentMethod,
    };

    storage.saveService(serviceData);
    setServices(storage.getServices());
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Atenção: Você tem certeza que deseja EXCLUIR esta Ordem de Serviço? Esta ação não pode ser desfeita.')) {
      storage.deleteService(id);
      setServices(storage.getServices());
    }
  };

  const getVehicleInfo = (id: string) => vehicles.find(v => v.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Icons.Search />
          </span>
          <input
            type="text"
            placeholder="Buscar por placa, tipo ou descrição..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-rose-500 focus:border-rose-500 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => { setEditingService(null); setIsModalOpen(true); }}
          className="w-full md:w-auto flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md active:scale-95"
        >
          <Icons.Plus />
          <span>Nova Ordem de Serviço</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Veículo / Cliente</th>
                <th className="px-6 py-4">Serviço / Status</th>
                <th className="px-6 py-4">Linha do Tempo (Datas)</th>
                <th className="px-6 py-4">Pagamento</th>
                <th className="px-6 py-4 text-right">Valor Bruto</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredServices.length > 0 ? filteredServices.map(service => {
                const vehicle = getVehicleInfo(service.vehicleId);
                return (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded w-fit mb-1 border border-gray-200">
                          {vehicle?.plate || 'S/ PLACA'}
                        </span>
                        <span className="text-xs text-gray-500">{vehicle?.brand} {vehicle?.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800 mb-1">{service.type}</div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        service.status === ServiceStatus.FINISHED ? 'bg-emerald-100 text-emerald-700' :
                        service.status === ServiceStatus.REPAIR ? 'bg-amber-100 text-amber-700' :
                        service.status === ServiceStatus.CANCELLED ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center text-xs text-gray-600">
                          <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] mr-2 font-black">E</span>
                          <span className="font-medium mr-1 text-gray-400">Entrada:</span>
                          <span className="font-bold text-gray-700">{formatDate(service.entryDate)}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] mr-2 font-black ${service.exitDate ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>S</span>
                          <span className="font-medium mr-1 text-gray-400">Saída:</span>
                          <span className={`font-bold ${service.exitDate ? 'text-emerald-600' : 'text-gray-300 italic'}`}>
                            {formatDate(service.exitDate) || 'Em aberto'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-600">
                          {service.paymentMethod || 'Pendente'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {service.paymentMethod === PaymentMethod.NOT_PAID ? 'Aguardando' : 'Confirmado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-black text-gray-800">
                        {service.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingService(service); setIsModalOpen(true); }} 
                          className="p-2 bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-all"
                          title="Ver detalhes / Editar"
                        >
                          <Icons.Edit />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)} 
                          className="p-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all"
                          title="Excluir O.S."
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Nenhuma ordem de serviço encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingService ? "🛠️ Detalhes da Ordem de Serviço" : "📝 Nova Ordem de Serviço"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Veículo Destinado</label>
              <select 
                name="vehicleId" 
                defaultValue={editingService?.vehicleId} 
                required 
                className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-gray-50 focus:ring-rose-500 focus:border-rose-500 outline-none"
              >
                <option value="">Selecione o Veículo...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>)}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Título do Serviço</label>
              <input 
                name="type" 
                defaultValue={editingService?.type} 
                placeholder="Ex: Reforma de Câmbio Automático AL4" 
                required 
                className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" 
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Descrição Técnica / Observações</label>
              <textarea 
                name="description" 
                defaultValue={editingService?.description} 
                rows={3} 
                placeholder="Descreva aqui as peças trocadas e o diagnóstico realizado..."
                className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">🗓️ Data de Entrada</label>
              <input 
                name="entryDate" 
                type="date" 
                defaultValue={editingService?.entryDate} 
                required 
                className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">✅ Data de Saída / Entrega</label>
              <input 
                name="exitDate" 
                type="date" 
                defaultValue={editingService?.exitDate} 
                className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Status Atual</label>
              <select 
                name="status" 
                defaultValue={editingService?.status || ServiceStatus.ANALYSIS} 
                required 
                className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none bg-white font-bold"
              >
                {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Forma de Pagamento</label>
              <select 
                name="paymentMethod" 
                defaultValue={editingService?.paymentMethod || PaymentMethod.NOT_PAID} 
                required 
                className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none bg-white"
              >
                {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Valor Total do Serviço</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-bold">R$</span>
                <input 
                  name="value" 
                  type="number" 
                  step="0.01" 
                  defaultValue={editingService?.value} 
                  required 
                  placeholder="0,00"
                  className="block w-full border border-gray-300 rounded-lg p-2.5 pl-10 text-sm font-bold focus:ring-rose-500 focus:border-rose-500 outline-none" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t mt-4">
            {editingService && (
              <button 
                type="button" 
                onClick={() => handleDelete(editingService.id)}
                className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Icons.Trash /> Excluir permanentemente
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-bold transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-8 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-black transition-all shadow-lg active:scale-95"
              >
                {editingService ? "Salvar Alterações" : "Gerar Ordem de Serviço"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Services;

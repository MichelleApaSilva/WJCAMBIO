
import React, { useMemo } from 'react';
import { storage } from '../services/storageService';
import { ServiceStatus } from '../types';

const Dashboard: React.FC = () => {
  const owners = storage.getOwners();
  const vehicles = storage.getVehicles();
  const services = storage.getServices();

  const stats = useMemo(() => {
    const totalRevenue = services
      .filter(s => s.status === ServiceStatus.FINISHED)
      .reduce((acc, curr) => acc + curr.value, 0);

    const activeServices = services.filter(s => 
      s.status === ServiceStatus.ANALYSIS || s.status === ServiceStatus.REPAIR
    ).length;

    return {
      totalOwners: owners.length,
      totalVehicles: vehicles.length,
      activeServices,
      revenue: totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    };
  }, [owners, vehicles, services]);

  const recentServices = useMemo(() => {
    return [...services].sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()).slice(0, 5);
  }, [services]);

  const getVehiclePlate = (id: string) => vehicles.find(v => v.id === id)?.plate || 'N/A';

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total de Clientes</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalOwners}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Frota Cadastrada</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalVehicles}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Serviços Ativos</p>
          <p className="text-3xl font-bold text-rose-600">{stats.activeServices}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Faturamento Total</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.revenue}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Services */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Serviços Recentes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Placa</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentServices.map(service => (
                  <tr key={service.id} className="text-sm">
                    <td className="py-3 font-medium text-gray-700">{getVehiclePlate(service.vehicleId)}</td>
                    <td className="py-3 text-gray-600">{service.type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.status === ServiceStatus.FINISHED ? 'bg-emerald-100 text-emerald-700' :
                        service.status === ServiceStatus.REPAIR ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-gray-800">
                      {service.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 p-8 rounded-xl shadow-xl text-white flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-2">Oficina WJ</h3>
          <p className="text-gray-400 mb-6">Referência em câmbios automáticos e manuais. Controle total da sua oficina em um só lugar.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-center">
              <p className="text-2xl mb-1">🔧</p>
              <p className="text-sm font-semibold">Garantia WJ</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-center">
              <p className="text-2xl mb-1">🚗</p>
              <p className="text-sm font-semibold">Check-up Grátis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

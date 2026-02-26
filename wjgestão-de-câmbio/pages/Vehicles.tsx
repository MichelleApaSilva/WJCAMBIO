
import React, { useState, useMemo } from 'react';
import { storage } from '../services/storageService';
import { Vehicle, GearboxType, Owner } from '../types';
import { Icons } from '../constants';
import Modal from '../components/Modal';

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(storage.getVehicles());
  const [owners] = useState<Owner[]>(storage.getOwners());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => 
      v.plate.toLowerCase().includes(search.toLowerCase()) || 
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase())
    );
  }, [vehicles, search]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newVehicle: Vehicle = {
      id: editingVehicle?.id || Date.now().toString(),
      plate: formData.get('plate') as string,
      brand: formData.get('brand') as string,
      model: formData.get('model') as string,
      year: Number(formData.get('year')),
      color: formData.get('color') as string,
      gearboxType: formData.get('gearboxType') as GearboxType,
      mileage: Number(formData.get('mileage')),
      ownerId: formData.get('ownerId') as string,
    };
    storage.saveVehicle(newVehicle);
    setVehicles(storage.getVehicles());
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este veículo?')) {
      storage.deleteVehicle(id);
      setVehicles(storage.getVehicles());
    }
  };

  const getOwner = (id: string) => owners.find(o => o.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Icons.Search />
          </span>
          <input
            type="text"
            placeholder="Buscar por placa, modelo ou marca..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-rose-500 focus:border-rose-500 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
          className="w-full md:w-auto flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Icons.Plus />
          <span>Novo Veículo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map(vehicle => {
          const owner = getOwner(vehicle.ownerId);
          return (
            <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2 py-1 rounded border border-rose-100 uppercase tracking-widest">{vehicle.plate}</span>
                    <h3 className="text-lg font-bold text-gray-800 mt-2">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.color}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => { setEditingVehicle(vehicle); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-rose-600 transition-colors"><Icons.Edit /></button>
                    <button onClick={() => handleDelete(vehicle.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Icons.Trash /></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-50 mb-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sistema de Câmbio</p>
                    <p className="text-sm font-semibold text-gray-700">{vehicle.gearboxType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Quilometragem</p>
                    <p className="text-sm font-semibold text-gray-700">{vehicle.mileage.toLocaleString()} km</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-sm font-bold shadow-inner">
                  {owner?.name.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Proprietário</p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">{owner?.name || 'Desconhecido'}</p>
                  {owner?.phone && (
                    <p className="text-xs text-rose-500 flex items-center mt-0.5">
                      <span className="mr-1">📞</span> {owner.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingVehicle ? "Editar Veículo" : "Cadastrar Veículo"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Placa</label>
              <input name="plate" defaultValue={editingVehicle?.plate} placeholder="ABC-1234" required className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm uppercase focus:ring-rose-500 focus:border-rose-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proprietário Responsável</label>
              <select name="ownerId" defaultValue={editingVehicle?.ownerId} required className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none">
                <option value="">Selecione um cliente...</option>
                {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.phone})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Marca</label>
              <input name="brand" defaultValue={editingVehicle?.brand} required placeholder="Ex: Honda" className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo</label>
              <input name="model" defaultValue={editingVehicle?.model} required placeholder="Ex: Civic" className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ano de Fabricação</label>
              <input name="year" type="number" defaultValue={editingVehicle?.year} required placeholder="2022" className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cor</label>
              <input name="color" defaultValue={editingVehicle?.color} required placeholder="Ex: Preto" className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Câmbio</label>
              <select name="gearboxType" defaultValue={editingVehicle?.gearboxType} required className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none">
                {Object.values(GearboxType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">KM Atual</label>
              <input name="mileage" type="number" defaultValue={editingVehicle?.mileage} required placeholder="0" className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium transition-colors shadow-md">Salvar Veículo</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;

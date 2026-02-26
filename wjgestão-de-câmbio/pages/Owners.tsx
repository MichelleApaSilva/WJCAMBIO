
import React, { useState, useMemo } from 'react';
import { storage } from '../services/storageService';
import { Owner } from '../types';
import { Icons } from '../constants';
import Modal from '../components/Modal';

const Owners: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>(storage.getOwners());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  const filteredOwners = useMemo(() => {
    return owners.filter(o => 
      o.name.toLowerCase().includes(search.toLowerCase()) || 
      o.document.includes(search) ||
      o.phone.includes(search)
    );
  }, [owners, search]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newOwner: Owner = {
      id: editingOwner?.id || Date.now().toString(),
      name: formData.get('name') as string,
      document: formData.get('document') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
    };
    storage.saveOwner(newOwner);
    setOwners(storage.getOwners());
    setIsModalOpen(false);
    setEditingOwner(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este proprietário?')) {
      storage.deleteOwner(id);
      setOwners(storage.getOwners());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Icons.Search />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou telefone..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => { setEditingOwner(null); setIsModalOpen(true); }}
          className="w-full md:w-auto flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Icons.Plus />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Informações do Cliente</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Endereço</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOwners.length > 0 ? filteredOwners.map(owner => (
                <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-800">{owner.name}</div>
                    <div className="text-xs text-rose-500">{owner.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{owner.document}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="mr-2 text-rose-500">📞</span>
                      {owner.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-xs text-gray-600 line-clamp-2" title={owner.address}>
                      {owner.address || 'Não informado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => { setEditingOwner(owner); setIsModalOpen(true); }}
                      className="text-gray-400 hover:text-rose-600 transition-colors"
                      title="Editar"
                    >
                      <Icons.Edit />
                    </button>
                    <button 
                      onClick={() => handleDelete(owner.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Icons.Trash />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Nenhum cliente encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingOwner ? "Editar Proprietário" : "Cadastrar Proprietário"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-1">Dados Pessoais</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                <input 
                  name="name" 
                  defaultValue={editingOwner?.name} 
                  required 
                  placeholder="Nome do Cliente"
                  className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF / CNPJ</label>
                <input 
                  name="document" 
                  defaultValue={editingOwner?.document} 
                  required 
                  placeholder="000.000.000-00"
                  className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone / WhatsApp</label>
                <input 
                  name="phone" 
                  defaultValue={editingOwner?.phone} 
                  required 
                  placeholder="(00) 00000-0000"
                  className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                <input 
                  name="email" 
                  type="email" 
                  defaultValue={editingOwner?.email} 
                  required 
                  placeholder="exemplo@email.com"
                  className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" 
                />
              </div>
            </div>

            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-1 pt-2">Localização</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço Completo</label>
                <textarea 
                  name="address" 
                  defaultValue={editingOwner?.address} 
                  required 
                  rows={2}
                  placeholder="Rua, Número, Bairro, Cidade - Estado"
                  className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium transition-colors shadow-md"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Owners;

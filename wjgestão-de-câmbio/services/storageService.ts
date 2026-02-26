
import { Owner, Vehicle, ServiceOrder, ServiceStatus, GearboxType } from '../types';

const STORAGE_KEYS = {
  OWNERS: 'wj_owners',
  VEHICLES: 'wj_vehicles',
  SERVICES: 'wj_services'
};

const INITIAL_OWNERS: Owner[] = [
  { id: '1', name: 'João Silva', document: '123.456.789-00', phone: '(11) 98888-7777', email: 'joao@email.com', address: 'Rua das Flores, 123' }
];

const INITIAL_VEHICLES: Vehicle[] = [
  { id: '1', plate: 'ABC-1234', brand: 'Toyota', model: 'Corolla', year: 2020, color: 'Prata', gearboxType: GearboxType.AUTOMATIC, mileage: 45000, ownerId: '1' }
];

const INITIAL_SERVICES: ServiceOrder[] = [
  { id: '1', vehicleId: '1', type: 'Troca de Óleo de Câmbio', description: 'Troca preventiva de fluído e filtro do câmbio CVT.', entryDate: '2023-10-01', exitDate: '2023-10-02', status: ServiceStatus.FINISHED, value: 1200.00 }
];

class StorageService {
  private get<T>(key: string, initial: T[]): T[] {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  private set<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Owners
  getOwners(): Owner[] { return this.get(STORAGE_KEYS.OWNERS, INITIAL_OWNERS); }
  saveOwner(owner: Owner): void {
    const owners = this.getOwners();
    const index = owners.findIndex(o => o.id === owner.id);
    if (index >= 0) owners[index] = owner;
    else owners.push(owner);
    this.set(STORAGE_KEYS.OWNERS, owners);
  }
  deleteOwner(id: string): void {
    const owners = this.getOwners().filter(o => o.id !== id);
    this.set(STORAGE_KEYS.OWNERS, owners);
  }

  // Vehicles
  getVehicles(): Vehicle[] { return this.get(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES); }
  saveVehicle(vehicle: Vehicle): void {
    const vehicles = this.getVehicles();
    const index = vehicles.findIndex(v => v.id === vehicle.id);
    if (index >= 0) vehicles[index] = vehicle;
    else vehicles.push(vehicle);
    this.set(STORAGE_KEYS.VEHICLES, vehicles);
  }
  deleteVehicle(id: string): void {
    const vehicles = this.getVehicles().filter(v => v.id !== id);
    this.set(STORAGE_KEYS.VEHICLES, vehicles);
  }

  // Services
  getServices(): ServiceOrder[] { return this.get(STORAGE_KEYS.SERVICES, INITIAL_SERVICES); }
  saveService(service: ServiceOrder): void {
    const services = this.getServices();
    const index = services.findIndex(s => s.id === service.id);
    if (index >= 0) services[index] = service;
    else services.push(service);
    this.set(STORAGE_KEYS.SERVICES, services);
  }
  deleteService(id: string): void {
    const services = this.getServices().filter(s => s.id !== id);
    this.set(STORAGE_KEYS.SERVICES, services);
  }
}

export const storage = new StorageService();

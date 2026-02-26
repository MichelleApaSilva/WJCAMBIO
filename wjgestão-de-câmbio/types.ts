
export enum ServiceStatus {
  ANALYSIS = 'Em Análise',
  REPAIR = 'Em Reparo',
  FINISHED = 'Finalizado',
  CANCELLED = 'Cancelado'
}

export enum GearboxType {
  MANUAL = 'Manual',
  AUTOMATIC = 'Automático',
  CVT = 'CVT',
  DUAL_CLUTCH = 'Dupla Embreagem',
  AUTOMATED = 'Automatizado'
}

export enum PaymentMethod {
  MONEY = 'Dinheiro',
  CREDIT_CARD = 'Cartão de Crédito',
  DEBIT_CARD = 'Cartão de Débito',
  PIX = 'Pix',
  TRANSFER = 'Transferência',
  BOLETO = 'Boleto',
  NOT_PAID = 'Pendente'
}

export interface Owner {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  gearboxType: GearboxType;
  mileage: number;
  ownerId: string;
}

export interface ServiceOrder {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  entryDate: string;
  exitDate?: string;
  status: ServiceStatus;
  value: number;
  paymentMethod?: PaymentMethod;
}

export enum FuelType {
  PETROL = 'Petrol',
  DIESEL = 'Diesel',
  ELECTRIC = 'Electric',
  HYBRID = 'Hybrid',
  CNG = 'CNG'
}

export enum Transmission {
  MANUAL = 'Manual',
  AUTOMATIC = 'Automatic',
  CVT = 'CVT',
  DCT = 'DCT'
}

export interface CarDetails {
  brand: string;
  model: string;
  variant: string;
  year: number;
  fuel: FuelType;
  transmission: Transmission;
  ownership: number; // 1st, 2nd, etc.
  kmDriven: number;
  location: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ValuationResult {
  priceBand: {
    min: number;
    max: number;
    currency: string;
  };
  originalMsrp?: string;
  reasoning: string;
  groundingSources: GroundingChunk[];
  historicalMargin?: {
    percentage: number;
    description: string;
  };
}

export interface SalesHistoryItem {
  brand: string;
  model: string;
  year: number;
  boughtPrice: number;
  soldPrice: number;
  date: string;
}

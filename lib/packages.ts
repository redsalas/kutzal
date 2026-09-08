// Shared package definitions — safe to import on both client and server

export interface PackageOption {
  id: string;
  name: string;
  classes: number;
  price: number; // MXN pesos
  priceDisplay: string;
}

export const PACKAGE_OPTIONS: PackageOption[] = [
  { id: 'pkg_1',  name: 'Paquete de 1 clase',   classes: 1,  price: 135,  priceDisplay: '$135' },
  { id: 'pkg_8',  name: 'Paquete de 8 clases',  classes: 8,  price: 960,  priceDisplay: '$960' },
  { id: 'pkg_12', name: 'Paquete de 12 clases', classes: 12, price: 1380, priceDisplay: '$1,380' },
  { id: 'pkg_16', name: 'Paquete de 16 clases', classes: 16, price: 1760, priceDisplay: '$1,760' },
  { id: 'pkg_20', name: 'Paquete de 20 clases', classes: 20, price: 2100, priceDisplay: '$2,100' },
];

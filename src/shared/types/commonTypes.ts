export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}

export interface Address {
  id?: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  company?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'vali' | 'balo' | 'tui-xach';
  size: 'S' | 'M' | 'L' | 'XL';
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  weight: number;
  volumetricWeight: number;
  price: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

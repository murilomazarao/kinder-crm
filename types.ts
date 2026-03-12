export type KanbanStatus = "inbox" | "contacted" | "proposal" | "sale" | "shipped" | "delivered";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: KanbanStatus;
  value: number;
  lastContact: string;
  priority: "low" | "medium" | "high";
  products: string[]; // Product IDs
  customFields?: Record<string, any>; // Keyed by FieldDefinition.id
  createdAt: string;
  tags?: string[]; // Array of Tag IDs
  discount?: number;
  freight?: number;
  carrier?: string;
  quoteNumber?: string;
  isClient?: boolean;
  saleOrigin?: string;
  avatar?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type FieldType =
  | 'text' | 'long_text' | 'email' | 'fixed_text'
  | 'document' | 'phone' | 'date_time' | 'date'
  | 'time' | 'due_date' | 'currency' | 'number'
  | 'list_selection' | 'single_selection' | 'responsible'
  | 'checkbox' | 'attachment' | 'label'
  | 'connected_database' | 'connected_board' | 'formula' | 'sequencer';

export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  options?: string[]; // For selection types
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number; // Keeping for compatibility, but maybe we should deprecate it or use it as salePrice
  supplierPrice: number;
  salePrice: number;
  purchasePrice: number;
  stock: number;
  category: string;
  images: string[];
}

export interface KanbanColumnDefinition {
  id: string;
  title: string;
  color: string;
  order: number;
}

export interface Transaction {
  id: string;
  month: string;
  revenue: number;
  expenses: number;
}

export type InvoiceCategory = 'invoice' | 'order' | 'receipt' | 'other' | 'input_invoice' | 'output_invoice' | 'proposal' | 'contract' | 'document';

export interface Invoice {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'expense';
  category: InvoiceCategory;
  date: string;
  fileUrl?: string;
  customerId?: string;
  createdAt: string;
}
export interface ImportantContact {
  id: string;
  name: string;
  phone: string;
  company: string;
  category: string;
  createdAt: string;
}

import { Customer, Product, Transaction, KanbanStatus } from "./types";

export const KANBAN_COLUMNS: { id: KanbanStatus; title: string; color: string }[] = [
  { id: "inbox", title: "Caixa de Entrada", color: "bg-blue-500" },
  { id: "contacted", title: "Contato Efetuado", color: "bg-orange-500" },
  { id: "proposal", title: "Orçamento", color: "bg-purple-500" },
  { id: "sale", title: "Venda", color: "bg-green-500" },
  { id: "delivered", title: "Entregue", color: "bg-zinc-500" },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Alice Freeman",
    company: "TechFlow Inc",
    email: "alice@techflow.com",
    phone: "+55 11 99999-1001",
    status: "inbox",
    avatar: "https://picsum.photos/100/100?random=1",
    value: 12500,
    lastContact: "2023-10-25",
    priority: "high",
    products: ["p1", "p2"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "c2",
    name: "Roberto Silva",
    company: "Constructos",
    email: "beto@constructos.com.br",
    phone: "+55 11 99999-1002",
    status: "contacted",
    avatar: "https://picsum.photos/100/100?random=2",
    value: 4500,
    lastContact: "2023-10-26",
    priority: "medium",
    products: ["p3"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "c3",
    name: "Sarah Chen",
    company: "Global Logistics",
    email: "s.chen@globallog.com",
    phone: "+55 11 99999-1003",
    status: "proposal",
    avatar: "https://picsum.photos/100/100?random=3",
    value: 22000,
    lastContact: "2023-10-24",
    priority: "high",
    products: ["p1", "p4", "p5"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "c4",
    name: "Michael Ross",
    company: "Law & Partners",
    email: "m.ross@lawpartners.com",
    phone: "+55 11 99999-1004",
    status: "sale",
    avatar: "https://picsum.photos/100/100?random=4",
    value: 8900,
    lastContact: "2023-10-20",
    priority: "low",
    products: ["p2"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "c5",
    name: "Emma Watson",
    company: "Creative Studio",
    email: "emma@studio.com",
    phone: "+55 11 99999-1005",
    status: "inbox",
    avatar: "https://picsum.photos/100/100?random=5",
    value: 3200,
    lastContact: "2023-10-27",
    priority: "medium",
    products: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "c6",
    name: "David Miller",
    company: "Retail King",
    email: "david@retailking.com",
    phone: "+55 11 99999-1006",
    status: "delivered",
    avatar: "https://picsum.photos/100/100?random=6",
    value: 15600,
    lastContact: "2023-10-15",
    priority: "low",
    products: ["p5"],
    createdAt: new Date().toISOString(),
  }
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "p1", name: "Ergonomic Chair Ultra", sku: "FUR-001", price: 1200, supplierPrice: 800, salePrice: 1200, purchasePrice: 600, stock: 45, category: "Furniture", images: ["https://picsum.photos/200/200?random=10"] },
  { id: "p2", name: "Standing Desk Pro", sku: "FUR-002", price: 2500, supplierPrice: 1500, salePrice: 2500, purchasePrice: 1250, stock: 12, category: "Furniture", images: ["https://picsum.photos/200/200?random=11"] },
  { id: "p3", name: "Monitor Arm Dual", sku: "ACC-001", price: 450, supplierPrice: 300, salePrice: 450, purchasePrice: 225, stock: 8, category: "Accessories", images: ["https://picsum.photos/200/200?random=12"] },
  { id: "p4", name: "Mechanical Keyboard", sku: "TEC-001", price: 650, supplierPrice: 400, salePrice: 650, purchasePrice: 325, stock: 120, category: "Tech", images: ["https://picsum.photos/200/200?random=13"] },
  { id: "p5", name: "Noise Cancelling Headset", sku: "TEC-002", price: 890, supplierPrice: 500, salePrice: 890, purchasePrice: 445, stock: 5, category: "Tech", images: ["https://picsum.photos/200/200?random=14"] },
  { id: "p6", name: "Desk Mat Large", sku: "ACC-002", price: 120, supplierPrice: 80, salePrice: 120, purchasePrice: 60, stock: 200, category: "Accessories", images: ["https://picsum.photos/200/200?random=15"] },
];

export const PRODUCT_CATEGORIES = [
  "Balanço",
  "Escorregadores",
  "Brinquedos de Molas",
  "Casinhas",
  "Mini Playgrounds",
  "Bancos",
  "Tubos",
  "Geral"
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t1", month: "Jan", revenue: 45000, expenses: 32000 },
  { id: "t2", month: "Feb", revenue: 52000, expenses: 34000 },
  { id: "t3", month: "Mar", revenue: 48000, expenses: 31000 },
  { id: "t4", month: "Apr", revenue: 61000, expenses: 42000 },
  { id: "t5", month: "May", revenue: 55000, expenses: 38000 },
  { id: "t6", month: "Jun", revenue: 67000, expenses: 45000 },
];

export const LOGO_URL = 'https://oswthqpzizyqrqbojzwx.supabase.co/storage/v1/object/public/arquivos/logo-kinderplay.png';
export const LOGO_ICON_URL = 'https://oswthqpzizyqrqbojzwx.supabase.co/storage/v1/object/public/arquivos/logo-kinderplay-icone.png';
export const LOJA_INTEGRADA_ICON_URL = 'https://oswthqpzizyqrqbojzwx.supabase.co/storage/v1/object/public/arquivos/loja-integrada.png';

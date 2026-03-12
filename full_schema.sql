-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Kanban Columns
CREATE TABLE IF NOT EXISTS kanban_columns (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    color TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- 2. Tags
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    color TEXT NOT NULL
);

-- 3. Field Definitions
CREATE TABLE IF NOT EXISTS field_definitions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    options TEXT[] -- Array of strings for selection options
);

-- 4. Products
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sku TEXT,
    price NUMERIC DEFAULT 0, -- Legacy field
    supplier_price NUMERIC DEFAULT 0,
    sale_price NUMERIC DEFAULT 0,
    purchase_price NUMERIC DEFAULT 0,
    stock INTEGER DEFAULT 0,
    category TEXT,
    images TEXT[] -- Array of image URLs
);

-- 5. Customers
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL, -- references kanban_columns(id)
    value NUMERIC DEFAULT 0,
    last_contact TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    products TEXT[], -- Array of Product IDs
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[], -- Array of Tag IDs
    discount NUMERIC DEFAULT 0,
    freight NUMERIC DEFAULT 0,
    is_client BOOLEAN DEFAULT FALSE,
    sale_origin TEXT,
    carrier TEXT,
    quote_number TEXT,
    avatar TEXT -- Avatar Column
);

-- 6. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    value NUMERIC DEFAULT 0,
    type TEXT CHECK (type IN ('income', 'expense')),
    category TEXT CHECK (category IN ('invoice', 'order', 'receipt', 'other')),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_url TEXT,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Bling NFSe Integration Columns
    payment_id TEXT,
    platform TEXT,
    message TEXT,
    status TEXT,
    bling_rps TEXT,
    invoice_id TEXT,
    send_data TIMESTAMP WITH TIME ZONE
);

-- 7. Bling Configuration
CREATE TABLE IF NOT EXISTS bling_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT NOT NULL UNIQUE,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status TEXT,
    message TEXT,
    code TEXT,
    user_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Storage Setup (Arquivos Bucket)
-- Ensure this is run in the Supabase SQL editor as it interacts with the storage schema
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('arquivos', 'arquivos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'arquivos' );
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'arquivos' );
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'arquivos' );
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'arquivos' );
*/

-- 10. Initial Data Seeds
-- Seed Columns
INSERT INTO kanban_columns (id, title, color, "order") VALUES
('inbox', 'Inbox', '#64748b', 0),
('contacted', 'Contato Realizado', '#3b82f6', 1),
('proposal', 'Proposta', '#eab308', 2),
('sale', 'Pedido Efetuado', '#22c55e', 3),
('shipped', 'Pedido Enviado', '#8b5cf6', 4),
('delivered', 'Entregue', '#ec4899', 5)
ON CONFLICT (id) DO NOTHING;

-- Seed Tags
INSERT INTO tags (name, color) VALUES
('VIP', '#ef4444'),
('Novo', '#3b82f6'),
('Indicação', '#10b981')
ON CONFLICT DO NOTHING;

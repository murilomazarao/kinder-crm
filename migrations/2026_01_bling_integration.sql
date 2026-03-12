CREATE TABLE IF NOT EXISTS bling_contacts (

id BIGINT PRIMARY KEY,
nome VARCHAR(255),
documento VARCHAR(50),
email VARCHAR(255),
telefone VARCHAR(50),
updated_at DATETIME

);

CREATE TABLE IF NOT EXISTS bling_products (

id BIGINT PRIMARY KEY,
nome VARCHAR(255),
codigo VARCHAR(100),
preco DECIMAL(10,2),
updated_at DATETIME

);

CREATE TABLE IF NOT EXISTS bling_orders (

id BIGINT PRIMARY KEY,
numero VARCHAR(50),
cliente_id BIGINT,
total DECIMAL(10,2),
data_emissao DATETIME

);

CREATE TABLE IF NOT EXISTS bling_invoices (

id BIGINT PRIMARY KEY,
numero VARCHAR(50),
serie VARCHAR(50),
valor_total DECIMAL(10,2),
data_emissao DATETIME

);

CREATE TABLE IF NOT EXISTS bling_sync_state (

entity VARCHAR(50) PRIMARY KEY,
last_sync DATETIME

);

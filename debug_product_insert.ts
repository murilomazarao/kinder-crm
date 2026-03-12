import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.gabrielguimaraes.site';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    const product = {
        id: crypto.randomUUID(),
        name: 'Test Product',
        sku: 'TEST-001',
        price: 100,
        supplier_price: 50,
        sale_price: 100,
        purchase_price: 50,
        stock: 10,
        category: 'Geral',
        images: []
    };

    console.log('Attempting to insert product:', product);

    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select();

    if (error) {
        console.error('Error inserting product:', JSON.stringify(error, null, 2));
    } else {
        console.log('Product inserted successfully:', data);
    }
}

testInsert();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://oswthqpzizyqrqbojzwx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zd3RocXB6aXp5cXJxYm9qend4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5ODExNDEsImV4cCI6MjA4NTU1NzE0MX0.B6PigvTXhIot8mxRIbtqMjXa06inYpHJiKz0X5PuRyI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadLogo(fileName) {
    const filePath = path.join(process.cwd(), 'assets', fileName);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    const fileBuffer = fs.readFileSync(filePath);

    const { data, error } = await supabase.storage
        .from('arquivos')
        .upload(fileName, fileBuffer, {
            contentType: 'image/png',
            upsert: true
        });

    if (error) {
        console.error(`Error uploading ${fileName}:`, error.message);
    } else {
        console.log(`Successfully uploaded ${fileName}:`, data.path);
    }
}

async function main() {
    await uploadLogo('logo-kinderplay.png');
    await uploadLogo('logo-kinderplay-icone.png');
    await uploadLogo('loja-integrada.png');
}

main();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const jsFile = fs.readFileSync('js/supabase.js', 'utf8');
const urlMatch = jsFile.match(/const SUPABASE_URL = '(.*?)'/);
const keyMatch = jsFile.match(/const SUPABASE_ANON_KEY = '(.*?)'/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
    const { data, error } = await supabase.from('setari').select('*');
    console.log(data);
}
run();

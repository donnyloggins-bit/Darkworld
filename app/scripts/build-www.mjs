// Copies the game (../index.html + art) into app/www for Capacitor, and writes config.js.
// Online mode: set SUPABASE_URL and SUPABASE_ANON_KEY in the environment (CI secrets),
// or keep a local ../config.js (gitignored). Without either, the app runs offline.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = dirname(dirname(fileURLToPath(import.meta.url)));
const root = dirname(app);
const www = join(app, 'www');

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });

const files = ['index.html', 'manifest.json', 'icon.svg', 'privacy.html'];
for (const f of files) if (existsSync(join(root, f))) copyFileSync(join(root, f), join(www, f));
cpSync(join(root, 'icons'), join(www, 'icons'), { recursive: true });

let images = 0;
for (const f of readdirSync(root)) {
  if (/\.(png|jpe?g|webp|gif)$/i.test(f)) { copyFileSync(join(root, f), join(www, f)); images++; }
}

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  writeFileSync(join(www, 'config.js'),
    `window.DW_CONFIG = ${JSON.stringify({ supabaseUrl: SUPABASE_URL, supabaseAnonKey: SUPABASE_ANON_KEY, raidRequireGps: true })};\n`);
  console.log('config.js: online mode (from environment)');
} else if (existsSync(join(root, 'config.js'))) {
  copyFileSync(join(root, 'config.js'), join(www, 'config.js'));
  console.log('config.js: copied from ../config.js');
} else {
  writeFileSync(join(www, 'config.js'), 'window.DW_CONFIG = null;\n');
  console.log('config.js: offline mode');
}
console.log(`www/ ready: ${files.length} pages, ${images} images, icons/`);

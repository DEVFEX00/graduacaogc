import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

mkdirSync('dist/client', { recursive: true });
mkdirSync('dist/server', { recursive: true });
for (const path of ['index.html', 'obrigado.html', 'estilo.css', 'obrigado.css', 'config.js',
  'medicao.js', 'pagina.js', 'cena.js', 'utm.js', 'fonts', 'img', 'media']) {
  cpSync(path, 'dist/client/' + path, { recursive: true });
}
for (const [source, target] of [
  ['worker/index.js', 'index.js'],
  ['utm.js', 'utm.js']
]) {
  cpSync(source, 'dist/server/' + target);
}
writeFileSync('dist/server/lead.js', readFileSync('lib/lead.js', 'utf8').replace("'../utm.js'", "'./utm.js'"));
writeFileSync('dist/server/wrangler.json', JSON.stringify({
  main: './index.js',
  compatibility_date: '2025-01-01',
  assets: { directory: '../client', binding: 'ASSETS', run_worker_first: ['/api/lead'] }
}, null, 2) + '\n');

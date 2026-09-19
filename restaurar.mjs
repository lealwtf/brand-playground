#!/usr/bin/env node
/* Restaura um snapshot de snapshots/ para brand.json.
 *
 * Por que existe: no boot o app escolhe entre o brand.json e o localStorage do
 * navegador pelo meta.updatedAt mais novo. Copiar um snapshot antigo por cima
 * na mão nao restaura nada: o localStorage vence e o app volta pro estado atual.
 * Este script carimba updatedAt = agora, entao o arquivo ganha.
 *
 * Uso:
 *   node restaurar.mjs                  lista os snapshots
 *   node restaurar.mjs <arquivo|prefixo>  restaura
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SNAPS = path.join(DIR, 'snapshots');
const LIVE = path.join(DIR, 'brand.json');

const listar = () => fs.existsSync(SNAPS)
  ? fs.readdirSync(SNAPS).filter(f => f.endsWith('.json')).sort().reverse()
  : [];

const resumo = s => {
  const c = s.colors || {}, t = s.type || {}, i = s.identity || {};
  return `${i.name || '?'} · ${c.primary || '?'} ${c.secondary || ''} ${c.accent || ''} · ${t.head || '?'}/${t.body || '?'} · destaque ${t.highlight || '?'}`;
};

const arg = process.argv[2];
const arquivos = listar();

if (!arg) {
  if (!arquivos.length) { console.log('Nenhum snapshot em snapshots/.'); process.exit(0); }
  console.log('Snapshots disponiveis (mais novo primeiro):\n');
  for (const f of arquivos) {
    let r = '(ilegivel)';
    try { r = resumo(JSON.parse(fs.readFileSync(path.join(SNAPS, f), 'utf8'))); } catch {}
    console.log(`  ${f}\n      ${r}`);
  }
  console.log('\nPara restaurar:  node restaurar.mjs ' + arquivos[0]);
  process.exit(0);
}

const alvo = arquivos.find(f => f === arg || f.startsWith(arg) || f === arg + '.json');
if (!alvo) {
  console.error(`Nao achei "${arg}" em snapshots/.`);
  if (arquivos.length) console.error('Tem: ' + arquivos.join(', '));
  process.exit(1);
}

let estado;
try { estado = JSON.parse(fs.readFileSync(path.join(SNAPS, alvo), 'utf8')); }
catch (e) { console.error('Snapshot invalido: ' + e.message); process.exit(1); }
if (estado.v !== 1 || !estado.identity || !estado.colors) {
  console.error('Isso nao parece um estado do playground (falta v:1 / identity / colors).');
  process.exit(1);
}

// guarda o que esta no ar agora, para o caso de a restauracao ser um erro
if (fs.existsSync(LIVE)) {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const seguro = path.join(SNAPS, `antes-de-restaurar-${stamp}.json`);
  fs.copyFileSync(LIVE, seguro);
  console.log('Estado atual guardado em  snapshots/' + path.basename(seguro));
}

// carimbo novo, senao o localStorage do navegador vence no boot
estado.meta = estado.meta || {};
estado.meta.updatedAt = Date.now();

const tmp = LIVE + '.tmp';
fs.writeFileSync(tmp, JSON.stringify(estado, null, 2));
fs.renameSync(tmp, LIVE);

console.log('Restaurado em brand.json      ' + resumo(estado));
console.log('');
console.log('ATENCAO: se a aba do playground estiver aberta, ela ainda tem o estado antigo');
console.log('em memoria e vai sobrescrever o brand.json na proxima gravacao.');
console.log('Feche a aba ANTES de rodar isto, e abra de novo depois.');

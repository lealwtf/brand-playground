// server.mjs — servidor local zero-dependência: serve o playground e grava brand.json em disco.
// Uso: node server.mjs [porta]   (padrão 4747)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2] || process.env.PORT || 4747);
const DATA = path.join(DIR, 'brand.json');
const BACKUPS = path.join(DIR, 'backups');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/markdown; charset=utf-8', '.ico': 'image/x-icon' };

const send = (res, code, body, type = 'application/json; charset=utf-8') => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' }); res.end(typeof body === 'string' ? body : JSON.stringify(body)); };

// --- Disponibilidade de domínio via RDAP (registro público, sem chave de API) ---
// Usa o bootstrap oficial da IANA para achar o servidor RDAP do TLD. Só responde "livre"
// quando um registro de verdade devolveu 404 — TLD sem RDAP vira "?" em vez de falso positivo.
// Fallback: registros NS no DNS provam que está registrado (a ausência não prova o contrário).
const rdapCache = new Map();
const CACHE_MS = 10 * 60 * 1000;
const RATE_WINDOW = 60_000, RATE_MAX = 60;
let rateHits = [];
const VALID_DOMAIN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,20}){1,2}$/;

let bootstrap = null, bootstrapAt = 0;
async function rdapBase(tld) {
  if (tld === 'br') return 'https://rdap.registro.br/';
  if (!bootstrap || Date.now() - bootstrapAt > 24 * 3600 * 1000) {
    try {
      const r = await fetchT('https://data.iana.org/rdap/dns.json', 9000);
      const j = await r.json();
      const map = new Map();
      for (const [tlds, urls] of j.services || []) for (const t of tlds) if (urls?.[0]) map.set(t, urls[0]);
      bootstrap = map; bootstrapAt = Date.now();
    } catch { bootstrap = bootstrap || new Map(); bootstrapAt = Date.now(); }
  }
  return bootstrap.get(tld) || null;
}
function fetchT(url, ms) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), ms);
  return fetch(url, { signal: ac.signal, redirect: 'follow', headers: { accept: 'application/rdap+json, application/json', 'user-agent': 'brand-playground/1.0 (uso local)' } })
    .finally(() => clearTimeout(timer));
}

async function checkDomain(domain) {
  const hit = rdapCache.get(domain);
  if (hit && Date.now() - hit.at < CACHE_MS) return { ...hit, cached: true };
  const now = Date.now();
  rateHits = rateHits.filter(t => now - t < RATE_WINDOW);
  if (rateHits.length >= RATE_MAX) return { domain, status: 'limite', via: 'local' };
  rateHits.push(now);

  const tld = domain.split('.').pop();
  let status = 'desconhecido', via = 'sem-rdap';
  const base = await rdapBase(tld);
  if (base) {
    via = 'rdap';
    try {
      const r = await fetchT(base.replace(/\/?$/, '/') + 'domain/' + domain, 9000);
      if (r.status === 404) status = 'livre';
      else if (r.ok) status = 'registrado';
      else if (r.status === 429) status = 'limite';
    } catch { status = 'desconhecido'; }
  }
  if (status === 'desconhecido') {
    try { const ns = await dns.promises.resolveNs(domain); if (ns?.length) { status = 'registrado'; via = 'dns'; } } catch {}
  }
  const out = { domain, status, via, at: Date.now() };
  rdapCache.set(domain, out);
  return out;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/state') {
    if (req.method === 'GET') {
      if (!fs.existsSync(DATA)) return send(res, 404, { error: 'sem estado salvo ainda' });
      return send(res, 200, fs.readFileSync(DATA, 'utf8'));
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      let body = ''; for await (const chunk of req) body += chunk;
      let parsed; try { parsed = JSON.parse(body); } catch { return send(res, 400, { error: 'JSON inválido' }); }
      const json = JSON.stringify(parsed, null, 2);
      const tmp = DATA + '.tmp'; fs.writeFileSync(tmp, json); fs.renameSync(tmp, DATA);
      try { fs.mkdirSync(BACKUPS, { recursive: true }); fs.writeFileSync(path.join(BACKUPS, `brand-${new Date().toISOString().slice(0, 10)}.json`), json); } catch {}
      return send(res, 200, { ok: true, savedAt: Date.now() });
    }
    return send(res, 405, { error: 'método não suportado' });
  }
  if (url.pathname === '/api/domain') {
    const names = (url.searchParams.get('name') || '').split(',').map(x => x.trim().toLowerCase()).filter(x => VALID_DOMAIN.test(x)).slice(0, 12);
    if (!names.length) return send(res, 400, { error: 'nenhum domínio válido' });
    const results = [];
    for (let i = 0; i < names.length; i += 4) results.push(...await Promise.all(names.slice(i, i + 4).map(checkDomain)));
    return send(res, 200, { results });
  }
  let p = decodeURIComponent(url.pathname); if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(DIR, p));
  if (!file.startsWith(DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'não encontrado', 'text/plain; charset=utf-8');
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Brand Playground → http://localhost:${PORT}`);
  console.log(`Estado salvo em: ${DATA} (backup diário em ${BACKUPS}/)`);
});

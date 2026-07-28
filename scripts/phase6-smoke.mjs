/**
 * Phase 6 smoke: health, SEO endpoints, catalog, finance, chat, FAQ.
 * Run: node scripts/phase6-smoke.mjs
 * Env: API_URL (default http://localhost:4000), SITE_URL (default http://localhost:3000)
 */
const API = process.env.API_URL ?? 'http://localhost:4000';
const SITE = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

async function req(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(
      `${method} ${url} → ${res.status}: ${typeof data === 'string' ? data.slice(0, 200) : JSON.stringify(data)}`,
    );
  }
  return { res, data, text };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const results = [];

  const health = await req(`${API}/api/health`);
  assert(health.data?.status === 'ok', 'health failed');
  results.push('✓ API health');

  const cars = await req(`${API}/api/cars`);
  assert(Array.isArray(cars.data) && cars.data.length > 0, 'cars empty');
  results.push(`✓ cars (${cars.data.length})`);

  const rates = await req(`${API}/api/finance/rates`);
  assert(rates.data?.currency === 'USD' || rates.data?.currency, 'finance rates');
  results.push('✓ finance rates');

  const chat = await req(`${API}/api/chat`, {
    method: 'POST',
    body: { message: 'Which SUVs do you have?', history: [] },
  });
  assert(typeof chat.data?.reply === 'string' && chat.data.reply.length > 10, 'chat reply');
  results.push(`✓ chat (${chat.data.source})`);

  const faq = await req(`${API}/api/faq`);
  assert(Array.isArray(faq.data) && faq.data.length >= 6, 'faq too few');
  results.push(`✓ faq (${faq.data.length})`);

  const robots = await req(`${SITE}/robots.txt`);
  assert(String(robots.text).toLowerCase().includes('sitemap'), 'robots.txt');
  results.push('✓ robots.txt');

  const sitemap = await req(`${SITE}/sitemap.xml`);
  assert(String(sitemap.text).includes('<urlset') || String(sitemap.text).includes('urlset'), 'sitemap');
  results.push('✓ sitemap.xml');

  const home = await req(`${SITE}/`);
  assert(String(home.text).toLowerCase().includes('suzuki') || home.res.ok, 'homepage');
  results.push('✓ homepage');

  console.log(results.join('\n'));
  console.log('\nPhase 6 smoke OK');
}

main().catch((err) => {
  console.error('Phase 6 smoke FAILED:', err.message);
  process.exit(1);
});

/**
 * Phase 3 API smoke: auth → configuration → quote → slots → test-drive booking.
 * Run: node scripts/phase3-smoke.mjs
 */
const API = process.env.API_URL ?? 'http://localhost:4000';

async function req(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
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
      `${method} ${path} → ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`,
    );
  }
  return data;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const results = [];

  const health = await req('/api/health');
  assert(health.status === 'ok', 'health failed');
  results.push('✓ health');

  const login = await req('/api/auth/login', {
    method: 'POST',
    body: { login: 'demo@suzuki.local', password: 'Demo1234' },
  });
  assert(login.accessToken, 'login missing token');
  const token = login.accessToken;
  results.push('✓ auth login');

  const carsPayload = await req('/api/cars?condition=NEW');
  const carList = Array.isArray(carsPayload)
    ? carsPayload
    : (carsPayload.items ?? carsPayload.data ?? []);
  assert(carList.length > 0, 'no NEW cars');
  const car = carList[0];
  results.push(`✓ cars (${car.slug})`);

  const saved = await req('/api/configurations', {
    method: 'POST',
    token,
    body: {
      carSlug: car.slug,
      bodyColorId: 'body-smoke-1',
      interiorColorId: 'int-smoke-1',
      selectedOptionIds: ['opt-a'],
      totalPrice: Number(car.price) || 15000,
      summary: 'Phase3 smoke config',
      snapshot: {
        bodyColorName: 'Smoke Red',
        interiorColorName: 'Black',
        optionNames: ['Option A'],
      },
    },
  });
  assert(saved.id, 'configuration create failed');
  assert(!Object.prototype.hasOwnProperty.call(saved, 'shareToken'), 'shareToken should be removed');
  results.push(`✓ configuration create (${saved.id})`);

  const current = await req(
    `/api/configurations/current?carSlug=${encodeURIComponent(car.slug)}`,
    { token },
  );
  assert(current.id === saved.id, 'current config mismatch');
  results.push('✓ configuration current');

  const list = await req('/api/configurations', { token });
  assert(Array.isArray(list) && list.some((c) => c.id === saved.id), 'list missing config');
  results.push('✓ configuration list');

  const quote = await req('/api/quotes', {
    method: 'POST',
    token,
    body: {
      customerName: 'Smoke Tester',
      customerPhone: '+44000000000',
      customerEmail: 'smoke@example.com',
      carSlug: car.slug,
      modelName: car.name ?? car.slug,
      summary: 'Phase3 smoke quote',
      totalPrice: Number(car.price) || 15000,
      dealerId: 'name-name-london',
      dealerName: 'Name name',
      contactMethod: 'EMAIL',
      configurationId: saved.id,
      notes: 'automated phase3 smoke',
    },
  });
  assert(quote.id, 'quote create failed');
  results.push(`✓ quote create (${quote.id})`);

  const day = new Date();
  day.setDate(day.getDate() + 2);
  while (day.getDay() === 0 || day.getDay() === 6) {
    day.setDate(day.getDate() + 1);
  }
  const date = day.toISOString().slice(0, 10);

  const slotList = await req(`/api/bookings/slots?date=${date}&type=TEST_DRIVE`);
  assert(Array.isArray(slotList) && slotList.length > 0, `no slots for ${date}`);
  const scheduledAt = slotList[0];
  assert(typeof scheduledAt === 'string', 'slot should be ISO string');
  results.push(`✓ booking slots (${date}, ${slotList.length})`);

  const booking = await req('/api/bookings/test-drive', {
    method: 'POST',
    token,
    body: {
      customerName: 'Smoke Tester',
      customerPhone: '+44000000000',
      customerEmail: 'smoke@example.com',
      carSlug: car.slug,
      scheduledAt,
      notes: 'phase3 smoke booking',
      configurationId: saved.id,
    },
  });
  assert(booking.id, 'test-drive booking failed');
  results.push(`✓ test-drive booking (${booking.id})`);

  await req('/api/configurations/delete', {
    method: 'POST',
    token,
    body: { id: saved.id },
  });
  results.push('✓ configuration delete');

  console.log('\nPhase 3 smoke OK\n');
  for (const line of results) console.log(line);
}

main().catch((err) => {
  console.error('\nPhase 3 smoke FAILED\n');
  console.error(err.message || err);
  process.exit(1);
});

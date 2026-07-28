/**
 * E19 Admin CMS smoke: staff login → dashboard → FAQ/Blog/Promotions/Cars CRUD → customer denied.
 * Run: node scripts/e19-admin-smoke.mjs
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
  return { ok: res.ok, status: res.status, data };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function reqUpload(path, { token, folder = 'cars' } = {}) {
  const formData = new FormData();
  const bytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  formData.append('file', new Blob([bytes], { type: 'image/png' }), 'smoke.png');

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}?folder=${folder}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  const results = [];

  const customerLoginAttempt = await req('/api/admin/auth/login', {
    method: 'POST',
    body: { login: 'demo@suzuki.local', password: 'Demo1234' },
  });
  assert(customerLoginAttempt.status === 403, 'customer account should be denied admin login');
  results.push('✓ customer account denied admin login');

  const login = await req('/api/admin/auth/login', {
    method: 'POST',
    body: { login: 'admin@suzuki.local', password: 'Admin1234' },
  });
  assert(login.ok && login.data.accessToken, 'admin login failed');
  assert(login.data.user.role === 'ADMIN', 'admin login missing role');
  const token = login.data.accessToken;
  results.push('✓ admin login (role: ADMIN)');

  const me = await req('/api/admin/auth/me', { token });
  assert(me.ok && me.data.role === 'ADMIN', 'admin /me failed');
  results.push('✓ admin /me');

  const noToken = await req('/api/admin/dashboard');
  assert(noToken.status === 401, 'dashboard should require auth');
  results.push('✓ dashboard requires auth');

  const dashboard = await req('/api/admin/dashboard', { token });
  assert(dashboard.ok && typeof dashboard.data.cars === 'number', 'dashboard summary failed');
  results.push('✓ dashboard summary');

  const upload = await reqUpload('/api/admin/media/upload', { token, folder: 'cars' });
  assert(upload.ok && upload.data.url?.startsWith('/uploads/cars/'), 'media upload failed');
  results.push('✓ Media upload (cars image)');

  const faq = await req('/api/admin/faq', {
    method: 'POST',
    token,
    body: { question: 'Smoke question?', answer: 'Smoke answer', category: 'smoke' },
  });
  assert(faq.ok && faq.data.id, 'faq create failed');
  const faqUpdated = await req(`/api/admin/faq/${faq.data.id}`, {
    method: 'PATCH',
    token,
    body: { sortOrder: 5 },
  });
  assert(faqUpdated.ok && faqUpdated.data.sortOrder === 5, 'faq update failed');
  const faqDeleted = await req(`/api/admin/faq/${faq.data.id}`, { method: 'DELETE', token });
  assert(faqDeleted.ok && faqDeleted.data.deleted, 'faq delete failed');
  results.push('✓ FAQ CRUD');

  const post = await req('/api/admin/blog-posts', {
    method: 'POST',
    token,
    body: { title: 'Smoke Post', content: 'Smoke content for the blog post.' },
  });
  assert(post.ok && post.data.slug, 'blog post create failed');
  const postDeleted = await req(`/api/admin/blog-posts/${post.data.id}`, {
    method: 'DELETE',
    token,
  });
  assert(postDeleted.ok, 'blog post delete failed');
  results.push('✓ Blog post CRUD');

  const promo = await req('/api/admin/promotions', {
    method: 'POST',
    token,
    body: { title: 'Smoke Promotion' },
  });
  assert(promo.ok && promo.data.id, 'promotion create failed');
  const promoDeleted = await req(`/api/admin/promotions/${promo.data.id}`, {
    method: 'DELETE',
    token,
  });
  assert(promoDeleted.ok, 'promotion delete failed');
  results.push('✓ Promotion CRUD');

  const now = new Date();
  const slotDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  slotDate.setHours(11, 0, 0, 0);
  const slotIso = slotDate.toISOString();

  const slotCreate = await req('/api/bookings/admin/slots', {
    method: 'POST',
    token,
    body: { startsAt: slotIso, type: 'TEST_DRIVE', maxBookings: 3 },
  });
  assert(slotCreate.ok && slotCreate.data.id, 'admin slot create failed');

  const slotUpdated = await req(`/api/bookings/admin/slots/${slotCreate.data.id}`, {
    method: 'PATCH',
    token,
    body: { isBlocked: true },
  });
  assert(slotUpdated.ok && slotUpdated.data.isBlocked === true, 'admin slot update failed');

  const from = slotDate.toISOString().slice(0, 10);
  const slotsList = await req(`/api/bookings/admin/slots?from=${from}&to=${from}&type=TEST_DRIVE`, {
    token,
  });
  assert(
    slotsList.ok && slotsList.data.some((slot) => slot.id === slotCreate.data.id),
    'admin slot not visible in list',
  );

  await req(`/api/bookings/admin/slots/${slotCreate.data.id}`, {
    method: 'PATCH',
    token,
    body: { isBlocked: false },
  });
  results.push('✓ Admin service slots (create/list/update, JWT-protected)');

  const noTokenSlots = await req(`/api/bookings/admin/slots?from=${from}&to=${from}`);
  assert(noTokenSlots.status === 401, 'admin slots should require auth');
  results.push('✓ admin slots require auth (no more X-Admin-Key)');

  const bookingsBefore = await req('/api/admin/bookings', { token });
  assert(bookingsBefore.ok && Array.isArray(bookingsBefore.data), 'admin bookings list failed');

  const testDriveSlots = await req(`/api/bookings/slots?date=${from}&type=TEST_DRIVE`);
  assert(Array.isArray(testDriveSlots.data) && testDriveSlots.data.length > 0, 'no public slots available');
  const scheduledAt = testDriveSlots.data[0];

  const booking = await req('/api/bookings/test-drive', {
    method: 'POST',
    body: {
      customerName: 'Smoke Tester',
      customerPhone: '+44 7000 000000',
      customerEmail: 'smoke@example.com',
      scheduledAt,
      notes: 'e19 admin smoke booking',
    },
  });
  assert(booking.ok && booking.data.id, 'test-drive booking failed');

  const bookingsAfter = await req('/api/admin/bookings?type=TEST_DRIVE', { token });
  assert(
    bookingsAfter.ok && bookingsAfter.data.some((item) => item.id === booking.data.id),
    'new booking not visible in admin list',
  );

  const bookingUpdated = await req(`/api/admin/bookings/${booking.data.id}`, {
    method: 'PATCH',
    token,
    body: { status: 'CONFIRMED' },
  });
  assert(bookingUpdated.ok && bookingUpdated.data.status === 'CONFIRMED', 'admin booking status update failed');
  results.push('✓ Admin bookings (list/filter/status update)');

  const quotesBefore = await req('/api/admin/quotes', { token });
  assert(quotesBefore.ok && Array.isArray(quotesBefore.data), 'admin quotes list failed');

  const quote = await req('/api/quotes', {
    method: 'POST',
    body: {
      carSlug: 'vitara',
      modelName: 'Vitara',
      summary: 'Smoke test configuration summary',
      totalPrice: 21000,
      customerName: 'Smoke Tester',
      customerPhone: '+44 7000 000000',
      customerEmail: 'smoke@example.com',
      dealerId: 'suzuki-birmingham',
      dealerName: 'Suzuki Birmingham',
      contactMethod: 'EITHER',
    },
  });
  assert(quote.ok && quote.data.id, `quote create failed: ${JSON.stringify(quote.data)}`);

  const quoteUpdated = await req(`/api/admin/quotes/${quote.data.id}`, {
    method: 'PATCH',
    token,
    body: { status: 'CONTACTED' },
  });
  assert(
    quoteUpdated.ok && quoteUpdated.data.status === 'CONTACTED',
    'admin quote status update failed',
  );
  results.push('✓ Admin quotes (list/status update)');

  const carsBefore = await req('/api/cars');
  const car = await req('/api/admin/cars', {
    method: 'POST',
    token,
    body: {
      name: 'Smoke Test Car',
      condition: 'NEW',
      year: 2025,
      price: 19999,
      bodyType: 'HATCHBACK',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      images: [upload.data.url],
    },
  });
  assert(car.ok && car.data.slug, 'car create failed');
  const carsAfter = await req('/api/cars');
  assert(carsAfter.data.length === carsBefore.data.length + 1, 'new car not visible on public site');
  const carDeleted = await req(`/api/admin/cars/${car.data.id}`, { method: 'DELETE', token });
  assert(carDeleted.ok, 'car delete failed');
  results.push('✓ Car CRUD (visible on public site without redeploy)');

  const staffUsers = await req('/api/admin/users', { token });
  assert(staffUsers.ok && Array.isArray(staffUsers.data) && staffUsers.data.length >= 1, 'staff users list failed');
  results.push('✓ Staff users list (admin only)');

  const contentLogin = await req('/api/admin/auth/login', {
    method: 'POST',
    body: { login: 'content@suzuki.local', password: 'Content1234' },
  });
  assert(contentLogin.ok && contentLogin.data.user.role === 'CONTENT_MANAGER', 'content manager login failed');
  const contentToken = contentLogin.data.accessToken;

  const contentBookingsDenied = await req('/api/admin/bookings', { token: contentToken });
  assert(contentBookingsDenied.status === 403, 'content manager should not access bookings');
  results.push('✓ content manager denied Operations');

  const dealerLogin = await req('/api/admin/auth/login', {
    method: 'POST',
    body: { login: 'dealer@suzuki.local', password: 'Dealer1234' },
  });
  assert(dealerLogin.ok && dealerLogin.data.user.role === 'DEALER_MANAGER', 'dealer manager login failed');
  const dealerToken = dealerLogin.data.accessToken;

  const dealerProbePost = await req('/api/admin/blog-posts', {
    method: 'POST',
    token,
    body: { title: 'Dealer Probe Post', content: 'Temporary post for role smoke.' },
  });
  assert(dealerProbePost.ok && dealerProbePost.data.id, 'probe blog create failed');
  const dealerDelete = await req(`/api/admin/blog-posts/${dealerProbePost.data.id}`, {
    method: 'DELETE',
    token: dealerToken,
  });
  assert(dealerDelete.status === 403, 'dealer manager should not delete blog posts');
  await req(`/api/admin/blog-posts/${dealerProbePost.data.id}`, { method: 'DELETE', token });
  results.push('✓ dealer manager denied content DELETE');

  const dealerUsersDenied = await req('/api/admin/users', { token: dealerToken });
  assert(dealerUsersDenied.status === 403, 'dealer manager should not list staff users');
  results.push('✓ dealer manager denied Settings');

  const dashWidgets = await req('/api/admin/dashboard', { token });
  assert(
    dashWidgets.ok &&
      typeof dashWidgets.data.quotesToday === 'number' &&
      typeof dashWidgets.data.upcomingTestDrives === 'number' &&
      typeof dashWidgets.data.activePromotions === 'number',
    'dashboard widgets missing',
  );
  results.push('✓ dashboard widgets (quotesToday / upcomingTestDrives / activePromotions)');

  console.log(results.join('\n'));
  console.log('\nAll E19 admin smoke checks passed.');
}

main().catch((error) => {
  console.error('\n✗ E19 admin smoke failed:', error.message);
  process.exit(1);
});

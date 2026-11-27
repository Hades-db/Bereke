const phones = [
  { id: 1, brand: 'Apple', name: 'iPhone 15 Pro', price: 96000, color: 'Титановый', emoji: '📱', specs: '6.1" OLED • A17 Pro • 48 МП', pop: 1 },
  { id: 2, brand: 'Samsung', name: 'Galaxy S24 Ultra', price: 108000, color: 'Чёрный', emoji: '📲', specs: '6.8" AMOLED • S-Pen • 200 МП', pop: 2 },
  { id: 3, brand: 'Xiaomi', name: 'Xiaomi 14', price: 64000, color: 'Чёрный', emoji: '📱', specs: '6.36" Leica • Snapdragon 8 Gen 3', pop: 3 },
  { id: 4, brand: 'Apple', name: 'iPhone 15', price: 78000, color: 'Синий', emoji: '📲', specs: '6.1" OLED • Dynamic Island', pop: 4 }
];

let currentBrand = 'all';
let selectedPhone = phones;
let selectedMem = '128 ГБ';
let memAddon = 0;
let term = 12;
let cartData = null;

let schedule = [
  { date: '15 дек 2026', sum: 6000, paid: true },
  { date: '15 янв 2027', sum: 6000, paid: false },
  { date: '15 фев 2027', sum: 6000, paid: false },
  { date: '15 мар 2027', sum: 6000, paid: false }
];

function switchAppMode(mode) {
  document.getElementById('modeClient').classList.toggle('active', mode === 'client');
  document.getElementById('modeAdmin').classList.toggle('active', mode === 'admin');
  document.getElementById('clientArea').style.display = mode === 'client' ? 'block' : 'none';
  document.getElementById('adminArea').style.display = mode === 'admin' ? 'block' : 'none';
  const isAuth = document.getElementById('scrAuth').classList.contains('active');
  document.getElementById('bottomNav').style.display = (mode === 'client' && !isAuth) ? 'flex' : 'none';
}

function handleAuth() {
  const otp = document.getElementById('otpBlock');
  if (otp.style.display === 'none') {
    otp.style.display = 'block';
    document.getElementById('authBtn').textContent = 'Подтвердить и войти';
  } else {
    loginSuccess();
  }
}

function loginSuccess() {
  document.getElementById('bottomNav').style.display = 'flex';
  navTo('scrCatalog');
}

function navTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'scrAuth') document.getElementById('bottomNav').style.display = 'none';
  document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
  const map = { scrCatalog: 'navCatalog', scrProduct: 'navCatalog', scrCart: 'navCart', scrPayments: 'navPayments', scrProfile: 'navProfile' };
  if (map[id]) document.getElementById(map[id]).classList.add('active');
}

function setBrand(b, el) {
  currentBrand = b;
  document.querySelectorAll('#brandChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderCatalog();
}

function renderCatalog() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const col = document.getElementById('colorFilter').value;
  const sort = document.getElementById('sortFilter').value;
  let list = phones.filter(p =>
    (currentBrand === 'all' || p.brand === currentBrand) &&
    (col === 'all' || p.color === col) &&
    p.name.toLowerCase().includes(q)
  );
  if (sort === 'asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'desc') list.sort((a, b) => b.price - a.price);

  document.getElementById('catalogGrid').innerHTML = list.map(p => `
    <div class="prod-card" onclick="openProduct(${p.id})">
      <div>
        <div class="prod-img">${p.emoji}</div>
        <div class="prod-title">${p.name}</div>
        <div class="prod-price">${p.color} • ${p.price.toLocaleString()} с</div>
      </div>
      <div class="prod-monthly num">от ${Math.round(p.price / 24).toLocaleString()} с/мес</div>
    </div>`).join('');
}

function openProduct(id) {
  selectedPhone = phones.find(p => p.id === id);
  memAddon = 0;
  selectedMem = '128 ГБ';
  document.getElementById('detEmoji').textContent = selectedPhone.emoji;
  document.getElementById('detTitle').textContent = selectedPhone.name;
  document.getElementById('detSpecs').textContent = selectedPhone.specs + ' • ' + selectedPhone.color;
  document.getElementById('memChips').innerHTML = [['128 ГБ', 0], ['256 ГБ', 8000], ['512 ГБ', 18000]].map(([m, add], i) =>
    `<button class="chip ${i === 0 ? 'active' : ''}" onclick="setMem('${m}',${add},this)">${m}</button>`).join('');
  calcInstallment();
  navTo('scrProduct');
}

function setMem(m, add, el) {
  selectedMem = m;
  memAddon = add;
  document.querySelectorAll('#memChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  calcInstallment();
}

function setTerm(t, el) {
  term = t;
  document.querySelectorAll('.term-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  calcInstallment();
}

function calcInstallment() {
  const base = selectedPhone.price + memAddon;
  const pct = parseInt(document.getElementById('downSlider').value);
  const down = Math.round(base * pct / 100);
  const rate = term === 24 ? 0.08 : 0;
  const total = Math.round((base - down) * (1 + rate));
  const monthly = Math.round(total / term);

  document.getElementById('detPrice').textContent = base.toLocaleString() + ' сом';
  document.getElementById('downPct').textContent = pct;
  document.getElementById('downVal').textContent = down.toLocaleString() + ' сом';
  document.getElementById('monthlyVal').textContent = monthly.toLocaleString() + ' сом / мес';
  document.getElementById('overpayVal').textContent = rate === 0 ? '0 сом (0%)' : Math.round((base - down) * rate).toLocaleString() + ' сом (8%)';
  cartData = { name: `${selectedPhone.name} (${selectedMem})`, total: total + down, monthly, term, down };
}

function addToCart() {
  document.getElementById('cartEmpty').style.display = 'none';
  document.getElementById('cartFlow').style.display = 'block';
  document.getElementById('scoringBox').style.display = 'none';
  document.getElementById('cartItemName').textContent = cartData.name;
  document.getElementById('cartItemTotal').textContent = cartData.total.toLocaleString() + ' сом';
  document.getElementById('cartItemDetails').textContent = `Срок: ${cartData.term} мес • Взнос: ${cartData.down.toLocaleString()} с • Платёж: ${cartData.monthly.toLocaleString()} с/мес`;
  navTo('scrCart');
}

function toggleKyc(id, text) {
  const el = document.getElementById(id);
  el.classList.add('done');
  el.textContent = text;
}

function submitScoring() {
  document.getElementById('cartFlow').style.display = 'none';
  document.getElementById('scoringBox').style.display = 'block';
  document.getElementById('scoringLoading').style.display = 'block';
  document.getElementById('scoringApproved').style.display = 'none';
  setTimeout(() => {
    document.getElementById('scoringLoading').style.display = 'none';
    document.getElementById('scoringApproved').style.display = 'block';
  }, 1200);
}

function signContract() {
  document.getElementById('activePlanTitle').textContent = cartData.name;
  document.getElementById('remainBalance').textContent = (cartData.total - cartData.down).toLocaleString() + ' сом';
  schedule = [
    { date: '15 дек 2026', sum: cartData.monthly, paid: false },
    { date: '15 янв 2027', sum: cartData.monthly, paid: false },
    { date: '15 фев 2027', sum: cartData.monthly, paid: false }
  ];
  renderSchedule();
  navTo('scrPayments');
}

function renderSchedule() {
  document.getElementById('scheduleList').innerHTML = schedule.map(s => `
    <div class="row sched-row">
      <span>${s.date}</span>
      <strong class="num">${s.sum.toLocaleString()} с</strong>
      <span style="font-size:11px;font-weight:700;color:${s.paid ? 'var(--primary)' : 'var(--muted)'};">${s.paid ? '✔ Оплачено' : 'Ожидается'}</span>
    </div>`).join('');
}

function payInstallment(full) {
  if (full) {
    schedule.forEach(s => s.paid = true);
    document.getElementById('remainBalance').textContent = '0 сом (Закрыта)';
  } else {
    const next = schedule.find(s => !s.paid);
    if (next) next.paid = true;
  }
  renderSchedule();
}

function changeCard() {
  const cur = document.getElementById('linkedCard').textContent;
  document.getElementById('linkedCard').textContent = cur.includes('Элкарт') ? 'Visa MBank •••• 8891' : 'Элкарт •••• 4512';
}

function adminAddPhone() {
  const name = document.getElementById('newPhoneName').value.trim();
  const price = parseInt(document.getElementById('newPhonePrice').value);
  if (!name || !price) return;
  phones.unshift({ id: Date.now(), brand: 'Apple', name, price, color: 'Титановый', emoji: '📱', specs: 'Новинка каталога', pop: 0 });
  document.getElementById('newPhoneName').value = '';
  document.getElementById('newPhonePrice').value = '';
  renderCatalog();
  alert('Смартфон добавлен в витрину клиента!');
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function sendChat() {
  const inp = document.getElementById('chatInput');
  if (!inp.value.trim()) return;
  const box = document.getElementById('chatBox');
  box.innerHTML += `<div class="chat-msg chat-user">${inp.value}</div>`;
  inp.value = '';
  setTimeout(() => {
    box.innerHTML += `<div class="chat-msg chat-bot">Спасибо за обращение! Оператор подключится в течение минуты. Досрочное погашение доступно без штрафов в разделе «Платежи».</div>`;
    box.scrollTop = box.scrollHeight;
  }, 500);
}

renderCatalog();
renderSchedule();

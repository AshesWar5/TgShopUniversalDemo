(() => {
  'use strict';

  /* ================= Helpers ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const tg = window.Telegram && window.Telegram.WebApp;
  const IN_TG = !!(tg && tg.platform && tg.platform !== 'unknown');
  const params = new URLSearchParams(location.search);
  const KEY = 'shop-demo-v1';
  const SHOP = window.SHOP || { name: '', has: false, title: 'Ваш магазин', withName: (h) => h };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => Math.round(n).toLocaleString('ru-RU') + ' ₽';
  const IMG = (id) => (String(id).startsWith('data:') ? id : `assets/products/${id}.jpg`);
  const hhmm = (t) => new Date(t).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const ago = (t) => {
    const m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return 'только что';
    if (m < 60) return `${m} мин назад`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} ч назад`;
    return new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };
  const plural = (n, a, b, c) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return a;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b;
    return c;
  };
  const haptic = (kind = 'light') => {
    if (!IN_TG || !tg.HapticFeedback) return;
    try {
      if (kind === 'success' || kind === 'error' || kind === 'warning') tg.HapticFeedback.notificationOccurred(kind);
      else tg.HapticFeedback.impactOccurred(kind);
    } catch (e) { /* noop */ }
  };

  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '48', '50', '52', '54', '56', '58', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  const sizeIdx = (s) => { const i = SIZE_ORDER.indexOf(s); return i < 0 ? 99 : i; };
  const CATS = window.SC_CATEGORIES;
  const catName = (id) => (CATS.find((c) => c.id === id) || {}).name || '';

  /* ================= Icons ================= */
  const sv = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
  const I = {
    search: sv('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    bag: sv('<path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>'),
    heart: sv('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>'),
    home: sv('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'),
    box: sv('<path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z"/><path d="M4 8l8 4 8-4M12 12v8"/>'),
    chart: sv('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    tag: sv('<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
    percent: sv('<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'),
    send: sv('<path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z"/><path d="m10 13 4-4"/>'),
    back: sv('<path d="m15 5-7 7 7 7"/>'),
    plus: sv('<path d="M12 5v14M5 12h14"/>'),
    x: sv('<path d="M6 6l12 12M18 6 6 18"/>'),
    check: sv('<path d="m5 12 5 5 9-10"/>'),
    chev: sv('<path d="m9 5 7 7-7 7"/>'),
    pin: sv('<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11Z"/><circle cx="12" cy="10" r="2.2"/>'),
    truck: sv('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    bell: sv('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
    reset: sv('<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/>'),
    info: sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    spark: sv('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
    image: sv('<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-8 8"/>'),
    trash: sv('<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>'),
    chat: sv('<path d="M5 18 3 21V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5Z"/>'),
    ruler: sv('<path d="M3 17 17 3l4 4L7 21l-4-4Z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>')
  };

  /* ================= State ================= */
  const now = Date.now();
  const M = 60000;
  const H = 3600000;

  function seedOrders() {
    const mk = (num, minsAgo, status, customer, delivery, lines, pay = 'cash') => {
      const items = lines.map(([pid, size, qty]) => {
        const p = window.SC_PRODUCTS.find((x) => x.id === pid);
        return { pid, size, qty, price: p.price, old: p.old, name: p.name, brand: p.brand, img: p.img[0] };
      });
      return {
        id: 'o' + num, num, createdAt: now - minsAgo * M, status, mine: false, customer, delivery, pay, comment: '',
        items, total: items.reduce((s, i) => s + i.price * i.qty, 0)
      };
    };
    return [
      mk(1046, 7, 'new', { name: 'Руслан К.', phone: '+7 928 *** 41 12' }, { type: 'pickup1' }, [['p16837', '3XL', 1], ['p16800', 'L', 1]]),
      mk(1045, 38, 'confirmed', { name: 'Магомед А.', phone: '+7 963 *** 08 77' }, { type: 'ship', city: 'Махачкала', addr: 'СДЭК, пр. Гамидова, 18' }, [['p16701', 'XL', 1]], 'transfer'),
      mk(1044, 95, 'ready', { name: 'Алексей М.', phone: '+7 905 *** 55 30' }, { type: 'pickup2' }, [['p16781', 'L', 1], ['p16786', 'M', 1]]),
      mk(1043, 190, 'done', { name: 'Ислам Г.', phone: '+7 988 *** 13 64' }, { type: 'ship', city: 'Москва', addr: 'Почта России, 125040' }, [['p16758', '2XL', 1]], 'transfer')
    ];
  }

  function seed() {
    return {
      v: 2,
      products: clone(window.SC_PRODUCTS).map((p) => ({ ...p, visible: true, sync: true })),
      cart: [],
      favs: ['p16833'],
      orders: seedOrders(),
      promo: { active: false, title: 'Чёрная пятница', percent: 20, cat: 'down', hours: 72, endsAt: 0 },
      log: [
        { t: now - 25 * M, h: 'Размер <b>L</b> продан — пост «Пиджак Brunello Cucinelli» обновлён' },
        { t: now - 52 * M, h: 'Опубликован пост «Куртка с капюшоном, тёмно-синяя»' },
        { t: now - 80 * M, h: 'Товар закончился — пост «Пуховик, графит» удалён из канала' }
      ],
      nextNum: 1047,
      nextPost: 16840,
      waitlist: 3,
      hints: {}
    };
  }

  let S;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const d = JSON.parse(raw); if (d && d.v === 2) return d; }
    } catch (e) { /* storage unavailable */ }
    return seed();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore quota / private mode */ }
  }
  S = load();

  const ui = {
    role: (params.get('role') || SHOP.role) === 'seller' ? 'seller' : 'client',
    ctab: 'catalog',
    stab: 'dash',
    stack: [],
    cat: 'all',
    size: null,
    q: '',
    pq: '',
    pfilter: 'all',
    ofilter: 'new',
    sel: {},
    draft: null,
    co: null,
    flash: null,
    lastKey: '',
    scroll: {}
  };

  /* ================= Domain ================= */
  const prod = (id) => S.products.find((p) => p.id === id);
  const stock = (p) => p.sizes.reduce((s, x) => s + x.q, 0);
  const avail = (p) => p.sizes.filter((x) => x.q > 0).sort((a, b) => sizeIdx(a.s) - sizeIdx(b.s));
  const brandLabel = (p) => (!p.brand || p.brand === 'Premium' ? catName(p.cat) : p.brand);
  const promoOn = () => S.promo.active && S.promo.endsAt > Date.now();
  function priceOf(p) {
    let price = p.price, old = p.old;
    if (promoOn() && (S.promo.cat === 'all' || S.promo.cat === p.cat)) {
      old = old || price;
      price = Math.round((price * (1 - S.promo.percent / 100)) / 10) * 10;
    }
    return { price, old, off: old ? Math.round((1 - price / old) * 100) : 0 };
  }
  const cartCount = () => S.cart.reduce((s, i) => s + i.qty, 0);
  const newOrders = () => S.orders.filter((o) => o.status === 'new').length;
  const addLog = (h) => { S.log.unshift({ t: Date.now(), h }); S.log = S.log.slice(0, 30); };

  const STEPS = ['new', 'confirmed', 'ready', 'done'];
  function statusLabel(o, st = o.status) {
    const ship = o.delivery.type === 'ship';
    return {
      new: 'Новый', confirmed: 'Подтверждён',
      ready: ship ? 'Отправлен' : 'Готов к выдаче',
      done: ship ? 'Доставлен' : 'Выдан',
      cancelled: 'Отменён'
    }[st];
  }
  const statusCls = { new: 'accent', confirmed: 'info', ready: 'warn', done: 'ok', cancelled: 'danger' };
  const deliveryText = (d) =>
    d.type === 'pickup1' ? 'Самовывоз · ул. Ленина, 10'
      : d.type === 'pickup2' ? 'Самовывоз · ТЦ «Центральный», 2 этаж'
        : `Доставка · ${esc(d.city || '')}${d.addr ? ', ' + esc(d.addr) : ''}`;

  /* ================= Toast ================= */
  let toastTimer;
  function toast(title, text = '', icon = I.check, img = null) {
    const el = $('#toast');
    el.innerHTML = `<div class="ic">${img ? `<img src="${img}" alt="">` : icon}</div><div><b>${title}</b>${text ? `<span>${text}</span>` : ''}</div>`;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  /* ================= Navigation ================= */
  const current = () => ui.stack[ui.stack.length - 1] || { v: ui.role === 'client' ? ui.ctab : ui.stab };
  function push(view) { saveScroll(); ui.stack.push(view); render(); }
  function back() { if (ui.stack.length) { ui.stack.pop(); render(); } }
  function setTab(t) {
    saveScroll();
    ui.stack = [];
    if (ui.role === 'client') ui.ctab = t; else ui.stab = t;
    render();
  }
  function setRole(r, tab) {
    if (ui.role === r && !tab) return;
    saveScroll();
    ui.role = r;
    ui.stack = [];
    if (tab) { if (r === 'client') ui.ctab = tab; else ui.stab = tab; }
    haptic('medium');
    render();
  }
  const keyOf = (v) => v.v + ':' + (v.id || '') + ':' + ui.role;
  function saveScroll() { const sc = $('#screen'); if (sc) ui.scroll[ui.lastKey] = sc.scrollTop; }

  /* ================= Shared bits ================= */
  function cardHTML(p) {
    const pr = priceOf(p);
    const av = avail(p);
    const sold = !av.length;
    const st = stock(p);
    const fav = S.favs.includes(p.id);
    let ribbon = '';
    if (sold) ribbon = 'Нет в наличии';
    else if (p.tag) ribbon = esc(p.tag);
    return `
      <div class="card ${sold ? 'soldout' : ''}">
        <button class="ph" data-a="open" data-id="${p.id}" style="width:100%">
          <img src="${IMG(p.img[0])}" alt="${esc(p.name)}" loading="lazy">
          ${pr.off && !sold ? `<span class="off">−${pr.off}%</span>` : ''}
          ${ribbon ? `<span class="ribbon">${ribbon}</span>` : ''}
        </button>
        <button class="fav ${fav ? 'on' : ''}" data-a="fav" data-id="${p.id}" aria-label="В избранное">${I.heart}</button>
        <div data-a="open" data-id="${p.id}">
          <div class="brand">${esc(brandLabel(p))}</div>
          <div class="name">${esc(p.name)}</div>
          <div class="prices"><span class="now">${fmt(pr.price)}</span>${pr.old ? `<span class="was">${fmt(pr.old)}</span>` : ''}</div>
          <div class="sz">${sold ? 'Сообщим о поступлении' : av.map((x) => x.s).join(' · ')}${!sold && st <= 1 ? ' · <span class="low">последний</span>' : ''}</div>
        </div>
      </div>`;
  }

  function bannerHTML(preview = false) {
    if (promoOn() || preview) {
      const pr = S.promo;
      const n = S.products.filter((p) => pr.cat === 'all' || pr.cat === p.cat).length;
      const sample = S.products.find((p) => pr.cat === 'all' || p.cat === pr.cat) || S.products[0];
      return `
        <div class="banner hot">
          <div class="kicker">${pr.cat === 'all' ? 'На весь каталог' : esc(catName(pr.cat))} · ${n} ${plural(n, 'товар', 'товара', 'товаров')}</div>
          <div class="ttl">${esc(pr.title || 'Акция')} −${pr.percent}%</div>
          <div class="txt">Скидка уже применена к ценам</div>
          <div class="timer" data-timer="${preview && !promoOn() ? Date.now() + pr.hours * H : pr.endsAt}"></div>
          <img src="${IMG(sample.img[0])}" alt="">
        </div>`;
    }
    return `
      <div class="banner">
        <div class="kicker" style="color:var(--accent)">Зимняя коллекция</div>
        <div class="ttl">До −60% на последние размеры</div>
        <div class="txt">Всё, что вы видите, — в наличии прямо сейчас</div>
        <img src="${IMG('16825_0')}" alt="">
      </div>`;
  }

  function hintHTML(id, html) {
    if (S.hints[id]) return '';
    return `<div class="hint">${I.info}<div>${html}</div><button data-a="hint" data-id="${id}" aria-label="Скрыть">${I.x}</button></div>`;
  }

  function postText(p) {
    const pr = priceOf(p);
    const av = avail(p);
    const title = (p.brand && p.brand !== 'Premium' && p.brand !== 'Готовый образ' ? `${esc(p.brand)} — ` : '') + esc(p.name);
    let t = `<b>${title}</b>\n\n`;
    if (pr.old) t += `Старая цена <s>${fmt(pr.old)}</s>\nЦена со скидкой <b>${fmt(pr.price)}</b>`;
    else t += `Цена <b>${fmt(pr.price)}</b>`;
    t += `\n\nРазмеры: ${av.length ? av.map((x) => x.s).join(', ') : '—'}`;
    return t;
  }
  function postHTML(p, opts = {}) {
    const av = avail(p);
    if ((!av.length || !p.visible) && p.sync && !opts.forceFull) {
      return `<div class="tgpost deleted">Публикация «${esc(p.name)}» удалена автоматически — товар закончился</div>`;
    }
    const views = (((p.post * 37) % 30) / 10 + 1.2).toFixed(1).replace('.', ',');
    return `
      <div class="tgpost">
        ${ui.flash === p.id ? '<div class="flash"></div>' : ''}
        <img class="pimg" src="${IMG(p.img[0])}" alt="" loading="lazy">
        <div class="body">${postText(p)}</div>
        <div class="meta"><span>👁 ${views}K</span><span>изменено ${hhmm(Date.now() - ((p.post % 50) * M))}</span></div>
        <button class="kb" data-a="fromChannel" data-id="${p.id}">🛍 Купить в приложении</button>
      </div>`;
  }

  /* ================= Client views ================= */
  const V = {};

  V.catalog = () => {
    const visible = S.products.filter((p) => p.visible);
    const inCat = visible.filter((p) => ui.cat === 'all' || p.cat === ui.cat);
    const sizes = [...new Set(inCat.flatMap((p) => avail(p).map((x) => x.s)))].sort((a, b) => sizeIdx(a) - sizeIdx(b));
    if (ui.size && !sizes.includes(ui.size)) ui.size = null;
    return {
      html: `
        <div class="hdr">
          <div class="logo-mark"><img src="assets/img/logo.svg" alt=""></div>
          <div class="grow"><h1>${esc(SHOP.title)}</h1><div class="sub">Мужская одежда и обувь · доставка по РФ</div></div>
          <button class="icon-btn" data-a="tab" data-t="cart" aria-label="Корзина">${I.bag}${cartCount() ? `<span class="badge">${cartCount()}</span>` : ''}</button>
        </div>
        <label class="search">${I.search}<input id="q" type="search" placeholder="Пуховик, Moncler, кроссовки…" value="${esc(ui.q)}" autocomplete="off"></label>
        ${hintHTML('c1', (SHOP.has ? `<b>Так может выглядеть приложение «${esc(SHOP.name)}».</b> Сейчас здесь товары для примера — в вашем будут ваши.` : '<b>Это демо на примере магазина мужской одежды.</b> С вашим названием и товарами всё будет выглядеть так же.') + ' Выберите свой размер — останется только то, что есть в наличии. Вверху можно переключиться на режим продавца.')}
        ${bannerHTML()}
        <div class="chips">${CATS.map((c) => `<button class="chip ${ui.cat === c.id ? 'on' : ''}" data-a="cat" data-id="${c.id}">${c.name}</button>`).join('')}</div>
        <div class="chips-label">Мой размер</div>
        <div class="chips">
          <button class="chip sm ${!ui.size ? 'on' : ''}" data-a="size" data-id="">Любой</button>
          ${sizes.map((s) => `<button class="chip sm ${ui.size === s ? 'on' : ''}" data-a="size" data-id="${s}">${s}</button>`).join('')}
        </div>
        <div id="pgrid">${gridHTML()}</div>`
    };
  };

  function gridHTML() {
    const q = ui.q.trim().toLowerCase();
    const list = S.products.filter((p) => p.visible
      && (ui.cat === 'all' || p.cat === ui.cat)
      && (!q || (p.name + ' ' + p.brand + ' ' + catName(p.cat)).toLowerCase().includes(q))
      && (!ui.size || p.sizes.some((x) => x.s === ui.size && x.q > 0)));
    const inStock = list.filter((p) => avail(p).length);
    const sold = ui.size ? [] : list.filter((p) => !avail(p).length);
    if (!inStock.length && !sold.length) {
      return `<div class="empty"><div class="ico">${I.search}</div><b>Ничего не нашлось</b>Попробуйте другой размер или категорию</div>`;
    }
    return `
      <div class="result-line"><span>${inStock.length} ${plural(inStock.length, 'товар', 'товара', 'товаров')} в наличии${ui.size ? ` · размер ${ui.size}` : ''}</span></div>
      <div class="grid">${inStock.map(cardHTML).join('')}</div>
      ${sold.length ? `<div class="section-t"><h3>Нет в наличии</h3><span>сообщим о поступлении</span></div><div class="grid">${sold.map(cardHTML).join('')}</div>` : ''}`;
  }

  V.product = ({ id }) => {
    const p = prod(id);
    if (!p) return V.catalog();
    const pr = priceOf(p);
    const av = avail(p);
    const sel = ui.sel[id];
    const selSize = p.sizes.find((x) => x.s === sel && x.q > 0);
    const fav = S.favs.includes(id);
    const sorted = [...p.sizes].sort((a, b) => sizeIdx(a.s) - sizeIdx(b.s));
    const isShoes = p.cat === 'shoes';
    return {
      noTabs: true,
      html: `
        <div class="pd-float"><div class="row">
          ${IN_TG ? '<span></span>' : `<button class="glass-btn" data-a="back" aria-label="Назад">${I.back}</button>`}
          <button class="glass-btn ${fav ? 'on' : ''}" data-a="fav" data-id="${id}" aria-label="В избранное">${I.heart}</button>
        </div></div>
        <div class="gallery">
          <div class="track" data-gallery>${p.img.map((im) => `<img src="${IMG(im)}" alt="">`).join('')}</div>
          ${p.img.length > 1 ? `<div class="dots">${p.img.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>` : ''}
        </div>
        <div class="pd">
          <div class="brand">${esc(brandLabel(p))}</div>
          <h2>${esc(p.name)}</h2>
          <div class="price-row">
            <span class="now">${fmt(pr.price)}</span>
            ${pr.old ? `<span class="was">${fmt(pr.old)}</span><span class="pill accent">−${pr.off}%</span>` : ''}
          </div>
          ${pr.old ? `<div class="save">Экономия ${fmt(pr.old - pr.price)}</div>` : ''}

          <div class="block-t"><b>${isShoes ? 'Размер обуви' : 'Размер'}</b><button class="link" data-a="fit">${I.ruler.replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')} Подобрать по росту</button></div>
          ${av.length ? `
            <div class="sizes">${sorted.map((x) => `
              <button class="size ${x.q <= 0 ? 'off' : ''} ${sel === x.s && x.q > 0 ? 'on' : ''}" ${x.q <= 0 ? 'disabled' : ''} data-a="pick" data-id="${id}" data-s="${x.s}">
                ${x.s}${x.q > 0 && x.q <= 2 ? `<small>${x.q} шт</small>` : ''}
              </button>`).join('')}
            </div>
            ${selSize && selSize.q === 1 ? '<div class="stock-note">Остался последний — успейте заказать</div>' : ''}
          ` : `<div class="toggle-row"><div class="t"><b>Товар закончился</b><span>Сообщим в Telegram, когда появится снова</span></div></div>`}

          <div class="block-t"><b>Описание</b></div>
          <div class="desc">${esc(p.desc || '')}</div>

          <div class="info-list">
            <div class="row">${I.pin}<div><b>Самовывоз сегодня</b><span>ул. Ленина, 10 · ТЦ «Центральный», 2 этаж · с 9:00 до 19:00</span></div></div>
            <div class="row">${I.truck}<div><b>Доставка по России</b><span>СДЭК или Почта России, 2–7 дней</span></div></div>
          </div>
          <div class="post-ref">Публикация в канале №${p.post} · обновляется автоматически</div>
        </div>`,
      bottom: av.length ? `
        <div class="buybar">
          <div class="sum"><small>${selSize ? 'Размер ' + selSize.s : 'Цена'}</small><b>${fmt(pr.price)}</b></div>
          <button class="btn primary grow" data-a="add" data-id="${id}" ${selSize ? '' : 'disabled'}>${selSize ? I.bag + ' В корзину' : 'Выберите размер'}</button>
        </div>` : `
        <div class="buybar"><button class="btn light grow" data-a="notify" data-id="${id}">${I.bell} Сообщить о поступлении</button></div>`
    };
  };

  V.favs = () => {
    const list = S.favs.map(prod).filter((p) => p && p.visible);
    return {
      html: `
        <div class="hdr"><div class="grow"><h1>Избранное</h1><div class="sub">${list.length} ${plural(list.length, 'товар', 'товара', 'товаров')}</div></div></div>
        ${list.length ? `<div class="grid" style="margin-top:6px">${list.map(cardHTML).join('')}</div>`
          : `<div class="empty"><div class="ico">${I.heart}</div><b>Пока пусто</b>Нажмите на сердечко у товара, чтобы сохранить его здесь</div>`}`
    };
  };

  V.cart = () => {
    const lines = S.cart.map((c) => ({ c, p: prod(c.pid) })).filter((x) => x.p);
    if (!lines.length) {
      return {
        html: `
          <div class="hdr"><div class="grow"><h1>Корзина</h1></div></div>
          <div class="empty"><div class="ico">${I.bag}</div><b>Корзина пуста</b>Добавьте товары из каталога — оформление займёт меньше минуты</div>
          <div class="pad"><button class="btn light block" data-a="tab" data-t="catalog">Перейти в каталог</button></div>`
      };
    }
    let total = 0, oldTotal = 0;
    const items = lines.map(({ c, p }) => {
      const pr = priceOf(p);
      const sz = p.sizes.find((x) => x.s === c.size);
      const max = sz ? sz.q : 0;
      total += pr.price * c.qty;
      oldTotal += (pr.old || pr.price) * c.qty;
      return `
        <div class="cart-item">
          <img src="${IMG(p.img[0])}" alt="" data-a="open" data-id="${p.id}">
          <div class="meta">
            <div class="brand">${esc(brandLabel(p))}</div>
            <div class="name">${esc(p.name)}</div>
            <div class="opt">Размер ${c.size}${max <= c.qty ? ' · больше нет в наличии' : ''}</div>
            <div class="bottom">
              <b>${fmt(pr.price * c.qty)}</b>
              <div class="stepper">
                <button data-a="cq" data-k="${c.pid}|${c.size}" data-d="-1">−</button><span>${c.qty}</span><button data-a="cq" data-k="${c.pid}|${c.size}" data-d="1" ${c.qty >= max ? 'disabled' : ''}>+</button>
              </div>
            </div>
          </div>
          <button class="x" data-a="cdel" data-k="${c.pid}|${c.size}" aria-label="Удалить">${I.x}</button>
        </div>`;
    }).join('');
    return {
      html: `
        <div class="hdr"><div class="grow"><h1>Корзина</h1><div class="sub">${cartCount()} ${plural(cartCount(), 'товар', 'товара', 'товаров')} · размеры зарезервируются при оформлении</div></div></div>
        ${items}
        <div class="summary">
          <div class="ln"><span>Товары</span><span>${fmt(oldTotal)}</span></div>
          ${oldTotal > total ? `<div class="ln disc"><span>Скидка</span><span>−${fmt(oldTotal - total)}</span></div>` : ''}
          <div class="ln"><span>Самовывоз</span><span>бесплатно</span></div>
          <div class="ln total"><span>Итого</span><span>${fmt(total)}</span></div>
        </div>`,
      bottom: `<div class="buybar"><div class="sum"><small>Итого</small><b>${fmt(total)}</b></div><button class="btn primary grow" data-a="checkout">Оформить заказ</button></div>`
    };
  };

  V.checkout = () => {
    if (!ui.co) {
      const u = IN_TG && tg.initDataUnsafe && tg.initDataUnsafe.user;
      ui.co = { name: u ? [u.first_name, u.last_name].filter(Boolean).join(' ') : '', phone: '', del: 'pickup1', city: '', addr: '', pay: 'cash', comment: '' };
    }
    const co = ui.co;
    const total = S.cart.reduce((s, c) => { const p = prod(c.pid); return p ? s + priceOf(p).price * c.qty : s; }, 0);
    const opt = (group, val, title, sub, right = '', disabled = false) => `
      <button class="opt-card ${co[group] === val ? 'on' : ''}" data-a="co" data-g="${group}" data-v="${val}" ${disabled ? 'disabled' : ''}>
        <span class="radio"></span><span class="t"><b>${title}</b><span>${sub}</span></span>${right ? `<span class="r">${right}</span>` : ''}
      </button>`;
    return {
      noTabs: true,
      html: `
        <div class="hdr">${IN_TG ? '' : `<button class="back-btn" data-a="back">${I.back}</button>`}<div class="grow"><h1>Оформление</h1><div class="sub">Менеджер подтвердит заказ в Telegram</div></div></div>
        <div class="form">
          <div class="fgroup"><div class="lbl">Контакты</div>
            <label class="field"><span>Имя</span><input class="input" data-f="co.name" value="${esc(co.name)}" placeholder="Как к вам обращаться" autocomplete="name"></label>
            <label class="field"><span>Телефон</span><input class="input" data-f="co.phone" value="${esc(co.phone)}" placeholder="+7 900 000-00-00" type="tel" inputmode="tel" autocomplete="tel"></label>
          </div>
          <div class="fgroup"><div class="lbl">Получение</div>
            ${opt('del', 'pickup1', 'Самовывоз — ул. Ленина, 10', 'Сегодня, с 9:00 до 19:00', 'бесплатно')}
            ${opt('del', 'pickup2', 'Самовывоз — ТЦ «Центральный», 2 этаж', 'Сегодня, с 9:00 до 19:00', 'бесплатно')}
            ${opt('del', 'ship', 'Доставка по России', 'СДЭК или Почта России, 2–7 дней', 'по тарифу')}
            ${co.del === 'ship' ? `
              <div class="row2" style="margin-top:6px">
                <label class="field"><span>Город</span><input class="input" data-f="co.city" value="${esc(co.city)}" placeholder="Махачкала"></label>
                <label class="field"><span>Адрес / ПВЗ</span><input class="input" data-f="co.addr" value="${esc(co.addr)}" placeholder="ПВЗ СДЭК"></label>
              </div>` : ''}
          </div>
          <div class="fgroup"><div class="lbl">Оплата</div>
            ${opt('pay', 'cash', 'При получении', 'Наличными или картой в магазине')}
            ${opt('pay', 'transfer', 'Переводом после подтверждения', 'Менеджер пришлёт реквизиты')}
            ${opt('pay', 'card', 'Онлайн — картой или СБП', 'Можно подключить вторым этапом', '', true)}
          </div>
          <div class="fgroup"><div class="lbl">Комментарий</div>
            <textarea class="input" data-f="co.comment" placeholder="Например: рост 182, вес 85 — подойдёт ли размер?">${esc(co.comment)}</textarea>
          </div>
        </div>`,
      bottom: `<div class="buybar"><div class="sum"><small>К оплате</small><b>${fmt(total)}</b></div><button class="btn primary grow" data-a="place">Подтвердить заказ</button></div>`
    };
  };

  V.success = ({ id }) => {
    const o = S.orders.find((x) => x.id === id);
    if (!o) return V.catalog();
    const lines = o.items.map((i) => `${esc(i.name)} · ${i.size}${i.qty > 1 ? ' × ' + i.qty : ''}`).join('<br>');
    return {
      noTabs: true,
      html: `
        <div class="success fade-in">
          <div class="check">${I.check}</div>
          <h2>Заказ №${o.num} оформлен</h2>
          <p>Размеры зарезервированы за вами. Менеджер подтвердит заказ — статус придёт сообщением от бота.</p>
          <div class="tg-msg">
            <div class="from"><img src="assets/img/logo.svg" alt="">${esc(SHOP.has ? SHOP.name + ' Bot' : 'Бот магазина')}</div>
            ✅ <b>Заказ №${o.num} принят!</b><br><br>${lines}<br><br>Итого: <b>${fmt(o.total)}</b><br>${deliveryText(o.delivery)}<br><br>Мы напишем, как только заказ будет готов.
            <div class="time">${hhmm(o.createdAt)}</div>
          </div>
          <div class="caption">Так клиент получает уведомление в Telegram</div>
        </div>`,
      bottom: `
        <div class="buybar" style="flex-direction:column;align-items:stretch;gap:8px">
          <button class="btn primary block" data-a="toSeller" data-t="sorders">Посмотреть заказ глазами продавца →</button>
          <button class="btn ghost block" data-a="done">Продолжить покупки</button>
        </div>`
    };
  };

  V.orders = () => {
    const mine = S.orders.filter((o) => o.mine).sort((a, b) => b.createdAt - a.createdAt);
    return {
      html: `
        <div class="hdr"><div class="grow"><h1>Мои заказы</h1><div class="sub">Статусы обновляются автоматически</div></div></div>
        ${mine.length ? hintHTML('c2', 'Переключитесь на <b>«Продавец»</b> и подтвердите заказ — статус здесь изменится, а клиенту придёт сообщение от бота.') : ''}
        ${mine.length ? mine.map((o) => orderCard(o, false)).join('')
          : `<div class="empty"><div class="ico">${I.box}</div><b>Заказов пока нет</b>Оформите первый заказ — он появится здесь со статусом</div>`}`
    };
  };

  function orderCard(o, seller) {
    const idx = STEPS.indexOf(o.status);
    const fresh = seller && o.status === 'new' && Date.now() - o.createdAt < 10 * M;
    return `
      <div class="order ${fresh ? 'fresh' : ''}">
        <div class="top"><div><b>Заказ №${o.num}</b><small>${ago(o.createdAt)} · ${hhmm(o.createdAt)}</small></div><span class="pill ${statusCls[o.status]}">${statusLabel(o)}</span></div>
        ${o.status !== 'cancelled' ? `<div class="timeline">${STEPS.map((s, i) => `<i class="${i <= idx ? 'on' : ''}"></i>`).join('')}</div>` : ''}
        <div class="thumbs">${o.items.map((i) => `<img src="${IMG(i.img)}" alt="">`).join('')}</div>
        <div class="lines">${o.items.map((i) => `<div><span>${esc(i.name)} · ${i.size}${i.qty > 1 ? ' × ' + i.qty : ''}</span><span>${fmt(i.price * i.qty)}</span></div>`).join('')}</div>
        ${seller ? `
          <div class="cust">
            <div><b>${esc(o.customer.name)}</b> · ${esc(o.customer.phone)}</div>
            <div>${deliveryText(o.delivery)}</div>
            <div>Оплата: ${{ cash: 'при получении', transfer: 'переводом', card: 'онлайн' }[o.pay]}</div>
            ${o.comment ? `<div>💬 ${esc(o.comment)}</div>` : ''}
          </div>` : ''}
        <div class="foot"><span style="color:var(--muted);font-size:13px">${seller ? '' : deliveryText(o.delivery)}</span><b>${fmt(o.total)}</b></div>
        ${seller && idx >= 0 && idx < 3 ? `
          <div class="acts">
            <button class="btn primary sm grow" data-a="advance" data-id="${o.id}">${{ new: 'Подтвердить', confirmed: o.delivery.type === 'ship' ? 'Отметить отправку' : 'Готов к выдаче', ready: o.delivery.type === 'ship' ? 'Доставлен' : 'Выдан' }[o.status]}</button>
            <button class="btn ghost sm" data-a="msg" data-id="${o.id}">${I.chat}</button>
            ${o.status === 'new' ? `<button class="btn danger sm" data-a="cancel" data-id="${o.id}">${I.x}</button>` : ''}
          </div>` : ''}
      </div>`;
  }

  /* ================= Seller views ================= */
  V.dash = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todays = S.orders.filter((o) => o.createdAt >= today.getTime() && o.status !== 'cancelled');
    const rev = todays.reduce((s, o) => s + o.total, 0);
    const units = S.products.reduce((s, p) => s + stock(p), 0);
    const low = S.products.filter((p) => p.visible && stock(p) === 1);
    const out = S.products.filter((p) => p.visible && stock(p) === 0);
    const news = S.orders.filter((o) => o.status === 'new').sort((a, b) => b.createdAt - a.createdAt);
    const week = [14, 19, 11, 23, 17, 26, Math.max(todays.length, 1) + 8];
    const max = Math.max(...week);
    const dn = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Сегодня'];
    return {
      html: `
        <div class="hdr"><div class="logo-mark"><img src="assets/img/logo.svg" alt=""></div><div class="grow"><h1>Панель магазина</h1><div class="sub">${new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div></div>
        ${hintHTML('s1', '<b>Попробуйте:</b> откройте любой товар во вкладке «Товары» и уберите размер — пост в канале обновится сам. Вкладка «Канал» покажет как.')}
        <div class="kpis">
          <button class="kpi accent" data-a="tab" data-t="sorders" style="text-align:left"><small>Новые заказы</small><b>${news.length}</b><div class="d">ждут подтверждения →</div></button>
          <div class="kpi"><small>Выручка сегодня</small><b>${fmt(rev)}</b><div class="d">${todays.length} ${plural(todays.length, 'заказ', 'заказа', 'заказов')}</div></div>
          <div class="kpi"><small>Единиц в наличии</small><b>${units}</b><div class="d" style="color:var(--muted)">${S.products.filter((p) => stock(p) > 0).length} моделей</div></div>
          <div class="kpi"><small>Ждут поступления</small><b>${S.waitlist}</b><div class="d" style="color:var(--muted)">подписались на размер</div></div>
        </div>
        <div class="section-t"><h3>Заказы за неделю</h3><span>пример статистики</span></div>
        <div class="pad"><div class="kpi" style="padding-bottom:10px">
          <div class="bars">${week.map((v, i) => `<i class="${i === 6 ? 'on' : ''}" style="height:${(v / max) * 100}%"></i>`).join('')}</div>
          <div class="bars-l">${dn.map((d) => `<span>${d}</span>`).join('')}</div>
        </div></div>
        ${news.length ? `<div class="section-t"><h3>Ждут подтверждения</h3><span>${news.length}</span></div>${news.slice(0, 2).map((o) => orderCard(o, true)).join('')}` : ''}
        ${low.length || out.length ? `
          <div class="section-t"><h3>Заканчивается</h3><span>${low.length + out.length}</span></div>
          <div class="list">${[...out, ...low].slice(0, 5).map((p) => prodRow(p)).join('')}</div>` : ''}
        <div class="section-t"><h3>Уведомления</h3></div>
        <div class="notice"><div class="ic">${I.bell}</div><div><b>Заказы приходят в Telegram</b><span>Бот сразу присылает заказ в общий чат менеджеров: товары, размеры, контакты и способ доставки. Переписывать ничего не нужно.</span></div></div>`
    };
  };

  function prodRow(p) {
    const st = stock(p);
    const pr = priceOf(p);
    const pill = !p.visible ? '<span class="pill muted">скрыт</span>' : st === 0 ? '<span class="pill danger">нет</span>' : st <= 1 ? '<span class="pill warn">мало</span>' : '<span class="pill ok">есть</span>';
    return `
      <button class="li" data-a="edit" data-id="${p.id}">
        <img src="${IMG(p.img[0])}" alt="">
        <div class="m">
          <b>${esc(p.name)}</b>
          <span>${esc(brandLabel(p))} · ${fmt(pr.price)}</span>
          <div class="szmini">${[...p.sizes].sort((a, b) => sizeIdx(a.s) - sizeIdx(b.s)).map((x) => `<i class="${x.q ? '' : 'z'}">${x.s}${x.q ? ' · ' + x.q : ''}</i>`).join('')}</div>
        </div>
        ${pill}
      </button>`;
  }

  V.sorders = () => {
    const f = ui.ofilter;
    const groups = { new: ['new'], work: ['confirmed', 'ready'], done: ['done', 'cancelled'], all: null };
    const list = S.orders.filter((o) => !groups[f] || groups[f].includes(o.status)).sort((a, b) => b.createdAt - a.createdAt);
    const cnt = (k) => S.orders.filter((o) => !groups[k] || groups[k].includes(o.status)).length;
    const chip = (k, l) => `<button class="chip sm ${f === k ? 'on' : ''}" data-a="ofilter" data-id="${k}">${l} · ${cnt(k)}</button>`;
    return {
      html: `
        <div class="hdr"><div class="grow"><h1>Заказы</h1><div class="sub">Все заказы из приложения в одном месте</div></div></div>
        <div class="chips">${chip('new', 'Новые')}${chip('work', 'В работе')}${chip('done', 'Завершённые')}${chip('all', 'Все')}</div>
        ${list.length ? list.map((o) => orderCard(o, true)).join('') : `<div class="empty"><div class="ico">${I.box}</div><b>Здесь пусто</b>Новые заказы появятся автоматически</div>`}`
    };
  };

  V.sproducts = () => ({
    html: `
      <div class="hdr"><div class="grow"><h1>Товары</h1><div class="sub">${S.products.length} моделей · остатки по размерам</div></div><button class="icon-btn" style="background:var(--accent)" data-a="newp" aria-label="Добавить товар">${I.plus}</button></div>
      <label class="search">${I.search}<input id="pq" type="search" placeholder="Найти товар" value="${esc(ui.pq)}" autocomplete="off"></label>
      <div class="chips">${[['all', 'Все'], ['in', 'В наличии'], ['low', 'Последние'], ['out', 'Нет в наличии']].map(([k, l]) => `<button class="chip sm ${ui.pfilter === k ? 'on' : ''}" data-a="pfilter" data-id="${k}">${l}</button>`).join('')}</div>
      <div id="plist">${plistHTML()}</div>`
  });
  function plistHTML() {
    const q = ui.pq.trim().toLowerCase();
    const list = S.products.filter((p) => {
      const st = stock(p);
      if (q && !(p.name + ' ' + p.brand).toLowerCase().includes(q)) return false;
      if (ui.pfilter === 'in') return st > 0;
      if (ui.pfilter === 'low') return st === 1;
      if (ui.pfilter === 'out') return st === 0;
      return true;
    });
    return list.length ? `<div class="list">${list.map(prodRow).join('')}</div>` : `<div class="empty"><b>Ничего не найдено</b></div>`;
  }

  V.editor = ({ id }) => {
    if (!ui.draft || ui.draft._for !== (id || 'new')) {
      const base = id ? clone(prod(id)) : { id: null, post: null, cat: 'jackets', brand: '', name: '', old: null, price: null, sizes: [{ s: 'L', q: 1 }, { s: 'XL', q: 1 }], img: [], desc: '', visible: true, sync: true };
      base._for = id || 'new';
      ui.draft = base;
    }
    const d = ui.draft;
    const off = d.old && d.price && d.old > d.price ? Math.round((1 - d.price / d.old) * 100) : 0;
    const sizes = [...d.sizes].sort((a, b) => sizeIdx(a.s) - sizeIdx(b.s));
    return {
      noTabs: true,
      html: `
        <div class="hdr">${IN_TG ? '' : `<button class="back-btn" data-a="back">${I.back}</button>`}<div class="grow"><h1>${id ? 'Редактирование' : 'Новый товар'}</h1><div class="sub">${id ? 'Публикация №' + d.post + ' в канале' : 'Опубликуется в канал автоматически'}</div></div>
          ${id ? `<button class="icon-btn" data-a="delp" aria-label="Удалить">${I.trash}</button>` : ''}</div>
        <div class="form">
          <div class="fgroup"><div class="lbl">Фото</div>
            <div class="photos">
              ${d.img.map((im) => `<img src="${IMG(im)}" alt="">`).join('')}
              <label class="add"><span>${I.image}Добавить</span><input type="file" accept="image/*" data-upload></label>
            </div>
          </div>
          <div class="fgroup"><div class="lbl">Основное</div>
            <label class="field"><span>Название</span><input class="input" data-f="draft.name" value="${esc(d.name)}" placeholder="Куртка на утином пуху"></label>
            <div class="row2">
              <label class="field"><span>Бренд</span><input class="input" data-f="draft.brand" value="${esc(d.brand === 'Premium' ? '' : d.brand)}" placeholder="Необязательно"></label>
              <label class="field"><span>Категория</span><select class="input" data-f="draft.cat">${CATS.filter((c) => c.id !== 'all').map((c) => `<option value="${c.id}" ${d.cat === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label>
            </div>
          </div>
          <div class="fgroup"><div class="lbl">Цена</div>
            <div class="row2">
              <label class="field"><span>Цена, ₽</span><input class="input" data-f="draft.price" data-num value="${d.price ?? ''}" inputmode="numeric" placeholder="3490"></label>
              <label class="field"><span>Старая цена, ₽</span><input class="input" data-f="draft.old" data-num value="${d.old ?? ''}" inputmode="numeric" placeholder="6500"></label>
            </div>
            <div class="calc" id="calc">${off ? `Скидка −${off}% · в канале будет «Старая цена / Цена со скидкой»` : ''}</div>
          </div>
          <div class="fgroup"><div class="lbl">Размеры и остатки</div>
            <div class="size-rows">${sizes.map((x) => `
              <div class="size-row">
                <b>${esc(x.s)}</b>
                <span class="st ${x.q ? '' : 'z'}">${x.q ? 'в наличии' : 'продан — скрыт из поста'}</span>
                <div class="stepper"><button data-a="sq" data-s="${esc(x.s)}" data-d="-1" ${x.q ? '' : 'disabled'}>−</button><span>${x.q}</span><button data-a="sq" data-s="${esc(x.s)}" data-d="1">+</button></div>
              </div>`).join('')}
            </div>
            <div class="add-size"><input class="input" id="newsize" placeholder="Новый размер, напр. 2XL или 42"><button class="btn ghost sm" data-a="addsize">${I.plus}</button></div>
          </div>
          <div class="fgroup"><div class="lbl">Публикация</div>
            <button class="toggle-row" style="width:100%;text-align:left" data-a="dtoggle" data-k="visible"><span class="t"><b>Показывать в приложении</b><span>Товар виден покупателям в каталоге</span></span><span class="switch ${d.visible ? 'on' : ''}"></span></button>
            <button class="toggle-row" style="width:100%;text-align:left" data-a="dtoggle" data-k="sync"><span class="t"><b>Синхронизировать пост в канале</b><span>Размеры и цена в посте обновляются сами, пост удаляется, когда товар закончился</span></span><span class="switch ${d.sync ? 'on' : ''}"></span></button>
          </div>
          <div class="fgroup"><div class="lbl">Так пост будет выглядеть в канале</div>
            <div class="tgfeed" style="margin:0"><div id="post-preview">${draftPreview()}</div></div>
          </div>
        </div>`,
      bottom: `<div class="buybar"><button class="btn primary grow" data-a="savep">${id ? 'Сохранить и обновить пост' : 'Опубликовать'}</button></div>`
    };
  };
  function draftPreview() {
    const d = ui.draft;
    const fake = { ...d, name: d.name || 'Название товара', price: d.price || 0, img: d.img.length ? d.img : ['16825_0'], post: d.post || S.nextPost };
    if (!d.img.length) fake.img = [null];
    const html = postHTML(fake, { forceFull: true }).replace('<button class="kb"', '<button class="kb" data-a="noop"');
    return d.img.length ? html : html.replace(/<img class="pimg"[^>]*>/, `<div class="pimg" style="display:grid;place-items:center;background:#22303f;color:#7f91a4;font-size:13px">Добавьте фото</div>`);
  }

  V.promo = () => {
    const pr = S.promo;
    const on = promoOn();
    const n = S.products.filter((p) => pr.cat === 'all' || pr.cat === p.cat).length;
    return {
      html: `
        <div class="hdr"><div class="grow"><h1>Акции</h1><div class="sub">Скидка применяется ко всем ценам автоматически</div></div>${on ? '<span class="pill ok">идёт</span>' : ''}</div>
        <div class="chips-label">Превью баннера в приложении</div>
        ${bannerHTML(true)}
        <div class="form">
          <div class="fgroup"><div class="lbl">Параметры</div>
            <label class="field"><span>Название акции</span><input class="input" data-f="promo.title" value="${esc(pr.title)}" ${on ? 'disabled' : ''}></label>
            <div class="range-wrap">
              <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="color:var(--muted);font-size:13px">Скидка</span><span class="v" id="pv">−${pr.percent}%</span></div>
              <input type="range" min="5" max="80" step="5" value="${pr.percent}" data-f="promo.percent" data-num ${on ? 'disabled' : ''}>
            </div>
          </div>
          <div class="fgroup"><div class="lbl">На что</div>
            <div class="chips" style="padding:0;flex-wrap:wrap">${CATS.map((c) => `<button class="chip sm ${pr.cat === c.id ? 'on' : ''}" data-a="pcat" data-id="${c.id}" ${on ? 'disabled' : ''}>${c.id === 'all' ? 'Весь каталог' : c.name}</button>`).join('')}</div>
            <div class="calc" style="margin-top:8px;color:var(--muted)">Применится к ${n} ${plural(n, 'товару', 'товарам', 'товарам')}</div>
          </div>
          <div class="fgroup"><div class="lbl">Длительность</div>
            <div class="chips" style="padding:0">${[[24, '24 часа'], [72, '3 дня'], [168, 'Неделя']].map(([h, l]) => `<button class="chip sm ${pr.hours === h ? 'on' : ''}" data-a="phours" data-id="${h}" ${on ? 'disabled' : ''}>${l}</button>`).join('')}</div>
          </div>
          <div class="notice" style="margin:0 0 18px">${`<div class="ic">${I.send}</div>`}<div><b>Анонс в канал — автоматически</b><span>При запуске в канал уйдёт пост об акции, а в приложении появится баннер с таймером. По окончании цены вернутся сами.</span></div></div>
        </div>`,
      bottom: `<div class="buybar">${on
        ? `<button class="btn danger grow" data-a="pstop">Остановить акцию</button>`
        : `<button class="btn primary grow" data-a="pstart">${I.spark} Запустить акцию</button>`}</div>`
    };
  };

  V.channel = () => {
    const posts = [...S.products].sort((a, b) => b.post - a.post).slice(0, 14);
    const html = `
      <div class="hdr"><div class="grow"><h1>Канал</h1><div class="sub">Посты синхронизируются с остатками автоматически</div></div></div>
      ${hintHTML('s2', 'Здесь видно, как выглядят посты в канале. Измените размер или цену товара — пост обновится. Закончился товар — пост удалится сам.')}
      <div class="section-t" style="padding-top:6px"><h3>Журнал синхронизации</h3><span>последние</span></div>
      <div class="log">${S.log.slice(0, 5).map((e) => `<div class="e"><time>${hhmm(e.t)}</time><span>${e.h}</span></div>`).join('')}</div>
      <div class="section-t"><h3>Лента канала</h3><span>${SHOP.has ? 'канал магазина' : '12,4 тыс. подписчиков'}</span></div>
      <div class="tgfeed">
        <div class="tgch-head"><img src="assets/img/logo.svg" alt=""><div><b>${esc(SHOP.title.toUpperCase())}</b><span>${SHOP.has ? 'канал магазина' : '12 400 подписчиков'}</span></div></div>
        ${posts.map((p) => postHTML(p)).join('')}
      </div>`;
    setTimeout(() => { ui.flash = null; }, 0);
    return { html };
  };

  /* ================= Render ================= */
  const TABS = {
    client: [['catalog', 'Каталог', I.home], ['favs', 'Избранное', I.heart], ['cart', 'Корзина', I.bag], ['orders', 'Заказы', I.box]],
    seller: [['dash', 'Сводка', I.chart], ['sorders', 'Заказы', I.box], ['sproducts', 'Товары', I.tag], ['promo', 'Акции', I.percent], ['channel', 'Канал', I.send]]
  };

  function render() {
    const cur = current();
    const out = V[cur.v](cur);
    const key = keyOf(cur);
    const screen = $('#screen');
    const changedView = key !== ui.lastKey;
    screen.innerHTML = `<div class="${changedView ? 'fade-in' : ''}">${out.html}</div>`;
    screen.classList.toggle('no-tabs', !!out.noTabs);
    const aboveTabs = !!out.bottom && !out.noTabs;
    screen.classList.toggle('with-bar', aboveTabs);
    $('#bottom').classList.toggle('above-tabs', aboveTabs);
    $('#bottom').innerHTML = out.bottom || '';

    // tabs
    const tabbar = $('#tabbar');
    tabbar.classList.toggle('hidden', !!out.noTabs);
    const active = ui.role === 'client' ? ui.ctab : ui.stab;
    tabbar.innerHTML = TABS[ui.role].map(([t, l, ic]) => {
      const b = t === 'cart' ? cartCount() : t === 'sorders' ? newOrders() : 0;
      return `<button class="${t === active ? 'on' : ''}" data-a="tab" data-t="${t}">${ic}<span>${l}</span>${b ? `<span class="badge">${b}</span>` : ''}</button>`;
    }).join('');

    // role switch
    $('#seg').classList.toggle('right', ui.role === 'seller');
    $('#seg').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.r === ui.role));

    // scroll
    screen.scrollTop = changedView ? (ui.scroll[key] || 0) : (ui.scroll.__same ?? screen.scrollTop);
    ui.lastKey = key;
    delete ui.scroll.__same;

    if (IN_TG) {
      try { if (ui.stack.length) tg.BackButton.show(); else tg.BackButton.hide(); } catch (e) { /* noop */ }
    }
    tickTimers();
    const fl = screen.querySelector('.flash');
    if (fl && changedView) setTimeout(() => fl.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
  }
  function rerender() { ui.scroll.__same = $('#screen').scrollTop; render(); }

  function tickTimers() {
    document.querySelectorAll('[data-timer]').forEach((el) => {
      const left = Math.max(0, +el.dataset.timer - Date.now());
      const d = Math.floor(left / 86400000), h = Math.floor((left % 86400000) / H), m = Math.floor((left % H) / M), s = Math.floor((left % M) / 1000);
      const p = (n) => String(n).padStart(2, '0');
      el.innerHTML = `${d ? `<span>${d} д</span>` : ''}<span>${p(h)} ч</span><span>${p(m)} м</span><span>${p(s)} с</span>`;
    });
    if (S.promo.active && S.promo.endsAt <= Date.now()) { S.promo.active = false; save(); }
  }
  setInterval(tickTimers, 1000);

  /* ================= Actions ================= */
  const A = {
    tab: (d) => setTab(d.t),
    role: (d) => setRole(d.r),
    back: () => back(),
    noop: () => {},
    hint: (d) => { S.hints[d.id] = 1; save(); rerender(); },
    cat: (d) => { ui.cat = d.id; rerender(); },
    size: (d) => { ui.size = d.id || null; haptic('light'); rerender(); },
    open: (d) => push({ v: 'product', id: d.id }),
    fav: (d) => {
      const i = S.favs.indexOf(d.id);
      if (i >= 0) S.favs.splice(i, 1); else { S.favs.push(d.id); haptic('light'); }
      save(); rerender();
    },
    pick: (d) => { ui.sel[d.id] = d.s; haptic('light'); rerender(); },
    fit: () => toast('Подбор размера', 'Напишите рост и вес в комментарии к заказу — менеджер подберёт размер', I.ruler),
    notify: (d) => { S.waitlist += 1; save(); haptic('success'); toast('Готово', 'Бот напишет вам в Telegram, когда товар появится', I.bell); },
    add: (d) => {
      const p = prod(d.id); const s = ui.sel[d.id];
      const sz = p.sizes.find((x) => x.s === s);
      const line = S.cart.find((c) => c.pid === d.id && c.size === s);
      const inCart = line ? line.qty : 0;
      if (!sz || sz.q <= inCart) { haptic('error'); toast('Больше нет в наличии', `Размер ${s} уже весь в вашей корзине`, I.info); return; }
      if (line) line.qty += 1; else S.cart.push({ pid: d.id, size: s, qty: 1 });
      save(); haptic('success');
      toast('Добавлено в корзину', `${esc(p.name)} · ${s}`, '', IMG(p.img[0]));
      rerender();
    },
    cq: (d) => {
      const [pid, size] = d.k.split('|');
      const line = S.cart.find((c) => c.pid === pid && c.size === size);
      if (!line) return;
      line.qty += +d.d;
      if (line.qty <= 0) S.cart = S.cart.filter((c) => c !== line);
      save(); rerender();
    },
    cdel: (d) => { const [pid, size] = d.k.split('|'); S.cart = S.cart.filter((c) => !(c.pid === pid && c.size === size)); save(); rerender(); },
    checkout: () => push({ v: 'checkout' }),
    co: (d) => { ui.co[d.g] = d.v; haptic('light'); rerender(); },
    place: () => {
      const co = ui.co;
      const digits = (co.phone || '').replace(/\D/g, '');
      if (!co.name.trim()) { haptic('error'); toast('Укажите имя', '', I.info); return; }
      if (digits.length < 10) { haptic('error'); toast('Проверьте телефон', 'Нужен номер для связи с менеджером', I.info); return; }
      if (co.del === 'ship' && !co.city.trim()) { haptic('error'); toast('Укажите город доставки', '', I.info); return; }
      const items = [];
      for (const c of S.cart) {
        const p = prod(c.pid); if (!p) continue;
        const sz = p.sizes.find((x) => x.s === c.size); if (!sz || sz.q <= 0) continue;
        const qty = Math.min(c.qty, sz.q);
        sz.q -= qty;
        const pr = priceOf(p);
        items.push({ pid: p.id, size: c.size, qty, price: pr.price, old: pr.old, name: p.name, brand: p.brand, img: p.img[0] });
        if (sz.q === 0 && p.sync) {
          if (stock(p) === 0) addLog(`Товар закончился — пост «${esc(p.name)}» удалён из канала`);
          else addLog(`Размер <b>${esc(c.size)}</b> продан — пост «${esc(p.name)}» обновлён`);
        }
      }
      if (!items.length) { toast('Товары закончились', 'Пока вы оформляли, их уже купили', I.info); S.cart = []; save(); rerender(); return; }
      const num = S.nextNum++;
      const o = {
        id: 'o' + num, num, createdAt: Date.now(), status: 'new', mine: true,
        customer: { name: co.name.trim(), phone: co.phone.trim() },
        delivery: { type: co.del, city: co.city.trim(), addr: co.addr.trim() },
        pay: co.pay, comment: co.comment.trim(), items,
        total: items.reduce((s, i) => s + i.price * i.qty, 0)
      };
      S.orders.push(o);
      S.cart = [];
      ui.co = null;
      save();
      haptic('success');
      ui.stack = [{ v: 'success', id: o.id }];
      render();
      setTimeout(() => toast(`Менеджерам: новый заказ №${num}`, `${fmt(o.total)} · ${esc(o.customer.name)} · ${o.delivery.type === 'ship' ? 'доставка' : 'самовывоз'}`, '', 'assets/img/logo.svg'), 1600);
    },
    done: () => { ui.stack = []; ui.ctab = 'catalog'; render(); },
    toSeller: (d) => setRole('seller', d.t),
    fromChannel: (d) => { setRole('client', 'catalog'); push({ v: 'product', id: d.id }); },

    // seller
    ofilter: (d) => { ui.ofilter = d.id; rerender(); },
    pfilter: (d) => { ui.pfilter = d.id; rerender(); },
    advance: (d) => {
      const o = S.orders.find((x) => x.id === d.id);
      const i = STEPS.indexOf(o.status);
      if (i < 0 || i >= 3) return;
      o.status = STEPS[i + 1];
      save(); haptic('success');
      toast(`Заказ №${o.num}: ${statusLabel(o).toLowerCase()}`, 'Клиент получил уведомление от бота', I.send);
      rerender();
    },
    cancel: (d) => {
      const o = S.orders.find((x) => x.id === d.id);
      o.status = 'cancelled';
      o.items.forEach((it) => { const p = prod(it.pid); const sz = p && p.sizes.find((x) => x.s === it.size); if (sz) sz.q += it.qty; });
      addLog(`Заказ №${o.num} отменён — размеры вернулись в пост`);
      save(); haptic('warning');
      toast(`Заказ №${o.num} отменён`, 'Товар вернулся в наличие, пост обновлён', I.reset);
      rerender();
    },
    msg: (d) => { const o = S.orders.find((x) => x.id === d.id); toast('Чат с клиентом', `Откроется диалог с ${esc(o.customer.name)} в Telegram`, I.chat); },
    edit: (d) => { ui.draft = null; push({ v: 'editor', id: d.id }); },
    newp: () => { ui.draft = null; push({ v: 'editor' }); },
    sq: (d) => {
      const x = ui.draft.sizes.find((z) => z.s === d.s);
      x.q = Math.max(0, x.q + +d.d);
      haptic('light'); rerender();
    },
    addsize: () => {
      const v = ($('#newsize').value || '').trim().toUpperCase();
      if (!v) return;
      if (!ui.draft.sizes.some((z) => z.s === v)) ui.draft.sizes.push({ s: v, q: 1 });
      rerender();
    },
    dtoggle: (d) => { ui.draft[d.k] = !ui.draft[d.k]; haptic('light'); rerender(); },
    savep: () => {
      const d = ui.draft;
      if (!d.name.trim()) { haptic('error'); toast('Укажите название', '', I.info); return; }
      if (!d.price) { haptic('error'); toast('Укажите цену', '', I.info); return; }
      if (!d.img.length) { haptic('error'); toast('Добавьте хотя бы одно фото', '', I.image); return; }
      const clean = { ...d }; delete clean._for;
      clean.brand = clean.brand ? clean.brand.trim() : 'Premium';
      if (clean.old && clean.old <= clean.price) clean.old = null;
      if (!d.id) {
        clean.id = 'n' + Date.now();
        clean.post = S.nextPost++;
        S.products.unshift(clean);
        addLog(`Опубликован пост «${esc(clean.name)}»`);
        toast('Товар опубликован', 'Пост с кнопкой «Купить» отправлен в канал', I.send);
      } else {
        const i = S.products.findIndex((p) => p.id === d.id);
        const prev = S.products[i];
        S.products[i] = clean;
        const sold = prev.sizes.filter((x) => x.q > 0 && (clean.sizes.find((y) => y.s === x.s) || { q: 0 }).q === 0).map((x) => x.s);
        const back = clean.sizes.filter((x) => x.q > 0 && (prev.sizes.find((y) => y.s === x.s) || { q: 0 }).q === 0).map((x) => x.s);
        if (clean.sync) {
          if (stock(clean) === 0 && stock(prev) > 0) addLog(`Товар закончился — пост «${esc(clean.name)}» удалён из канала`);
          else if (sold.length) addLog(`Размер <b>${sold.map(esc).join(', ')}</b> продан — пост «${esc(clean.name)}» обновлён`);
          if (back.length) addLog(`Размер <b>${back.map(esc).join(', ')}</b> снова в наличии — пост «${esc(clean.name)}» обновлён`);
          if (prev.price !== clean.price || prev.old !== clean.old) addLog(`Цена изменена — пост «${esc(clean.name)}» обновлён`);
        }
        toast('Сохранено', clean.sync ? 'Пост в канале обновлён автоматически' : 'Изменения в приложении применены', I.check);
      }
      ui.flash = clean.id;
      ui.draft = null;
      save(); haptic('success');
      back();
    },
    delp: () => {
      const id = ui.draft.id;
      const p = prod(id);
      S.products = S.products.filter((x) => x.id !== id);
      S.cart = S.cart.filter((c) => c.pid !== id);
      addLog(`Товар удалён — пост «${esc(p.name)}» удалён из канала`);
      ui.draft = null; save(); haptic('warning');
      toast('Товар удалён', 'Пост в канале тоже удалён', I.trash);
      back();
    },
    pcat: (d) => { S.promo.cat = d.id; save(); rerender(); },
    phours: (d) => { S.promo.hours = +d.id; save(); rerender(); },
    pstart: () => {
      S.promo.active = true;
      S.promo.endsAt = Date.now() + S.promo.hours * H;
      addLog(`Анонс акции «${esc(S.promo.title)} −${S.promo.percent}%» опубликован в канале`);
      save(); haptic('success');
      toast('Акция запущена', 'Цены пересчитаны, анонс ушёл в канал', I.spark);
      rerender();
    },
    pstop: () => { S.promo.active = false; save(); haptic('warning'); toast('Акция остановлена', 'Цены вернулись к обычным', I.reset); rerender(); },
    reset: () => {
      S = seed(); save();
      Object.assign(ui, { stack: [], cat: 'all', size: null, q: '', pq: '', sel: {}, draft: null, co: null, ctab: 'catalog', stab: 'dash' });
      haptic('medium'); render();
      toast('Демо сброшено', 'Все данные вернулись к исходным', I.reset);
    }
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]');
    if (!el || el.disabled) return;
    const fn = A[el.dataset.a];
    if (fn) { e.preventDefault(); fn(el.dataset, el); }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'q') { ui.q = t.value; $('#pgrid').innerHTML = gridHTML(); return; }
    if (t.id === 'pq') { ui.pq = t.value; $('#plist').innerHTML = plistHTML(); return; }
    const f = t.dataset.f;
    if (!f) return;
    const [obj, key] = f.split('.');
    const target = obj === 'co' ? ui.co : obj === 'draft' ? ui.draft : obj === 'promo' ? S.promo : null;
    if (!target) return;
    let v = t.value;
    if (t.hasAttribute('data-num')) v = v.replace(/\D/g, '') ? parseInt(v.replace(/\D/g, ''), 10) : null;
    target[key] = v;
    if (obj === 'promo') {
      save();
      if (key === 'percent') { const pv = $('#pv'); if (pv) pv.textContent = `−${v}%`; }
      const b = document.querySelector('.banner .ttl'); if (b) b.textContent = `${S.promo.title || 'Акция'} −${S.promo.percent}%`;
    }
    if (obj === 'draft') {
      const pp = $('#post-preview'); if (pp) pp.innerHTML = draftPreview();
      const d = ui.draft; const off = d.old && d.price && d.old > d.price ? Math.round((1 - d.price / d.old) * 100) : 0;
      const c = $('#calc'); if (c) c.textContent = off ? `Скидка −${off}% · в канале будет «Старая цена / Цена со скидкой»` : '';
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('select[data-f]')) { const [, key] = t.dataset.f.split('.'); ui.draft[key] = t.value; return; }
    if (!t.matches('[data-upload]') || !t.files || !t.files[0]) return;
    const file = t.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 720;
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        ui.draft.img.push(c.toDataURL('image/jpeg', 0.8));
        rerender();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // gallery dots
  document.addEventListener('scroll', (e) => {
    const t = e.target;
    if (!(t instanceof Element) || !t.matches('[data-gallery]')) return;
    const i = Math.round(t.scrollLeft / t.clientWidth);
    t.parentElement.querySelectorAll('.dots i').forEach((d, k) => d.classList.toggle('on', k === i));
  }, true);

  /* ================= Boot ================= */
  if (params.get('embed') === '1') document.body.classList.add('embed');
  if (SHOP.has) document.title = `${SHOP.name} — демо приложения`;
  document.querySelectorAll('a[data-keep-for]').forEach((a) => { a.href = SHOP.withName(a.getAttribute('href')); });
  if (IN_TG) {
    document.body.classList.add('in-tg');
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#0a0a0b');
      tg.setBackgroundColor('#0a0a0b');
      if (tg.setBottomBarColor) tg.setBottomBarColor('#0a0a0b');
      if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
      tg.BackButton.onClick(back);
    } catch (e) { /* older clients */ }

    // Keep content clear of Telegram's own controls (close / ⋯ buttons in fullscreen, notch, home bar)
    const applyInsets = () => {
      const sa = tg.safeAreaInset || {};
      const csa = tg.contentSafeAreaInset || {};
      let top = (sa.top || 0) + (csa.top || 0);
      let bottom = (sa.bottom || 0) + (csa.bottom || 0);
      if (tg.isFullscreen && !csa.top) top = Math.max(top, 92);
      if (top) top += 6;
      const root = document.documentElement.style;
      root.setProperty('--safe-top', `max(env(safe-area-inset-top, 0px), ${top}px)`);
      root.setProperty('--safe-bottom', `max(env(safe-area-inset-bottom, 0px), ${bottom}px)`);
    };
    applyInsets();
    ['safeAreaChanged', 'contentSafeAreaChanged', 'fullscreenChanged', 'viewportChanged'].forEach((ev) => {
      try { tg.onEvent(ev, applyInsets); } catch (e) { /* older clients */ }
    });
  }
  document.querySelectorAll('#seg button').forEach((b) => b.addEventListener('click', () => setRole(b.dataset.r)));
  $('#resetBtn').addEventListener('click', A.reset);

  // sync between tabs/iframes of the same browser
  window.addEventListener('storage', (e) => { if (e.key === KEY) { S = load(); rerender(); } });

  render();
})();

/* Название магазина: ?for=Banger на сайте или параметр запуска Mini App в Telegram.
   Без названия везде остаётся нейтральное «Ваш магазин».

   Параметр запуска (t.me/бот?startapp=…) Telegram принимает только из A–Z a–z 0–9 _ -
   и не длиннее 64 символов, поэтому название кодируется так:
   первая буква — роль (c — покупатель, s — продавец), дальше — название в base64url (UTF-8). */
(() => {
  const MAX_PARAM = 64;
  const clean = (s) => String(s || '')
    .replace(/[\u0000-\u001f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 32);

  const toB64url = (str) => {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const fromB64url = (s) => {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
    const bin = atob(b64);
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  };

  // Build a start parameter; long names are shortened until they fit Telegram's limit
  const startParam = (name, role) => {
    const flag = role === 'seller' ? 's' : 'c';
    let n = name;
    // Drop whole words first, then letters, so the name is not cut mid-word when possible
    while (n && (flag + toB64url(n)).length > MAX_PARAM) {
      n = n.includes(' ') ? n.slice(0, n.lastIndexOf(' ')).trim() : n.slice(0, -1);
    }
    return flag + (n ? toB64url(n) : '');
  };

  // Read a start parameter (also accepts the old plain "seller")
  const parseStart = (p) => {
    if (!p) return null;
    if (p === 'seller') return { role: 'seller', name: '' };
    if (!/^[cs][A-Za-z0-9_-]*$/.test(p)) return null;
    let name = '';
    try { name = clean(fromB64url(p.slice(1))); } catch (e) { /* broken parameter */ }
    return { role: p[0] === 's' ? 'seller' : 'client', name };
  };

  let name = '';
  let role = null;
  try {
    const qs = new URLSearchParams(location.search);
    name = clean(qs.get('for'));
    const tg = window.Telegram && window.Telegram.WebApp;
    const start = parseStart(qs.get('tgWebAppStartParam') || (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param));
    if (start) {
      role = start.role;
      if (!name) name = start.name;
    }
  } catch (e) { /* old browser */ }

  // Adds ?for=… to an internal link so the name survives navigation
  const withName = (href) => {
    if (!name) return href;
    const [path, hash = ''] = href.split('#');
    return `${path}${path.includes('?') ? '&' : '?'}for=${encodeURIComponent(name)}${hash ? '#' + hash : ''}`;
  };

  window.SHOP = {
    name,
    has: !!name,
    title: name || 'Ваш магазин',
    role, // 'seller' | 'client' | null — from the Telegram start parameter
    withName,
    startParam: (r) => startParam(name, r)
  };
})();

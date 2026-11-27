/* ===== Настройки: заполните перед отправкой ===== */
const CONFIG = {
  // Нейтральный демо-бот: кнопки «Открыть демо» открывают Mini App в Telegram
  // и передают туда название магазина из ?for= (см. shop-name.js).
  // Если оставить пустым, кнопки откроют app.html на сайте.
  bot: 'https://t.me/tg_shop_demo_1_bot',
  // Ваш Telegram для связи — появится кнопка «Обсудить проект»
  contact: 'https://t.me/Artur105k'
};

(() => {
  // Shop name from ?for= (see shop-name.js)
  const SHOP = window.SHOP || { has: false, title: 'Ваш магазин', withName: (h) => h, startParam: null };
  if (SHOP.has) {
    document.title = `${SHOP.name} — магазин в Telegram`;
    document.querySelectorAll('[data-kicker]').forEach((el) => { el.textContent = `Предложение для ${SHOP.name}`; });
    document.querySelectorAll('[data-bot-name]').forEach((el) => { el.textContent = `${SHOP.name} Bot`; });
  }
  document.querySelectorAll('[data-shop-name]').forEach((el) => { el.textContent = SHOP.has ? SHOP.name : 'Магазин'; });
  document.querySelectorAll('[data-shop-upper]').forEach((el) => { el.textContent = SHOP.title.toUpperCase(); });
  document.querySelectorAll('a[href^="app.html"]').forEach((a) => { a.href = SHOP.withName(a.getAttribute('href')); });
  document.querySelectorAll('iframe[data-keep-for]').forEach((f) => { f.dataset.src = SHOP.withName(f.dataset.src); });

  // Demo buttons → Telegram Mini App; role and shop name travel in the start parameter
  const miniApp = (role) => `${CONFIG.bot}?startapp=${SHOP.startParam ? SHOP.startParam(role) : (role === 'seller' ? 'seller' : '')}`;
  document.querySelectorAll('[data-demo]').forEach((a) => {
    if (CONFIG.bot) a.href = miniApp(a.dataset.demo);
  });
  document.querySelectorAll('[data-bot]').forEach((a) => {
    if (CONFIG.bot) { a.href = miniApp(); a.hidden = false; }
  });
  document.querySelectorAll('[data-contact]').forEach((a) => {
    if (CONFIG.contact) { a.href = CONFIG.contact; a.hidden = false; }
  });

  // Marquee with real product photos
  const imgs = ['16833_0', '16701_0', '16798_0', '16837_0', '16696_0', '16758_0', '16827_0', '16807_0', '16733_0', '16800_0', '16715_1', '16781_0', '16825_0', '16746_0'];
  const track = document.getElementById('marquee');
  if (track) {
    const html = imgs.map((i) => `<img src="assets/products/${i}.jpg" alt="" loading="lazy">`).join('');
    track.innerHTML = html + html;
  }

  // Nav background
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal on scroll
  const els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('in'));
  }

  // Live demo iframe — only on wide screens, loaded when visible
  const frame = document.querySelector('iframe[data-src]');
  if (frame && window.matchMedia('(min-width: 900px)').matches && 'IntersectionObserver' in window) {
    const fo = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { frame.src = frame.dataset.src; fo.disconnect(); }
    }, { rootMargin: '300px' });
    fo.observe(frame);
  }
})();

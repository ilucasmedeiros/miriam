(() => {
  const WHATSAPP = '5511982593530';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = document.querySelector('.header');
  const nav = document.getElementById('menu');
  const toggle = document.querySelector('.nav-toggle');
  const form = document.getElementById('form-contato');
  const serviceSelect = document.getElementById('f-servico');
  const waFloat = document.querySelector('.wa-float');

  /* ---------- header ao rolar ---------- */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- menu mobile ---------- */
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- animações de entrada ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- contadores ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && !reduceMotion) {
    counters.forEach((el) => { el.textContent = '0'; });
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        co.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- faixa de fotos em loop contínuo ---------- */
  const track = document.querySelector('.strip__track');
  if (track) [...track.children].forEach((img) => track.appendChild(img.cloneNode(true)));

  /* ---------- CTAs que já escolhem o serviço ---------- */
  document.querySelectorAll('[data-service]').forEach((link) => {
    link.addEventListener('click', () => {
      serviceSelect.value = link.dataset.service;
      setTimeout(() => document.getElementById('f-nome').focus({ preventScroll: true }), reduceMotion ? 0 : 700);
    });
  });

  /* ---------- WhatsApp flutuante: aparece depois do hero, some no contato ---------- */
  if ('IntersectionObserver' in window) {
    const state = { hero: true, contact: false };
    const update = () => waFloat.classList.toggle('is-visible', !state.hero && !state.contact);
    const fo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target.classList.contains('hero')) state.hero = entry.isIntersecting;
        else state.contact = entry.isIntersecting;
      });
      update();
    }, { threshold: 0.12 });
    fo.observe(document.querySelector('.hero'));
    fo.observe(document.getElementById('contato'));
  } else {
    waFloat.classList.add('is-visible');
  }

  /* ---------- formulário → WhatsApp ---------- */
  const status = form.querySelector('.form__status');
  const required = [...form.querySelectorAll('[required]')];

  const validateField = (input) => {
    const ok = input.value.trim() !== '';
    const field = input.closest('.field');
    field.classList.toggle('has-error', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    if (ok) input.removeAttribute('aria-describedby');
    else input.setAttribute('aria-describedby', `${input.id}-erro`);
    return ok;
  };
  required.forEach((input) => input.addEventListener('input', () => {
    if (input.closest('.field').classList.contains('has-error')) validateField(input);
  }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = required.filter((input) => !validateField(input));
    if (invalid.length) {
      invalid[0].focus();
      status.textContent = 'Preencha os campos obrigatórios.';
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    const lines = [
      'Olá, Miriam! Vim pelo site da Notícia Expressa.',
      '',
      `*Nome:* ${data.nome.trim()}`,
      `*Empresa:* ${data.empresa.trim()}`,
    ];
    if (data.segmento) lines.push(`*Segmento:* ${data.segmento}`);
    if (data.servico) lines.push(`*Interesse:* ${data.servico}`);
    if (data.mensagem.trim()) lines.push('', data.mensagem.trim());

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
    // 'noopener' faria window.open retornar null sempre; por isso o opener é zerado à mão
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
    status.textContent = 'Tudo certo! Sua mensagem foi preparada no WhatsApp.';
  });

  /* ---------- ano no rodapé ---------- */
  document.getElementById('ano').textContent = new Date().getFullYear();
})();

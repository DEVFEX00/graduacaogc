import { campaignUtm } from './utm.js';

/* T-092 v2 · LP do Tecnólogo em Gestão Comercial. Configuração em config.js (só o Caio preenche).
   Regras: nenhum dado pessoal em endereço, em evento de medição ou em log. Os parâmetros UTM ficam guardados na aba durante a visita.
   Exceção pequena e local: o primeiro nome vai para o sessionStorage da própria aba, só para o obrigado dizer "Pronto, Ana.";
   o obrigado lê e apaga na hora, e o nome aparece num elemento que o Clarity não grava (data-clarity-mask). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var raiz = document.documentElement;
  var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var toque = !!(window.matchMedia && matchMedia('(hover: none), (pointer: coarse)').matches);
  var C = window.CONFIG || {};

  /* ---------- origem (só utm_*) e medição sem dado pessoal ---------- */
  var origem = campaignUtm(location.search);
  function medir(evento, extra) {
    var d = Object.assign({}, origem);
    if (extra) for (var k in extra) d[k] = extra[k];
    if (window.MEDICAO) window.MEDICAO.evento(evento, d);
  }
  window.MEDIR = medir;
  medir('pagina_vista', { topo: ($('#topo').getAttribute('data-topo') || 'a') });

  /* ---------- conteúdo que vem de config.js: prazos, investimento, política ---------- */
  (function () {
    var P = C.prazos || {};
    $$('[data-prazo]').forEach(function (el) { var v = P[el.getAttribute('data-prazo')]; if (v) el.textContent = v; });
    $$('[data-prazo-bloco]').forEach(function (el) { el.hidden = !P[el.getAttribute('data-prazo-bloco')]; });
    var I = C.investimento || {}, modo = I.modo || 'sem-preco';
    if (modo === 'com-preco' && !(I.de && I.por && I.ate)) modo = 'sem-preco';   // sem os três valores, nada de preço na página
    var bloco = $('#investimento');
    if (modo === 'desligado') bloco.hidden = true;
    $$('[data-invest]', bloco).forEach(function (b) { b.hidden = b.getAttribute('data-invest') !== modo; });
    if (modo === 'com-preco') {
      $('[data-preco=de]').textContent = 'R$ ' + I.de; $('[data-preco=por]').textContent = 'R$ ' + I.por; $('[data-preco=ate]').textContent = 'até ' + I.ate + '.';
      $('[data-preco=inclui]').textContent = I.inclui || '';
      $('#faq-preco').textContent = 'A mensalidade da turma 2027 está em condição exclusiva: de R$ ' + I.de + ' por R$ ' + I.por + ' até ' + I.ate + '.';
    }
    if (C.privacidade) $('#priv').href = C.privacidade;
  })();

  /* ---------- 1 · linha que gira: "Graduação em ___" ---------- */
  (function () {
    var el = $('#gira'); if (!el || calmo) return;   // com "menos movimento" fica parada em "vendas com método"
    var P = ['funil', 'negociação', 'indicadores', 'CRM', 'inteligência artificial', 'liderança'], i = -1, naTela = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { naTela = es[0].isIntersecting; }, { threshold: .5 }).observe(el);
    function prox() {
      if (!naTela || document.hidden) return;
      i = (i + 1) % P.length;
      el.classList.remove('g-entra'); el.classList.add('g-sai');
      setTimeout(function () { el.textContent = P[i]; el.classList.remove('g-sai'); void el.offsetWidth; el.classList.add('g-entra'); }, 280);
    }
    setTimeout(function () { prox(); setInterval(prox, 1800); }, 1400);
  })();

  /* ---------- 1 · vitrine: fotos que passam sozinhas a cada 2,5 s, sem legenda; pausa ao toque, fora da tela e com "menos movimento" ---------- */
  (function () {
    var v = $('#vitrine'); if (!v) return;
    var figs = $$('figure', v), pontos = $('#pontos'), atual = 0, pausado = false, naTela = true, carregou = false, retomar = null;
    figs.forEach(function (f, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Foto ' + (i + 1) + ' de ' + figs.length);
      b.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () { carregar(); ir(i); pausar(); });
      pontos.appendChild(b);
      if (i) f.setAttribute('aria-hidden', 'true');
    });
    function carregar() {
      if (carregou) return; carregou = true;
      $$('img[data-src]', v).forEach(function (im) { im.srcset = im.getAttribute('data-srcset'); im.src = im.getAttribute('data-src'); });
    }
    function ir(n) {
      n = (n + figs.length) % figs.length; if (n === atual) return;
      figs[atual].classList.remove('on'); figs[atual].setAttribute('aria-hidden', 'true'); pontos.children[atual].setAttribute('aria-current', 'false');
      atual = n;
      figs[atual].classList.add('on'); figs[atual].removeAttribute('aria-hidden'); pontos.children[atual].setAttribute('aria-current', 'true');
    }
    /* depois de um toque, a vitrine para e volta a passar sozinha em 6 s (no computador, ao tirar o mouse) */
    function pausar() { pausado = true; clearTimeout(retomar); retomar = setTimeout(function () { pausado = false; }, 6000); }
    function passo() {
      if (pausado || !naTela || document.hidden || ($('#folha') && $('#folha').open)) return;
      var im = $('img', figs[(atual + 1) % figs.length]);
      if (im && im.complete && im.naturalWidth) ir(atual + 1);   // só troca quando a próxima foto já chegou
    }
    var x0 = null;
    v.addEventListener('pointerdown', function (e) { x0 = e.clientX; carregar(); });
    v.addEventListener('pointerup', function (e) { if (x0 !== null && Math.abs(e.clientX - x0) > 40) { ir(atual + (e.clientX < x0 ? 1 : -1)); pausar(); } x0 = null; });
    v.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { pausado = true; clearTimeout(retomar); } });
    v.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') pausado = false; });
    pontos.addEventListener('focusin', pausar);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { naTela = es[0].isIntersecting; }, { threshold: .3 }).observe(v);
    function ligar() { carregar(); if (!calmo) setInterval(passo, 2500); }
    if (document.readyState === 'complete') setTimeout(ligar, 600); else addEventListener('load', function () { setTimeout(ligar, 600); });
  })();

  $$('[data-ver]').forEach(function (a) { a.addEventListener('click', function () { medir('ver_video_toque'); }); });

  /* ---------- 2 · VSL: capa com o play desenhado; o vídeo só carrega no toque; flutua se a pessoa rolar com ele tocando ---------- */
  (function () {
    var V = C.vsl || {}, box = $('#player'), dentro = $('#player-in'), capa = $('#capa'), video = $('#vsl'), aviso = $('#vsl-aviso'), fechar = $('#fechar-flut');
    if (V.capa) $('#capa-img').src = V.capa;
    var tocou = false, fechado = false, naTela = true;
    function semVideo() { video.hidden = true; capa.hidden = false; aviso.hidden = false; medir('vsl_indisponivel'); }
    capa.addEventListener('click', function () {
      if (!V.arquivo) { semVideo(); return; }
      if (!video.src) {
        video.poster = V.capa || ''; video.src = V.arquivo;
        if (V.legenda) { var t = document.createElement('track'); t.kind = 'captions'; t.srclang = 'pt-BR'; t.label = 'Português'; t.src = V.legenda; t.default = true; video.appendChild(t); }
      }
      capa.hidden = true; video.hidden = false; aviso.hidden = true;
      var p = video.play(); if (p && p.catch) p.catch(function () {});
      if (!tocou) { tocou = true; medir('vsl_play'); }
    });
    video.addEventListener('error', semVideo);
    video.addEventListener('ended', function () { medir('vsl_fim'); flutuar(false); });
    var marcos = { 25: 0, 50: 0, 75: 0 };
    video.addEventListener('timeupdate', function () {
      if (!video.duration) return; var pr = video.currentTime / video.duration * 100;
      for (var m in marcos) if (!marcos[m] && pr >= +m) { marcos[m] = 1; medir('vsl_' + m); }
    });
    function flutuar(sim) {
      if (sim && !dentro.classList.contains('flut')) { box.style.setProperty('--alt-player', box.offsetHeight + 'px'); box.classList.add('flutuando'); dentro.classList.add('flut'); fechar.hidden = false; }
      if (!sim && dentro.classList.contains('flut')) { dentro.classList.remove('flut'); box.classList.remove('flutuando'); fechar.hidden = true; }
    }
    function avaliar() { flutuar(!naTela && !video.paused && !video.ended && !fechado && !($('#folha').open)); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { naTela = es[0].isIntersecting; avaliar(); }, { threshold: .25 }).observe(box);
    video.addEventListener('play', function () { fechado = false; avaliar(); });
    video.addEventListener('pause', avaliar);
    fechar.addEventListener('click', function () { fechado = true; video.pause(); flutuar(false); });
  })();

  /* ---------- 3 · semestres: abas com teclado (setas, Home, End) ---------- */
  (function () {
    var abas = $$('.abas [role=tab]'), paineis = abas.map(function (a) { return document.getElementById(a.getAttribute('aria-controls')); });
    function ir(n, foco) {
      abas.forEach(function (a, i) { var sel = i === n; a.setAttribute('aria-selected', sel ? 'true' : 'false'); a.tabIndex = sel ? 0 : -1; paineis[i].classList.toggle('on', sel); });
      if (foco) abas[n].focus();
    }
    abas.forEach(function (a, i) {
      a.addEventListener('click', function () { ir(i); medir('semestre_toque', { semestre: i + 1 }); });
      a.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = (i + 1) % abas.length;
        else if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i - 1 + abas.length) % abas.length;
        else if (k === 'Home') n = 0; else if (k === 'End') n = abas.length - 1;
        if (n !== null) { e.preventDefault(); ir(n, true); }
      });
    });
    ir(0);
  })();

  /* ---------- 5 · letreiro de quem ensina: para ao toque (e volta ao tocar de novo) ---------- */
  (function () {
    var l = $('#letreiro'); if (!l) return;
    l.addEventListener('click', function () { l.classList.toggle('parado'); });
  })();

  /* ---------- cartões que inclinam: com o mouse no computador; no celular, um leve balanço ao rolar ---------- */
  var tilts = $$('.tilt');
  if (!calmo && !toque) {
    tilts.forEach(function (el) {
      var r = null;
      el.addEventListener('pointerenter', function () { r = el.getBoundingClientRect(); el.classList.add('ativo'); });
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        if (!r) r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () { r = null; el.classList.remove('ativo'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }
  function balancoAoRolar() {
    if (calmo || !toque) return;
    var h = innerHeight;
    tilts.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > h) return;
      var c = (r.top + r.height / 2) / h - .5;           // -0,5 no alto da tela, +0,5 embaixo
      el.style.setProperty('--rx', (c * 7).toFixed(2) + 'deg');
    });
  }

  /* ---------- formulário: folha de um passo ---------- */
  var folha = $('#folha'), form = $('#form'), enviado = false, iniciou = false;
  function abrir(ev) {
    if (ev) ev.preventDefault();
    var de = ev && ev.currentTarget ? ev.currentTarget.getAttribute('data-cta') : '';
    medir('cta_toque', { botao: de });
    if (folha.showModal) { if (!folha.open) folha.showModal(); } else folha.setAttribute('open', '');
    folha.scrollTop = 0;
    var v = $('#vsl'); if (v && !v.paused) v.pause();
    if (window.CENA && window.CENA.pausar) window.CENA.pausar(true);
    fixa(false);
    /* no computador o foco vai para o nome; no celular não, para o teclado não cobrir a folha antes de a pessoa ler */
    if (!matchMedia('(pointer: coarse)').matches) { var el = $('#f-nome'); if (el) el.focus({ preventScroll: true }); }
  }
  function fechou() { if (window.CENA && window.CENA.pausar) window.CENA.pausar(false); quadro(); }
  $$('[data-cta]').forEach(function (b) { b.addEventListener('click', abrir); });
  $('#fechar').addEventListener('click', function () { if (folha.close) folha.close(); else { folha.removeAttribute('open'); fechou(); } });
  folha.addEventListener('close', fechou);
  folha.addEventListener('click', function (e) { if (e.target === folha && folha.close) folha.close(); });
  form.addEventListener('focusin', function () { if (!iniciou) { iniciou = true; medir('form_inicio'); } });

  /* máscara do WhatsApp: (11) 90000-0000; aceita colar com +55 */
  var zap = $('#f-zap');
  function soDigitos(v) { var d = String(v || '').replace(/\D/g, ''); if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2); if (d.length > 11 && d.charAt(0) === '0') d = d.slice(1); return d.slice(0, 11); }
  function mascara(d) {
    if (!d) return '';
    if (d.length < 3) return '(' + d;
    if (d.length < 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length < 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  zap.addEventListener('input', function () { zap.value = mascara(soDigitos(zap.value)); });

  var CAMPOS = [
    { el: $('#f-nome'), msg: $('#erro-nome'), nome: 'nome', ok: function (v) { return v.trim().length >= 2; } },
    { el: zap, msg: $('#erro-zap'), nome: 'whatsapp', ok: function (v) { var d = soDigitos(v), ddd = parseInt(d.slice(0, 2), 10); return (d.length === 10 || (d.length === 11 && d.charAt(2) === '9')) && ddd >= 11 && ddd <= 99; } },
    { el: $('#f-email'), msg: $('#erro-email'), nome: 'email', ok: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); } }
  ];
  function marcar(c, certo) { c.msg.hidden = certo; if (certo) c.el.removeAttribute('aria-invalid'); else c.el.setAttribute('aria-invalid', 'true'); }
  CAMPOS.forEach(function (c) {
    c.el.addEventListener('blur', function () { if (c.el.value) marcar(c, c.ok(c.el.value)); });
    c.el.addEventListener('input', function () { if (c.el.getAttribute('aria-invalid') && c.ok(c.el.value)) marcar(c, true); });
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault(); if (enviado) return;
    var primeiro = null;
    CAMPOS.forEach(function (c) { var certo = c.ok(c.el.value); marcar(c, certo); if (!certo && !primeiro) primeiro = c; });
    if (primeiro) { primeiro.el.focus(); medir('form_erro_' + primeiro.nome); return; }
    var nome = $('#f-nome').value.trim().replace(/\s+/g, ' ');
    var lead = { nome: nome.slice(0, 120), email: $('#f-email').value.trim().slice(0, 160), whatsapp: soDigitos(zap.value), interesse: 'Gestão Comercial',
      pagina: 'Tecnólogo Gestão Comercial', aceite: true, origem: origem };
    try { sessionStorage.setItem('tgc_pn', nome.split(' ')[0].slice(0, 30)); } catch (e) {}
    function ir(sufixo) { enviado = true; location.href = C.obrigado + sufixo; }
    if (!C.destino) { medir('form_envio_ok', { previa: 1 }); ir('?previa=1'); return; }
    var botao = $('#enviar'), rotulo = $('span', botao); botao.disabled = true; rotulo.textContent = 'Enviando…';
    /* regra da casa (Caio, 24/11): a pessoa nunca fica presa no formulário. Se nenhum destino confirmar o recebimento (destino fora do ar,
       variável não configurada, rede ruim) ou passar de 8 s, ela vai para o obrigado com ?e=1, que pede o WhatsApp. */
    var foi = false;
    function seguir(ok) { if (foi) return; foi = true; if (ok) { medir('form_envio_ok', { previa: 0 }); ir(''); } else { medir('form_erro_envio'); ir('?e=1'); } }
    var limite = setTimeout(function () { seguir(false); }, 8000);
    try {
      fetch(C.destino, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead), keepalive: true })
        .then(function (r) { clearTimeout(limite); seguir(r.ok); })
        .catch(function () { clearTimeout(limite); seguir(false); });
    } catch (e) { clearTimeout(limite); seguir(false); }
  });

  /* ---------- entradas: de desfocado para nítido, subindo ---------- */
  var alvos = $$('.rev');
  if ('IntersectionObserver' in window && !calmo) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var irmaos = e.target.parentElement ? $$(':scope > .rev', e.target.parentElement) : [];
        var k = Math.max(0, irmaos.indexOf(e.target));
        e.target.style.transitionDelay = Math.min(k, 4) * 70 + 'ms';   // cartões irmãos entram em sequência curta
        e.target.classList.add('vis'); io.unobserve(e.target);
        setTimeout(function () { e.target.style.transitionDelay = ''; }, 1400);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    alvos.forEach(function (a) { io.observe(a); });
  } else alvos.forEach(function (a) { a.classList.add('vis'); });

  /* ---------- rolagem: sombra da barra, barra fixa do celular, linha dos passos e marcos de leitura ---------- */
  var barra = $('#barra'), barraFixa = $('#fixa'), topo = $('#topo'), final = $('#final'), passos = $('#passos');
  var marco50 = false, marco90 = false, pedido = false;
  function fixa(sim) {
    if (!barraFixa) return;
    barraFixa.classList.toggle('on', sim); barraFixa.setAttribute('aria-hidden', sim ? 'false' : 'true');
    $('a', barraFixa).tabIndex = sim ? 0 : -1;
  }
  function quadro() {
    pedido = false;
    var sy = scrollY || pageYOffset, h = innerHeight, total = Math.max(1, raiz.scrollHeight - h), pr = sy / total;
    barra.classList.toggle('sombra', sy > 8);
    var rt = topo.getBoundingClientRect(), rf = final.getBoundingClientRect();
    fixa(rt.bottom < 0 && rf.top > h * .85 && !folha.open);
    if (passos) { var rp = passos.getBoundingClientRect(); passos.style.setProperty('--prog', Math.max(0, Math.min(1, (h * .75 - rp.top) / rp.height)).toFixed(3)); }
    balancoAoRolar();
    if (!marco50 && pr > .5) { marco50 = true; medir('rolagem_50'); }
    if (!marco90 && pr > .9) { marco90 = true; medir('rolagem_90'); }
  }
  addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(quadro); } }, { passive: true });
  addEventListener('resize', quadro);
  quadro();

  /* ---------- cenas WebGL: segunda camada, só depois de a página responder ---------- */
  function cena() {
    try { if (new URLSearchParams(location.search).get('cena') === '0') return; } catch (e) {}
    var s = document.createElement('script'); s.src = 'cena.js'; s.async = true; document.body.appendChild(s);
  }
  function depois() { if ('requestIdleCallback' in window) requestIdleCallback(cena, { timeout: 2000 }); else setTimeout(cena, 800); }
  if (document.readyState === 'complete') depois(); else addEventListener('load', depois);
})();

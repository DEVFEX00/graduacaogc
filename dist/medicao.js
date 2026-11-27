/* T-092 · MEDIÇÃO da LP do Tecnólogo em Gestão Comercial: Meta Pixel, Google Analytics 4, Microsoft Clarity e RD Station
   (medição padrão da casa, mesma do T-083). Os identificadores ficam em config.js (CONFIG.medicao); são públicos, não são segredo.
   Regras da casa:
   - nenhum dado pessoal vai para as ferramentas: só visita, eventos com rótulos fixos e a conversão na página de obrigado;
   - sem "advanced matching" do pixel (nada de e-mail ou telefone);
   - o formulário e o primeiro nome no obrigado levam data-clarity-mask (o Clarity não grava o que está ali dentro);
   - nada é carregado em prévia local (localhost) nem com ?previa=1 no obrigado;
   - os scripts de terceiros entram depois que a página carregou, para não atrasar a primeira dobra. */
(function (w, d) {
  'use strict';
  var M = (w.CONFIG && w.CONFIG.medicao) || {};
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';
  var previa = false;
  try { previa = !!new URLSearchParams(location.search).get('previa'); } catch (e) {}
  var ligado = !local && !previa && M.ligado !== false;

  // filas: os eventos disparados antes de os scripts chegarem não se perdem
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };
  if (!w.fbq) {
    var n = w.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!w._fbq) w._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
  }
  w.clarity = w.clarity || function () { (w.clarity.q = w.clarity.q || []).push(arguments); };

  /* evento(nome, rótulos): eventos de comportamento vão só para o Analytics.
     conversao(): o lead, disparado uma vez na página de obrigado (Pixel "Lead", Analytics "generate_lead", Clarity "lead_tgc"). */
  w.MEDICAO = {
    ligado: ligado,
    evento: function (nome, rotulos) { if (ligado && M.ga4) w.gtag('event', nome, rotulos || {}); },
    conversao: function (rotulos) {
      if (!ligado) return;
      if (M.pixel) w.fbq('track', 'Lead', { content_name: M.pagina || '' });
      if (M.ga4) w.gtag('event', 'generate_lead', rotulos || {});
      if (M.clarity) w.clarity('event', 'lead_tgc');
    }
  };
  if (!ligado) return;

  if (M.ga4) { w.gtag('js', new Date()); w.gtag('config', M.ga4, { anonymize_ip: true }); }
  if (M.pixel) { w.fbq('init', M.pixel); w.fbq('track', 'PageView'); }

  function script(src) { var s = d.createElement('script'); s.async = true; s.src = src; d.head.appendChild(s); }
  function carregar() {
    if (M.ga4) script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(M.ga4));
    if (M.pixel) script('https://connect.facebook.net/en_US/fbevents.js');
    if (M.clarity) script('https://www.clarity.ms/tag/' + encodeURIComponent(M.clarity));
    if (M.rd) script('https://d335luupugsy2.cloudfront.net/js/loader-scripts/' + encodeURIComponent(M.rd) + '-loader.js');
  }
  function depois() { (w.requestIdleCallback || function (f) { setTimeout(f, 1200); })(carregar, { timeout: 2500 }); }
  if (d.readyState === 'complete') depois(); else w.addEventListener('load', depois);
})(window, document);

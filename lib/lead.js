import { cleanUtm } from '../utm.js';

const PAGINA = 'Tecnólogo Gestão Comercial';
const INTERESSE = 'Gestão Comercial';

function texto(valor, limite) {
  return typeof valor === 'string' ? valor.trim().slice(0, limite) : '';
}

export async function receberLead(request, env) {
  if (request.method !== 'POST') {
    return Response.json({ ok: false }, { status: 405, headers: { Allow: 'POST' } });
  }

  const corpo = await request.json().catch(() => null);
  if (!corpo || typeof corpo !== 'object') return Response.json({ ok: false }, { status: 400 });
  const lead = {
    nome: texto(corpo.nome, 120),
    email: texto(corpo.email, 160),
    whatsapp: texto(corpo.whatsapp, 20).replace(/\D/g, ''),
    interesse: INTERESSE,
    pagina: PAGINA,
    aceite: corpo.aceite === true,
    origem: cleanUtm(corpo.origem),
    recebido_em: new Date().toISOString()
  };
  if (lead.nome.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email) ||
      lead.whatsapp.length < 10 || !lead.aceite) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const destinos = [
    ['planilha', env.LEAD_WEBHOOK_URL],
    ['n8n', env.N8N_LEAD_WEBHOOK_URL]
  ].filter(([, url]) => url);
  if (!destinos.length) return Response.json({ ok: false }, { status: 503 });

  const origemSite = new URL(request.url).origin;
  const urlPagina = typeof corpo.pagina === 'string' && URL.canParse(corpo.pagina) ? new URL(corpo.pagina) : null;
  const paginaN8n = urlPagina?.origin === origemSite ? origemSite + urlPagina.pathname : origemSite + '/';
  const entregas = await Promise.all(destinos.map(async ([nome, url]) => {
    try {
      const resposta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nome === 'n8n' ? { ...lead, pagina: paginaN8n } : lead),
        signal: AbortSignal.timeout(6500)
      });
      if (resposta.ok) {
        const resultado = await resposta.json().catch(() => null);
        if (resultado?.ok !== false) return true;
      }
    } catch {
      // A resposta de erro do fornecedor pode conter dados do lead ou o endereço do webhook.
    }
    console.error('Falha ao encaminhar lead para ' + nome);
    return false;
  }));

  // Se um destino recebeu o lead, evita pedir um segundo cadastro em caso de falha parcial.
  const ok = entregas.some(Boolean);
  return Response.json({ ok }, { status: ok ? 200 : 502 });
}

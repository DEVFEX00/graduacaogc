// T-092 · função de servidor (Vercel) que recebe o lead da LP do Tecnólogo em Gestão Comercial e repassa para a planilha.
// O destino (app da Web do Apps Script do T-083, com a chave) fica na variável de ambiente LEAD_WEBHOOK_URL, configurada no
// painel da hospedagem. Nunca escreva esse endereço aqui nem em config.js: ele é segredo.
// A planilha separa as páginas pelo campo "pagina"; aqui ele é fixo, para ninguém gravar em outra aba.
const PAGINA = 'Tecnólogo Gestão Comercial';
const INTERESSE = 'Gestão Comercial';
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function texto(v, max) { return typeof v === 'string' ? v.trim().slice(0, max) : ''; }

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  const destino = process.env.LEAD_WEBHOOK_URL;
  if (!destino) return res.status(503).json({ ok: false, erro: 'destino não configurado' });
  let corpo = req.body;
  if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch (e) { return res.status(400).json({ ok: false }); } }
  if (!corpo || typeof corpo !== 'object') return res.status(400).json({ ok: false });

  // só os campos esperados, com tamanho limitado (nada de dado a mais)
  const lead = {
    nome: texto(corpo.nome, 120),
    email: texto(corpo.email, 160),
    whatsapp: texto(corpo.whatsapp, 20).replace(/\D/g, ''),
    interesse: INTERESSE,
    pagina: PAGINA,
    aceite: corpo.aceite === true
  };
  const origem = {};
  if (corpo.origem && typeof corpo.origem === 'object') for (const k of UTM) if (typeof corpo.origem[k] === 'string') origem[k] = corpo.origem[k].slice(0, 120);
  lead.origem = origem;
  if (lead.nome.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email) || lead.whatsapp.length < 10 || !lead.aceite) return res.status(400).json({ ok: false });
  lead.recebido_em = new Date().toISOString();

  try {
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 7000);   // a página desiste em 8 s; o servidor responde antes
    const r = await fetch(destino, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead), redirect: 'follow', signal: controle.signal });
    clearTimeout(limite);
    if (!r.ok) throw new Error('destino respondeu ' + r.status);
    // o Apps Script responde 200 até quando recusa (chave errada, campo faltando): confere o "ok" da resposta
    let resposta = null; try { resposta = await r.json(); } catch (e) {}
    if (resposta && resposta.ok === false) throw new Error('destino recusou: ' + (resposta.erro || 'sem motivo'));
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('lead não repassado:', e.message);   // sem dado pessoal no log
    return res.status(502).json({ ok: false });
  }
}

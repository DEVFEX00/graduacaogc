import { receberLead } from '../lib/lead.js';

export default async function handler(req, res) {
  const request = new Request('https://localhost/api/lead', {
    method: req.method,
    body: req.method === 'POST' && req.body != null
      ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
      : undefined
  });
  const resposta = await receberLead(request, process.env);
  const allow = resposta.headers.get('Allow');
  if (allow) res.setHeader('Allow', allow);
  return res.status(resposta.status).json(await resposta.json());
}

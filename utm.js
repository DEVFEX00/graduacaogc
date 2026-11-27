const UTM = ['utm_id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export function cleanUtm(values) {
  const origem = {};
  for (const key of UTM) {
    const value = values?.[key];
    if (typeof value === 'string' && value.trim()) origem[key] = value.trim().slice(0, 120);
  }
  return origem;
}

export function campaignUtm(search, storage) {
  const params = new URLSearchParams(search);
  const atual = cleanUtm(Object.fromEntries(UTM.map(key => [key, params.get(key)])));
  try {
    storage ??= globalThis.sessionStorage;
    if (Object.keys(atual).length) {
      storage.setItem('tgc_utm', JSON.stringify(atual));
    } else {
      return cleanUtm(JSON.parse(storage.getItem('tgc_utm') || '{}'));
    }
  } catch {
    // O formulário ainda recebe os parâmetros da URL se o navegador bloquear armazenamento.
  }
  return atual;
}

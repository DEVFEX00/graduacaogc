/* T-092 · CONFIGURAÇÃO da LP do Tecnólogo em Gestão Comercial. Só o Caio preenche, na hora de publicar. Nunca escreva segredo aqui.
   O endereço real do destino (o app da Web do Apps Script, com a chave) fica SÓ na variável LEAD_WEBHOOK_URL da hospedagem.

   destino      caminho da função do servidor que recebe o lead (na Vercel: "/api/lead"). Vazio = prévia: nada é enviado.
                No computador local a página fica em prévia; ?teste-envio=1 força o envio real (só para teste).
   obrigado     página para onde a pessoa vai depois de enviar.
   privacidade  política de privacidade da FEX (aparece no texto de consentimento do formulário).
   whatsapp     link do WhatsApp do comercial no Chat Guru. Hoje: o da secretaria (o mesmo do edital). [CONFIRMAR com o Caio]
   mensagem     texto que já vai escrito no WhatsApp. "Gestão Comercial" é a CHAVE DA TAG no Chat Guru: não tirar.
   mensagemFalha  o mesmo, para quem caiu no obrigado com ?e=1 (o envio falhou).
   vestibular   link do processo seletivo. O link novo do vestibular 2027 chega em 26/11 (Pedro): trocar aqui.
   vsl          arquivo do vídeo, capa (com o play desenhado nela) e legenda opcional (.vtt). Sem arquivo: o player avisa "vídeo em produção".
   prazos       datas reais do edital 2027.1 (itens 4.2 e 6.3). inicioAulas: vazio = não aparece. [CONFIRMAR]
   investimento modo da dobra de investimento:
                  'sem-preco'  (padrão) "Quanto custa a sua graduação?" + botão, sem valor nenhum na página;
                  'com-preco'  mostra a condição, mas SÓ se de, por e ate estiverem preenchidos (senão volta para 'sem-preco');
                  'desligado'  a dobra some.
                Preço e condição ainda não foram confirmados pela secretaria: não preencher antes disso.
   medicao      identificadores públicos das ferramentas (os mesmos do T-083). ligado: false desliga tudo. Em prévia local nada carrega. */
var LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';
var TESTE_ENVIO = /[?&]teste-envio=1(&|$)/.test(location.search);
var CONFIG = {
  destino: LOCAL && !TESTE_ENVIO ? '' : '/api/lead',
  obrigado: 'obrigado.html',
  privacidade: 'https://faculdade.fexeducacao.edu.br/politica-de-privacidade',
  whatsapp: 'https://fexeducacao.edu.br/secretaria',
  mensagem: 'Olá! Tenho interesse na graduação em Gestão Comercial da FEX.',
  mensagemFalha: 'Olá! Tenho interesse na graduação em Gestão Comercial da FEX. Tentei enviar meus dados pela página e não consegui.',
  vestibular: 'https://faculdade.fexeducacao.edu.br/processo-seletivo',
  vsl: { arquivo: 'media/vsl.mp4', capa: 'media/vsl-capa.jpg', legenda: 'media/legenda.vtt' },
  prazos: { inscricoes: '10 de dezembro de 2026', matriculas: '18 de dezembro de 2026', inicioAulas: '' },
  investimento: { modo: 'sem-preco', de: '', por: '', ate: '', inclui: '' },
  medicao: { ligado: true, pagina: 'tgc-gestao-comercial', pixel: '2377222452495164', ga4: 'G-859GN55PSY', clarity: 'p9qzbbqu9g', rd: 'a961ff15-4101-4960-a3c3-0e13c3ddd1ac' }
};

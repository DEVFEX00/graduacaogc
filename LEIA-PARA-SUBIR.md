# LP do Tecnólogo em Gestão Comercial: como subir

Os arquivos já estão na raiz do zip: `index.html` (a LP), `obrigado.html`, CSS, JS, `api/lead.js` (a função que grava o lead na planilha), `img/`, `media/` (VSL, capa e legenda), `fonts/`, `vercel.json` e `package.json`.

## 1. Onde subir (sem repositório)
A página precisa de uma hospedagem que rode a função `api/lead.js`, porque é ela que manda o lead para a planilha. **Use a Vercel**, que é grátis.
- **Sem repositório:** descompacte o zip numa pasta, abra o terminal dentro dela e rode `npx vercel` (na primeira vez ele pede para entrar na sua conta). Depois rode `npx vercel --prod` para publicar.
- **Se subir num lugar que só aceita arquivos** (Netlify Drop, por exemplo), a página abre normalmente, mas o formulário não grava na planilha: a pessoa vai direto para o obrigado de falha, que pede para chamar no WhatsApp. Serve só para mostrar a página, não para rodar o tráfego.

## 2. O que preencher
**Na Vercel, em Settings → Environment Variables:**
- `LEAD_WEBHOOK_URL`: o endereço do app da Web do Apps Script da planilha de leads (o mesmo dos outros funis). Ele nunca vai em arquivo.

**No arquivo `config.js`:**
- `whatsapp`: o link do WhatsApp do comercial no Chat Guru. Hoje está o da secretaria.
- `vestibular`: o link novo do vestibular 2027, que o Pedro manda em 26/11. Hoje está a página do processo seletivo.
- `privacidade`: já aponta para a política da faculdade (faculdade.fexeducacao.edu.br/politica-de-privacidade). Confira se o endereço abre.
- `investimento`: a página sai sem preço. Quando a mensalidade e a condição forem confirmadas, preencha os valores e troque `modo` para mostrar o preço.

## 3. Planilha (aba própria do Tecnólogo)
O passo a passo está em `Área de Trabalho\Planilha de leads dos funis\PASSO A PASSO.md`.
- O lead chega com `pagina: "Tecnólogo Gestão Comercial"`.
- Sem mudar nada no script, ele cai na aba **"Outros"**.
- Para ter a aba própria, acrescente no `receber_leads.gs`, dentro de `var ABAS = { ... }`, a entrada do Tecnólogo (o trecho exato está no `LEIA.md` completo da LP, em `entregas/T-092-tgc-paginas/lp/LEIA.md`). Depois faça **Implantar → Gerenciar implantações → Nova versão**. O endereço continua o mesmo.

## 4. Medição (já ligada)
São os mesmos identificadores dos outros funis: Meta Pixel, Google Analytics 4, Microsoft Clarity e o script do RD Station.
- **Conversão:** dispara uma vez, na página de obrigado (Pixel "Lead", GA "generate_lead", Clarity "lead_tgc").
- **Dados pessoais:** nome, e-mail e telefone não vão para nenhuma dessas ferramentas.
- **RD Station:** não ligue a "integração de formulários" para este domínio, senão o RD captura os dados por fora da planilha.

## 5. Antes de rodar o tráfego
- Testar no celular abrindo pelo Instagram (iPhone e Android).
- Confirmar com o acadêmico a matriz 2027.1 e os dois fatos do VSL: "cada disciplina termina com um entregável" e "todo semestre, um projeto real".
- O VSL usa voz sintética: marque o rótulo de IA onde a plataforma pedir.

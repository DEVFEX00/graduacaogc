import { receberLead } from './lead.js';

export default {
  fetch(request, env) {
    if (new URL(request.url).pathname === '/api/lead') return receberLead(request, env);
    return env.ASSETS.fetch(request);
  }
};

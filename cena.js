/* T-092 v2 · cenas WebGL da LP (WebGL puro, sem biblioteca, ~8 KB). Cada cena vive num bloco próprio, sem texto em cima:
   - "aurora": atrás da vitrine de fotos do topo. Malha de luz verde que flui (ruído com distorção de domínio), com linhas finas
     de curva de nível, que dão o ar de tecnologia sem desenhar nada atrás de texto;
   - "nucleo": janela da dobra "Por que a FEX". Uma forma 3D macia (esfera que respira), com borda de luz verde e anéis em órbita.
   Regras: só desenha quando a cena está na tela, a aba está visível e o formulário está fechado; resolução reduzida (a tela amplia);
   se o aparelho sofrer, a resolução cai em degraus; com "menos movimento" desenha um quadro só e para. Sem WebGL fica o fundo do CSS. */
(function () {
  'use strict';
  var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var COMUM = 'precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;' +
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}' +
    'float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=R*p*2.02;a*=.5;}return v;}';
  var CENAS = {
    aurora: { escala: .7, frag: COMUM +
      'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);float T=t*.07;' +
      'p+=m*.06;' +
      'vec2 q=vec2(fbm(p*1.3+vec2(0.,T)),fbm(p*1.3+vec2(5.2,1.3)-T));' +
      'vec2 w=vec2(fbm(p*1.6+2.4*q+vec2(1.7,9.2)+T*.8),fbm(p*1.6+2.4*q+vec2(8.3,2.8)-T*.6));' +
      'float f=fbm(p*1.4+2.6*w);' +
      'vec3 c0=vec3(.918,.973,.925),c1=vec3(.62,.9,.66),c2=vec3(.196,.804,.196),c3=vec3(.055,.29,.173),c4=vec3(.027,.153,.102);' +
      'vec3 col=mix(c0,c1,smoothstep(.1,.45,f));col=mix(col,c2,smoothstep(.42,.7,f));col=mix(col,c3,smoothstep(.55,.9,length(w)*.95)*.9);' +
      'col=mix(col,c4,smoothstep(.55,1.15,uv.y*.35+(1.-uv.x)*.15+length(q)*.55)*.55);' +
      'float k=f*16.;float lin=1.-smoothstep(0.,.06,abs(fract(k)-.5)-.44);col=mix(col,vec3(1.),lin*.16*smoothstep(.25,.75,f));' +
      'float g=length(p-vec2(.0,.05));col+=vec3(.25,.6,.3)*.12*exp(-g*g*3.);' +
      'col+=(h(gl_FragCoord.xy+t)-.5)/255.*2.;gl_FragColor=vec4(col,1.);}' },
    nucleo: { escala: .85, frag: COMUM +
      'mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}' +
      'float sd(vec3 p){p.xz*=rot(t*.25);p.xy*=rot(t*.17);float d=length(p)-1.;d+=.11*sin(3.1*p.x+t*.9)*sin(2.7*p.y+t*.7)*sin(3.3*p.z+t*.5);return d*.8;}' +
      'vec3 nor(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(sd(p+e.xyy)-sd(p-e.xyy),sd(p+e.yxy)-sd(p-e.yxy),sd(p+e.yyx)-sd(p-e.yyx)));}' +
      'void main(){vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);' +
      'vec3 bg=vec3(.024,.125,.059)+vec3(.1,.35,.15)*.35*exp(-dot(p,p)*3.);' +
      'vec2 e=p*vec2(1.,2.8);float a1=abs(length(e)-.78);float a2=abs(length(p*vec2(1.,3.6)*rot(.35))-.95);' +
      'bg+=vec3(.2,.8,.2)*(.35*(1.-smoothstep(0.,.012,a1))+.22*(1.-smoothstep(0.,.01,a2)));' +
      'float ang=atan(e.y,e.x);float dot1=1.-smoothstep(.0,.03,length(e-.78*vec2(cos(t*.6),sin(t*.6))));bg+=vec3(.2,.85,.25)*dot1;' +
      'vec3 ro=vec3(0.,0.,3.2),rd=normalize(vec3(p,-1.6));float d=0.,md=9.;bool hit=false;' +
      'for(int i=0;i<56;i++){vec3 q=ro+rd*d;float s=sd(q);md=min(md,s);if(s<.002){hit=true;break;}d+=s;if(d>6.)break;}' +
      'vec3 col=bg+vec3(.2,.9,.3)*.55*exp(-md*28.);if(hit){vec3 q=ro+rd*d;vec3 nn=nor(q);vec3 L=normalize(vec3(.6,.8,.5));float dif=max(dot(nn,L),0.);' +
      'float fr=pow(1.-max(dot(nn,-rd),0.),2.6);float sp=pow(max(dot(reflect(-L,nn),-rd),0.),24.);' +
      'col=vec3(.03,.16,.09)+vec3(.06,.32,.16)*dif+vec3(.2,.95,.25)*fr*1.15+vec3(.85,1.,.88)*sp*.45;' +
      'float bands=smoothstep(.45,.5,abs(fract((q.y+q.x*.3)*5.+t*.15)-.5));col+=vec3(.2,.8,.25)*bands*.06;}' +
      'gl_FragColor=vec4(col,1.);}' }
  };

  var cenas = [], pausado = false, mx = 0, my = 0;
  function criar(el) {
    var tipo = el.getAttribute('data-cena'), def = CENAS[tipo]; if (!def) return;
    var cv = document.createElement('canvas'), gl = null;
    try { gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false }); } catch (e) {}
    if (!gl) { if (window.MEDIR) window.MEDIR('webgl_fallback', { cena: tipo }); return; }
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var pr;
    try { pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, def.frag)); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link'); }
    catch (e) { if (window.MEDIR) window.MEDIR('webgl_fallback', { cena: tipo }); return; }
    gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var ap = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
    var c = { el: el, cv: cv, gl: gl, ur: gl.getUniformLocation(pr, 'r'), ut: gl.getUniformLocation(pr, 't'), um: gl.getUniformLocation(pr, 'm'),
      escala: def.escala, vis: false, t0: performance.now() - 8000 * Math.random(), lentos: 0, quadros: 0, w: 0, h: 0 };
    el.appendChild(cv);
    medida(c);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { c.vis = es[0].isIntersecting; if (c.vis) pedir(); }, { rootMargin: '60px' }).observe(el);
    else c.vis = true;
    cenas.push(c);
    if (calmo) desenhar(c, 8);   // um quadro só, parado
  }
  function medida(c) {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5) * c.escala;
    var w = Math.max(2, Math.round(c.el.clientWidth * dpr)), h = Math.max(2, Math.round(c.el.clientHeight * dpr));
    if (w !== c.w || h !== c.h) { c.w = c.cv.width = w; c.h = c.cv.height = h; c.gl.viewport(0, 0, w, h); }
  }
  function desenhar(c, t) {
    var gl = c.gl; gl.uniform2f(c.ur, c.w, c.h); gl.uniform1f(c.ut, t); gl.uniform2f(c.um, mx, my); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  var rodando = false, ultimo = 0;
  function pedir() { if (!rodando && !calmo) { rodando = true; ultimo = performance.now(); requestAnimationFrame(laco); } }
  function laco(agora) {
    var alguma = false, dt = agora - ultimo; ultimo = agora;
    if (!pausado && !document.hidden) {
      cenas.forEach(function (c) {
        if (!c.vis) return; alguma = true;
        desenhar(c, (agora - c.t0) / 1000);
        /* aparelho sofrendo (quadro acima de 34 ms em 45 de 60): a resolução cai um degrau; nunca abaixo de 0,3 */
        c.quadros++; if (dt > 34) c.lentos++;
        if (c.quadros >= 60) { if (c.lentos > 45 && c.escala > .3) { c.escala = Math.max(.3, c.escala * .75); medida(c); } c.quadros = 0; c.lentos = 0; }
      });
    }
    if (alguma && !pausado) requestAnimationFrame(laco); else rodando = false;
  }
  window.CENA = { pausar: function (sim) { pausado = !!sim; if (!sim) pedir(); } };
  document.addEventListener('visibilitychange', function () { if (!document.hidden) pedir(); });
  addEventListener('resize', function () { cenas.forEach(medida); if (calmo) cenas.forEach(function (c) { desenhar(c, 8); }); });
  /* a luz do topo acompanha o mouse de leve (no celular, a rolagem) */
  addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { mx = (e.clientX / innerWidth - .5) * 2; my = (.5 - e.clientY / innerHeight) * 2; } }, { passive: true });
  addEventListener('scroll', function () { if (!window.matchMedia('(pointer: coarse)').matches) return; my = Math.min(1, (scrollY || 0) / 600); }, { passive: true });
  Array.prototype.forEach.call(document.querySelectorAll('[data-cena]'), criar);
  pedir();
})();

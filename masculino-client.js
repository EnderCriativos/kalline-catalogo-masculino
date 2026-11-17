/**
 * Kalline Masculino Inverno 2027 - cliente do estudio (mesmo motor do feminino).
 * Fala com a API /api/catalog do motor homologado (app-base/neon-client.js):
 *   GET /me · GET /bootstrap · POST /photo-urls · GET /versions · GET /versions/:id · POST /versions
 * Versoes: SharedVersions (versions/client.mjs, identico ao do feminino), snapshots imutaveis com parentId.
 * Acesso: Neon Auth com codigo por e-mail, igual ao feminino (neon-auth.js = cliente extraido do neon-client.js).
 * Toda chamada /api/catalog leva "Authorization: Bearer <JWT da sessao>"; o papel (owner/editor) e o CSRF vem de /me.
 * Nenhum segredo no codigo: config.js so tem enderecos publicos.
 * Indexacao/busca: indice-produtos.mjs. Navegacao bidirecional pelas paginas.
 */

import './neon-auth.js?v=v03e';
import { indexarProdutos, buscarProdutos } from './indice-produtos.mjs?v=v03e';

(function() {
  'use strict';
  const cfg = Object.assign({ apiOrigin: '', catalogo: 'masculino-inv2027' }, window.KALLINE_CONFIG || {});

  // ---------- sessao Neon Auth (mesmo fluxo do feminino: O3 -> {auth, bearer}) ----------
  const neon = window.KallineNeonAuth.create(cfg.authBaseUrl);
  const bearer = () => neon.bearer();

  // ---------- fetch autenticado para /api/catalog (como o bj() do neon-client) ----------
  const nativeFetch = globalThis.fetch.bind(globalThis);
  async function catalogFetch(url, options = {}) {
    const headers = new Headers(options.headers);
    headers.set('Authorization', 'Bearer ' + await bearer());
    headers.set('X-Kalline-Catalog', cfg.catalogo);
    return nativeFetch(cfg.apiOrigin + url, { ...options, headers, credentials: 'omit', cache: 'no-store', redirect: 'error' });
  }
  globalThis.fetch = (url, options = {}) => typeof url === 'string' && url.startsWith('/api/catalog') ? catalogFetch(url, options) : nativeFetch(url, options);
  async function api(url, options = {}) {
    const r = await catalogFetch(url, options); let v = {};
    try { v = await r.json(); } catch (e) {}
    if (!r.ok) { const err = Error(v.error?.message || 'A operação não foi confirmada.'); err.code = v.error?.code; err.status = r.status; throw err; }
    return v;
  }

  // ---------- fotos: URLs assinadas devolvidas por POST /photo-urls ----------
  let photoUrls = {};
  window.NeonPilot = {
    showLogin: msg => loginGate(msg),
    signOut: async () => { try { await neon.auth.signOut(); } catch (e) {} location.reload(); },
    photoUrl: (filename, isTratada = true) => photoUrls[(isTratada ? 'treated/' : 'raw/') + filename] || photoUrls['raw/' + filename] || photoUrls['treated/' + filename] || '',
    fallbackUrl: filename => photoUrls['raw/' + filename] || photoUrls['treated/' + filename] || '',
    mediaUrl: key => photoUrls[key] || ''
  };
  window.KallineSession = { role: 'cliente', user: null, api };

  const status = msg => { const st = document.getElementById('neonLoginStatus'); if (st) st.textContent = msg; };
  // tela de espera/erro (sem formulario)
  function gate(msg) {
    const g = document.getElementById('loginGate');
    if (!g) return;
    g.style.display = 'flex';
    for (const id of ['neonEmailForm', 'neonOtpForm', 'neonImportButton']) { const el = document.getElementById(id); if (el) el.hidden = true; }
    status(msg);
  }
  // tela de login: e-mail -> codigo (como o Rr() do feminino)
  function loginGate(msg = 'Entre com seu e-mail autorizado.') {
    gate(msg);
    document.getElementById('neonEmailForm').hidden = false;
    document.getElementById('neonOtpForm').hidden = true;
  }
  document.getElementById('neonEmailForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('neonEmail').value.trim(), btn = e.submitter; if (btn) btn.disabled = true;
    status('Enviando código…');
    try {
      const r = await neon.auth.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
      if (r.error) throw Error(r.error.message || 'Não foi possível enviar o código.');
      document.getElementById('neonOtpForm').hidden = false;
      status('Código enviado. Digite o código recebido no seu e-mail.');
      document.getElementById('neonOtp').focus();
    } catch (err) { status(err.message); } finally { if (btn) btn.disabled = false; }
  });
  document.getElementById('neonOtpForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.submitter; if (btn) btn.disabled = true;
    status('Conferindo código…');
    try {
      const r = await neon.auth.signIn.emailOtp({ email: document.getElementById('neonEmail').value.trim(), otp: document.getElementById('neonOtp').value.trim() });
      if (r.error) throw Error(r.error.message || 'Código inválido ou expirado.');
      document.getElementById('neonOtp').value = '';
      started = false; await initMasculinoEditor();
    } catch (err) { status(err.message); } finally { if (btn) btn.disabled = false; }
  });

  // escopo do autosave por usuario (+ ?qa= para testes), como o I3() do neon-client
  function storageScope(userId) {
    const qa = new URLSearchParams(location.search).get('qa');
    if (qa === null) return { key: userId, testMode: false };
    if (!/^[A-Za-z0-9_-]{4,48}$/.test(qa)) throw Error('Identificador de teste inválido. Abra o endereço normal do catálogo.');
    return { key: userId + '_qa_' + qa, testMode: true };
  }

  // Navegação direta com rolagem suave e destaque visual
  window.navigateToPage = function(pageId) {
    const el = document.getElementById(pageId);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    el.classList.add('page-highlight-pulse');
    setTimeout(() => {
      el.classList.remove('page-highlight-pulse');
    }, 2000);

    // Em telas mobile / estreitas, fecha o sidebar para não cobrir o canvas
    if (window.innerWidth <= 700) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        if (typeof window.toggleSidebar === 'function') window.toggleSidebar();
      }
    }
  };

  // Renderizador inteligente da barra lateral com indexação resiliente e navegação bidirecional
  window.renderSidebarLooks = function(filterQuery = '') {
    const list = document.getElementById('sidebarLooksList');
    if (!list) return;

    const produtos = (LOOKS_DATA || []).map(l => ({
      referencia: l.ref1,
      nome: l.name1,
      name1: l.name1,
      cor1: l.cor1,
      lookNum: l.seq,
      status: l.status,
      is_recolor_base: l.is_recolor_base,
      originalLook: l
    }));

    let indexResult;
    try {
      indexResult = indexarProdutos(produtos, window.pages || []);
    } catch (e) {
      console.warn('[Roadmap Index] Erro ao indexar produtos:', e);
      indexResult = { produtos, diagnosticos: [] };
    }

    const q = filterQuery.trim();
    const filtered = q ? buscarProdutos(indexResult, q) : indexResult.produtos;

    list.innerHTML = filtered.map(p => {
      const l = p.originalLook || p;
      const hasPages = Array.isArray(p.paginas) && p.paginas.length > 0;
      const isPendingPhoto = p.is_recolor_base || (p.referencia === '0461812.001');

      const pagePillsHtml = hasPages
        ? p.paginas.map(pg => `
            <button type="button" class="btn-side-page" onclick="navigateToPage('${pg.id}')" title="Navegar até a Página ${pg.numero.toString().padStart(2, '0')} no Canvas">
              <i data-lucide="eye" style="width:12px;height:12px;"></i> Pág ${pg.numero.toString().padStart(2, '0')}
            </button>
          `).join(' ')
        : `<span class="badge-no-page">Sem página</span>`;

      const pendingBadgeHtml = isPendingPhoto
        ? `<span class="badge-pending" title="Peça sem fotos no shooting original; requer retoque digital ou fotos dedicadas">Pendente Pintura</span>`
        : '';

      return `
        <div class="look-side-card" data-ref="${p.referencia}">
          <div class="look-side-header">
            <span class="look-seq-pill">LOOK #${p.lookNum.toString().padStart(2, '0')}</span>
            ${pendingBadgeHtml}
          </div>
          <div class="look-side-name">${p.nome || l.name1}</div>
          <div class="look-side-ref">${p.referencia} ${l.name2 ? ' • ' + l.name2 : ''}</div>
          <div class="look-side-occurrences">
            <span class="occurrences-label">Páginas:</span>
            ${pagePillsHtml}
          </div>
          <div class="look-side-actions">
            <button class="btn-side-add" onclick="addNewPage(null, createDefaultPageForLook(getLookBySeq(${p.lookNum})))" title="Inserir nova página com este look">
              <i data-lucide="plus" aria-hidden="true"></i> Nova Página
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  // Sobrescreve filterSidebarLooks para usar a busca resiliente
  window.filterSidebarLooks = function() {
    const q = document.getElementById('lookSearchInput')?.value || '';
    window.renderSidebarLooks(q);
  };

  // Inicialização do Editor
  function sanitizePieceNames(planList) {
    if (!Array.isArray(planList)) return;
    planList.forEach(p => {
      (p.pieces || []).forEach(piece => {
        if (piece.name) {
          piece.name = piece.name.replace(/\s*\([^)]*\)\s*$/, '').trim();
        }
      });
    });
  }

  // Ao abrir (sem edicao local pendente): abre a versao mais recente do CLIENTE (nao oficial), lida de GET /versions.
  const stable = value => Array.isArray(value) ? '[' + value.map(stable).join(',') + ']'
    : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}' : JSON.stringify(value);
  async function latestClientVersionMeta() {
    const list = (await api('/api/catalog/versions')).versions || [];
    return list.filter(v => !v.readOnly && !v.oficial).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
  }
  window.KallineSession.latestClientVersionMeta = latestClientVersionMeta;
  // Abertura: a BASE OFICIAL mais nova manda. Versao de cliente so e aberta sozinha se descende dessa base;
  // rascunho local feito sobre base antiga (ou de origem desconhecida) e guardado e substituido pela base atual.
  const ORIGEM_KEY = () => 'kalline_masc_origem_' + window.KALLINE_STORAGE_SCOPE;
  const lerOrigem = () => { try { return JSON.parse(localStorage.getItem(ORIGEM_KEY()) || 'null'); } catch (e) { return null; } };
  const gravarOrigem = o => { try { localStorage.setItem(ORIGEM_KEY(), JSON.stringify(o)); } catch (e) {} };
  function lineage(list) {
    const byId = new Map(list.map(v => [v.id, v]));
    const rootOf = id => { let cur = id, n = 0; while (byId.get(cur)?.parentId && n++ < 500) cur = byId.get(cur).parentId; return cur; };
    const desc = (a, b) => String(b.createdAt).localeCompare(String(a.createdAt));
    const bases = list.filter(v => v.readOnly || v.oficial).sort(desc);
    const clientes = list.filter(v => !v.readOnly && !v.oficial).sort(desc);
    return { rootOf, base: bases[0] || null, clientes, byId };
  }
  window.KallineSession.lineage = lineage;
  async function openLatestClientVersion() {
    let panel = null;
    for (let i = 0; i < 100 && !panel; i++) {
      try { panel = sharedVersionsPanel; } catch (e) {}
      if (!panel) await new Promise(r => setTimeout(r, 100));
    }
    const diag = window.__kallineStartup = { autosaveDescartado: false };
    try {
      if (!panel) return;
      const cl = panel.client;
      const list = (await api('/api/catalog/versions')).versions || [];
      const L = lineage(list);
      const alvo = L.clientes.find(v => L.rootOf(v.id) === L.base?.id) || L.base;  // ultima do cliente sobre a base atual, senao a base
      Object.assign(diag, { base: L.base?.id || null, latest: alvo && alvo !== L.base ? alvo.id : null, versoes: list.length });
      if (!alvo) return;
      const origem = lerOrigem();
      const fpAtual = stable(window.pages);
      const fpBoot = stable(KallineReview.normalize(structuredClone(INITIAL_PAGES)));
      const rascunhoLocal = fpAtual !== fpBoot;
      // rascunho local valido = feito sobre a base atual (origem conhecida) e ainda diferente do que foi salvo
      const rascunhoDaBaseAtual = rascunhoLocal && origem && origem.base === L.base?.id;
      if (rascunhoDaBaseAtual && cl.parentId !== alvo.id) {
        showToast('Há alterações não salvas neste navegador. Clique em Salvar para guardá-las.');
        return;
      }
      if (rascunhoLocal && !rascunhoDaBaseAtual) {
        try { localStorage.setItem('kalline_masc_rascunho_antigo_' + window.KALLINE_STORAGE_SCOPE, JSON.stringify({ guardadoEm: new Date().toISOString(), origem, plan: window.pages })); } catch (e) {}
        diag.autosaveDescartado = true;
      }
      if (cl.parentId === alvo.id && !rascunhoLocal) { gravarOrigem({ base: L.base?.id, versao: alvo.id }); return; }
      const snap = await api('/api/catalog/versions/' + encodeURIComponent(alvo.id));
      await cl.applyPlan(structuredClone(snap.plan));
      cl.baseline = stable(window.pages); cl.parentId = snap.id; cl.rememberCurrent(); cl.changed(cl);
      gravarOrigem({ base: L.base?.id, versao: snap.id });
      showToast(diag.autosaveDescartado ? 'A base do catálogo foi atualizada: aberta "' + snap.name + '". Seu rascunho anterior ficou guardado neste navegador.' : 'Aberta: ' + snap.name);
    } catch (e) {
      console.warn('[Kalline] abertura da versão:', e.message);
    } finally {
      window.__kallineStartupDone = true;
      // a cada gravacao/abertura, lembra sobre qual base o trabalho esta (para a proxima visita)
      setInterval(async () => {
        try { const cl = panel?.client; if (!cl?.parentId || lerOrigem()?.versao === cl.parentId) return;
          const L = lineage((await api('/api/catalog/versions')).versions || []); gravarOrigem({ base: L.rootOf(cl.parentId), versao: cl.parentId }); } catch (e) {}
      }, 3000);
    }
  }

  let started = false;
  async function initMasculinoEditor() {
    if (started) return; started = true;
    gate('Conferindo sessão…');
    try { await bearer(); } catch (e) { started = false; loginGate(); return; }
    let me, boot;
    try {
      me = await api('/api/catalog/me');
      boot = await api('/api/catalog/bootstrap');
    } catch (e) {
      started = false;
      if (e.status === 401 || e.code === 'SIGN_IN_REQUIRED') loginGate('Sessão expirada. Entre novamente.');
      else if (e.status === 403) loginGate('Este e-mail não tem acesso a este catálogo. Use o e-mail autorizado pela Ender.');
      else gate('Não foi possível conectar ao servidor: ' + e.message);
      return;
    }
    if (!boot.photosReady) { gate('Acesso confirmado. As prévias das fotos ainda estão sendo preparadas.'); return; }
    // a API devolve as chaves completas (kalline-masculino/treated/x.jpg); o editor procura treated/, raw/, conceito/, assets/
    const signed = (await api('/api/catalog/photo-urls', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': me.csrf }, body: JSON.stringify({ keys: boot.photoKeys }) })).urls || {};
    photoUrls = Object.fromEntries(Object.entries(signed).map(([k, v]) => [k.replace(/^kalline-masculino\//, ''), v]));

    // papel vem do servidor: owner (Ender) ou admin (mock) liberam os controles de exportacao
    window.KallineSession.role = ['admin', 'owner'].includes(me.user.role || me.role) ? 'admin' : 'cliente';
    window.KallineSession.user = me.user;
    document.documentElement.classList.toggle('is-admin', window.KallineSession.role === 'admin');

    // espelho do .indd (mapa) e fotos: os looks oferecem SO as tratadas daquela referencia; nada de foto bruta
    // o storage da Function so repassa {photoKeys,looks,original,rawCatalog,brandData,conceito}: o espelho vem em conceito.espelho
    window.KALLINE_ESPELHO_V03 = boot.espelho || boot.conceito?.espelho || null;
    const tratadas = (window.KALLINE_ESPELHO_V03 && window.KALLINE_ESPELHO_V03.fotosLooks) || [];
    LOOKS_DATA = (boot.looks || []).map(l => {
      const entered = (l.entered || []).filter(e => tratadas.includes(e.filename));
      const usados = new Set(entered.map(e => e.filename));
      return { ...l, entered, unused_tratadas: tratadas.filter(f => f.startsWith(l.ref1 + '_') && !usados.has(f)), unused_todas: [] };
    });
    boot.rawCatalog = { files: [], byLook: {} };
    PLANO_79_PAGINAS_REFINADO = boot.original;
    PLANO_107_PAGINAS_EXPANDIDO = boot.original;
    INITIAL_PAGES = boot.original; // 40 paginas V03
    window.KALLINE_CONCEITO_V03 = boot.conceito;
    window.KALLINE_RAW_PHOTOS = boot.rawCatalog || { files: [], byLook: {} };
    KALLINE_BRASAO_DATA = boot.brandData || '';
    KALLINE_BRASAO_HTML = KALLINE_BRASAO_DATA ? `<img class="kalline-brasao-img" src="${KALLINE_BRASAO_DATA}" alt="Kalline" />` : '';
    TREATED_PHOTO_FILES = new Set(LOOKS_DATA.flatMap(a => (a.entered || []).map(o => o.filename).concat(a.unused_tratadas || [])));
    KNOWN_RAW_PHOTO_FILES = new Set(LOOKS_DATA.flatMap(a => a.unused_todas || []).concat(window.KALLINE_RAW_PHOTOS.files || []));
    const scope = storageScope(me.user.id);
    window.KALLINE_AUTH_USER_ID = me.user.id;
    window.KALLINE_STORAGE_SCOPE = cfg.catalogo + '_' + scope.key;
    NEON_PAGE_KEY = 'kalline_neon_' + cfg.catalogo + '_' + scope.key;

    document.getElementById('loginGate').style.display = 'none';
    const profileBadge = document.getElementById('userProfileBadge');
    if (profileBadge) {
      profileBadge.style.display = 'flex';
      const label = profileBadge.querySelector('span');
      if (label) label.textContent = me.user.name || (window.KallineSession.role === 'admin' ? 'Ender' : 'Cliente');
    }

    // metricas da Venti (linha de base exata dos textos do INDD): carrega as fontes antes do primeiro desenho
    try { await Promise.all([500, 600, 700].map(w => document.fonts.load(w + ' 10px "Venti CF"'))); } catch (e) {}
    loadState();
    sanitizePieceNames(window.pages || []);
    setZoom(0.75);
    renderAllPages();
    window.renderSidebarLooks();
    const countEl = document.getElementById('totalLooksCount');
    if (countEl) countEl.textContent = LOOKS_DATA.length;
    initializeSharedVersions();
    openLatestClientVersion();
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    console.log('[Kalline Masculino 2027] Estúdio pronto (' + window.KallineSession.role + ').');
  }

  window.addEventListener('kalline-editor-ready', () => { initMasculinoEditor(); });
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initMasculinoEditor, 50);
  }
})();

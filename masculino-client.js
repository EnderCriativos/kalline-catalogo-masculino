/**
 * Kalline Masculino Inverno 2027 - Cliente Editorial Local-First
 * Baseado no motor de produção aprovado (release 44902d6).
 * Integrado com o novo Roadmap (Fase 1 - MVP):
 * - Indexação e busca resiliente (módulo indice-produtos.mjs)
 * - Navegação bidirecional: clicar no badge de página leva direto à página com scroll suave e destaque
 * - Suporte a múltiplos desdobros (relação 1:N entre look e páginas)
 * - Identificação visual de status (peças pendentes de retoque fotográfico)
 * - Controle de versões imutáveis com botões rosa
 */

import { indexarProdutos, buscarProdutos } from './indice-produtos.mjs';

(function() {
  'use strict';

  // Configuração global do catálogo masculino
  LOOKS_DATA = window.KALLINE_MASCULINO_LOOKS || [];
  PLANO_79_PAGINAS_REFINADO = window.KALLINE_MASCULINO_PAGES || [];
  PLANO_107_PAGINAS_EXPANDIDO = window.KALLINE_MASCULINO_PAGES || [];
  INITIAL_PAGES = window.KALLINE_MASCULINO_PAGES || [];
  window.KALLINE_RAW_PHOTOS = window.KALLINE_MASCULINO_RAW_PHOTOS || { files: [], byLook: {} };
  KALLINE_BRASAO_DATA = window.KALLINE_BRASAO_DATA || '';
  KALLINE_BRASAO_HTML = KALLINE_BRASAO_DATA ? `<img class="kalline-brasao-img" src="${KALLINE_BRASAO_DATA}" alt="Kalline" />` : '';

  TREATED_PHOTO_FILES = new Set(
    LOOKS_DATA.flatMap(a => (a.entered || []).map(o => o.filename).concat(a.unused_tratadas || []))
  );
  KNOWN_RAW_PHOTO_FILES = new Set(
    LOOKS_DATA.flatMap(a => a.unused_todas || []).concat(window.KALLINE_RAW_PHOTOS.files || [])
  );

  window.KALLINE_AUTH_USER_ID = 'ender_direcao';
  window.KALLINE_STORAGE_SCOPE = 'masculino_inv2027';
  NEON_PAGE_KEY = 'kalline_masculino_inverno_2027_v1';
  const VERSIONS_STORAGE_KEY = 'kalline_masculino_versions_v1';

  // Provedor de fotos e sessão local
  window.NeonPilot = {
    showLogin: () => {},
    signOut: () => {
      if (confirm('Deseja reiniciar a sessão local? As versões salvas continuarão no navegador.')) {
        location.reload();
      }
    },
    photoUrl: (filename, isTratada = true) => {
      if (!filename) return '';
      return 'fotos/' + encodeURIComponent(filename);
    }
  };

  // Helper para gerar IDs imutáveis v_ + 32 hex
  function generateVersionId() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return 'v_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Base imutável inicial do masculino
  const BASE_VERSION = {
    id: 'base_masculino_v01',
    name: 'Base Editorial Masculino Inverno 2027 (10 Duplas / 20 Peças)',
    readOnly: true,
    createdAt: '2026-11-12T00:00:00.000Z',
    author: { name: 'Ender · Base Oficial Aprovada' },
    plan: JSON.parse(JSON.stringify(INITIAL_PAGES))
  };

  function getLocalVersions() {
    try {
      const stored = localStorage.getItem(VERSIONS_STORAGE_KEY);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {
      console.warn('Erro ao ler versões locais:', e);
    }
    return [BASE_VERSION];
  }

  function saveLocalVersions(list) {
    try {
      localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Erro ao gravar versões locais:', e);
      throw new Error('Armazenamento local cheio. Salve um JSON pelo botão Salvar JSON.');
    }
  }

  // Intercepta chamadas de rede para simular o backend idêntico ao Neon
  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (url, options = {}) => {
    if (typeof url === 'string' && url.startsWith('/api/catalog')) {
      const path = url.replace('/api/catalog', '');
      const method = (options.method || 'GET').toUpperCase();

      // /me
      if (path === '/me') {
        return new Response(JSON.stringify({
          ok: true,
          user: { id: 'ender_direcao', name: 'Ender · Direção Criativa' },
          csrf: 'local_csrf_token'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // /versions
      if (path === '/versions') {
        if (method === 'GET') {
          const list = getLocalVersions();
          const versionsMeta = list.map(v => ({
            id: v.id,
            name: v.name,
            readOnly: !!v.readOnly,
            createdAt: v.createdAt,
            author: v.author,
            parentId: v.parentId || null
          }));
          return new Response(JSON.stringify({ ok: true, versions: versionsMeta }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
          });
        }

        if (method === 'POST') {
          const body = JSON.parse(options.body || '{}');
          if (!body.name || !body.name.trim()) {
            return new Response(JSON.stringify({ error: { code: 'INVALID_NAME', message: 'Dê um nome para a versão.' } }), {
              status: 400, headers: { 'Content-Type': 'application/json' }
            });
          }
          if (!Array.isArray(body.plan) || !body.plan.length) {
            return new Response(JSON.stringify({ error: { code: 'INVALID_PLAN', message: 'O plano precisa conter páginas válidas.' } }), {
              status: 400, headers: { 'Content-Type': 'application/json' }
            });
          }

          const newId = generateVersionId();
          const newVersion = {
            id: newId,
            name: body.name.trim(),
            readOnly: false,
            createdAt: new Date().toISOString(),
            author: { name: 'Ender · Direção Criativa' },
            parentId: body.parentId || null,
            plan: body.plan
          };

          const list = getLocalVersions();
          list.unshift(newVersion);
          saveLocalVersions(list);

          return new Response(JSON.stringify({
            ok: true,
            version: {
              id: newVersion.id,
              name: newVersion.name,
              createdAt: newVersion.createdAt,
              author: newVersion.author
            }
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      }

      // /versions/:id
      if (path.startsWith('/versions/')) {
        const id = decodeURIComponent(path.replace('/versions/', ''));
        const list = getLocalVersions();
        const found = list.find(v => v.id === id);
        if (!found) {
          return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Versão não encontrada.' } }), {
            status: 404, headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({
          ok: true,
          id: found.id,
          name: found.name,
          readOnly: !!found.readOnly,
          createdAt: found.createdAt,
          author: found.author,
          plan: found.plan
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ error: { message: 'Rota não implementada localmente' } }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }

    return originalFetch(url, options);
  };

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
      nome: l.name1 + (l.cor1 ? ` (${l.cor1})` : ''),
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
  function initMasculinoEditor() {
    const loginGate = document.getElementById('loginGate');
    if (loginGate) loginGate.style.display = 'none';

    const profileBadge = document.getElementById('userProfileBadge');
    if (profileBadge) {
      profileBadge.style.display = 'flex';
      const label = profileBadge.querySelector('span');
      if (label) label.textContent = 'Ender · Direção Criativa';
    }

    loadState();
    setZoom(0.75);
    renderAllPages();
    window.renderSidebarLooks();

    const countEl = document.getElementById('totalLooksCount');
    if (countEl) countEl.textContent = LOOKS_DATA.length;

    initializeSharedVersions();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    console.log('[Kalline Masculino 2027] Estúdio Editorial pronto (Roadmap Fase 1 integrado).');
  }

  window.addEventListener('kalline-editor-ready', () => {
    initMasculinoEditor();
  });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initMasculinoEditor, 50);
  }
})();

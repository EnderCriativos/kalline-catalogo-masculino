/**
 * Kalline Masculino Inverno 2027 - Conceito V03 no estudio web.
 * - Paginas de conceito (capa, conceito 2-16, LOOKBOOK 17, fechamento 38-39, contracapa 40)
 * - Exportador InDesign (.jsx) portado de 05_SCRIPTS/conceito_masculino/montar_conceito.py (build_jsx)
 * - Exportar/Importar versao (JSON) e Exportar comentarios (JSON)
 * Medidas em pt no corte A4 (595.276 x 841.89), sangria 5 mm (14.173 pt), iguais ao Python.
 */
(function () {
  'use strict';
  // dados do conceito chegam por GET /api/catalog/bootstrap (campo conceito); no Node (mock/CLI) vem do arquivo
  const getC = () => {
    const c = window.KALLINE_CONCEITO_V03 || { paginas: [], fechamento: [], fotos: [] };
    const e = window.KALLINE_ESPELHO_V03;
    return e && e.fotosConceito ? { ...c, fotos: e.fotosConceito } : c;
  };

  // ---------- geometria (copia fiel de montar_conceito.py) ----------
  const W = 595.276, H = 841.89, B = 14.173;
  const BG = '#F2F3EF', INK = '#231F20', FULL = 'FULL';
  const LAYOUTS = {
    capa:          { bg: null, fotos: [FULL], logo_capa: [470, 74, 55, 334] },
    inset:         { bg: BG, fotos: [[35, 34, 528, 732]] },
    full:          { bg: null, fotos: [FULL] },
    duo_inverno:   { bg: BG, fotos: [[221, 34, 341, 323], [221, 382, 341, 405]], inverno: [73.5, 445.5] },
    sobreposta:    { bg: '#CFD1CC', fotos: [[33, 33, 369, 515], [334, 404, 227, 371]] },
    coluna3:       { bg: BG, fotos: [[122, -B, 352, 181 + B], [122, 205, 352, 432], [122, 662, 352, H + B - 662]] },
    moldura:       { bg: '#43102A', fotos: [[47, 49, 501, 735]] },
    quad4:         { bg: BG, fotos: [[56, 33, 276, 294], [347, 33, 195, 294], [54, 343, 278, 457], [346, 344, 195, 454]] },
    moldura_preta: { bg: '#03070E', fotos: [[89, 109, 417, 625]] },
    trio_esq:      { bg: BG, fotos: [[47, 131, 323, 581], [394, 130, 160, 285], [395, 437, 160, 274]] },
    brasao_baixo:  { bg: BG, fotos: [[86, 369, 423, 415]], brasao: [86.5, 76] },
    solo:          { bg: BG, fotos: [[113, 171, 369, 499]] },
    tagline:       { bg: BG, fotos: [[56, 313, 384, 461]], brasao: [465.1, 314.8], tagline: [465.1, 730] },
    lookbook:      { bg: null, fotos: [FULL], lookbook: true },
    fechamento:    { bg: BG, fotos: [], tagline_linha: true },
    // espelho do .indd salvo: a pagina guarda os itens do mapa (moldura, recorte, textos, fundos)
    indd:          { bg: null, fotos: [], indd: true },
    contracapa:    { bg: null, fotos: [FULL], brasao_branco: [72.2, 81.9], logo_cc: [69.0, 617.5, 37.9, 142.9], inverno_cc: [91.0, 363.5] },
  };
  const LAYOUT_LABELS = {
    capa: 'Capa (foto + logo)', inset: 'Foto com margem', full: 'Foto sangrada', duo_inverno: 'Dupla + INVERNO 2027',
    sobreposta: 'Duas sobrepostas', coluna3: 'Coluna de 3', moldura: 'Moldura (fundo escuro)', quad4: '4 fotos',
    moldura_preta: 'Moldura preta', trio_esq: 'Trio', brasao_baixo: 'Brasão + foto', solo: 'Foto central',
    tagline: 'Foto + brasão + tagline', lookbook: 'Abertura LOOKBOOK', fechamento: 'Tagline em linha (fechamento)',
    contracapa: 'Contracapa', indd: 'Como no InDesign (V03)',
  };
  const BRASAO = 34.7;
  const TXT_INVERNO = 'INVERNO 2027';
  const TXT_TAGLINE = ['COURO.', 'DESIGN.', 'TRADIÇÃO.'];
  const TXT_LOOKBOOK = 'LOOKBOOK';
  const TXT_TAGLINE_LINHA = 'COURO. DESIGN. TRADIÇÃO.';
  const TXT_INVERNO_CC = ['INVERNO', '2027'];
  const TRK_TAGLINE_LINHA = 205, TRK_INVERNO_CC = 240;
  const TRK_INVERNO = 200, TRK_TAGLINE = 200, TRK_LOOKBOOK = 200, TRK_FOOT = 250;
  const LOOK_GRIDS = {
    look3: { front: [35, 36, 308, 710], topRight: [348, 36, 213, 386], bottomRight: [348, 429, 212, 317] },
    look3_right: { heroRight: [252, 36, 308, 710], topLeft: [35, 36, 213, 386], bottomLeft: [36, 429, 212, 317] },
    // grades extras do estudio (medidas do exportador anterior do 06_WEB)
    '2col': { col1: [34.015, 34.015, 256.536, 725.67], col2: [304.724, 34.015, 256.535, 725.67] },
    '3col': { col1: [34.015, 34.015, 171.02, 725.67], col2: [212.122, 34.015, 171.02, 725.67], col3: [390.229, 34.015, 171.03, 725.67] },
    estourada: { hero: [34.015, 34.015, 527.244, 725.67] },
    quad4: { slot1: [34.015, 34.015, 256.536, 359.335], slot2: [304.724, 34.015, 256.535, 359.335], slot3: [34.015, 400.35, 256.536, 359.335], slot4: [304.724, 400.35, 256.535, 359.335] },
  };
  const FOOT_BRASAO = [92.7, 774.2, 24.1], FOOT_NAME_X = 131.3, FOOT_DIV_X = 432.7, FOOT_SIZE_X = 442.2;

  const pad2 = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isPhotoItem = it => it.tipo === 'Rectangle' && it.arquivo && (it.pasta === 'ORIGINAIS' || it.pasta === 'TRATADAS');
  const slotKeys = (layout, page) => layout === 'indd'
    ? ((page && page.itens) || []).map((it, i) => isPhotoItem(it) ? 'r' + i : null).filter(Boolean)
    : (LAYOUTS[layout]?.fotos || []).map((_, i) => 'f' + i);
  // URLs assinadas devolvidas por POST /api/catalog/photo-urls (chaves conceito/<arquivo> e assets/<arquivo>)
  const conceptUrl = f => window.NeonPilot?.mediaUrl?.('conceito/' + f) || '';
  const assetUrl = f => window.NeonPilot?.mediaUrl?.('assets/' + f) || '';

  // ---------- plano inicial (40 paginas) ----------
  function conceptPage(pg) {
    const slots = {};
    pg.fotos.forEach((f, i) => { slots['f' + i] = { file: f, pos: 'center' }; });
    const page = { id: 'c_p' + pad2(pg.pag), type: 'concept', layout: pg.layout, layoutOriginal: pg.layout, pieces: [], slots };
    if (pg.fundo) page.fundo = pg.fundo;
    if (pg.layout === 'capa') page.isCover = true;
    return page;
  }
  function buildInitialPlan(lookPages) {
    const C = getC();
    return [...C.paginas.map(conceptPage), ...structuredClone(lookPages), ...C.fechamento.map(conceptPage)];
  }

  // ---------- plano a partir do MAPA do .indd (fonte de verdade) ----------
  const near = (a, b, t = 3) => Math.abs(a - b) <= t;
  function classifyLookRect(it) {
    for (const [type, grid] of Object.entries(LOOK_GRIDS)) for (const [key, r] of Object.entries(grid))
      if (near(it.x, r[0]) && near(it.y, r[1]) && near(it.w, r[2]) && near(it.h, r[3])) return { type, key };
    return null;
  }
  function buildPlanFromMap(espelho, lookPages) {
    const diffs = [];
    const byCode = new Map(lookPages.map(p => [String(p.pieces?.[0]?.code || ''), p]));
    const plan = espelho.paginas.map(mp => {
      const pag = mp.pagina;
      const tratadas = mp.itens.filter(it => isPhotoItem(it) && it.pasta === 'TRATADAS');
      if (tratadas.length) {
        const texts = mp.itens.filter(it => it.tipo === 'TextFrame');
        const nameTxt = texts.find(t => t.texto.includes('  -  '));
        const code = nameTxt ? nameTxt.texto.split('  -  ').pop().trim() : '';
        const base = byCode.get(code);
        if (!base) { diffs.push({ pag, tipo: 'look sem referencia', detalhe: 'codigo ' + code + ' do mapa nao esta em paginas.json' }); }
        const page = base ? structuredClone(base) : { id: 'p_m' + pad2(pag), lookNum: 0, pieces: [], slots: {} };
        page.slots = {};
        let type = null;
        for (const it of tratadas) {
          const c = classifyLookRect(it);
          if (!c) { diffs.push({ pag, tipo: 'moldura de look fora da grade', detalhe: it.arquivo + ' ' + [it.x, it.y, it.w, it.h].join(',') }); continue; }
          type = type || c.type;
          page.slots[c.key] = { file: it.arquivo, pos: 'center' };
          // moldura ajustada no INDD (ex.: pag. 31 da V03.2 em 2 colunas de 259 pt): guarda a medida exata
          const g = LOOK_GRIDS[c.type][c.key];
          if ([it.x, it.y, it.w, it.h].some((v, k) => Math.abs(v - g[k]) > 0.5)) (page.moldurasIndd ||= {})[c.key] = [it.x, it.y, it.w, it.h];
        }
        page.type = type || 'look3';
        if (page.moldurasIndd) page.tipoIndd = page.type;
        const files = tratadas.map(t => t.arquivo);
        const dup = files.filter((f, i) => files.indexOf(f) !== i);
        if (dup.length) diffs.push({ pag, tipo: 'foto repetida (como no INDD)', detalhe: dup.join(', ') });
        if (base) {
          const expected = base.pieces.map(pc => pc.name.toUpperCase() + '  -  ' + pc.code);
          const got = texts.filter(t => t.texto.includes('  -  ')).map(t => t.texto);
          if (JSON.stringify(expected) !== JSON.stringify(got)) diffs.push({ pag, tipo: 'legenda difere de paginas.json', detalhe: got.join(' | ') + ' x ' + expected.join(' | ') });
        }
        // rodape como esta no INDD (o Markus ajusta a posicao em algumas paginas)
        const br = mp.itens.find(it => it.pasta === 'ASSETS');
        const ln = mp.itens.find(it => it.tipo === 'GraphicLine');
        const box = it => [it.x, it.y, it.w, it.h];
        page.rodapeIndd = {
          brasao: br ? box(br) : null, brasaoArquivo: br ? br.arquivo : null, linha: ln ? [...box(ln), ln.traco || 0.25] : null, corLinha: ln && ln.cor_traco ? hexOf(ln.cor_traco) : null,
          nomes: texts.filter(t => t.texto.includes('  -  ')).sort((a, b) => a.y - b.y).map(t => ({ box: box(t), item: structuredClone(t) })),
          tamanhos: texts.filter(t => !t.texto.includes('  -  ')).sort((a, b) => a.y - b.y).map(t => ({ box: box(t), item: structuredClone(t) })),
        };
        page.mapaPagina = pag;
        return page;
      }
      const slots = {};
      mp.itens.forEach((it, i) => { if (isPhotoItem(it)) slots['r' + i] = { file: it.arquivo, pos: 'center' }; });
      const page = { id: 'm_p' + pad2(pag), type: 'concept', layout: 'indd', layoutOriginal: 'indd', pieces: [], slots, itens: structuredClone(mp.itens), mapaPagina: pag };
      if (pag === 1) page.isCover = true;
      return page;
    });
    return { plan, diffs };
  }

  function pageBg(page) {
    if (page.layout === 'indd') return null;
    const L = LAYOUTS[page.layout];
    return (page.fundo && page.layout === page.layoutOriginal) ? page.fundo : L.bg;
  }

  function isValidConceptPage(page) {
    const L = LAYOUTS[page.layout];
    const okSlot = s => s === null || (s && typeof s.file === 'string' && (s.pos === undefined || ['top', 'center', 'bottom'].includes(s.pos)));
    if (page.itens !== undefined && (!Array.isArray(page.itens) || page.itens.length > 200 || JSON.stringify(page.itens).length > 100000)) return false;
    if (page.layout === 'indd' && !Array.isArray(page.itens)) return false;
    return !!L && LAYOUTS[page.layoutOriginal] !== undefined && Array.isArray(page.pieces) && page.pieces.length === 0 &&
      page.slots && typeof page.slots === 'object' && !Array.isArray(page.slots) && Object.values(page.slots).every(okSlot) &&
      (page.fundo === undefined || /^#[0-9A-Fa-f]{6}$/.test(page.fundo)) &&
      (page.isCover === undefined || typeof page.isCover === 'boolean');
  }

  // ---------- render HTML ----------
  const pct = (v, total) => (v / total * 100).toFixed(4) + '%';
  function boxStyle(r) {
    const [x, y, w, h] = r === FULL ? [0, 0, W, H] : r;
    return `left:${pct(x, W)};top:${pct(y, H)};width:${pct(w, W)};height:${pct(h, H)};`;
  }
  const fs = pt => `calc(${pt}px * var(--page-scale))`;
  // texto com linha de base em y (pt); line-height 1 => topo ~ 0.8em acima da base
  function textAt({ x = null, baseline, size, trk, color, weight, text, center = false }) {
    const top = baseline - size * 0.8;
    const pos = center ? 'left:0;width:100%;text-align:center;' : `left:${pct(x, W)};`;
    const comp = center ? `margin-right:-${trk / 1000}em;` : '';
    return `<div class="cx-text" style="${pos}top:${pct(top, H)};font-size:${fs(size)};letter-spacing:${trk / 1000}em;color:${color};font-weight:${weight};"><span style="${comp}">${esc(text)}</span></div>`;
  }

  function renderPhoto(page, key, rect, label) {
    const s = page.slots[key];
    const style = boxStyle(rect);
    if (!s || !s.file) {
      return `<div class="cx-photo cx-empty" style="${style}" onclick="KallineConceito.openPicker('${page.id}','${key}')"><span>Escolher foto</span></div>`;
    }
    const pos = s.pos || 'center';
    return `<div class="cx-photo" style="${style}" onclick="KallineConceito.openPicker('${page.id}','${key}')" title="${esc(s.file)} · clique para trocar">
      <img src="${conceptUrl(s.file)}" alt="${esc(s.file)}" loading="lazy" style="object-position:center ${pos};">
      <div class="cx-photo-actions"><span class="cx-file">${esc(s.file.replace('KALLINE ', ''))}</span>
        <button type="button" onclick="event.stopPropagation();KallineConceito.openPicker('${page.id}','${key}')">Trocar</button>
        <button type="button" onclick="event.stopPropagation();KallineConceito.cyclePos('${page.id}','${key}')" title="Enquadramento">${pos.toUpperCase()}</button>
      </div></div>`;
  }

  // ---------- espelho: itens do mapa em coordenadas do InDesign ----------
  const hexOf = c => (String(c || '').match(/#[0-9A-Fa-f]{6}/) || ['#000000'])[0];
  const weightOf = f => /Demi/i.test(f) ? 600 : /Medium/i.test(f) ? 500 : /Bold/i.test(f) ? 700 : 400;
  // mapas antigos (sem "paragrafos"): molduras de pagina inteira e "INVERNO 2027" girado de 1 linha eram centralizados
  const legacyAlign = it => (it.w >= 590 || (Number(it.rotacao) === 90 && !String(it.texto).includes('\n'))) ? 'centro' : 'esquerda';
  const assetPng = f => String(f).replace(/\.pdf$/i, '.png');
  const ALIGN = { esquerda: 'left', centro: 'center', direita: 'right', justificado: 'justify' };
  // ---- texto do mapa: paragrafos (alinhamento, entrelinha, linha de base) e trechos (fonte, corpo, tracking, cor) ----
  function paragraphsOf(it) {
    if (Array.isArray(it.paragrafos) && it.paragrafos.length) return it.paragrafos;
    return String(it.texto).split('\n').map(l => ({ texto: l, alinhamento: legacyAlign(it), entrelinha: 'auto(120%)', legado: true,
      trechos: [{ texto: l, fonte: it.fonte || 'Venti CF Bold', corpo: it.corpo || 10, tracking: it.tracking || 0, cor: it.cor }] }));
  }
  // o InDesign devolve trechos que podem atravessar paragrafos: corta cada trecho no texto do paragrafo
  function runsOf(par) {
    const out = []; let rest = String(par.texto);
    for (const t of par.trechos || []) {
      if (!rest) break;
      const first = String(t.texto).split('\n')[0];
      const take = first && rest.startsWith(first) ? first : rest;
      out.push({ ...t, texto: take }); rest = rest.slice(take.length);
    }
    if (rest) out.push({ ...((par.trechos || []).slice(-1)[0] || {}), texto: rest });
    return out;
  }
  const leadingOf = (par, size) => typeof par.entrelinha === 'number' ? par.entrelinha : (parseFloat(String(par.entrelinha || '').replace(/[^0-9.]/g, '')) || 120) / 100 * size;
  const metricsCache = {};
  function fontMetrics(w) {
    if (metricsCache[w]) return metricsCache[w];
    let m = { a: 0.8, d: 0.2 };
    try {
      const c = document.createElement('canvas').getContext('2d'); c.font = `${w} 100px "Venti CF"`;
      const t = c.measureText('H');
      if (t.fontBoundingBoxAscent) m = { a: t.fontBoundingBoxAscent / 100, d: t.fontBoundingBoxDescent / 100 };
      if (document.fonts && document.fonts.check(`${w} 100px "Venti CF"`)) metricsCache[w] = m;
    } catch {}
    return m;
  }
  // o InDesign nao soma o tracking depois da ultima letra; o CSS soma: o ultimo trecho compensa
  const runSpan = (r, last) => `<span style="font-weight:${weightOf(r.fonte)};font-size:${fs(r.corpo || 10)};letter-spacing:${(r.tracking || 0) / 1000}em;color:${hexOf(r.cor)};${last ? `margin-right:-${(r.tracking || 0) / 1000}em;` : ''}">${esc(r.texto)}</span>`;
  function textFrame(it, extra = '') {
    const pars = paragraphsOf(it), rot = Number(it.rotacao) || 0;
    const head = `<div class="cx-tf" style="${boxStyle([it.x, it.y, it.w, it.h])}" data-item="text" data-text="${esc(it.texto)}" data-frame="${[it.x, it.y, it.w, it.h].join(',')}" ${extra}>`;
    const base = 'font-family:var(--font-catalog);white-space:pre;';
    if (!rot && pars.every(p => typeof p.linha_base === 'number')) {
      // linha de base exata de cada paragrafo (em pt na pagina), alinhamento do paragrafo
      const lines = pars.map(p => {
        const runs = runsOf(p), size = Math.max(...runs.map(r => r.corpo || 10)), m = fontMetrics(weightOf(runs[0]?.fonte));
        const top = p.linha_base - it.y - size * ((1 - (m.a + m.d)) / 2 + m.a);
        return `<div style="position:absolute;left:0;width:100%;top:${(top / it.h * 100).toFixed(4)}%;font-size:${fs(size)};line-height:1;text-align:${ALIGN[p.alinhamento] || 'left'};">${runs.map((r, k) => runSpan(r, k === runs.length - 1)).join('')}</div>`;
      }).join('');
      return head + `<div class="cx-tf-inner" style="${base}position:absolute;inset:0;">${lines}</div></div>`;
    }
    // sem linha de base (texto girado ou mapa antigo): justificacao vertical da moldura + entrelinha do paragrafo
    const innerW = rot % 180 ? it.h : it.w, innerH = rot % 180 ? it.w : it.h;
    const vj = { CENTER_ALIGN: 'center', TOP_ALIGN: 'flex-start', BOTTOM_ALIGN: 'flex-end' }[it.alinhamento_vertical || 'CENTER_ALIGN'] || 'center';
    // sem linha de base: o centro vertical do InDesign fica ~(0.06em + 0.7pt) abaixo do centro da caixa de linha do CSS (medido no PDF)
    const legacyDy = `position:relative;top:calc(0.06em + ${fs(0.7)});`;
    const lines = pars.map(p => {
      const runs = runsOf(p), size = Math.max(...runs.map(r => r.corpo || 10));
      return `<div style="${legacyDy}font-size:${fs(size)};line-height:${fs(leadingOf(p, size))};text-align:${ALIGN[p.alinhamento] || 'left'};">${runs.map((r, k) => runSpan(r, k === runs.length - 1)).join('')}</div>`;
    }).join('');
    const inner = `${base}display:flex;flex-direction:column;justify-content:${vj};width:${fs(innerW)};height:${fs(innerH)};` +
      (rot ? `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(${-rot}deg);` : '');
    return head + `<div class="cx-tf-inner" style="${inner}">${lines}</div></div>`;
  }
  // especificacao do texto para o .jsx: texto unico (paragrafos com \r) + estilos por paragrafo e por trecho (offsets)
  function textSpec(it) {
    const pars = paragraphsOf(it); let off = 0;
    const paras = pars.map((p, k) => {
      const runs = runsOf(p).map(r => { const o = { start: off, len: r.texto.length, estilo: String(r.fonte || 'Venti CF Bold').replace(/^Venti CF[\s]+/, ''), corpo: r.corpo || 10, tracking: r.tracking || 0, cor: hexOf(r.cor) }; off += r.texto.length; return o; }).filter(r => r.len);
      off += 1; // \r
      const size = Math.max(...runs.map(r => r.corpo), 1);
      return { just: { centro: 'CENTER_ALIGN', direita: 'RIGHT_ALIGN', justificado: 'LEFT_JUSTIFIED' }[p.alinhamento] || 'LEFT_ALIGN',
        leading: typeof p.entrelinha === 'number' ? p.entrelinha : 'auto', autoPct: typeof p.entrelinha === 'number' ? 120 : Math.round(leadingOf(p, size) / size * 100), runs };
    });
    return { texto: pars.map(p => p.texto).join('\r'), rotacao: Number(it.rotacao) || 0, vj: it.alinhamento_vertical || 'CENTER_ALIGN', box: [it.x, it.y, it.w, it.h], paras };
  }
  function renderInddInner(page) {
    const itens = page.itens || [];
    const rects = itens.map((it, i) => [it, i]).filter(([it]) => it.tipo === 'Rectangle').reverse(); // mapa: frente -> fundo
    let h = '';
    for (const [it, i] of rects) {
      const frame = [it.x, it.y, it.w, it.h];
      if (it.fundo && !it.arquivo) { h += `<div class="cx-fill" style="${boxStyle(frame)}background:${hexOf(it.fundo)};" data-item="fundo" data-cor="${hexOf(it.fundo)}"></div>`; continue; }
      if (it.pasta === 'ASSETS') { const png = assetPng(it.arquivo); h += `<img class="cx-art" src="${assetUrl(png)}" alt="" style="${boxStyle(frame)}object-fit:fill;" data-item="asset" data-file="${esc(png)}" data-frame="${frame.join(',')}">`; continue; }
      if (!isPhotoItem(it)) continue;
      const key = 'r' + i, s = page.slots[key];
      const url = s && s.file ? (it.pasta === 'TRATADAS' ? window.NeonPilot.photoUrl(s.file) : conceptUrl(s.file)) : '';
      const original = s && s.file === it.arquivo && it.img;
      const imgStyle = original
        ? `position:absolute;left:${((it.img.x - it.x) / it.w * 100).toFixed(4)}%;top:${((it.img.y - it.y) / it.h * 100).toFixed(4)}%;width:${(it.img.w / it.w * 100).toFixed(4)}%;height:${(it.img.h / it.h * 100).toFixed(4)}%;object-fit:fill;${it.espelho && it.espelho !== 'NONE' ? 'transform:scaleX(-1);' : ''}`
        : `width:100%;height:100%;object-fit:cover;object-position:center ${(s && s.pos) || 'center'};`;
      h += `<div class="cx-photo" style="${boxStyle(frame)}" data-item="photo" data-slot="${key}" data-file="${esc(s?.file || '')}" data-frame="${frame.join(',')}" data-img="${original ? [it.img.x, it.img.y, it.img.w, it.img.h].join(',') : 'cover'}" onclick="KallineConceito.openPicker('${page.id}','${key}')" title="${esc(s?.file || '')} · clique para trocar">` +
        (url ? `<img src="${url}" alt="${esc(s.file)}" loading="lazy" style="${imgStyle}">` : '<span class="cx-empty-label">Escolher foto</span>') +
        `<div class="cx-photo-actions"><span class="cx-file">${esc((s?.file || '').replace('KALLINE ', ''))}</span><button type="button" onclick="event.stopPropagation();KallineConceito.openPicker('${page.id}','${key}')">Trocar</button>` +
        (original ? '' : `<button type="button" onclick="event.stopPropagation();KallineConceito.cyclePos('${page.id}','${key}')">${((s && s.pos) || 'center').toUpperCase()}</button>`) + `</div></div>`;
    }
    for (const it of itens.filter(it => it.tipo === 'GraphicLine'))
      h += `<div class="cx-line" style="${boxStyle([it.x - (it.traco || 0.25) / 2, it.y, it.traco || 0.25, it.h])}background:${it.cor_traco ? hexOf(it.cor_traco) : '#B1B3B6'};" data-item="line" data-frame="${[it.x, it.y, it.w, it.h].join(',')}"></div>`;
    for (const it of itens.filter(it => it.tipo === 'TextFrame'))
      h += textFrame(it);
    return h;
  }

  // paginas de look em medida exata do .indd (feminino p.25 / LOOK3), com rodape como no .jsx
  const SLOT_LABELS = { front: 'Frente / Look Todo', topRight: 'Detalhe (Sup. Dir)', bottomRight: 'Costas (Inf. Dir)', heroRight: 'Frente / Look Todo (Dir)',
    topLeft: 'Detalhe (Sup. Esq)', bottomLeft: 'Costas (Inf. Esq)', col1: 'Coluna 1', col2: 'Coluna 2', col3: 'Coluna 3', hero: 'Página inteira', slot1: 'Foto 1', slot2: 'Foto 2', slot3: 'Foto 3', slot4: 'Foto 4' };
  // grade do look: a do INDD (mapa) enquanto o cliente nao troca a grade; senao a padrao
  function lookGrid(page) {
    const base = LOOK_GRIDS[page.type];
    if (!base) return base;
    if (!page.moldurasIndd || page.tipoIndd !== page.type) return base;
    return Object.fromEntries(Object.entries(base).map(([k, r]) => [k, page.moldurasIndd[k] || r]));
  }
  function renderLookExact(page) {
    const grid = lookGrid(page) || {};
    let h = '';
    for (const [k, r] of Object.entries(grid))
      h += `<div class="exact-slot" style="${boxStyle(r)}" data-item="photo" data-slot="${k}" data-file="${esc(page.slots[k]?.file || '')}" data-frame="${r.join(',')}" data-img="cover">${renderPhotoSlotBox(page, k, SLOT_LABELS[k] || k)}</div>`;
    const g = footerGeometry(page);
    if (g) {
      h += `<img class="cx-art" src="${assetUrl('brasao_rodape_look.png')}" alt="" style="${boxStyle(g.brasao)}" data-item="asset" data-file="brasao_rodape_look.png" data-frame="${g.brasao.join(',')}">`;
      if (g.linha) h += `<div class="cx-line" style="${boxStyle([g.linha[0] - g.linha[4] / 2, g.linha[1], g.linha[4], g.linha[3]])}background:${g.corLinha};" data-item="line" data-frame="${g.linha.slice(0, 4).join(',')}"></div>`;
      for (const t of g.textos) h += textFrame(t);
    }
    return h;
  }
  // geometria do rodape: a do INDD (mapa) quando a pagina ainda tem as mesmas pecas; senao a padrao do .jsx
  function footerGeometry(page) {
    const pcs = window.KallineReview.printed(page);
    if (!pcs.length) return null;
    const r = page.rodapeIndd;
    const mapTexts = r ? [...(r.nomes || []), ...(r.tamanhos || [])].map(t => t.item).filter(Boolean) : [];
    const textos = []; let changed = false;
    const synth = (x, y, w, h, runs) => ({ tipo: 'TextFrame', x, y, w, h, rotacao: 0, texto: runs.map(r => r.texto).join(''), alinhamento_vertical: 'CENTER_ALIGN',
      paragrafos: [{ texto: runs.map(r => r.texto).join(''), alinhamento: 'esquerda', entrelinha: 'auto(120%)', linha_base: y + 10.39, trechos: runs }] });
    const run = (texto, estilo) => ({ texto, fonte: 'Venti CF ' + estilo, corpo: 10, tracking: TRK_FOOT, cor: INK });
    pcs.forEach((pc, q) => {
      const top = 778.6 + q * 13, nm = pc.name.trim().toUpperCase(), cd = pc.code.trim();
      const label = nm && cd ? nm + '  -  ' + cd : (nm || cd);
      // legenda igual a do INDD: usa o item do mapa (posicao, trechos Bold/Medium, linha de base); senao, o padrao do .jsx
      if (label) { const m = mapTexts.find(t => t.texto === label); if (!m) changed = true;
        textos.push(m || synth(FOOT_NAME_X, top, 295, 14, nm && cd ? [run(nm, 'Bold'), run('  -  ' + cd, 'Medium')] : [run(label, nm ? 'Bold' : 'Medium')])); }
      const sz = pc.size.trim().toUpperCase();
      if (sz) { const m = mapTexts.find(t => t.texto === sz && !textos.includes(t)); if (!m) changed = true;
        textos.push(m || synth(FOOT_SIZE_X, top, 120, 14, [run(sz, 'Bold')])); }
    });
    const useMap = r && r.brasao && !changed;
    return { brasao: useMap ? r.brasao : [FOOT_BRASAO[0], FOOT_BRASAO[1], FOOT_BRASAO[2], FOOT_BRASAO[2]],
      linha: pcs.some(p => p.size.trim()) ? (useMap && r.linha ? r.linha : [FOOT_DIV_X, 774.2, 0, 24.1, 0.25]) : null,
      corLinha: useMap && r.corLinha ? r.corLinha : '#B1B3B6', textos };
  }

  function renderConceptInner(page) {
    if (page.layout === 'indd') return renderInddInner(page);
    const L = LAYOUTS[page.layout];
    const keys = slotKeys(page.layout);
    let h = '';
    L.fotos.forEach((r, i) => { h += renderPhoto(page, keys[i], r, 'Foto ' + (i + 1)); });
    if (L.logo_capa) h += `<img class="cx-art" src="${assetUrl('logo_vertical_branco.png')}" alt="KALLINE" style="${boxStyle(L.logo_capa)}">`;
    if (L.brasao) h += `<img class="cx-art" src="${assetUrl('brasao_conceito.png')}" alt="Brasão" style="${boxStyle([L.brasao[0], L.brasao[1], BRASAO, BRASAO])}">`;
    if (L.inverno) {
      h += `<div class="cx-rot" style="left:${pct(L.inverno[0], W)};top:${pct(L.inverno[1], H)};"><div class="cx-rot-inner" style="font-size:${fs(14.3)};letter-spacing:${TRK_INVERNO / 1000}em;color:${INK};font-weight:600;"><span style="margin-right:-${TRK_INVERNO / 1000}em">${TXT_INVERNO}</span></div></div>`;
    }
    if (L.tagline) TXT_TAGLINE.forEach((t, i) => { h += textAt({ x: L.tagline[0], baseline: L.tagline[1] + 11 + i * 16, size: 10.6, trk: TRK_TAGLINE, color: INK, weight: 600, text: t }); });
    if (L.lookbook) h += textAt({ baseline: 437, size: 42.3, trk: TRK_LOOKBOOK, color: '#F2F3EF', weight: 600, text: TXT_LOOKBOOK, center: true });
    if (L.tagline_linha) h += textAt({ baseline: 397, size: 14.3, trk: TRK_TAGLINE_LINHA, color: INK, weight: 600, text: TXT_TAGLINE_LINHA, center: true });
    if (L.brasao_branco) h += `<img class="cx-art" src="${assetUrl('brasao_branco.png')}" alt="Brasão" style="${boxStyle([L.brasao_branco[0], L.brasao_branco[1], BRASAO, BRASAO])}">`;
    if (L.logo_cc) h += `<img class="cx-art" src="${assetUrl('logo_contracapa_branco.png')}" alt="KALLINE" style="${boxStyle(L.logo_cc)}">`;
    if (L.inverno_cc) {
      const lines = TXT_INVERNO_CC.map((t, i) => `<div style="position:absolute;left:0;top:${((22 + i * 29.5 - 23.7 * 0.8) / 62 * 100).toFixed(3)}%;line-height:1;white-space:nowrap;">${t}</div>`).join('');
      h += `<div class="cx-rot" style="left:${pct(L.inverno_cc[0], W)};top:${pct(L.inverno_cc[1], H)};"><div class="cx-rot-inner" style="width:${fs(144)};height:${fs(62)};font-size:${fs(23.7)};letter-spacing:${TRK_INVERNO_CC / 1000}em;color:#F2F3EF;font-weight:700;position:relative;">${lines}</div></div>`;
    }
    return h;
  }

  function pageLabel(page, idx) {
    if (page.type !== 'concept') return 'Look ' + pad2(page.lookNum);
    if (page.layout === 'capa' || (page.layout === 'indd' && page.isCover)) return 'Capa';
    if (page.layout === 'indd' && (page.itens || []).some(it => it.tipo === 'TextFrame' && it.texto === 'LOOKBOOK')) return 'LOOKBOOK';
    if (page.layout === 'contracapa') return 'Contracapa';
    if (page.layout === 'lookbook') return 'LOOKBOOK';
    const firstLook = window.pages.findIndex(p => p.type !== 'concept');
    return (firstLook >= 0 && idx > firstLook) ? 'Fechamento' : 'Conceito';
  }

  function renderConceptPageCard(page, idx, isSpreadLeft, isSpreadRight) {
    const pageNum = idx + 1;
    const opts = Object.keys(LAYOUTS).map(k => `<option value="${k}" ${k === page.layout ? 'selected' : ''}>${esc(LAYOUT_LABELS[k])}${k === page.layoutOriginal ? ' (V03)' : ''}</option>`).join('');
    const open = (page.comments || []).filter(c => !c.resolved).length;
    const bg = pageBg(page) || '#FFFFFF';
    return `
      <div class="page-wrapper" id="${page.id}">
        <div class="page-toolbar">
          <div class="toolbar-row">
            <div class="toolbar-row-left">
              <span class="page-num-pill">PÁG ${pad2(pageNum)} ${isSpreadLeft ? '[ESQ]' : (isSpreadRight ? '[DIR]' : '')} · ${esc(pageLabel(page, idx).toUpperCase())}</span>
              <select class="page-look-select cx-layout-select" onchange="KallineConceito.changeLayout('${page.id}', this.value)" title="Layout da página de conceito" aria-label="Layout da página ${pageNum}">${opts}</select>
            </div>
            <div class="toolbar-row-right"><div class="page-tools">
              <button class="btn-tool-icon" onclick="movePage(${idx}, -1)" title="Mover antes"><i data-lucide="chevron-up"></i></button>
              <button class="btn-tool-icon" onclick="movePage(${idx}, 1)" title="Mover depois"><i data-lucide="chevron-down"></i></button>
              <button class="btn-tool-icon" onclick="KallineConceito.duplicateConcept(${idx})" title="Duplicar página"><i data-lucide="copy"></i></button>
              <button class="btn-tool-icon btn-tool-delete" onclick="deletePage(${idx})" title="Excluir esta página"><i data-lucide="trash-2"></i></button>
            </div></div>
          </div>
          <div class="toolbar-row toolbar-layout-row">
            <div class="toolbar-row-right">
              <span class="cx-hint">Clique numa foto para trocar</span>
              <button class="btn-tool-insert-small" onclick="KallineConceito.insertConcept(${idx})" title="Inserir página de conceito depois desta"><i data-lucide="plus-circle"></i> Página de conceito</button>
              <button class="btn-tool-insert-small" onclick="openInsertModal(${idx})" title="Inserir página de look depois desta"><i data-lucide="plus-circle"></i> Página de look</button>
              <button class="btn-tool-insert-small" onclick="openCommentsEditor('${page.id}')"><i data-lucide="message-square" aria-hidden="true"></i> Comentários (${open})</button>
            </div>
          </div>
        </div>
        <div data-review-page="${page.id}" class="lookbook-page concept-page ${isSpreadLeft ? 'page-left' : ''} ${isSpreadRight ? 'page-right' : ''}" style="background:${bg};">
          ${renderConceptInner(page)}
          ${window.renderReviewOverlay ? window.renderReviewOverlay(page) : ''}
        </div>
        <div class="review-overflow-warning" data-footer-warning="${page.id}" role="status" hidden></div>
      </div>`;
  }

  // ---------- edicao ----------
  function mutatePage(pageId, fn) {
    const page = window.pages.find(p => p.id === pageId);
    if (!page) return;
    window.pages = window.pages.map(p => p === page ? fn(structuredClone(p)) : p);
    saveState();
    renderAllPages(true);
  }
  function changeLayout(pageId, layout) {
    if (!LAYOUTS[layout]) return;
    if (layout === 'indd' && !(window.pages.find(p => p.id === pageId)?.itens)) { showToast('Esta página não veio do InDesign.'); return; }
    mutatePage(pageId, p => {
      if (layout !== 'indd') {
        const from = slotKeys(p.layout, p).map(k => p.slots[k]).filter(s => s && s.file);
        slotKeys(layout).forEach((k, i) => { if (!p.slots[k]?.file && from[i]) p.slots[k] = { file: from[i].file, pos: from[i].pos || 'center' }; });
      }
      p.layout = layout; if (layout === 'capa' || (layout === 'indd' && p.mapaPagina === 1)) p.isCover = true; else delete p.isCover; return p;
    });
    showToast('Layout alterado. As fotos que sobraram ficam guardadas na página.');
  }
  function cyclePos(pageId, key) {
    const order = ['center', 'top', 'bottom'];
    mutatePage(pageId, p => { const s = p.slots[key]; if (s) s.pos = order[(order.indexOf(s.pos || 'center') + 1) % 3]; return p; });
  }
  let picker = null;
  function openPicker(pageId, key) {
    const page = window.pages.find(p => p.id === pageId);
    if (!page) return;
    if (!picker) { picker = document.createElement('dialog'); picker.className = 'review-dialog cx-picker'; document.body.append(picker); }
    const cur = page.slots[key]?.file || '';
    const used = new Set(window.pages.filter(p => p.type === 'concept').flatMap(p => Object.values(p.slots || {}).map(s => s?.file)));
    const isLookFoto = page.layout === 'indd' && page.itens?.[Number(key.slice(1))]?.pasta === 'TRATADAS';
    const lista = isLookFoto ? (window.KALLINE_ESPELHO_V03?.fotosLooks || []) : getC().fotos;
    const urlOf = f => isLookFoto ? window.NeonPilot.photoUrl(f) : conceptUrl(f);
    picker.innerHTML = `<h2>Trocar foto</h2><p>Página ${window.pages.indexOf(page) + 1} · ${esc(LAYOUT_LABELS[page.layout])}. ${lista.length} fotos ${isLookFoto ? 'tratadas' : 'de conceito (cópia leve)'}. Marcadas com • já estão em uso.</p>
      <div class="cx-picker-grid">${lista.map(f => `<button type="button" class="${f === cur ? 'is-current' : ''}" data-file="${esc(f)}"><img src="${urlOf(f)}" alt="" loading="lazy"><span>${used.has(f) ? '• ' : ''}${esc(f.replace('KALLINE ', ''))}</span></button>`).join('')}</div>
      <button type="button" data-close>Cancelar</button>`;
    picker.querySelectorAll('[data-file]').forEach(b => b.addEventListener('click', () => {
      const file = b.dataset.file; picker.close();
      mutatePage(pageId, p => { p.slots[key] = { file, pos: p.slots[key]?.pos || 'center' }; return p; });
      showToast('Foto trocada: ' + file);
    }));
    picker.querySelector('[data-close]').addEventListener('click', () => picker.close());
    picker.showModal();
  }

  function newPageId(prefix) { return prefix + Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, '0')).join(''); }
  function duplicateConcept(idx) {
    const src = window.pages[idx]; if (!src) return;
    const clone = structuredClone(src); clone.id = newPageId('c_'); delete clone.isCover; delete clone.mapaPagina;
    (clone.comments || []).forEach(c => { c.id = 'comment_' + newPageId(''); c.pageId = clone.id; });
    window.pages.splice(idx + 1, 0, clone); saveState(); renderAllPages(true); showToast('Página ' + (idx + 1) + ' duplicada.');
  }
  function insertConcept(idx) {
    const page = { id: newPageId('c_'), type: 'concept', layout: 'full', layoutOriginal: 'full', pieces: [], slots: {} };
    window.pages.splice(idx + 1, 0, page); saveState(); renderAllPages(true);
    showToast('Página de conceito inserida depois da ' + (idx + 1) + '. Escolha o layout e as fotos.');
    setTimeout(() => document.getElementById(page.id)?.scrollIntoView({ block: 'center' }), 60);
  }

  // ---------- navegacao (miniaturas) ----------
  function firstPhotoUrl(page) {
    if (page.type === 'concept') {
      const s = slotKeys(page.layout, page).map(k => page.slots[k]).find(s => s && s.file);
      if (!s) return '';
      return page.layout === 'indd' && /^\d/.test(s.file) ? window.NeonPilot.photoUrl(s.file) : conceptUrl(s.file);
    }
    const s = Object.values(page.slots || {}).find(s => s && s.file);
    return s ? window.NeonPilot.photoUrl(s.file) : '';
  }
  function renderPageNav() {
    let box = document.getElementById('cxPageNav');
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    if (!box) {
      box = document.createElement('div'); box.id = 'cxPageNav'; box.className = 'cx-page-nav';
      const search = sidebar.querySelector('.sidebar-search');
      sidebar.insertBefore(box, search);
    }
    const ps = window.pages || [];
    const falta = (4 - ps.length % 4) % 4;
    let warn = document.getElementById('cxPrintWarning');
    if (!warn) { warn = document.createElement('div'); warn.id = 'cxPrintWarning'; warn.setAttribute('role', 'status'); document.querySelector('.header-actions')?.prepend(warn); }
    warn.className = 'cx-print-warning' + (falta ? ' is-bad' : '');
    warn.textContent = falta ? `${ps.length} páginas · não fecha para impressão: faltam ${falta} ${falta === 1 ? 'página' : 'páginas'} (múltiplo de 4)` : `${ps.length} páginas · fecha para impressão (múltiplo de 4)`;
    checkTextOverflow();
    box.innerHTML = `<div class="cx-nav-title">Páginas (${ps.length})${falta ? ` · <span style="color:#ffb38a">faltam ${falta} p/ múltiplo de 4</span>` : ''}</div><div class="cx-nav-grid">${ps.map((p, i) => {
      const u = firstPhotoUrl(p);
      return `<button type="button" onclick="navigateToPage('${p.id}')" title="Pág ${pad2(i + 1)} · ${esc(pageLabel(p, i))}"><span class="cx-thumb" style="background:${p.type === 'concept' ? (pageBg(p) || '#ddd') : '#fff'}">${u ? `<img src="${u}" alt="" loading="lazy">` : ''}</span><span>${pad2(i + 1)}</span></button>`;
    }).join('')}</div>`;
  }

  // texto nunca pode ser cortado: avisa na pagina se algum texto nao cabe na moldura
  function checkTextOverflow() {
    for (const node of document.querySelectorAll('[data-review-page]')) {
      const bad = [...node.querySelectorAll('.cx-tf-inner')].filter(t => t.scrollWidth > t.clientWidth + 1 || t.scrollHeight > t.clientHeight + 1)
        .map(t => t.closest('.cx-tf').dataset.text);
      const w = document.querySelector('[data-footer-warning="' + node.dataset.reviewPage + '"]');
      if (!w || !node.classList.contains('exact-page') && !node.classList.contains('concept-page')) continue;
      w.hidden = !bad.length; w.textContent = bad.length ? 'Texto não cabe na moldura (revise antes de exportar): ' + bad.join(' | ') : '';
    }
  }

  // ---------- JSX (porte de build_jsx) ----------
  const jsLit = (v, indent) => JSON.stringify(v, null, indent).replace(/[\u007f-\uffff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  const asciiComment = s => String(s).replace(/[\r\n\u2028\u2029]+/g, ' ').replace(/\*\//g, '* /').replace(/[\u007f-\uffff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));

  function conceptItem(page, pag) {
    if (page.layout === 'indd') {
      const itens = (page.itens || []).map((it, i) => {
        const o = { tipo: it.tipo, x: it.x, y: it.y, w: it.w, h: it.h };
        if (it.fundo && !it.arquivo) o.fundo = hexOf(it.fundo);
        if (it.pasta === 'ASSETS') { o.asset = it.arquivo; }
        if (isPhotoItem(it)) { const s = page.slots['r' + i]; if (!s || !s.file) return null; o.foto = s.file; o.pasta = it.pasta; o.pos = s.pos || 'center'; if (s.file === it.arquivo && it.img) o.img = [it.img.x, it.img.y, it.img.w, it.img.h]; }
        if (it.tipo === 'TextFrame') o.spec = textSpec(it);
        if (it.tipo === 'GraphicLine') { o.traco = it.traco || 0.25; o.cor = it.cor_traco ? hexOf(it.cor_traco) : '#B1B3B6'; }
        return o;
      }).filter(Boolean);
      return { kind: 'indd', pag, itens };
    }
    const L = LAYOUTS[page.layout];
    const item = { kind: 'concept', pag, layout: page.layout, bg: pageBg(page), fotos: [], extras: {} };
    slotKeys(page.layout, page).forEach((k, i) => {
      const s = page.slots[k];
      if (s && s.file) item.fotos.push({ rect: L.fotos[i], file: s.file, pos: s.pos || 'center' });
    });
    for (const key of ['logo_capa', 'brasao', 'inverno', 'tagline', 'brasao_branco', 'logo_cc', 'inverno_cc']) if (L[key]) item.extras[key] = L[key].slice();
    for (const key of ['lookbook', 'tagline_linha']) if (L[key]) item.extras[key] = true;
    return item;
  }
  function lookItem(page) {
    const grid = lookGrid(page);
    if (!grid) throw Error('Grade desconhecida na página ' + page.id);
    const pieces = window.KallineReview.printed(page).map(({ name, code, size }) => ({ name: name.trim(), code: code.trim(), size: size.trim() }));
    if (pieces.length > 4) throw Error('Mais de quatro legendas na página do look ' + page.lookNum + '. Nenhuma peça é omitida: revise antes de exportar.');
    const g = footerGeometry(page);
    return { kind: 'look', lookNum: page.lookNum, pieces, rodape: g ? { brasao: g.brasao, linha: g.linha, corLinha: g.corLinha, textos: g.textos.map(textSpec) } : null,
      fotos: Object.keys(grid).filter(k => page.slots[k]?.file).map(k => ({ rect: grid[k], file: page.slots[k].file, pos: page.slots[k].pos || 'center' })) };
  }

  function buildJsx(plan, meta) {
    const items = plan.map((p, i) => p.type === 'concept' ? conceptItem(p, i + 1) : lookItem(p));
    const now = new Date();
    const stamp = now.getFullYear() + pad2(now.getMonth() + 1) + pad2(now.getDate()) + '_' + pad2(now.getHours()) + pad2(now.getMinutes());
    const vid = String(meta.id || 'sem-id');
    const slug = (vid.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 14) || 'local');
    const outRel = '07_CONCEITO_EDITORIAL/EXPORT_ESTUDIO/' + stamp + '_' + slug + '/INDESIGN/';
    const outName = 'CATALOGO MASCULINO INVERNO 2027 - ESTUDIO ' + stamp;
    let root = String(meta.root || '').trim();
    if (root && !root.endsWith('/')) root += '/';
    return `// KALLINE MASCULINO INVERNO 2027 - CONCEITO + LOOKBOOK (${items.length} paginas)
// VERSAO ID: ${asciiComment(vid)}
// VERSAO NOME: ${asciiComment(meta.name || 'Plano em edicao')}
// VERSAO AUTOR: ${asciiComment(meta.author || '-')} | SALVA EM: ${asciiComment(meta.createdAt || '-')}
// ${meta.dirty ? 'ATENCAO: inclui alteracoes ainda nao salvas como versao.' : 'Conteudo identico a versao salva acima.'}
// Gerado em ${now.toISOString()} pelo estudio web (06_WEB/conceito-v03.js), porte de 05_SCRIPTS/conceito_masculino/montar_conceito.py (build_jsx).
// Cria um documento NOVO (A4 210x297, sangria 5 mm, paginas espelhadas). Nao abre nem altera nenhum .indd existente.
// Fotos de conceito: 02_FOTOS/CONCEITO/ORIGINAIS (alta), recuo BAIXA_RESOLUCAO. Fotos de look: 02_FOTOS/TRATADAS, recuo BAIXA_RESOLUCAO.
#target indesign

(function () {
    var versionId = ${jsLit(vid)};
    var versionName = ${jsLit(String(meta.name || 'Plano em edicao'))};
    var root = ${jsLit(root)};
    if (!root || !new Folder(root + '03_DADOS').exists) {
        var picked = Folder.selectDialog('Selecione a pasta CATALOGO MASCULINO INVERNO 2027 (a que tem 02_FOTOS, 03_DADOS e 07_CONCEITO_EDITORIAL)');
        if (!picked) return;
        root = picked.fsName + '/';
        if (!new Folder(root + '03_DADOS').exists) { alert('Pasta errada: nao encontrei 03_DADOS em ' + root); return; }
    }
    var outDir = root + ${jsLit(outRel)};
    var outName = ${jsLit(outName)};
    var conceptDirs = [root + '02_FOTOS/CONCEITO/ORIGINAIS/', root + '02_FOTOS/CONCEITO/BAIXA_RESOLUCAO/'];
    var lookDirs = [root + '02_FOTOS/TRATADAS/', root + '02_FOTOS/BAIXA_RESOLUCAO/'];
    var assets = root + '07_CONCEITO_EDITORIAL/ASSETS/';
    var W = ${W}, H = ${H}, B = ${B};
    var plan = ${jsLit(items, 1)};

    var f = new Folder(outDir); if (!f.exists) f.create();
    if (new File(outDir + outName + '.indd').exists) { alert('Ja existe ' + outName + '.indd. Nada foi sobrescrito.'); return; }

    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
    app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
    var doc = app.documents.add(false);
    with (doc.documentPreferences) {
        facingPages = true; pageWidth = W; pageHeight = H; pagesPerDocument = plan.length;
        documentBleedTopOffset = B; documentBleedBottomOffset = B; documentBleedInsideOrRightOffset = 0; documentBleedOutsideOrLeftOffset = B;
        startPageNumber = 1;
    }
    doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;
    doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.POINTS;
    doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.POINTS;
    with (doc.marginPreferences) { top = 0; bottom = 0; left = 0; right = 0; }
    try { doc.label = 'KALLINE_VERSAO ' + versionId + ' | ' + versionName; } catch (eLbl) {}

    var swatches = {};
    function hexToRgb(h) { return [parseInt(h.substr(1,2),16), parseInt(h.substr(3,2),16), parseInt(h.substr(5,2),16)]; }
    function color(hex) {
        if (!hex) return null;
        if (swatches[hex]) return swatches[hex];
        var n = 'K ' + hex;
        var c = doc.colors.itemByName(n);
        if (!c.isValid) c = doc.colors.add({ name: n, model: ColorModel.PROCESS, space: ColorSpace.RGB, colorValue: hexToRgb(hex) });
        return (swatches[hex] = c);
    }
    function findFile(dirs, name) {
        for (var i = 0; i < dirs.length; i++) { var ff = new File(dirs[i] + name); if (ff.exists) return ff; }
        return null;
    }
    var missing = [];
    function rect(page, r, opts) {
        var side = page.side == PageSideOptions.LEFT_HAND ? 'L' : 'R';
        var ox = page.bounds[1], oy = page.bounds[0];
        var x, y, w, h;
        if (r === 'FULL') { if (side == 'L') { x = -B; w = W + B; } else { x = 0; w = W + B; } y = -B; h = H + 2 * B; }
        else { x = r[0]; y = r[1]; w = r[2]; h = r[3]; }
        var it = page.rectangles.add({ geometricBounds: [oy + y, ox + x, oy + y + h, ox + x + w], strokeWeight: 0 });
        if (opts && opts.fill) it.fillColor = color(opts.fill); else it.fillColor = doc.swatches.itemByName('None');
        it.strokeColor = doc.swatches.itemByName('None');
        return it;
    }
    function placeFill(frame, file, pos) {
        if (!file) return;
        frame.place(file);
        frame.frameFittingOptions.fittingAlignment = pos == 'top' ? AnchorPoint.TOP_CENTER_ANCHOR : (pos == 'bottom' ? AnchorPoint.BOTTOM_CENTER_ANCHOR : AnchorPoint.CENTER_ANCHOR);
        frame.fit(FitOptions.FILL_PROPORTIONALLY);
        if (!pos || pos == 'center') frame.fit(FitOptions.CENTER_CONTENT);
    }
    // o InDesign pode mover o quadro ao colocar PDF: reafirma a posicao depois do place
    function placeFitArt(frame, file) { var gb = frame.geometricBounds; frame.place(file); frame.geometricBounds = gb; frame.fit(FitOptions.CONTENT_TO_FRAME); }
    // texto rico do mapa: paragrafos (alinhamento, entrelinha) e trechos (fonte, corpo, tracking, cor); giro em graus
    function richText(page, sp) {
        var b = sp.box, rot = sp.rotacao || 0, cx = b[0] + b[2] / 2, cy = b[1] + b[3] / 2;
        var tw = (rot % 180) ? b[3] : b[2], th = (rot % 180) ? b[2] : b[3];
        var ox = page.bounds[1], oy = page.bounds[0];
        var tf = page.textFrames.add({ geometricBounds: [oy + cy - th / 2, ox + cx - tw / 2, oy + cy + th / 2, ox + cx + tw / 2] });
        tf.contents = sp.texto;
        tf.textFramePreferences.insetSpacing = [0, 0, 0, 0];
        tf.textFramePreferences.verticalJustification = VerticalJustification[sp.vj] || VerticalJustification.CENTER_ALIGN;
        var chars = tf.texts[0].characters;
        for (var k = 0; k < sp.paras.length && k < tf.paragraphs.length; k++) {
            var pp = sp.paras[k], par = tf.paragraphs[k];
            par.justification = Justification[pp.just];
            if (pp.leading == 'auto') { par.leading = Leading.AUTO; par.autoLeading = pp.autoPct; } else par.leading = pp.leading;
            for (var q = 0; q < pp.runs.length; q++) {
                var rn = pp.runs[q], rg = chars.itemByRange(rn.start, rn.start + rn.len - 1);
                rg.appliedFont = app.fonts.itemByName('Venti CF\t' + rn.estilo);
                rg.pointSize = rn.corpo; rg.tracking = rn.tracking; rg.fillColor = color(rn.cor);
            }
        }
        if (rot) tf.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, app.transformationMatrices.add({ counterclockwiseRotationAngle: rot }));
        return tf;
    }
    function text(page, bounds, str, style, size, trk, hex, just) {
        var ox = page.bounds[1], oy = page.bounds[0];
        var tf = page.textFrames.add({ geometricBounds: [oy + bounds[1], ox + bounds[0], oy + bounds[1] + bounds[3], ox + bounds[0] + bounds[2]] });
        tf.contents = str;
        var t = tf.texts[0];
        var fn = 'Venti CF\\t' + (style == 'DemiBold' ? 'Demi Bold' : style);
        t.appliedFont = app.fonts.itemByName(fn);
        t.pointSize = size; t.tracking = trk; t.fillColor = color(hex);
        t.justification = just || Justification.LEFT_ALIGN;
        tf.textFramePreferences.insetSpacing = [0, 0, 0, 0];
        tf.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
        return tf;
    }

    for (var i = 0; i < plan.length; i++) {
        var p = plan[i], page = doc.pages[i];
        if (p.kind == 'indd') {
            // espelho do mapa do .indd: cria do fundo para a frente (no mapa a ordem e frente -> fundo)
            var rs = [], ls = [], ts = [];
            for (var a = 0; a < p.itens.length; a++) { var it = p.itens[a]; if (it.tipo == 'Rectangle') rs.push(it); else if (it.tipo == 'GraphicLine') ls.push(it); else if (it.tipo == 'TextFrame') ts.push(it); }
            for (var a = rs.length - 1; a >= 0; a--) {
                var it = rs[a];
                if (it.fundo) { rect(page, [it.x, it.y, it.w, it.h], { fill: it.fundo }); continue; }
                if (it.asset) { placeFitArt(rect(page, [it.x, it.y, it.w, it.h]), new File(assets + it.asset)); continue; }
                if (it.foto) {
                    var ff = findFile(it.pasta == 'TRATADAS' ? lookDirs : conceptDirs, it.foto);
                    if (!ff) missing.push('pag ' + (i + 1) + ': ' + it.foto);
                    var fr = rect(page, [it.x, it.y, it.w, it.h]);
                    if (ff && it.img) { fr.place(ff); var ox0 = page.bounds[1], oy0 = page.bounds[0]; fr.graphics[0].geometricBounds = [oy0 + it.img[1], ox0 + it.img[0], oy0 + it.img[1] + it.img[3], ox0 + it.img[0] + it.img[2]]; }
                    else placeFill(fr, ff, it.pos);
                }
            }
            for (var a = 0; a < ls.length; a++) {
                var ox1 = page.bounds[1], oy1 = page.bounds[0], gl0 = page.graphicLines.add();
                gl0.paths[0].pathPoints[0].anchor = [ox1 + ls[a].x, oy1 + ls[a].y];
                gl0.paths[0].pathPoints[1].anchor = [ox1 + ls[a].x + ls[a].w, oy1 + ls[a].y + ls[a].h];
                gl0.strokeWeight = ls[a].traco; gl0.strokeColor = color(ls[a].cor || '#B1B3B6');
            }
            for (var a = 0; a < ts.length; a++) richText(page, ts[a].spec);
        } else if (p.kind == 'concept') {
            if (p.bg) rect(page, 'FULL', { fill: p.bg });
            for (var j = 0; j < p.fotos.length; j++) {
                var ff = findFile(conceptDirs, p.fotos[j].file);
                if (!ff) missing.push('pag ' + (i + 1) + ': ' + p.fotos[j].file);
                placeFill(rect(page, p.fotos[j].rect), ff, p.fotos[j].pos);
            }
            var e = p.extras;
            if (e.logo_capa) placeFitArt(rect(page, e.logo_capa), new File(assets + 'logo_vertical_branco.pdf'));
            if (e.brasao) placeFitArt(rect(page, [e.brasao[0], e.brasao[1], ${BRASAO}, ${BRASAO}]), new File(assets + 'brasao_conceito.pdf'));
            if (e.inverno) {
                var tf = text(page, [e.inverno[0] - 80, e.inverno[1] - 10, 160, 20], ${jsLit(TXT_INVERNO)}, 'DemiBold', 14.3, ${TRK_INVERNO}, '${INK}', Justification.CENTER_ALIGN);
                tf.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, app.transformationMatrices.add({ counterclockwiseRotationAngle: 90 }));
            }
            if (e.tagline) text(page, [e.tagline[0], e.tagline[1], 120, 50], ${jsLit(TXT_TAGLINE.join('\r'))}, 'DemiBold', 10.6, ${TRK_TAGLINE}, '${INK}');
            if (e.tagline_linha) text(page, [0, 383, W, 22], ${jsLit(TXT_TAGLINE_LINHA)}, 'DemiBold', 14.3, ${TRK_TAGLINE_LINHA}, '${INK}', Justification.CENTER_ALIGN);
            if (e.brasao_branco) placeFitArt(rect(page, [e.brasao_branco[0], e.brasao_branco[1], ${BRASAO}, ${BRASAO}]), new File(assets + 'brasao_branco.pdf'));
            if (e.logo_cc) placeFitArt(rect(page, e.logo_cc), new File(assets + 'logo_contracapa_branco.pdf'));
            if (e.inverno_cc) {
                var tc = text(page, [e.inverno_cc[0] - 72, e.inverno_cc[1] - 31, 144, 62], ${jsLit(TXT_INVERNO_CC.join('\r'))}, 'Bold', 23.7, ${TRK_INVERNO_CC}, '#F2F3EF');
                tc.texts[0].leading = 29.5;
                tc.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, app.transformationMatrices.add({ counterclockwiseRotationAngle: 90 }));
            }
            if (e.lookbook) text(page, [0, 395, W, 60], ${jsLit(TXT_LOOKBOOK)}, 'DemiBold', 42.3, ${TRK_LOOKBOOK}, '#F2F3EF', Justification.CENTER_ALIGN);
        } else {
            for (var j = 0; j < p.fotos.length; j++) {
                var ff = findFile(lookDirs, p.fotos[j].file);
                if (!ff) missing.push('pag ' + (i + 1) + ': ' + p.fotos[j].file);
                placeFill(rect(page, p.fotos[j].rect), ff, p.fotos[j].pos);
            }
            // rodape: mesma geometria que o boneco mostra (a do INDD quando a pagina nao mudou de pecas)
            var rd = p.rodape;
            if (rd) {
                placeFitArt(rect(page, rd.brasao), new File(assets + 'brasao_rodape_look.png'));
                for (var q = 0; q < rd.textos.length; q++) richText(page, rd.textos[q]);
                if (rd.linha) {
                    var ox = page.bounds[1], oy = page.bounds[0];
                    var gl = page.graphicLines.add();
                    gl.paths[0].pathPoints[0].anchor = [ox + rd.linha[0], oy + rd.linha[1]];
                    gl.paths[0].pathPoints[1].anchor = [ox + rd.linha[0] + rd.linha[2], oy + rd.linha[1] + rd.linha[3]];
                    gl.strokeWeight = rd.linha[4]; gl.strokeColor = color(rd.corLinha || '#B1B3B6');
                }
            }
        }
    }

    var overflow = [];
    for (var pi = 0; pi < doc.pages.length; pi++) {
        for (var ti = 0; ti < doc.pages[pi].textFrames.length; ti++) {
            var tfo = doc.pages[pi].textFrames[ti]; tfo.recompose();
            if (tfo.overflows) overflow.push('pag ' + (pi + 1) + ': ' + tfo.contents);
        }
    }
    var win = doc.windows.add();
    doc.save(new File(outDir + outName + '.indd'));
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
    alert('Gerado: ' + outName + '.indd (' + plan.length + ' paginas).\\nVersao: ' + versionName + ' [' + versionId + ']' +
        (missing.length ? '\\nFotos nao encontradas:\\n' + missing.join('\\n') : '\\nTodas as fotos vinculadas.') +
        (overflow.length ? '\\nTEXTO CORTADO (revise):\\n' + overflow.join('\\n') : ''));
})();
`;
  }

  // ---------- versoes: metadados, exportar/importar ----------
  // mesmo contrato do motor: /api/catalog/versions (GET lista, GET :id, POST com X-CSRF-Token + Idempotency-Key)
  const versionsApi = async (path, opts) => {
    const r = await fetch('/api/catalog' + path, opts);
    let v = {}; try { v = await r.json(); } catch {}
    if (!r.ok) { const e = Error(v.error?.message || 'Falha na operação de versões.'); e.code = v.error?.code; throw e; }
    return v;
  };
  async function latestClientMeta() {
    const list = (await versionsApi('/versions')).versions || [];
    return list.filter(v => !v.readOnly && !v.oficial).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
  }
  function panelClient() { try { return sharedVersionsPanel?.client || null; } catch { return null; } }
  async function currentMeta() {
    const cl = panelClient();
    let list = [];
    try { list = (await versionsApi('/versions')).versions; } catch {}
    const v = cl && list.find(x => x.id === cl.parentId);
    const dirty = cl ? cl.isDirty() : true;
    return { id: v ? v.id : 'plano-local', name: v ? v.name : 'Plano em edição (sem versão salva)', author: v?.author?.name || '', createdAt: v?.createdAt || '', dirty: !v || dirty };
  }
  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function stampName(kind) {
    const d = new Date();
    let seq = 1;
    try { seq = Number(localStorage.getItem('kalline_masc_export_seq') || 0) + 1; localStorage.setItem('kalline_masc_export_seq', String(seq)); } catch {}
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}_${pad2(d.getHours())}${pad2(d.getMinutes())}_cliente_${kind ? kind + '_' : ''}v${pad2(seq)}.json`;
  }
  function reviewerName(ask) {
    let n = '';
    try { n = localStorage.getItem('kalline_revisor_nome') || ''; } catch {}
    if (!n && ask) {
      n = (prompt('Seu nome (aparece nos comentários e na versão exportada):', '') || '').trim().slice(0, 80);
      if (n) try { localStorage.setItem('kalline_revisor_nome', n); } catch {}
    }
    return n;
  }

  async function exportVersionJson() {
    const meta = await currentMeta();
    const author = reviewerName(true) || 'Revisor sem nome';
    const name = (prompt('Nome desta versão (para identificarmos ao receber):', meta.dirty ? '' : meta.name) || '').trim().slice(0, 80);
    if (!name) { showToast('Exportação cancelada: dê um nome para a versão.'); return; }
    const plan = structuredClone(window.pages);
    const comments = plan.reduce((n, p) => n + (p.comments || []).length, 0);
    const payload = {
      tipo: 'kalline-masculino-inv2027-versao', formato: 1, catalogo: 'KALLINE MASCULINO INVERNO 2027 - V03',
      versao: { nome: name, autor: author, exportadaEm: new Date().toISOString(), origemId: meta.id, origemNome: meta.name, alteracoesNaoSalvas: meta.dirty },
      resumo: { paginas: plan.length, comentarios: comments },
      plan,
    };
    download(stampName(''), JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    showToast(`Versão exportada (${plan.length} páginas, ${comments} comentários). Envie o arquivo para a Ender.`);
  }

  async function exportCommentsJson() {
    const meta = await currentMeta();
    const author = reviewerName(true) || 'Revisor sem nome';
    const paginas = window.pages.map((p, i) => ({ pag: i + 1, id: p.id, tipo: p.type === 'concept' ? 'conceito' : 'look', layout: p.type === 'concept' ? p.layout : p.type, look: p.lookNum ?? null,
      fotos: Object.values(p.slots || {}).filter(s => s && s.file).map(s => s.file), comentarios: (p.comments || []).map(c => ({ texto: c.text, resolvido: c.resolved, x: c.x, y: c.y, autor: c.author?.name, criadoEm: c.createdAt, atualizadoEm: c.updatedAt })) }))
      .filter(p => p.comentarios.length);
    const payload = { tipo: 'kalline-masculino-inv2027-comentarios', formato: 1, exportadoEm: new Date().toISOString(), exportadoPor: author,
      versao: { id: meta.id, nome: meta.name, alteracoesNaoSalvas: meta.dirty }, totalComentarios: paginas.reduce((n, p) => n + p.comentarios.length, 0), paginas };
    download(stampName('comentarios'), JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    showToast(`Comentários exportados (${payload.totalComentarios}).`);
  }

  function importVersionJson() {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json';
    input.addEventListener('change', () => {
      const file = input.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try { await importVersionText(String(reader.result), file.name); }
        catch (err) { alert('Não foi possível importar: ' + err.message); }
      };
      reader.readAsText(file);
    });
    input.click();
  }
  async function importVersionText(text, fileName) {
    const data = JSON.parse(text);
    let plan, nome, autor, quando;
    if (data && data.tipo === 'kalline-masculino-inv2027-versao' && Array.isArray(data.plan)) {
      plan = data.plan; nome = data.versao?.nome || fileName; autor = data.versao?.autor || 'cliente'; quando = data.versao?.exportadaEm || '';
    } else if (Array.isArray(data)) { plan = data; nome = fileName; autor = 'arquivo JSON'; quando = ''; }
    else throw Error('Arquivo não é uma versão exportada pelo estúdio.');
    validatePlan(structuredClone(plan));
    const when = quando ? new Date(quando).toLocaleString('pt-BR') : 'sem data';
    const name = ('Recebida · ' + nome + ' · ' + autor + ' · ' + when).slice(0, 80);
    const me = await versionsApi('/me');
    const r = await versionsApi('/versions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': me.csrf, 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({ name, plan, parentId: null }) });
    showToast('Versão importada como nova versão: ' + name);
    const cl = panelClient();
    if (cl) { await cl.refresh().catch(() => {}); if (confirm('Versão importada sem sobrescrever nenhuma outra. Abrir agora no estúdio?')) await cl.load(r.version.id); }
    return r.version;
  }

  // ---------- dialogo "Exportar .jsx" com escolha da versao ----------
  let jsxDialog = null;
  async function openJsxDialog() {
    if (!jsxDialog) { jsxDialog = document.createElement('dialog'); jsxDialog.className = 'review-dialog cx-jsx-dialog'; document.body.append(jsxDialog); }
    const meta = await currentMeta();
    let list = [];
    try { list = (await versionsApi('/versions')).versions; } catch {}
    const latest = list.filter(v => !v.readOnly && !v.oficial).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
    let savedRoot = '';
    try { savedRoot = localStorage.getItem('kalline_masc_jsx_root') || ''; } catch {}
    jsxDialog.innerHTML = `<h2>Exportar InDesign (.jsx)</h2>
      <p>O script monta as ${window.pages.length} páginas (conceito + looks + fechamento) num documento InDesign novo, sem alterar nenhum arquivo existente. O nome e o id da versão vão no cabeçalho do .jsx.</p>
      <label>Versão a exportar<select id="cxJsxVersion">
        ${latest ? `<option value="__latest" selected>Última do cliente: ${esc(latest.name)} · ${latest.createdAt ? new Date(latest.createdAt).toLocaleString('pt-BR') : ''}</option>` : ''}
        <option value="__current">Plano em edição agora${meta.dirty ? ' (com alterações não salvas)' : ' = ' + esc(meta.name)}</option>
        ${list.map(v => `<option value="${esc(v.id)}" ${!latest && !meta.dirty && v.id === meta.id ? 'selected' : ''}>${v.readOnly || v.oficial ? '[OFICIAL] ' : ''}${esc(v.name)} · ${v.createdAt ? new Date(v.createdAt).toLocaleString('pt-BR') : ''}</option>`).join('')}
      </select></label>
      <label>Pasta da coleção no computador do InDesign (opcional; se vazio, o script pergunta)<input id="cxJsxRoot" type="text" value="${esc(savedRoot)}" placeholder=".../CATALOGO MASCULINO INVERNO 2027/"></label>
      <p id="cxJsxStatus" role="status"></p>
      <button type="button" id="cxJsxGo">Baixar .jsx</button> <button type="button" id="cxJsxClose">Fechar</button>`;
    const status = jsxDialog.querySelector('#cxJsxStatus');
    jsxDialog.querySelector('#cxJsxClose').onclick = () => jsxDialog.close();
    jsxDialog.querySelector('#cxJsxGo').onclick = async () => {
      try {
        const sel = jsxDialog.querySelector('#cxJsxVersion').value;
        const root = jsxDialog.querySelector('#cxJsxRoot').value.trim();
        try { localStorage.setItem('kalline_masc_jsx_root', root); } catch {}
        const code = await jsxForVersion(sel, root);
        const vid = code.meta.id;
        download(`gerar_catalogo_masculino_v03_${vid.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 24)}.jsx`, code.text, 'application/javascript;charset=utf-8');
        status.textContent = `Baixado: ${code.pages} páginas · versão "${code.meta.name}".`;
      } catch (err) { status.textContent = err.message; }
    };
    jsxDialog.showModal();
  }
  async function jsxForVersion(sel, root) {
    let plan, meta;
    if (sel === '__current') {
      if (typeof assertPrintableFooters === 'function') assertPrintableFooters();
      plan = window.pages; meta = await currentMeta();
    } else {
      if (sel === '__latest') { const l = await latestClientMeta(); if (!l) throw Error('Ainda não há versão salva pelo cliente.'); sel = l.id; }
      const v = await versionsApi('/versions/' + encodeURIComponent(sel));
      plan = validatePlan(structuredClone(v.plan)); meta = { id: v.id, name: v.name, author: v.author?.name || '', createdAt: v.createdAt || '', dirty: false };
    }
    meta.root = root;
    return { text: buildJsx(plan, meta), pages: plan.length, meta };
  }

  window.KallineConceito = Object.freeze({
    LAYOUTS, LAYOUT_LABELS, buildInitialPlan, buildPlanFromMap, renderLookExact, duplicateConcept, insertConcept, isValidConceptPage, renderConceptPageCard, renderPageNav,
    changeLayout, cyclePos, openPicker, buildJsx, jsxForVersion, currentMeta, latestClientMeta,
    exportVersionJson, exportCommentsJson, importVersionJson, importVersionText, openJsxDialog, reviewerName,
  });
})();

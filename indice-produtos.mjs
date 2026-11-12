/**
 * Módulo de indexação e busca de produtos em catálogos e lookbooks.
 *
 * ESPECIFICAÇÃO DO CONTRATO:
 * 1. O retorno de indexarProdutos(produtos, paginas) é um objeto simples serializável:
 *    { produtos: Array<Object>, diagnosticos: Array<Object> }
 *    Sem compatibilidade artificial e sem propriedades circulares sobre arrays.
 * 2. Validação estrita de referências de produtos:
 *    - Rejeita referências não textuais (ex: números) com TypeError para não perder zeros à esquerda.
 *    - Rejeita referências ausentes, nulas, vazias ou duplicadas no cadastro de produtos.
 * 3. Validação defensiva de páginas:
 *    - Rejeita páginas nulas, IDs ausentes, nulos, vazios, não textuais ou duplicados.
 * 4. Resiliência a peças com código ausente ou inconsistente:
 *    - Peça sem código (nulo, ausente, vazio, não textual ou peça nula) NÃO derruba o índice.
 *    - Emite diagnóstico contextualizado em `diagnosticos` e preserva todos os dados válidos.
 * 5. Preservação de zeros e integridade de variantes:
 *    - A correspondência produto <-> peça usa código textual exato sem coerção numérica.
 *    - Zeros à esquerda são estritamente preservados ('001.02' != '1.02' e '009' != '9').
 *    - Variantes não são aproximadas ('001.02' != '001.02-A').
 * 6. Derivação do número de página:
 *    - O número de página deriva SEMPRE da ordem sequencial do array (1-based), ignorando pagina.numero.
 * 7. Busca resiliente (buscarProdutos):
 *    - Aceita índice como { produtos } ou diretamente um array de produtos.
 *    - Busca por código com ou sem pontuação (ex: '001.02' e '00102', 'REF-100' e 'REF 100').
 *    - Busca por nome sem acento/diacrítico, multi-termo em qualquer ordem e tolerância a espaços repetidos.
 *    - Imutabilidade garantida: consulta vazia sempre retorna uma nova lista.
 */

const removerAcentos = v =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizarTexto = v =>
  removerAcentos(v)
    .toLocaleLowerCase('pt-BR')
    .trim();

const normalizarCodigoBusca = v =>
  removerAcentos(v)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const extrairTokensNome = v =>
  removerAcentos(v)
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{N}]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

/**
 * Indexa produtos associando as páginas onde cada peça ocorre.
 *
 * @param {Array<Object>} produtos - Array de produtos ({ referencia, nome, ... }).
 * @param {Array<Object>} paginas - Array de páginas ({ id, pieces, ... }).
 * @returns {{ produtos: Array<Object>, diagnosticos: Array<Object> }}
 */
export function indexarProdutos(produtos, paginas) {
  if (!Array.isArray(produtos)) {
    throw new TypeError('O parâmetro "produtos" deve ser um array.');
  }
  if (!Array.isArray(paginas)) {
    throw new TypeError('O parâmetro "paginas" deve ser um array.');
  }

  const porReferencia = new Map();

  for (let i = 0; i < produtos.length; i++) {
    const produto = produtos[i];
    if (!produto || typeof produto !== 'object') {
      throw new TypeError(`Produto inválido na posição ${i + 1}: item nulo ou inválido.`);
    }

    if (produto.referencia === undefined || produto.referencia === null) {
      throw new Error(`Referência ausente no produto na posição ${i + 1} (${produto.nome || 'sem nome'}).`);
    }

    // Rejeitar referências não textuais para não perder zeros à esquerda
    if (typeof produto.referencia !== 'string') {
      throw new TypeError(
        `Referência não textual no produto na posição ${i + 1} (${produto.nome || 'sem nome'}): referências devem ser strings para não perder zeros à esquerda.`
      );
    }

    const refExata = produto.referencia.trim();
    if (refExata === '') {
      throw new Error(`Referência vazia no produto na posição ${i + 1} (${produto.nome || 'sem nome'}).`);
    }

    if (porReferencia.has(refExata)) {
      throw new Error(`Referência duplicada detectada no cadastro de produtos: "${produto.referencia}".`);
    }

    porReferencia.set(refExata, {
      ...produto,
      paginas: []
    });
  }

  const idsPaginas = new Set();
  const diagnosticos = [];

  for (let indice = 0; indice < paginas.length; indice++) {
    const pagina = paginas[indice];
    if (!pagina || typeof pagina !== 'object') {
      throw new Error(`Página inválida na posição ${indice + 1}: item nulo ou inválido.`);
    }

    // Rejeitar páginas sem ID válido
    if (pagina.id === undefined || pagina.id === null) {
      throw new Error(`Página na posição ${indice + 1} rejeitada: ID ausente ou nulo.`);
    }

    if (typeof pagina.id !== 'string') {
      throw new TypeError(`Página na posição ${indice + 1} rejeitada: ID inválido (não é string).`);
    }

    const idStr = pagina.id.trim();
    if (idStr === '') {
      throw new Error(`Página na posição ${indice + 1} rejeitada: ID vazio.`);
    }

    // Rejeitar IDs duplicados
    if (idsPaginas.has(idStr)) {
      throw new Error(`Página na posição ${indice + 1} rejeitada: ID duplicado "${idStr}".`);
    }
    idsPaginas.add(idStr);

    // O número de página deriva SEMPRE da ordem sequencial do array (1-based), ignorando pagina.numero
    const numeroDerivado = indice + 1;

    const pieces = pagina.pieces ?? [];
    if (!Array.isArray(pieces)) {
      throw new Error(`Propriedade "pieces" da página "${idStr}" deve ser um array ou indefinida.`);
    }

    const pecasRegistradasNaPagina = new Set();

    for (let pIdx = 0; pIdx < pieces.length; pIdx++) {
      const peca = pieces[pIdx];

      // Peça inválida ou nula não deve derrubar o índice
      if (peca === null || peca === undefined || typeof peca !== 'object') {
        diagnosticos.push({
          codigo: null,
          paginaId: idStr,
          paginaNumero: numeroDerivado,
          posicaoPeca: pIdx + 1,
          motivo: 'Peça nula ou inválida detectada na página.'
        });
        continue;
      }

      // Peça com código ausente não deve derrubar o índice
      if (peca.code === undefined || peca.code === null) {
        diagnosticos.push({
          codigo: null,
          paginaId: idStr,
          paginaNumero: numeroDerivado,
          posicaoPeca: pIdx + 1,
          motivo: 'Código de peça ausente na página.'
        });
        continue;
      }

      // Peça com código não textual não deve derrubar o índice
      if (typeof peca.code !== 'string') {
        diagnosticos.push({
          codigo: peca.code,
          paginaId: idStr,
          paginaNumero: numeroDerivado,
          posicaoPeca: pIdx + 1,
          motivo: 'Código de peça não textual: referências devem ser strings para preservar zeros à esquerda.'
        });
        continue;
      }

      const codigoExato = peca.code.trim();
      if (codigoExato === '') {
        diagnosticos.push({
          codigo: peca.code,
          paginaId: idStr,
          paginaNumero: numeroDerivado,
          posicaoPeca: pIdx + 1,
          motivo: 'Código de peça vazio na página.'
        });
        continue;
      }

      // Correspondência exata: zeros preservados sem aproximar variantes
      if (porReferencia.has(codigoExato)) {
        if (!pecasRegistradasNaPagina.has(codigoExato)) {
          porReferencia.get(codigoExato).paginas.push({
            id: idStr,
            numero: numeroDerivado
          });
          pecasRegistradasNaPagina.add(codigoExato);
        }
      } else {
        // Reporta peças sem correspondência em diagnosticos sem perder os produtos
        diagnosticos.push({
          codigo: peca.code,
          referencia: peca.code,
          paginaId: idStr,
          paginaNumero: numeroDerivado,
          posicaoPeca: pIdx + 1,
          motivo: 'Peça referenciada na página não encontrada no catálogo de produtos.'
        });
      }
    }
  }

  // Retorno de objeto simples serializável sem propriedades circulares
  return {
    produtos: [...porReferencia.values()],
    diagnosticos
  };
}

/**
 * Busca produtos no catálogo por código de referência ou nome.
 *
 * @param {Array<Object>|{produtos: Array<Object>}} indice - Índice de produtos ou objeto { produtos }.
 * @param {string} consulta - Termo de pesquisa.
 * @returns {Array<Object>} Nova lista com os produtos correspondentes ordenados por relevância.
 */
export function buscarProdutos(indice, consulta) {
  if (!indice) {
    throw new TypeError('O parâmetro "indice" é obrigatório.');
  }

  const lista = Array.isArray(indice) ? indice : indice.produtos;
  if (!Array.isArray(lista)) {
    throw new TypeError('O parâmetro "indice" deve conter a propriedade "produtos" (array) ou ser um array de produtos.');
  }

  const produtosValidos = lista.filter(p => p && typeof p === 'object');

  // Consulta vazia ou em branco retorna SEMPRE uma nova lista (imutabilidade)
  if (consulta === undefined || consulta === null) {
    return [...produtosValidos];
  }

  const consultaStr = String(consulta).trim();
  if (consultaStr === '') {
    return [...produtosValidos];
  }

  const consultaTexto = normalizarTexto(consultaStr);
  const consultaCodigo = normalizarCodigoBusca(consultaStr);
  const termosConsultaNome = extrairTokensNome(consultaStr);

  const pontuados = [];

  for (let i = 0; i < produtosValidos.length; i++) {
    const p = produtosValidos[i];
    let score = 0;

    const refOriginal = String(p.referencia ?? '').trim();
    const refTexto = normalizarTexto(refOriginal);
    const refCodigo = normalizarCodigoBusca(refOriginal);

    // 1. Verificação por código de referência (com ou sem pontuação)
    if (consultaCodigo && refCodigo) {
      if (refCodigo === consultaCodigo) {
        score = Math.max(score, 100); // Correspondência exata do código desmascarado
      } else if (refCodigo.startsWith(consultaCodigo)) {
        score = Math.max(score, 70);
      } else if (refCodigo.includes(consultaCodigo)) {
        score = Math.max(score, 50);
      }
    }

    if (consultaTexto && refTexto) {
      if (refTexto === consultaTexto) {
        score = Math.max(score, 95);
      } else if (refTexto.includes(consultaTexto)) {
        score = Math.max(score, 45);
      }
    }

    // 2. Verificação por nome (sem acento, múltiplos termos, espaços tolerados)
    const nomeOriginal = String(p.nome ?? '');
    const tokensNome = extrairTokensNome(nomeOriginal);
    const nomeTexto = normalizarTexto(nomeOriginal);

    if (termosConsultaNome.length > 0) {
      const todosTermosPresentes = termosConsultaNome.every(termo =>
        tokensNome.some(tok => tok.includes(termo))
      );
      if (todosTermosPresentes) {
        if (nomeTexto === consultaTexto) {
          score = Math.max(score, 90);
        } else {
          score = Math.max(score, 40);
        }
      }
    } else if (consultaTexto && nomeTexto.includes(consultaTexto)) {
      score = Math.max(score, 30);
    }

    if (score > 0) {
      pontuados.push({ produto: p, score, indiceOriginal: i });
    }
  }

  // Ordena por relevância (score decrescente); se empatar, preserva a ordem original de cadastro
  pontuados.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.indiceOriginal - b.indiceOriginal;
  });

  return pontuados.map(item => item.produto);
}

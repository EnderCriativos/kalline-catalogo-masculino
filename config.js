// Configuracao PUBLICA do estudio (sem segredos: so enderecos). Login e o do Neon Auth (codigo por e-mail),
// igual ao feminino; a sessao vira um JWT que vai como "Authorization: Bearer" para a API.
//
// apiOrigin: origem da Function do masculino (sem caminho). O cliente chama <apiOrigin>/api/catalog/...
//   producao: https://br-delicate-paper-b8vpj7op-kallinemasculinoapi.compute.c-14.us-east-1.aws.neon.tech
//   teste:    https://br-long-cherry-b81xk88i-kallinemasculinoapi.compute.c-14.us-east-1.aws.neon.tech
// authBaseUrl: Neon Auth do projeto (o mesmo do feminino). O site precisa estar em https://endercriativos.github.io
// (SITE_ORIGIN da Function e dominio confiavel do Neon Auth).
// catalogo: escopo enviado no header X-Kalline-Catalog.
// No mock local (tools/mock-api/server.mjs) este arquivo NAO e usado: o mock serve a propria config.
window.KALLINE_CONFIG = {
  apiOrigin: 'https://br-delicate-paper-b8vpj7op-kallinemasculinoapi.compute.c-14.us-east-1.aws.neon.tech',
  authBaseUrl: 'https://ep-plain-queen-b82anqge.neonauth.c-14.us-east-1.aws.neon.tech/neondb/auth',
  catalogo: 'masculino-inv2027'
};

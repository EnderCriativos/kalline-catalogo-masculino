# Estúdio Web Editorial • Catálogo Masculino Inverno 2027

Aplicação web editorial oficial baseada no motor canônico homologado da Ender (release `44902d6` de `kalline-catalogo-app`).

---

## Como Executar Localmente
No terminal, execute:

```bash
cd "/Users/ender/Library/CloudStorage/GoogleDrive-endercriativos@gmail.com/Meu Drive/WORK/KALLINE/INVERNO 2027/CATALOGO MASCULINO INVERNO 2027/06_WEB"
python3 -m http.server 8080
```

Abra o navegador em:
👉 **`http://localhost:8080/`**

---

## Recursos Disponíveis na Interface
1. **Controle de Versões Imutáveis (Botões Rosa):**
   - **Nova versão:** Salva o estado atual com um nome personalizado como novo snapshot.
   - **Salvar:** Gravação rápida da versão corrente.
   - **Status Dinâmico:** Informa `Base preservada`, `Alterações pendentes` (*dirty state*) ou `Salvo no servidor`.
   - **Versões (Menu):** Diálogo para restaurar qualquer versão anterior ou base original com confirmação de segurança.
2. **Revisão Editorial Ancorada:**
   - Botão **Comentários** no cabeçalho de cada página para adicionar anotações fixadas por coordenadas.
   - Marcação de notas como resolvidas ou pendentes com registro de autor e data.
3. **Curadoria Fotográfica e Troca de Slots:**
   - Clique em qualquer foto para abrir o modal de seleção.
   - Exibe todas as fotos disponíveis para aquele produto (tratadas e brutas do acervo de 293 fotos).
   - Troca instantânea mantendo histórico de Desfazer/Refazer (Ctrl+Z / Ctrl+Y).
4. **Grids Editoriais Dinâmicos:**
   - Seletores no topo de cada página: `3 ESQ`, `3 DIR`, `2 COL`, `3 COL`, `4 FOTOS`, `1 FULL`.
   - Ferramenta **Desdobrar** para redistribuir fotos em novas páginas.
5. **Exportação InDesign (.jsx):**
   - Botão **Exportar InDesign (.jsx)** gera o script milimétrico pronto para execução no InDesign Desktop.

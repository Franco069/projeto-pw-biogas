# Padronização visual da área APP

## Causa e correção

O `views/assets/app/styles/app.css` continha somente estilos de componentes do
perfil. As regras de cabeçalho, menu lateral, conteúdo e cartões estavam no
`profile.css`, carregado apenas por `profile.html`. As outras cinco páginas
carregavam corretamente o CSS, mas faltavam as regras dos seus componentes.
Além disso, o `base.css` aplica a todos os elementos `section`, `header`, `nav`
e `footer` espaçamentos e posicionamentos voltados às páginas públicas.

O layout compartilhado agora está em `app.css`, sob a classe `.app-page`, usada
pelas seis páginas. O `profile.css` contém apenas os componentes específicos do
perfil. Os estilos públicos são normalizados somente dentro do APP; o CSS base,
a área pública, o backend e a área administrativa não foram alterados nesta correção.

As telas compartilham o verde, a tipografia, o fundo, as bordas, o menu com ícones,
os títulos, os botões e o padrão de cartões do perfil. Também foram estilizados
os indicadores do dashboard, formulário e resultados da simulação, histórico e
detalhes, seleção e tabela de comparação, listagens e modal de relatórios e sua
impressão. As tabelas e a navegação móvel têm rolagem interna para não alargar a página.

## Arquivos envolvidos

- `views/assets/app/styles/app.css`: layout e componentes compartilhados, responsividade e impressão.
- `views/assets/app/styles/profile.css`: componentes exclusivos do perfil, sem duplicar o layout compartilhado.
- `views/assets/app/pages/dashboard.html`, `new-simulation.html`, `history.html`,
  `compare.html`, `reports.html` e `profile.html`: classe do APP e cabeçalho/menu
  uniformes; títulos nas cinco telas que não tinham o cabeçalho do perfil;
  contêiner acessível para rolagem da tabela de histórico.
- `views/assets/app/scripts/app.js`: reaproveita a renderização dos avatares no
  cabeçalho das seis telas. Não altera os cálculos ou os serviços das simulações e relatórios.
- `tests/app.integration.cjs`: regressão visual e funcional com conta e dados temporários.
- `views/assets/app/README.MD` e este documento: orientação e registro dos testes.

## Testes executados

Validação local em 30/10/2026 com Chrome, Apache/MySQL do XAMPP e ferramentas de
teste já disponíveis. Nenhuma dependência foi adicionada à aplicação.

O teste `tests/app.integration.cjs` passou em **21 grupos**, abrangendo:

- As seis páginas sem dados e as seis com dados, com verificação dos estilos computados.
- As seis páginas preenchidas em 360, 390, 768, 1024, 1440 e 1890 px:
  36 combinações de página/largura, sem overflow horizontal da página.
- Criação de duas simulações pelo formulário e apresentação dos sete indicadores do resultado.
- Métricas e atividades do dashboard com dados reais da conta de teste.
- Histórico, abertura de detalhes e rolagem da tabela em celular.
- Seleção e comparação de duas simulações, incluindo os nove indicadores da tabela.
- Geração, abertura, fechamento e botão de impressão de relatório, modal em quatro
  larguras e verificação do CSS de impressão, com PDF de teste gerado.
- Foto salva no cabeçalho das seis telas.
- Exclusão de uma simulação pelo histórico, navegação pelos links e logout.
- Nenhuma exceção/erro no console, falha de requisição ou recurso CSS ausente no fluxo testado.

Também foi repetida a suíte `tests/profile.integration.cjs`: **21 grupos
aprovados**, incluindo upload JPG/PNG/WEBP, prévia, validações, autenticação,
persistência, atualização dos dados e falha controlada no banco. `node --check`
passou no JavaScript alterado e no novo teste. Foram inspecionadas capturas de
desktop e celular das páginas e do modal.

As contas, fotos, simulações, locais e relatórios temporários foram removidos.
O teste compara os dados das tabelas envolvidas antes e depois da limpeza para
confirmar que os dados preexistentes foram preservados.

## Repetir os testes

Com Apache e MySQL em execução e na raiz do projeto:

```powershell
$env:BIOGAS_TEST_NODE_MODULES = 'C:/Users/rafae/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
$env:BIOGAS_TEST_OUTPUT = Join-Path $env:TEMP 'biogas-app-testes'
node tests/app.integration.cjs
$env:BIOGAS_TEST_OUTPUT = Join-Path $env:TEMP 'biogas-profile-regressao'
node tests/profile.integration.cjs
```

Podem ser configurados `BIOGAS_TEST_PHP`, `BIOGAS_TEST_CHROME` e `BIOGAS_TEST_URL`.
O teste usa Playwright e Sharp existentes no ambiente, sem instalar bibliotecas.
Na execução desta correção, os resultados e capturas ficaram em
`C:/Users/rafae/.codex/tmp/biogas-app-css/results/` e a regressão do perfil em
`C:/Users/rafae/.codex/tmp/biogas-app-css/profile-regression/`.

Firefox, Safari, dispositivos físicos e hospedagem externa não foram testados.

## Manutenção

Uma página da área APP deve usar `class="app-page"` no `body`, carregar o
`base.css` e, depois, o `app.css`. Somente o perfil carrega adicionalmente
`profile.css`. Novas regras de layout compartilhado devem entrar no `app.css`;
regras exclusivas do perfil ficam no arquivo específico.

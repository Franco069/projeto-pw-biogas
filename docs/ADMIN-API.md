# Integração da área administrativa com a API

## Estrutura e dados compartilhados

O admin segue o fluxo usado no app: página HTML → classe da página → serviço em
`views/assets/_common/classes` → `HttpClientBase` → controller PHP → model → banco.
As oito páginas carregam `admin.js` como módulo. O arquivo inicializa apenas a
classe da página atual, como `app.js`, e usa `AuthGuard`, `SessionStorage`,
`FormController` e `Toast` existentes.

O admin deixou de depender de `AppState.js`/`BioGasStore`. Usuários, administradores,
resíduos, FAQs, parâmetros, simulações e relatórios vêm do mesmo `db_biogas` usado
pelo app. Os dados de demonstração antigos do navegador não são importados.

O perfil administrativo estende a classe `Profile` do app, usando `Users(1)`.
Os formulários de dados, senha e foto usam a mesma implementação do app. No PHP,
os métodos administrativos chamam os mesmos fluxos de perfil e upload, com o tipo
de usuário correspondente. O padrão de `Users()` continua sendo usuário comum.

## Funcionalidades

| Tela | Origem e comportamento |
| --- | --- |
| Dashboard | Contagens e atividades reais de usuários, administradores, resíduos, FAQs, parâmetros, simulações e relatórios. |
| Usuários | Lista, cadastro com senha inicial, edição de nome/e-mail e exclusão lógica de contas do tipo 2. |
| Administradores | O mesmo fluxo, com contas do tipo 1. A conta autenticada não pode excluir a si mesma. |
| Resíduos | Lista e edição dos campos existentes: nome, descrição e rendimento estimado. Exclusão lógica. |
| Parâmetros | Edição individual dos parâmetros ativos usados pelo app, mantendo os nomes necessários ao cálculo. |
| FAQs | Categoria, pergunta, resposta e publicação; cadastro de categorias; exclusão da FAQ. |
| Relatórios | Resumo por período e relatórios de todos os usuários, com os resultados já persistidos pelo app. |
| Perfil | Nome, e-mail, senha atual/nova senha e foto, sem conta de demonstração ou senha padrão. |

As rotas de gerenciamento exigem token de administrador. As rotas originais de
simulações e relatórios do app continuam limitadas ao usuário autenticado; as
listagens globais têm rotas administrativas próprias.

## Efeito no app

- Nome/e-mail editados no admin são recuperados pelo perfil do usuário no app.
- A exclusão lógica de uma conta impede seu login e invalida o acesso com seu
  token, pois a API verifica o estado atual da conta no banco.
- O app carrega os parâmetros ativos da mesma tabela. Uma alteração é aplicada
  na próxima simulação, seguindo a fórmula existente. Resultados já salvos são
  preservados.
- O app lista os tipos de resíduo ativos. O usuário escolhe o tipo ao criar a
  simulação, e o cálculo usa seu `estimated_yield`. A edição do rendimento pelo
  admin afeta as próximas simulações; os resultados já salvos são preservados.
- O parâmetro antigo `biogas_yield` foi mantido no banco por compatibilidade,
  mas não participa mais do cálculo e não aparece no formulário de parâmetros.
  O rendimento é administrado em Resíduos. Não há mais resíduo fixo por nome.
- FAQs publicadas aparecem nas consultas públicas. `active = 0` representa
  rascunho; a exclusão remove a FAQ para distingui-la da despublicação, sem criar
  colunas ou tabelas novas.

As páginas consultam a API ao carregar. Para ver uma edição em outra página já
aberta, recarregue-a. Não foi adicionado um mecanismo de atualização em tempo real.

## Acesso inicial

O formulário de login oferece “Entrar como administrador”, usando a rota
`POST /users/login-admin` existente. O cadastro público continua criando somente
usuários comuns. `POST /users/register-admin` exige um administrador autenticado.

O administrador inicial solicitado pelo usuário já foi criado no banco local.
As credenciais foram entregues na conversa e não são armazenadas na documentação.

## Validação local

Foram executadas 93 verificações de API e navegador e 6 verificações finais de
limites dos parâmetros e compatibilidade da rota de cadastro administrativo:

- Cadastro, edição, exclusão e separação dos tipos de conta; bloqueio de acesso
  anônimo, de usuário comum e de exclusão da própria conta administrativa.
- FAQ em rascunho, publicação, edição refletida na consulta pública e cadastro
  de categoria; persistência e exclusão lógica de resíduos.
- Perfil administrativo, atualização sem mudanças, troca de senha com validação
  da senha atual, upload e recuperação de foto.
- Alteração de parâmetro no admin, leitura pelo app, criação de nova simulação
  com o valor alterado e preservação da simulação anterior.
- Relatórios e simulações do app visíveis nas consultas administrativas.
- Carregamento das oito telas no Chrome, cadastro pelos formulários de usuários
  e FAQs, gravação de parâmetro, relatório por período, login e logout.
- Inspeção visual do dashboard e perfil; perfil em tela de 390 px sem alargar a
  página; ausência de erros JavaScript nas telas verificadas.
- Sintaxe dos 12 arquivos PHP envolvidos, 17 módulos JavaScript e carregamento
  dos módulos nas oito páginas HTML.

Os testes usaram contas e registros temporários identificados por um prefixo
exclusivo. Esses registros e as fotos de teste foram removidos; os valores e
timestamps originais dos parâmetros foram restaurados.

A integração posterior de fotos corrigiu os erros de declaração de namespace em
`Controller/LocationImages.php` e `Models/Store/LocationImage.php`. Consulte
[SIMULACOES-RESIDUOS-FOTOS.md](SIMULACOES-RESIDUOS-FOTOS.md) para o fluxo atual de
escolha do resíduo, envio independente de fotos e sua exibição no app.

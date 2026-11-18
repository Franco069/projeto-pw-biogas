# Etapa 07 — Foto de perfil do BioGas Analytics

> Atualização posterior: o layout do perfil foi compartilhado com as demais telas
> do APP a pedido do usuário. A reorganização do CSS e a nova regressão estão
> documentadas em [APP-VISUAL.md](APP-VISUAL.md). O relato abaixo descreve a etapa
> original de upload; sua suíte de testes foi repetida após essa reorganização.

Implementação e validação local concluídas em 30/10/2026. Escopo: perfil do usuário comum na área APP.

## Arquivos modificados

| Arquivo | Finalidade |
| --- | --- |
| `api/index.php` | Registra `POST /users/photo` no grupo de usuários existente. |
| `api/source/Controller/Users.php` | Integra `update`, `me`, `uploadPhoto`, `photoUrl` e `deletePreviousPhoto` da referência. Mantém cadastro, login e métodos administrativos existentes. |
| `api/source/Models/User.php` | Integra `updatePhoto` e `updateProfile` da referência; acrescenta acesso a `active` para hidratação pelo Model base. |
| `views/assets/_common/classes/Users.js` | Acrescenta envio autenticado da foto por `postForm`; configura Bearer também em `me` e `update`. O token é lido novamente a cada operação protegida. |
| `views/assets/_common/scripts/HttpClientBase.js` | Mantém a estrutura do professor e seu suporte a FormData; faz somente o ajuste de prioridade do status HTTP descrito abaixo. |
| `views/assets/app/pages/profile.html` | Preserva os dois formulários e seus IDs, acrescentando foto salva, avatar no cabeçalho, prévia separada, acessibilidade e limites dos campos. |
| `views/assets/app/scripts/app.js` | Conecta carregamento, formulários independentes, validação, prévia, mensagens, bloqueio de envio duplicado, atualização da sessão e dos avatares. |
| `views/assets/app/README.MD` | Acrescenta link para esta documentação, preservando o conteúdo anterior. |
| `.gitignore` | Ignora fotos locais de usuários em `/uploads/users/`. |

## Arquivos criados

| Arquivo | Motivo |
| --- | --- |
| `api/source/Support/Upload.php` | Classe original do professor, extraída integralmente do anexo, sem alteração em seus métodos ou validações. |
| `views/assets/app/styles/profile.css` | Complementos visuais carregados somente pelo perfil; evita alterar o layout das demais telas. |
| `tests/profile.integration.cjs` | Testes reproduzíveis de API, banco, arquivos e navegador, incluindo falha controlada de persistência. |
| `docs/ETAPA07-PERFIL.md` | Documentação e relatório desta etapa. |

## Adaptações necessárias à referência

- O banco ativo foi consultado: `users` já contém `photo VARCHAR(255)` e usa `user_type_id`. Não houve migração, criação de coluna ou importação do SQL anexado.
- Foram aproveitados somente os métodos relacionados ao perfil. No SQL desses métodos, `type_id` foi adaptado para `user_type_id`, e a propriedade PHP correspondente continua sendo `userTypeId`. A chave `type_id` do JWT permanece compatível com a autenticação existente. O Model base continua convertendo `userTypeId` em `user_type_id`.
- `getActive` e `setActive` da referência foram incorporados ao Model existente. São necessários porque `selectById` hidrata os campos por setters; o campo privado `active` precisa desse acesso. O Model base não foi alterado.
- O formulário já usava `current_password` e `new_password`, mas o controller anterior esperava apenas `password` e não conferia a senha atual. A integração dos métodos do professor corrige esse fluxo e renova o JWT. A exigência do BioGas de pelo menos oito caracteres, com letras e números, foi mantida.
- Nome e e-mail respeitam os limites reais do banco: 100 e 150 caracteres. O frontend omite os campos de senha quando ambos estão vazios, conforme o contrato da referência.
- O `HttpClientBase` original retornava JSON antes de conferir `response.ok`. O ajuste mantém os envelopes de erro utilizados pelas chamadas existentes, mas substitui `code` pelo status HTTP real em respostas HTTP de erro e transforma um eventual `status: "success"` contraditório em `"error"`. Respostas HTTP de erro com JSON primitivo ou array geram exceção. Os demais métodos, assinaturas, serialização e cabeçalhos permanecem iguais.
- O CSS geral atual não define o layout estrutural do APP. Os complementos necessários ao perfil foram isolados em `profile.css`, com seletores sob `.profile-page`; o `app.css` existente não foi alterado. Foram mantidos os links de navegação, a tipografia e as cores originais do BioGas.

Os anexos originais não foram modificados. Não foram incorporadas funcionalidades, marcas ou dependências do outro projeto usado como referência HTML. Não houve modificação em arquivos administrativos, simulações, relatórios, autenticação compartilhada, JWT ou Model base.

## Fluxo e separação dos formulários

1. `GET /users/me` carrega nome, e-mail e foto do usuário autenticado. Sem foto válida, a interface apresenta iniciais.
2. O formulário `#profile-form` envia somente nome, e-mail e, quando preenchidos, `current_password` e `new_password` para `PUT /users/update`. Não inclui o arquivo selecionado. O token retornado é salvo por `SessionStorage`, e ambos os campos de senha são limpos após o sucesso.
3. O formulário `#profile-photo-form` contém somente o campo de arquivo `photo`. Selecionar um JPG, PNG ou WEBP de até **5 × 1024 × 1024 bytes** cria uma prévia local por `URL.createObjectURL`. A legenda informa que a imagem ainda não está salva. A foto oficial permanece visível no perfil e no cabeçalho.
4. O serviço `Users.uploadPhoto(file)` cria `FormData` e acrescenta exclusivamente `photo`. Utiliza `HttpClientBase.postForm`, sem definir manualmente `Content-Type`; o navegador gera o boundary multipart.
5. O backend chama `authToken(2)` e utiliza somente `userAuthId`, obtido do JWT. Um ID adicional enviado pelo cliente não escolhe o usuário que será alterado. Usuários administrativos não têm acesso a essa rota.
6. O controller confirma o perfil, verifica `$_FILES["photo"]` e chama `(new Upload($uploadDirectory))->image(...)`. A classe original valida erros de upload, origem HTTP, tamanho real, MIME com `finfo` e conteúdo com `getimagesize`, cria o diretório e grava o arquivo com nome aleatório de 32 caracteres hexadecimais.
7. `User.updatePhoto` persiste o caminho relativo em `users.photo`. Se a gravação falhar, o controller remove o arquivo recém-criado. A foto anterior só é removida após o sucesso no banco e quando seu caminho e nome correspondem ao diretório gerenciado.
8. O backend devolve a URL da imagem. A interface verifica `status`, `code`, dados e a URL antes de atualizar a sessão e os avatares, limpar a seleção e mostrar sucesso. A atualização dos dados pessoais preserva uma foto enviada em paralelo.
9. O nome aleatório muda em cada upload, evitando cache antigo. Ao recarregar a página, a foto é recuperada novamente por `GET /users/me`.

A prévia é liberada ao trocar ou cancelar a seleção, concluir o upload ou sair da página (`URL.revokeObjectURL`). Durante o envio, somente o formulário correspondente fica bloqueado. Erros preservam a foto salva; a prévia continua identificada como não salva. URLs de imagem aceitas pela interface devem ter a mesma origem da aplicação e corresponder a `uploads/users/<32 caracteres hexadecimais>.jpg|png|webp`, sem credenciais na URL.

## Contrato da API

Base configurada: `http://localhost/projeto-pw-biogas/api`.

| Método e rota | Entrada | Retorno de sucesso |
| --- | --- | --- |
| `GET /users/me` | `Authorization: Bearer TOKEN` | `data: { id, name, email, photo }`, sendo `photo` uma URL ou `null`. |
| `PUT /users/update` | Bearer; campos textuais codificados como `application/x-www-form-urlencoded` | `data: { id, name, email, photo, token }`. |
| `POST /users/photo` | Bearer; `multipart/form-data`, campo `photo` | `data: { photo: "http://localhost/projeto-pw-biogas/uploads/users/....png" }`. |

Exemplo real de estrutura de sucesso do upload:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Foto atualizada com sucesso.",
  "data": {
    "photo": "http://localhost/projeto-pw-biogas/uploads/users/0123456789abcdef0123456789abcdef.png"
  }
}
```

O nome acima é ilustrativo. O banco armazena `uploads/users/<nome>`, nunca o binário ou um caminho absoluto. Os arquivos são gravados em `<raiz do projeto>/uploads/users/`, criado automaticamente pelo uploader quando necessário. Fotos de perfil são servidas como imagens públicas por essa URL, conforme a referência.

| Situação | HTTP / status | Comportamento |
| --- | --- | --- |
| Sem token válido, expirado, conta inativa ou permissão diferente de usuário comum | `401 / unauthorized` | Não grava arquivo nem altera foto. No perfil, a sessão é limpa e ocorre redirecionamento ao login. |
| Sem arquivo, formato proibido, arquivo inválido ou acima do limite | `400 / bad_request` | Mensagem da referência; foto anterior preservada. |
| Falhas de recebimento ou armazenamento lançadas pelo uploader | `400 / bad_request` | A referência também mapeia essas `RuntimeException` para 400, com mensagem específica, por exemplo impossibilidade de gravar na pasta. |
| Perfil não encontrado depois da autenticação | `404 / not_found` | Não atualiza a foto. |
| Falha ao persistir a nova foto no banco | `500 / internal_server_error` | Remove o arquivo novo; mantém a referência anterior. |
| E-mail já cadastrado ao atualizar dados pessoais | `409 / conflict` | Dados anteriores preservados. |
| Senha atual incorreta, senha incompleta ou nova senha fora das regras | `400 / bad_request` | Não altera a senha. |
| Falha de rede ou resposta sem sucesso | Feedback no formulário | Não apresenta sucesso nem promove a prévia a foto oficial. |

Não são enviados tokens na URL ou no corpo multipart, nem imagens em Base64. As mensagens usam os componentes de feedback já existentes na página.

## Como testar manualmente

Com Apache e MySQL do XAMPP em execução, entre com uma conta comum e abra `views/assets/app/pages/profile.html` pelo servidor HTTP.

1. Confira nome, e-mail e foto atual (ou iniciais).
2. Selecione uma imagem: a prévia deve surgir separadamente, sem mudar o avatar salvo. Cancele e confira que a foto anterior permanece.
3. Envie JPG, PNG e WEBP de até 5 MB; confira perfil e cabeçalho. Recarregue e confirme a persistência.
4. Confira no banco `SELECT id, photo FROM users WHERE id = <seu ID>` e o arquivo correspondente em `uploads/users/`.
5. Envie outra imagem e confira a remoção da imagem anterior gerenciada.
6. Tente arquivo inválido, vazio, acima de 5 MB e envio sem seleção. Confira as mensagens.
7. Com uma foto selecionada, salve nome/e-mail; a seleção da foto deve continuar pendente. No painel de rede, o PUT deve conter apenas os dados textuais, e o POST da foto apenas `photo`.
8. Confira a troca opcional de senha com senha atual correta e incorreta, além de login, logout e navegação.
9. Verifique em tela estreita: os cartões devem empilhar, e a navegação fica disponível por rolagem horizontal dentro da barra.

O servidor precisa permitir uploads multipart, possuir `fileinfo`, acesso ao banco e permissão de escrita no diretório de uploads. Os limites de `post_max_size` e `upload_max_filesize` precisam comportar o envio de 5 MB e o overhead multipart. No XAMPP validado, ambos estão em 40 MB; não foi necessário alterar o PHP.

## Testes automatizados e resultados

Executado no Windows com Apache/MySQL do XAMPP, PHP 8.2.12, Node.js e Chrome. Foram usados Playwright e Sharp já disponíveis no runtime de testes do Codex; **nenhuma dependência foi adicionada à aplicação**.

Para repetir, configure os caminhos locais disponíveis:

```powershell
$env:BIOGAS_TEST_NODE_MODULES = 'C:/Users/rafae/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
$env:BIOGAS_TEST_OUTPUT = Join-Path $env:TEMP 'biogas-etapa07-resultados'
node tests/profile.integration.cjs
```

São opcionais `BIOGAS_TEST_PHP`, `BIOGAS_TEST_CHROME` e `BIOGAS_TEST_URL`. Os padrões correspondem ao XAMPP e Chrome locais. O teste cria duas contas temporárias, remove suas fotos e exclui essas contas ao terminar. A falha de banco é simulada por um PDO que rejeita exclusivamente o UPDATE da foto em um processo PHP separado, servido somente em loopback; não altera a configuração, o schema ou a conexão do Apache.

Resultado final: **21 grupos aprovados, 0 reprovados**.

| Grupo executado | Resultado |
| --- | --- |
| Perfil autenticado e fallback sem foto | Aprovado |
| Upload JPG, arquivo real, banco e substituição | Aprovado |
| Upload PNG, arquivo real, banco e substituição | Aprovado |
| Upload WEBP, arquivo real, banco e substituição | Aprovado |
| Sem arquivo, texto disfarçado, GIF, imagem truncada, arquivo vazio e mais de 5 MB | Aprovado |
| Sem token, inválido, expirado e permissão administrativa | Aprovado |
| ID do cliente ignorado e isolamento entre dois usuários | Aprovado |
| Dados pessoais, conflito de e-mail, senha incorreta, troca válida e renovação do token | Aprovado |
| Alteração efetiva de e-mail, login com o novo endereço e preservação da foto | Aprovado |
| Falha de persistência com limpeza do arquivo novo e manutenção do anterior | Aprovado |
| Carregamento no navegador, imagem persistida e dois formulários independentes | Aprovado |
| Validação de seleção e arquivo no navegador | Aprovado |
| Prévia separada, envio de dados pessoais sem imagem e preservação da seleção | Aprovado |
| Multipart apenas com `photo`, Bearer, boundary automático, bloqueio e atualização dos avatares após sucesso/reload | Aprovado |
| Falha de rede, erro JSON, HTTP 500 e corpo que contradiz o status HTTP | Aprovado |
| Rejeição de URLs externas, JavaScript e caminhos fora do diretório esperado | Aprovado |
| Liberação de URLs temporárias ao trocar/cancelar seleção | Aprovado |
| Layout em 360, 390, 768, 1024, 1440 e 1890 px, sem overflow da página | Aprovado |
| Navegação e consulta de dashboard, histórico, comparação, parâmetros e relatórios | Aprovado |
| Sessão expirada, redirecionamento, limpeza de armazenamento e logout | Aprovado |
| Nenhuma exceção JavaScript, usuários preexistentes preservados e nenhum novo Warning/Fatal/Parse error PHP no log da execução | Aprovado |

Também foram executados `php -l` nos quatro arquivos PHP envolvidos e `node --check` nos três arquivos JavaScript de produção envolvidos e no teste: todos aprovados. A classe `Upload` foi comparada com o trecho original do anexo e é idêntica. As capturas desktop e mobile foram inspecionadas visualmente.

Os arquivos `results.json` e as capturas `profile-390.png`, `profile-1440.png` e `profile-1890.png` são gerados no diretório de saída dos testes. Na execução desta implementação: `C:/Users/rafae/.codex/tmp/biogas-etapa07/results/`.

## Limites e pendências

Não foi identificada pendência que impeça o fluxo de perfil no ambiente local testado. Não foram executados testes em Firefox, Safari, aparelho físico, hospedagem externa ou testes exaustivos de criação/exclusão de simulações e relatórios ou operação da área administrativa; essas áreas foram preservadas e a regressão cobriu consulta e navegação. Não se afirma cobertura completa dessas funcionalidades.

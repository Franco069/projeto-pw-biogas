# BioGas Analytics

Projeto didático de Programação Web para simulação do potencial energético e econômico do biogás. A aplicação permite cadastrar usuários, criar e consultar simulações, comparar cenários, gerar relatórios e associar fotos aos locais analisados.

O sistema utiliza uma API PHP organizada em Models e Controllers, interface em HTML/CSS e JavaScript orientado a objetos, com persistência em MySQL. Este README reúne a documentação geral e as **Etapas 06 — JavaScript Orientado a Objetos** e **07 — Upload de Imagens e Arquivos**, revisadas conforme os arquivos presentes no projeto.

## 1. Funcionalidades

| Área | Funcionalidades implementadas no código |
| --- | --- |
| Pública | Página inicial, apresentação, consulta de FAQs, cadastro e login, com opção de acesso administrativo. |
| Aplicação | Dashboard, nova simulação, histórico, detalhes e exclusão de simulações, comparação de cenários e geração, consulta e impressão de relatórios. |
| Perfil | Consulta e atualização de nome/e-mail, alteração de senha e envio de foto com prévia. |
| Fotos dos locais | Envio de várias imagens, consulta e exclusão individual; exibição no histórico, na comparação e nos relatórios. |
| Administração | Dashboard, gestão de usuários e administradores, resíduos, parâmetros, FAQs, consulta de relatórios e perfil administrativo. |

Na administração, a exclusão de usuários, administradores e resíduos é lógica: o registro fica inativo. As operações disponíveis variam conforme a tela; a tela de parâmetros edita os parâmetros utilizados pelo cálculo.

## 2. Tecnologias e requisitos

| Tecnologia | Uso |
| --- | --- |
| HTML5 e CSS3 | Estrutura, estilos, formulários e apresentação dos resultados. |
| JavaScript | Módulos ES, classes, campos privados, herança, composição, protótipos e consumo da API com `fetch`. |
| PHP | API, validação, autenticação, cálculo e armazenamento de imagens. |
| MySQL | Persistência dos usuários, locais, simulações, resultados, relatórios e metadados das imagens. |
| Composer | Autoload PSR-4 e dependências PHP. |
| CoffeeCode Router | Encaminhamento das rotas HTTP aos Controllers. |
| Firebase PHP-JWT | Emissão e validação de tokens JWT. |
| Apache | Servidor local e reescrita de URLs por `.htaccess`. |

Requisitos para a instalação:

- PHP compatível com o projeto: `api/composer.json` declara **`8.1.*`**. A instalação de dependências deve respeitar essa restrição.
- Extensões PHP `pdo_mysql`, `fileinfo` e `mbstring` habilitadas.
- Apache com `mod_rewrite` e permissão para aplicar as regras de `api/.htaccess`.
- MySQL em execução e banco `db_biogas` configurado.
- Navegador com suporte a módulos JavaScript, campos privados, `fetch` e `FormData`.
- Permissão de gravação para o Apache nas pastas de upload.

## 3. Arquitetura e organização

```text
projeto-pw-biogas/
├── index.html                   # Redireciona para a página pública inicial
├── README.MD                    # Documentação principal
├── api/
│   ├── index.php                # Registro e despacho das rotas
│   ├── .htaccess                # Reescrita de URLs
│   ├── composer.json
│   ├── vendor/                  # Autoload e bibliotecas PHP
│   └── source/
│       ├── Config/              # URL base, banco e configuração JWT
│       ├── Controller/          # Autenticação, validação e processamento HTTP
│       ├── Core/                # Model base, conexão PDO e JWT
│       ├── Models/              # Entidades e persistência
│       └── Support/             # Helpers e Upload
├── data-base/
│   ├── dump.sql                 # Esquema e dados de demonstração
│   └── location_images.sql      # Criação da tabela de imagens dos locais
├── docs/                        # Documentação complementar e registros anteriores
├── uploads/
│   ├── users/                   # Fotos de perfil
│   └── locations/               # Fotos dos locais
└── views/assets/
    ├── _common/
    │   ├── classes/             # Entidades e serviços HTTP
    │   ├── prototypes/          # Toast e FormController
    │   ├── scripts/             # HttpClientBase, AuthGuard e sessão
    │   └── styles/              # Estilos compartilhados
    ├── public/                  # Área pública
    ├── app/                     # Área do usuário autenticado
    └── admin/                   # Área administrativa
```

O fluxo principal é:

```text
Página HTML → classe da página → serviço JavaScript → HttpClientBase
    → api/index.php / CoffeeCode Router → Controller PHP → Model → MySQL
    ← atualização da interface ← resposta JSON da API
```

O roteador é fornecido pela biblioteca CoffeeCode Router e configurado em `api/index.php`. A conexão com o banco utiliza PDO em `api/source/Core/Connect.php`.

## 4. Como executar

### 4.1. Servidor e dependências

1. Coloque a pasta em `C:\xampp\htdocs\projeto-pw-biogas`, ou no diretório público equivalente do Apache.
2. Inicie Apache e MySQL.
3. Confira as dependências em `api/vendor/`. Para instalar a partir do manifesto, execute na pasta `api/`, com Composer disponível:

   ```powershell
   Set-Location C:\xampp\htdocs\projeto-pw-biogas\api
   composer install
   ```

4. Ajuste `api/source/Config/Config.php`: `CONF_URL_BASE`, `CONF_URL_TEST`, host, porta, nome, usuário e senha do banco, além da configuração JWT do ambiente.
5. A configuração atual usa a URL `http://localhost/projeto-pw-biogas` e o banco `db_biogas`, com MySQL na porta `3306`.

Os serviços JavaScript informam explicitamente `http://localhost/projeto-pw-biogas/api` aos seus construtores. Se mudar pasta, porta ou domínio, ajuste também essas URLs e a consulta direta em `views/assets/public/scripts/faq-home.js`. Alterar apenas `Config.php` não atualiza o frontend. O valor padrão de `HttpClientBase` ainda aponta para um endereço antigo do ACME; os serviços atuais substituem esse valor.

### 4.2. Banco novo

Crie um banco **vazio** chamado `db_biogas` com o comando abaixo. Se ele já contém dados, consulte a seção 4.3.

```sql
CREATE DATABASE db_biogas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

No phpMyAdmin, selecione o banco criado, clique em **Importar** e escolha [dump.sql](data-base/dump.sql). O arquivo usa o banco selecionado. Ele cria as 15 tabelas com suas chaves estrangeiras, os tipos de conta, as colunas de aceite dos termos e newsletter, os parâmetros de cálculo e os dados de demonstração.

Para explorar o histórico com fotos, entre como usuário comum com **`demo20@example.test`** e a senha de demonstração **`BiogasDemo2026`**. Essa conta tem duas simulações, dois relatórios e cinco fotos. A conta `demo4@example.test` usa a mesma senha e contém as outras duas simulações e um relatório. Os arquivos das fotos ficam em `uploads/locations/` e devem acompanhar o projeto.

Para habilitar seu primeiro acesso administrativo, cadastre uma conta com sua própria senha na aplicação. Selecione `db_biogas` no phpMyAdmin e execute o comando abaixo, substituindo o e-mail pelo da conta recém-criada. Em seguida, faça login com a opção **Entrar como administrador**.

```sql
UPDATE users SET user_type_id = 1
WHERE email = 'seu-email@example.test' AND user_type_id = 2;
```

### 4.3. Banco existente

Preserve os dados e confira a estrutura antes de aplicar alterações:

```sql
USE db_biogas;
SHOW COLUMNS FROM users;
SELECT id, name, active FROM user_types;
SHOW TABLES LIKE 'location_images';
```

- Se faltar a tabela de imagens, execute `data-base/location_images.sql` com `db_biogas` selecionado. O script usa `CREATE TABLE IF NOT EXISTS`; ele não corrige uma tabela existente com estrutura diferente.
- Se faltarem as colunas de cadastro ou os tipos de usuário, aplique apenas os ajustes ausentes, respeitando os registros existentes e os IDs `1` para administrador e `2` para usuário comum.
- Confira os parâmetros ativos `waste_per_person`, `biogas_energy_conversion` e `glp_energy_conversion`, além de pelo menos um resíduo ativo com `estimated_yield > 0`.

### 4.4. Uploads e acesso

Confira o `php.ini` utilizado pelo Apache:

```ini
file_uploads = On
upload_max_filesize = 5M
post_max_size = 20M
```

Reinicie o Apache após alterar o PHP. O limite da aplicação é de **5 MiB por imagem** (`5 × 1024 × 1024` bytes), mesmo que o servidor aceite arquivos maiores. `post_max_size` deve comportar o arquivo e os demais dados do formulário.

As pastas `uploads/users/` e `uploads/locations/` precisam permitir gravação pelo Apache. A classe `Upload` tenta criar o diretório quando necessário.

Acesse o [BioGas Analytics no servidor local](http://localhost/projeto-pw-biogas/). Use uma conta de demonstração ou cadastre sua própria conta.

As páginas devem ser acessadas pelo servidor HTTP. Os módulos JavaScript e a API dependem desse ambiente.

## 5. Etapa 06 — JavaScript Orientado a Objetos

A etapa organiza o JavaScript em entidades, serviços HTTP, classes das páginas e objetos prototípicos, separando representação dos dados, comunicação e interface.

### 5.1. Entidades e serviços compartilhados

Os arquivos ficam em `views/assets/_common/classes/`:

| Entidade | Serviço | Responsabilidade |
| --- | --- | --- |
| `User.js` | `Users.js` | Dados de usuários, cadastro, login, perfil, foto e gestão de contas. |
| `Simulation.js` e `SimulationResult.js` | `Simulations.js` | Simulações, resultados, consultas e exclusão. |
| `WasteType.js` | `WasteTypes.js` | Tipos de resíduos e rendimentos. |
| `SystemParameter.js` | `SystemParameters.js` | Parâmetros usados pelo sistema. |
| `Report.js` | `Reports.js` | Dados, geração e consulta de relatórios. |
| `Faq.js` e `FaqCategory.js` | `Faqs.js` e `FaqsCategories.js` | Perguntas frequentes e categorias. |
| `Location.js` | `LocationImages.js` para as fotos | Dados do local e operações sobre suas imagens. |

As entidades representam dados; os serviços estendem `HttpClientBase` para acessar a API. A conversão dos campos retornados pelo backend ocorre nos construtores e, em alguns casos, nas classes das páginas.

### 5.2. Classes das páginas

Em `views/assets/app/scripts/`:

| Arquivo | Função |
| --- | --- |
| `app.js` | Proteção da área autenticada, navegação, dados da conta e inicialização da página atual. |
| `dashboard.js` | Indicadores e resumo das simulações. |
| `simulations.js` | Criação de simulações, seleção do resíduo e formulário independente de fotos. |
| `history.js` | Histórico, detalhes, exclusão de simulações e gestão das fotos do local. |
| `compare.js` | Comparação de indicadores e fotos dos cenários selecionados. |
| `reports.js` | Geração, listagem, apresentação e impressão dos relatórios, incluindo fotos. |
| `profile.js` | Dados pessoais, senha, prévia e envio da foto de perfil. |

A área administrativa possui classes de página em `views/assets/admin/scripts/`, inicializadas por `admin.js`. Elas reutilizam os serviços compartilhados. Também há herança entre classes de tela: `AdminProfile` estende `Profile`, e `Admins` estende `UsersPage`.

### 5.3. Classes, encapsulamento e composição

As classes ES representam os objetos do sistema. `Simulation`, por exemplo, compõe os dados de uma simulação com instâncias de `Location` e `SimulationResult`:

```javascript
this.location = new Location(data);
this.result = new SimulationResult(data);
```

O encapsulamento aparece nos campos privados `#baseUrl` e `#defaultHeaders` de `HttpClientBase`, além de entidades como `User` e `WasteType`, que possuem campos privados e getters/setters com validação.

Essa estratégia não é uniforme em todas as entidades: `Simulation`, `SystemParameter` e `Report`, por exemplo, utilizam propriedades públicas. A documentação não pressupõe que todas as classes possuam getters/setters ou o mesmo formato de conversão de payloads.

As classes das páginas também usam composição ao reunir serviços, `Toast` e, onde necessário, `FormController`.

### 5.4. Herança e comunicação HTTP

`views/assets/_common/scripts/HttpClientBase.js` centraliza:

- `get()`, `post()`, `put()` e `delete()`;
- `postForm()` e `putForm()`;
- `setAuthToken()` e `clearAuthToken()`;
- montagem de URL, parâmetros, cabeçalhos e leitura das respostas.

Exemplos de herança presentes no código:

```javascript
export default class Simulations extends HttpClientBase {
    // Operações específicas de simulações.
}

export default class Users extends HttpClientBase {
    // Operações específicas de usuários.
}
```

`postForm()` envia `FormData`, inclusive arquivos. Para esses envios, o cliente remove o `Content-Type` padrão e deixa o navegador definir o multipart com seu boundary. `putForm()` utiliza `application/x-www-form-urlencoded`.

### 5.5. Programação prototípica

Os objetos em `views/assets/_common/prototypes/` compartilham métodos por meio de `Object.create()`, sem declaração com `class`:

| Protótipo | Métodos | Uso |
| --- | --- | --- |
| `Toast` | `show()`, `success()`, `warning()`, `error()`, `response()` | Mensagens visuais de sucesso, aviso e erro. |
| `FormController` | `init()`, `serialize()`, `clear()` | Associação ao formulário, leitura dos campos e limpeza. |

Exemplo real de `views/assets/public/scripts/auth.js`:

```javascript
const loginForm = Object.create(FormController);
const registerForm = Object.create(FormController);
```

Os dois objetos compartilham os métodos do protótipo e mantêm sua própria referência de formulário após `init()`. `serialize()` monta um objeto com os campos preenchidos, enquanto `clear()` chama `reset()` no formulário associado.

`Toast` também é usado com `Object.create(Toast)` em diferentes páginas. As mensagens são inseridas com `textContent`; `response()` escolhe o tipo de aviso conforme a resposta. A página de perfil possui mensagens próprias nos formulários.

### 5.6. Autenticação e respostas da API

Os serviços enviam o JWT no cabeçalho `Authorization: Bearer TOKEN`. A classe chamada `SessionStorage`, definida em `storage.js`, guarda o token e os dados da conta em **`localStorage`**. O nome da classe não significa que ela utiliza a API nativa `sessionStorage`.

`AuthGuard` verifica a presença da sessão e o tipo esperado pela área. A autorização efetiva acontece na API: o backend valida o JWT e consulta o tipo e o estado ativo da conta no banco.

As respostas geradas por `Api::call(...)->back(...)` possuem `code`, `status`, `type` e `message`, além de `data` quando há dados a retornar. O frontend interpreta essas respostas e apresenta os resultados por `Toast` ou mensagens da página. `HttpClientBase` também considera o status HTTP real ao tratar falhas.

## 6. Simulações e relatórios

O cálculo é realizado em `api/source/Controller/Simulations.php`, com parâmetros ativos do banco e o rendimento do resíduo escolhido. O servidor valida o resíduo e consulta seu `estimated_yield`, sem aceitar um rendimento arbitrário do navegador.

```text
resíduo diário = quantidade de pessoas × waste_per_person
biogás diário = resíduo diário × estimated_yield do resíduo
energia diária = biogás diário × biogas_energy_conversion
GLP mensal equivalente = energia diária ÷ glp_energy_conversion × 30
preço por kg de GLP = custo mensal atual ÷ consumo mensal atual
economia mensal = menor(GLP mensal equivalente, consumo mensal atual) × preço por kg
economia anual = economia mensal × 12
payback em meses = custo de implantação ÷ economia mensal
```

Quando não há consumo de GLP, o cálculo utiliza preço por kg igual a zero. Quando não há economia mensal, o payback é armazenado como `null`.

O parâmetro antigo `biogas_yield` permanece no dump por compatibilidade; o cálculo atual usa o rendimento cadastrado no tipo de resíduo. Alterações de rendimento e parâmetros afetam novas simulações. Os resultados já calculados são persistidos em `simulation_results`.

Os relatórios são apresentados na aplicação e podem ser impressos com `window.print()`. As fotos vinculadas ao local são consultadas para exibição; a geração do relatório não representa o upload de um arquivo PDF nem uma cópia independente das imagens.

## 7. Etapa 07 — Upload de Imagens e Arquivos

A implementação integrada ao BioGas Analytics contempla a foto do usuário e várias imagens para cada local analisado. Os arquivos são enviados por `multipart/form-data`, sem conversão para Base64. O banco armazena caminhos e metadados; as imagens ficam no sistema de arquivos do servidor.

### 7.1. Foto de perfil

Arquivos principais:

- `views/assets/app/pages/profile.html` e `views/assets/app/scripts/profile.js`;
- `views/assets/_common/classes/Users.js`;
- `api/source/Controller/Users.php`;
- `api/source/Models/User.php`;
- `api/source/Support/Upload.php`.

O usuário seleciona uma imagem, confere a prévia e envia pelo formulário de foto, independente do formulário de dados pessoais. `Users.uploadPhoto(file)` monta o `FormData` com o campo **`photo`** e envia o token da sessão.

O Controller identifica a conta pelo JWT, utiliza uma instância de `Upload` e chama seu método `image()`. Após salvar o arquivo, `User.updatePhoto()` atualiza `users.photo` com o caminho relativo. A resposta devolve `data.photo` como URL para atualizar o perfil e o cabeçalho.

Também existe envio de foto no perfil administrativo, usando a mesma implementação com o tipo de conta correspondente.

### 7.2. Imagens dos locais e relacionamento 1:N

Cada simulação criada pelo fluxo atual possui um local associado. A relação de imagens é **`locations` 1:N `location_images`**: um local pode ter nenhuma, uma ou várias imagens, e cada imagem pertence a um único local.

| Campo de `location_images` | Função |
| --- | --- |
| `id` | Identificador da imagem. |
| `location_id` | Chave estrangeira para `locations(id)`. |
| `image_path` | Caminho relativo do arquivo salvo. |
| `alt_text` | Texto alternativo opcional, com até 255 caracteres. |
| `position` | Posição registrada, com valor padrão zero. |
| `created_at` | Data de cadastro. |

A chave estrangeira possui `ON DELETE CASCADE` e `ON UPDATE CASCADE`. A criação da tabela está tanto em `data-base/location_images.sql` quanto em `data-base/dump.sql`.

`api/source/Models/Store/LocationImage.php` estende `Model` e possui construtor, atributos privados, getters e setters. `api/source/Controller/LocationImages.php` implementa `listAll()`, `insert()` e `delete()`.

O Controller exige usuário comum autenticado, confirma a propriedade do local e, na exclusão, verifica se a imagem pertence ao local informado.

### 7.3. Rotas e contrato de upload

Base local da API: `http://localhost/projeto-pw-biogas/api`. As rotas são registradas em `api/index.php`.

| Método | Rota | Entrada / operação | Autenticação |
| --- | --- | --- | --- |
| POST | `/users/photo` | Campo multipart `photo`; atualiza foto do usuário. | Tipo 2 |
| POST | `/users/photo-admin` | Campo multipart `photo`; atualiza foto do administrador. | Tipo 1 |
| GET | `/locations/{location_id}/images` | Lista imagens do local. | Tipo 2, proprietário do local |
| POST | `/locations/{location_id}/images` | Campo multipart `image` e `alt_text` opcional. | Tipo 2, proprietário do local |
| DELETE | `/locations/{location_id}/images/{image_id}` | Exclui a imagem indicada. | Tipo 2, proprietário do local |

A identificação da conta vem do token, sem depender de um ID de usuário enviado pelo formulário.

O GET retorna `id`, `location_id`, `image_path`, `image_url`, `alt_text`, `position` e `created_at`. O POST recebe **uma imagem por requisição** e retorna os dados da imagem criada, sem `created_at`. A interface aceita vários arquivos e realiza um envio individual para cada um.

O backend aceita `alt_text`, mas `LocationImages.insert(locationId, file)` envia apenas o campo `image`; o formulário atual não oferece edição desse texto.

### 7.4. Validação e armazenamento

`Source\Support\Upload` valida as imagens com:

- formatos JPEG, PNG e WEBP;
- limite de **5 MiB por imagem**;
- estrutura de `$_FILES`, erros de upload e origem por upload HTTP;
- tamanho real do arquivo;
- MIME identificado por `finfo` e conteúdo verificado com `getimagesize()`;
- nome aleatório gerado pelo servidor, sem reutilizar o nome original do navegador.

O frontend verifica tipo e tamanho antes do envio. A validação final ocorre no PHP.

| Destino | Caminho persistido |
| --- | --- |
| Foto de perfil | `uploads/users/<nome_aleatorio>.<extensão>` em `users.photo`. |
| Foto do local | `uploads/locations/<nome_aleatorio>.<extensão>` em `location_images.image_path`. |

Se o upload funcionar e a gravação no banco falhar, os Controllers tentam remover o arquivo recém-criado. Ao substituir a foto de perfil, o sistema também tenta remover a foto anterior gerenciada pelo projeto.

Na exclusão individual de uma foto do local, o registro é removido primeiro e depois o Controller tenta apagar o arquivo físico. Uma falha nessa remoção pode deixar um arquivo sem referência.

A exclusão de um local pelo Controller `Locations` não faz a limpeza física de suas fotos; o cascade remove apenas os registros do banco, quando a exclusão do local é permitida pelas demais relações. Excluir uma simulação também não remove automaticamente o local associado nem suas imagens.

A classe `Upload` oferece ainda um método `file()` para PDF, ZIP e documentos Office, com limite padrão de 10 MiB. Os fluxos documentados nesta etapa utilizam `image()`; não há uma tela de envio genérico desses documentos integrada ao fluxo descrito.

### 7.5. Integração com as páginas

`views/assets/_common/classes/LocationImages.js` estende `HttpClientBase` e oferece:

```javascript
listAll(locationId)
insert(locationId, file)
remove(locationId, imageId)
```

O serviço utiliza o token da sessão e envia o arquivo com `FormData`, deixando o navegador definir o cabeçalho multipart.

| Página | Funcionamento das imagens |
| --- | --- |
| Nova Simulação | Formulários separados para cálculo e fotos. Após criar uma simulação, abra “Todas simulações”, selecione um registro salvo e use “Adicionar fotos”. O vínculo utiliza o `location_id` da seleção. |
| Histórico | Os detalhes apresentam as fotos do local, permitem novos envios e exclusão individual. |
| Comparar Cenários | Mostra as fotos dos locais junto aos indicadores das simulações selecionadas. |
| Relatórios | Inclui as fotos na listagem, no relatório apresentado e na impressão. |

Criar a simulação não envia automaticamente as fotos selecionadas no outro formulário. Enviar fotos também não cria outra simulação. As páginas apresentam estados de carregamento, lista vazia, prévia, envio, sucesso e falha, conforme a operação.

## 8. Roteiro de testes e evidências

Este roteiro serve para validar a entrega em uma instalação configurada. Sua presença não significa que todos os testes foram executados nesta revisão da documentação.

### 8.1. Etapa 06

1. Cadastrar um usuário, fazer login e conferir o direcionamento para a área correta.
2. Atualizar o perfil e conferir os dados após recarregar a página.
3. Criar uma simulação escolhendo um resíduo ativo e conferir os resultados.
4. Consultar a simulação no histórico, abrir seus detalhes e comparar cenários.
5. Gerar, consultar e imprimir um relatório.
6. Excluir uma simulação de teste e conferir a atualização da lista.
7. Com um administrador, testar cadastro e edição de contas e resíduos, exclusão lógica, edição de parâmetros e operações de FAQs.
8. Confirmar as mensagens de sucesso, validação e erro e o uso de `FormController` nos formulários de login e cadastro.

### 8.2. Etapa 07 — foto do perfil

1. Abrir Perfil, selecionar uma imagem válida e conferir a prévia.
2. Enviar a foto, atualizar a página e conferir sua permanência.
3. Enviar outra foto e conferir a substituição e o caminho persistido no banco.
4. Repetir o fluxo no perfil administrativo com uma conta do tipo adequado.

### 8.3. Etapa 07 — fotos dos locais

1. Criar uma simulação e selecioná-la em “Todas simulações”.
2. Selecionar duas imagens válidas e enviá-las.
3. Conferir as duas fotos na interface e dois registros com o mesmo `location_id` no banco.
4. Recarregar a página, selecionar a simulação e conferir a persistência das imagens.
5. Abrir o Histórico e excluir somente uma das fotos; a outra deve permanecer.
6. Conferir as fotos na comparação de cenários e nos relatórios, incluindo a impressão.
7. Testar arquivo de formato inválido, conteúdo que não seja uma imagem, arquivo acima de 5 MiB e requisição sem arquivo.
8. Testar requisições sem token, com token inválido e com outro usuário tentando listar, enviar ou excluir imagens de um local que não lhe pertence.
9. Conferir a remoção física do arquivo excluído individualmente, além da remoção do registro.

Consultas de conferência:

```sql
SELECT id, location_id, image_path, alt_text, position, created_at
FROM location_images
ORDER BY location_id, id;

SELECT id, photo
FROM users;
```

As evidências devem ser capturas reais: interface com duas fotos, registros no MySQL, persistência após recarregar e resultado da exclusão individual. Tokens, senhas e outros dados de acesso não devem aparecer nas capturas.

## 9. Revisão do texto enviado e pendências

A revisão conferiu o texto das Etapas 06 e 07 com o código, as rotas e os scripts SQL presentes nesta cópia do projeto. Os principais ajustes foram:

| Ponto | Situação verificada |
| --- | --- |
| Identidade do projeto | O README anterior ainda apresentava o modelo didático ACME; a documentação principal agora descreve o BioGas Analytics. |
| Galeria de produtos | Há referências antigas em `docs/ETAPA_07.md`, rotas `/products` e arquivos residuais. Nesta cópia faltam `gallery.html`, `gallery.js`, `Products.js`, o Controller `Products.php` e o Model `ProductImage.php`. Esse conjunto não constitui uma galeria funcional. A integração de fotos atual utiliza locais. |
| Script de imagens | `location_images` já está no dump geral e na migração própria. `etapa07_product_images.sql` pertence à proposta antiga de produtos e não é necessário para as fotos dos locais. |
| Cadastro após importar o dump | O esquema inclui `terms_accepted`, `newsletter` e os dois tipos de usuário. O cadastro público e o login foram testados após importar o arquivo em um banco vazio. |
| POO | Existem encapsulamento, herança, composição e protótipos, mas getters/setters e conversão de payloads variam entre entidades. |
| Upload PHP | `image()` é um método de instância de `Upload`, chamado a partir de um objeto; não é um método estático. |
| Exclusão de imagens | A exclusão individual tenta limpar o disco; a exclusão de locais e simulações tem as limitações descritas na seção de armazenamento. |
| Branch da etapa | `javascript-poo` não foi identificada nas referências locais/remotas cadastradas nesta cópia. Sua existência no servidor Git não foi verificada. |

Permanecem como próximos ajustes do projeto: revisar a limpeza dos arquivos na remoção de locais, padronizar as entidades conforme os critérios da disciplina e revisar os arquivos e documentos residuais da galeria de produtos.

**Validação do dump.** O arquivo foi importado em um banco vazio no MariaDB 10.4.32 do XAMPP. Uma cópia da API PHP executou os fluxos de cadastro, login comum e administrativo, edição de perfil, cálculo e exclusão de simulação, relatórios, edição de resíduos e parâmetros, FAQ e upload de fotos. Os testes conferiram também os valores calculados, os vínculos dos registros importados e a leitura dos cinco arquivos de imagem. O roteiro da seção 8 cobre as verificações visuais no navegador.

## 10. Documentação complementar

- [Integração da área administrativa](docs/ADMIN-API.md).
- [Resíduos e fotos das simulações](docs/SIMULACOES-RESIDUOS-FOTOS.md).

Os documentos complementares registram trabalhos anteriores e podem citar testes realizados em outros momentos. `docs/ETAPA_07.md` descreve a proposta anterior de galeria de produtos e está desatualizado em relação ao fluxo atual; para a instalação e as fotos dos locais, utilize este README.

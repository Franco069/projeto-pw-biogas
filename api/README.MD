# API - Projeto PW Biogas

## Descricao do projeto

Este Web Service faz parte do projeto PW Biogas e fornece uma API em PHP para comunicacao entre o front-end e o banco de dados MySQL.

A API recebe requisicoes HTTP, direciona cada rota para seu controller correspondente e retorna respostas em JSON. Nesta documentacao, somente as rotas da entidade `Locations` estao documentadas, conforme solicitado.

## Tecnologias utilizadas

- PHP
- MySQL
- PDO
- Composer
- CoffeeCode Router
- JWT com `firebase/php-jwt`

## Estrutura do projeto

- `index.php`: ponto de entrada da API e arquivo onde as rotas sao registradas.
- `source/Controller`: controllers responsaveis por receber as requisicoes e retornar respostas JSON.
- `source/Models`: models responsaveis por representar as entidades e acessar o banco de dados.
- `source/Core`: classes centrais da API, como conexao com o banco, model base e JWT.
- `source/Config`: configuracoes do projeto.
- `source/Support`: funcoes auxiliares.
- `vendor`: dependencias instaladas pelo Composer.

## Padrao de resposta JSON

As respostas seguem o padrao da classe `Api`, utilizando os metodos `call()` e `back()`.

Formato base:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Mensagem retornada pelo controller",
  "data": {}
}
```

O campo `data` aparece somente quando o controller envia dados para o metodo `back()`.

## Seguranca

A API utiliza autenticacao JWT nas rotas protegidas de `Locations`.

O token pode ser enviado em um dos headers aceitos pelo metodo `authToken()`:

- `Authorization: Bearer <token>`
- `authorization: Bearer <token>`
- `token: <token>`

Nas rotas de `Locations`, o controller valida o token com `authToken(2)`, seguindo o mesmo padrao utilizado em `Addresses.php`. Quando o token nao existe, e invalido, expirou ou nao pertence ao tipo de usuario esperado, a API retorna:

```json
{
  "code": 401,
  "type": "error",
  "status": "unauthorized",
  "message": "Token de autenticação inválido ou expirado."
}
```

## Rotas de Locations

As URLs abaixo sao relativas ao endereco base da API.

### GET /locations/list

Metodo HTTP: `GET`

URL: `/locations/list`

Descricao: lista todas as localizacoes cadastradas.

Parametros:

- Header de autenticacao JWT obrigatorio.
- Nao possui parametros de rota.
- Nao possui body.

Resposta de sucesso:

- Codigo HTTP: `200 OK`
- Retorna a lista de localizacoes encontradas.

Exemplo de resposta com sucesso:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de Localizações",
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "name": "Unidade Rural",
      "location_type": "rural",
      "city": "Pelotas",
      "state": "RS",
      "created_at": "2026-06-29 20:00:00",
      "updated_at": "2026-06-29 20:00:00"
    }
  ]
}
```

Resposta de erro:

- Codigo HTTP: `401 Unauthorized`
- Ocorre quando o token JWT nao e enviado, e invalido ou expirou.

Exemplo de resposta com erro:

```json
{
  "code": 401,
  "type": "error",
  "status": "unauthorized",
  "message": "Token de autenticação inválido ou expirado."
}
```

Codigos HTTP retornados:

- `200`
- `401`

### GET /locations/list/{location_id}

Metodo HTTP: `GET`

URL: `/locations/list/{location_id}`

Descricao: busca uma localizacao pelo ID.

Parametros:

- Header de autenticacao JWT obrigatorio.
- `location_id`: ID da localizacao. Deve ser um numero inteiro.
- Nao possui body.

Resposta de sucesso:

- Codigo HTTP: `200 OK`
- Retorna os dados da localizacao encontrada.

Exemplo de resposta com sucesso:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Localização encontrada",
  "data": {
    "id": 1,
    "user_id": 2,
    "name": "Unidade Rural",
    "location_type": "rural",
    "city": "Pelotas",
    "state": "RS",
    "created_at": "2026-06-29 20:00:00",
    "updated_at": "2026-06-29 20:00:00"
  }
}
```

Respostas de erro:

- Codigo HTTP: `400 Bad Request`: ocorre quando o `location_id` nao e informado corretamente ou nao e um numero inteiro.
- Codigo HTTP: `401 Unauthorized`: ocorre quando o token JWT nao e enviado, e invalido ou expirou.
- Codigo HTTP: `404 Not Found`: ocorre quando a localizacao nao e encontrada.

Exemplo de resposta com erro 400:

```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID da localização é obrigatório e deve ser um número inteiro"
}
```

Exemplo de resposta com erro 404:

```json
{
  "code": 404,
  "type": "error",
  "status": "not_found",
  "message": "Localização não encontrada"
}
```

Codigos HTTP retornados:

- `200`
- `400`
- `401`
- `404`

### POST /locations

Metodo HTTP: `POST`

URL: `/locations`

Descricao: cadastra uma nova localizacao.

Parametros:

- Header de autenticacao JWT obrigatorio.
- Nao possui parametros de rota.

Body:

```json
{
  "user_id": 2,
  "name": "Unidade Rural",
  "location_type": "rural",
  "city": "Pelotas",
  "state": "RS"
}
```

Resposta de sucesso:

- Codigo HTTP: `201 Created`
- Retorna os dados enviados e o ID gerado pelo banco. No controller atual, `created_at` e `updated_at` retornam `null` nessa resposta.

Exemplo de resposta com sucesso:

```json
{
  "code": 201,
  "type": "success",
  "status": "success",
  "message": "Localização inserida com sucesso",
  "data": {
    "id": 3,
    "user_id": 2,
    "name": "Unidade Rural",
    "location_type": "rural",
    "city": "Pelotas",
    "state": "RS",
    "created_at": null,
    "updated_at": null
  }
}
```

Respostas de erro:

- Codigo HTTP: `400 Bad Request`: ocorre quando algum campo obrigatorio nao e enviado ou `user_id` nao e um numero inteiro.
- Codigo HTTP: `401 Unauthorized`: ocorre quando o token JWT nao e enviado, e invalido ou expirou.
- Codigo HTTP: `500 Internal Server Error`: ocorre quando o model nao consegue inserir o registro.

Exemplo de resposta com erro 400:

```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "Os campos user_id, name, location_type, city e state são obrigatórios"
}
```

Exemplo de resposta com erro 500:

```json
{
  "code": 500,
  "type": "error",
  "status": "internal_server_error",
  "message": "Falha ao inserir registro."
}
```

Codigos HTTP retornados:

- `201`
- `400`
- `401`
- `500`

### PUT /locations/{location_id}

Metodo HTTP: `PUT`

URL: `/locations/{location_id}`

Descricao: atualiza uma localizacao existente.

Parametros:

- Header de autenticacao JWT obrigatorio.
- `location_id`: ID da localizacao. Deve ser um numero inteiro.

Body:

```json
{
  "user_id": 2,
  "name": "Unidade Rural Atualizada",
  "location_type": "rural",
  "city": "Pelotas",
  "state": "RS"
}
```

Resposta de sucesso:

- Codigo HTTP: `200 OK`
- Retorna os dados enviados para atualizacao. No controller atual, `id`, `created_at` e `updated_at` retornam `null` nessa resposta.

Exemplo de resposta com sucesso:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Localização atualizada com sucesso",
  "data": {
    "id": null,
    "user_id": 2,
    "name": "Unidade Rural Atualizada",
    "location_type": "rural",
    "city": "Pelotas",
    "state": "RS",
    "created_at": null,
    "updated_at": null
  }
}
```

Respostas de erro:

- Codigo HTTP: `400 Bad Request`: ocorre quando o `location_id` nao e um numero inteiro ou quando campos obrigatorios nao sao enviados.
- Codigo HTTP: `401 Unauthorized`: ocorre quando o token JWT nao e enviado, e invalido ou expirou.
- Codigo HTTP: `500 Internal Server Error`: ocorre quando o model nao consegue atualizar o registro.

Exemplo de resposta com erro 400 por ID invalido:

```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID da localização é obrigatório e deve ser um número inteiro"
}
```

Exemplo de resposta com erro 400 por body invalido:

```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "Os campos user_id, name, location_type, city e state são obrigatórios"
}
```

Exemplo de resposta com erro 500:

```json
{
  "code": 500,
  "type": "error",
  "status": "internal_server_error",
  "message": "Registro não encontrado ou sem alterações."
}
```

Codigos HTTP retornados:

- `200`
- `400`
- `401`
- `500`

### DELETE /locations/{location_id}

Metodo HTTP: `DELETE`

URL: `/locations/{location_id}`

Descricao: exclui uma localizacao pelo ID.

Parametros:

- Header de autenticacao JWT obrigatorio.
- `location_id`: ID da localizacao. Deve ser um numero inteiro.
- Nao possui body.

Resposta de sucesso:

- Codigo HTTP: `200 OK`
- Retorna apenas a mensagem de sucesso.

Exemplo de resposta com sucesso:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Localização excluída com sucesso"
}
```

Respostas de erro:

- Codigo HTTP: `400 Bad Request`: ocorre quando o `location_id` nao e um numero inteiro.
- Codigo HTTP: `401 Unauthorized`: ocorre quando o token JWT nao e enviado, e invalido ou expirou.
- Codigo HTTP: `500 Internal Server Error`: ocorre quando o model nao consegue excluir o registro.

Exemplo de resposta com erro 400:

```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID da localização é obrigatório e deve ser um número inteiro"
}
```

Exemplo de resposta com erro 500:

```json
{
  "code": 500,
  "type": "error",
  "status": "internal_server_error",
  "message": "Registro não encontrado ou inativo."
}
```

Codigos HTTP retornados:

- `200`
- `400`
- `401`
- `500`

## Codigos HTTP utilizados

- `200 OK`: requisicao executada com sucesso.
- `201 Created`: registro criado com sucesso.
- `400 Bad Request`: dados obrigatorios ausentes ou invalidos.
- `401 Unauthorized`: token JWT ausente, invalido, expirado ou sem permissao para o tipo de usuario esperado.
- `404 Not Found`: registro nao encontrado na rota que busca localizacao por ID.
- `500 Internal Server Error`: falha interna retornada pelo model durante insercao, atualizacao ou exclusao.

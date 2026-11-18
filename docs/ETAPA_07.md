# Etapa 07 — Upload de imagens (BioGas Analytics)

Esta etapa amplia o BioGas sem modificar o fluxo de simulações. A tela **Galeria** é um módulo isolado da área autenticada. Foi escolhido **um arquivo por requisição** (o usuário pode selecionar vários arquivos de uma vez, e o navegador envia cada arquivo em uma requisição separada). É possível usar a tela com um produto e duas ou mais imagens.

## Antes de executar

1. Descompacte **a pasta `projeto-pw-biogas`** na raiz pública do Apache, mantendo o nome da pasta. Exemplo XAMPP: `C:\xampp\htdocs\projeto-pw-biogas`.
2. Inicie **Apache e MySQL**. Em `http://localhost`, confirme que o servidor responde; também abra `http://localhost/projeto-pw-biogas/api` (pode responder 404 JSON porque a raiz não é uma rota).
3. Importe o `data-base/dump.sql` do BioGas **apenas se o banco ainda não existir**. **Não reimporte o dump em um banco com dados.**
4. Em phpMyAdmin, selecione `db_biogas`, abra a aba **SQL** e execute **somente** `data-base/etapa07_product_images.sql` em um banco já existente. Isso cria `products` e `product_images` sem apagar as tabelas anteriores. **A migração pressupõe que `products` ainda não existe no banco ativo**, como no `dump.sql` atual. Se houver outra tabela real `products`, analise seu esquema antes de aplicar.
5. Confira `api/source/Config/Config.php`: host, porta, usuário, senha do banco e URL base. As classes frontend usam `http://localhost/projeto-pw-biogas/api`; adapte **todos** os serviços se Apache usar porta ou pasta diferentes.
6. Confira `php.ini`: `file_uploads=On`, `upload_max_filesize=5M` ou maior e `post_max_size=6M` ou maior (recomendado `post_max_size=20M`). Reinicie o Apache após alterações. A classe `Source\Support\Upload` valida **até 5 MiB por imagem**.
7. A pasta `uploads/products` precisa permitir gravação pelo processo do Apache. Não desative a validação dos arquivos nem modifique `Upload.php`.

## Banco / relacionamento

- `products(id, user_id, name, created_at)` — cada produto pertence a um usuário (`users.id`).
- `product_images(id, product_id, image_path, alt_text, position, created_at)` — cada registro aponta para um produto (`products.id`), criando a relação **1:N**.
- A chave estrangeira `ON DELETE CASCADE` remove os metadados ao excluir o produto. O controller exclui os arquivos gerenciados do disco após o commit da exclusão.
- A implementação não usa a classe `Source\Models\Product` antiga: ela permanece intacta como material de exemplo de uma loja antiga, pois pressupõe `products_categories`, que não existe no esquema BioGas ativo. Os novos models ficam em `Store/GalleryProduct.php` e `Store/ProductImage.php`.

## Autenticação

Todas as rotas de produtos/imagens exigem JWT de **usuário comum (tipo 2)**, igual a `/simulations`. Envie `Authorization: Bearer TOKEN`. O backend extrai o usuário **exclusivamente do JWT**; os produtos são filtrados por `user_id`, e a alteração de imagens exige que o produto seja do usuário autenticado. O cliente não pode escolher outro usuário por formulário.

## Contrato da API

Base: `http://localhost/projeto-pw-biogas/api`. Todas as respostas seguem `Api::call(...)->back(...)` com `code`, `status`, `type`, `message` e `data` quando há dados.

| Método | Rota | Entrada | Resposta de sucesso |
| --- | --- | --- | --- |
| GET | `/products/list` | JWT | `data`: lista de `{id,name,created_at}` do usuário |
| POST | `/products/` | `multipart/form-data` com `name` | 201 + `data`: `{id,name,created_at}` |
| DELETE | `/products/{product_id}` | JWT | 200; remove produto, metadados e arquivos gerenciados |
| GET | `/products/{product_id}/images` | JWT | 200 + `data`: lista de imagens daquele produto |
| POST | `/products/{product_id}/images` | `multipart/form-data` com **`image`** e `alt_text` opcional | 201 + `data` com imagem cadastrada |
| DELETE | `/products/{product_id}/images/{image_id}` | JWT | 200; remove somente a imagem indicada |
| POST | `/users/photo` | `multipart/form-data` com **`photo`** | 200 + `data.photo` com URL da foto |

Campos da imagem: `id`, `product_id`, `image_path` relativo (ex.: `uploads/products/<nome_aleatorio>.jpg`), `image_url` (URL pública), `alt_text`, `position`, `created_at`. O nome do arquivo original **não é armazenado**; `Upload::image()` identifica o MIME real, verifica conteúdo válido, limita a 5 MiB e gera nome aleatório.

**Erros esperados:** 400 (campo ausente ou imagem rejeitada), 401 (JWT inválido), 404 (produto ou imagem fora do escopo), 500 (falha de banco/servidor). Um novo arquivo cujo INSERT falha é removido do disco. O registro da imagem é excluído antes de tentar apagar o arquivo físico; falhas no `unlink()` são registradas no log PHP e exigem reconciliação manual do arquivo órfão (não é possível garantir atomicidade entre banco e sistema de arquivos).

## Frontend

- `views/assets/app/pages/gallery.html` — página de gestão; link **Galeria** presente nas demais páginas da área autenticada.
- `views/assets/app/scripts/gallery.js` — classe `Gallery` inicializada pelo `app.js` apenas nesta página.
- `views/assets/_common/classes/Products.js` — serviço de produtos.
- `views/assets/_common/classes/ProductImages.js` — serviço de imagens, estende `HttpClientBase`, usa `SessionStorage`, envia `FormData` sem definir manualmente o `Content-Type` multipart.
- `views/assets/app/styles/gallery.css` — visual compatível com o restante do projeto.
- `api/source/Controller/Products.php`, `api/source/Models/Store/GalleryProduct.php`, `api/source/Models/Store/ProductImage.php` — backend.
- `api/source/Support/Upload.php` permanece inalterado.

O seletor aceita JPG, PNG ou WEBP. O limite é 5 MiB por imagem. O usuário pode escolher várias imagens; cada uma é enviada isoladamente. A interface exibe a prévia, estado de envio, mensagens de erro/sucesso e atualiza a listagem sem recarregar a página. Campos de texto são inseridos via `textContent`/`Option`, impedindo injeção de HTML. A URL da imagem exibida só é aceita quando está no mesmo origin e na pasta de uploads do projeto.

## Testes / evidências de aceite

1. Entre com um usuário normal e abra **Galeria**.
2. Cadastre um produto de teste, por exemplo “Equipamento demonstrativo”.
3. Selecione **duas imagens** JPG/PNG/WEBP, veja as duas prévias e clique **Enviar imagens**.
4. Confirme no banco: `SELECT * FROM product_images ORDER BY product_id, id;` — duas linhas independentes com o mesmo `product_id`.
5. Atualize a página do navegador: ambas devem continuar visíveis (volte a selecionar o produto, se necessário).
6. Exclua **uma** das imagens: a outra deve permanecer no frontend e no banco.
7. Teste login com outro usuário: o produto do primeiro usuário não deve aparecer; não é possível alterar suas imagens.
8. Tente arquivo `.txt`, arquivo acima de 5 MiB, upload sem imagem e token inválido; não devem gerar novos registros.
9. Abra **Perfil**: selecione uma foto, veja a prévia, envie, atualize a página e confira a persistência. Envie outra foto e confira a substituição.
10. Opcionalmente exclua o produto e verifique que não restaram linhas de `product_images` para aquele ID, nem seus arquivos físicos gerenciados.

Registre capturas de tela reais da galeria com **duas imagens**, da tabela no phpMyAdmin e da galeria **após atualizar a página**. As capturas não são incluídas automaticamente porque exigem executar Apache/MySQL e enviar arquivos de fato.

## Limitações de teste

Foram verificadas sintaxe PHP/JS e referências locais. **Não foi realizada execução ponta a ponta com Apache, MySQL e navegador.** A migração precisa ser aplicada manualmente na instalação real; sem ela, o cadastro de produtos retornará erro 500.

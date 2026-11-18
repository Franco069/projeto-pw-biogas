# Resíduos e fotos das simulações

## Tipo de resíduo

Nova Simulação carrega `GET /waste-types/list` com a mesma classe `WasteTypes`
usada pelo admin. O campo `waste_type_id` é obrigatório. O servidor busca o
registro ativo e usa seu rendimento cadastrado, sem aceitar um rendimento
enviado pelo navegador.

O cálculo mantém a sequência existente:

```text
resíduo diário = pessoas × waste_per_person
biogás diário = resíduo diário × estimated_yield do tipo escolhido
energia diária = biogás diário × biogas_energy_conversion
GLP mensal equivalente = energia diária ÷ glp_energy_conversion × 30
economia mensal = menor(GLP equivalente, consumo atual) × preço atual por kg
economia anual = economia mensal × 12
payback em meses = implantação ÷ economia mensal, quando há economia
```

O rendimento usa a precisão de quatro casas da tabela de resíduos. Resultados
continuam sendo gravados com a precisão já definida em `simulation_results`.
O antigo parâmetro global `biogas_yield` fica no banco por compatibilidade, mas
o app e a tela de parâmetros administrativos passam a usar o cadastro de resíduos
para essa escolha. O dashboard administrativo indica resíduo por pessoa.

## Envio de fotos

1. Crie uma simulação normalmente, escolhendo o tipo de resíduo.
2. No formulário independente “Fotos da simulação”, clique em “Todas simulações”.
3. Escolha uma das suas simulações salvas, inclusive uma criada anteriormente.
4. Selecione JPG, PNG ou WEBP de até 5 MB por arquivo e clique em “Adicionar fotos”.

Criar uma simulação não envia imagens automaticamente. O envio de fotos não cria
outra simulação. A seleção de arquivos pertence ao formulário de fotos, separado
do formulário de cálculo.

O fluxo reaproveita `LocationImages`, `Upload`, a tabela `location_images` e as
rotas `/locations/{location_id}/images`. Cada simulação criada pelo app possui seu
próprio local; o seletor obtém o local da simulação escolhida. Não há novo esquema
de autenticação ou armazenamento de imagens. A API verifica a propriedade do
local em listagem, envio e exclusão.

As consultas de simulações incluem `images`, agrupadas por local em uma consulta
adicional. Assim, Comparar Cenários mostra as miniaturas na coluna correspondente,
e Relatórios mostra as fotos na listagem, no relatório aberto e na impressão.
O Histórico continua exibindo e permitindo excluir as fotos do mesmo local.

## Banco e arquivos

O banco local já possuía `location_images`; seus dados foram preservados. A criação
idempotente da tabela foi adicionada ao `dump.sql` e também está disponível em
`data-base/location_images.sql` para instalações que ainda não a possuem.

Os arquivos PHP de imagens tinham uma linha em branco antes de `<?php`, o que
impedia a declaração de namespace. Essa linha foi removida. O setter de texto
alternativo aceita `null`, como a coluna do banco.

## Verificação

Passaram 75 verificações de API e navegador, usando registros temporários:

- Resíduos criados no admin aparecem no seletor; rendimentos diferentes alteram
  biogás e economia; rendimentos inválidos e tipos inativos são rejeitados.
- O tipo selecionado é persistido; alterações posteriores do rendimento afetam
  novos cálculos e preservam resultados anteriores.
- Criar a simulação não envia as fotos selecionadas no outro formulário.
- O seletor inclui simulações novas e anteriores; só a escolhida recebe as fotos.
- Fotos persistem após recarregar e aparecem em comparação, relatório aberto,
  relatório salvo, impressão e Histórico.
- Outro usuário não consegue consultar, enviar ou excluir fotos desses locais.
- Arquivos inválidos são rejeitados; a exclusão de fotos sem texto alternativo funciona.
- Os formulários foram inspecionados em desktop e em 390 px, sem ampliar a página.
- A tela de parâmetros e o dashboard administrativo não apresentam mais o
  rendimento global antigo como parâmetro usado no cálculo.

Também passaram as verificações de sintaxe de 32 arquivos PHP e 35 módulos
JavaScript. Os registros e arquivos de teste foram removidos ao terminar.

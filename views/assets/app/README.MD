# 📁 views/assets/app/

## Recursos da Área do Usuário Logado

---

### 🎯 Para que serve esta pasta?

A pasta `app/` contém os recursos visuais (CSS, JS, imagens) **exclusivos da área do usuário
autenticado** (logado). Essa é a área principal da aplicação, onde o usuário interage com o
sistema após fazer login.

---

### 👤 O que é a área do usuário logado (app)?

É a área onde o usuário comum (não administrador) acessa funcionalidades como:

- 🏠 Dashboard pessoal
- 👤 Editar seu perfil
- 📝 Criar e gerenciar seus conteúdos
- ⚙️ Configurações da conta
- 🔔 Notificações

---

### 📂 Estrutura desta pasta

```
app/
├── images/     ← Imagens da área logada (ícones, avatares padrão)
├── scripts/    ← JavaScript da área logada (perfil, dashboard)
└── styles/     ← CSS da área logada (layout do painel do usuário)
```

---

### 💡 Exemplos de arquivos

| Pasta      | Arquivo exemplo        | Descrição                              |
|------------|------------------------|----------------------------------------|
| `styles/`  | `profile.css`          | Estilo da página de perfil             |
| `styles/`  | `dashboard.css`        | Layout do dashboard do usuário         |
| `scripts/` | `profile.js`           | Edição de perfil via API               |
| `scripts/` | `auth.js`              | Verificação de autenticação            |
| `images/`  | `default-avatar.png`   | Avatar padrão para novos usuários      |

---

### 💡 Exemplo: Script de perfil do usuário

```javascript
// app/scripts/profile.js

// Carrega os dados do perfil do usuário logado
async function carregarPerfil() {
    const response = await fetch("api/perfil", {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    });
    const result = await response.json();

    document.getElementById("nome").value = result.data.name;
    document.getElementById("email").value = result.data.email;
}

// Atualiza os dados do perfil
async function atualizarPerfil(event) {
    event.preventDefault();

    const dados = {
        name: document.getElementById("nome").value,
        email: document.getElementById("email").value
    };

    const response = await fetch("api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    const result = await response.json();
    alert(result.message);
}
```

---

### 🔄 Diferença entre `app/` e `admin/`

| Aspecto       | `app/` (Usuário)              | `admin/` (Administrador)          |
|---------------|-------------------------------|-----------------------------------|
| Quem acessa?  | Usuário comum logado          | Administrador do sistema          |
| Permissões    | Acessa **seus próprios** dados| Acessa **todos** os dados         |
| Funcionalidades| Perfil, dashboard pessoal    | Gerenciar usuários, relatórios    |

---

> 💡 **Dica:** Separar `app/` de `admin/` permite criar experiências visuais diferentes
> para cada tipo de usuário.

---

### Etapa 07 — Perfil e upload de foto

O perfil possui dois formulários independentes: dados pessoais (`PUT /users/update`)
e foto (`POST /users/photo`). A foto é enviada no campo multipart `photo`, com JWT,
usando `Users`, `HttpClientBase` e a classe original `Source\Support\Upload`.
São aceitos JPG, PNG e WEBP de até 5 MB. O arquivo fica em `uploads/users/` e
seu caminho é persistido em `users.photo`, recuperado por `GET /users/me`.

Consulte a [documentação e o relatório completo da Etapa 07](../../../docs/ETAPA07-PERFIL.md)
para arquivos envolvidos, fluxo, respostas da API, adaptações ao código do professor,
como testar e resultados dos testes locais.

### Padrão visual compartilhado do APP

Dashboard, Nova Simulação, Histórico, Comparar Cenários, Relatórios e Perfil usam
o mesmo layout em `styles/app.css`. Todas essas páginas usam `app-page` no `body`;
`styles/profile.css` acrescenta somente os componentes exclusivos do perfil.

A [documentação da padronização visual](../../../docs/APP-VISUAL.md) registra a
causa dos estilos ausentes, os arquivos corrigidos e os testes das seis telas,
incluindo simulações, comparação, relatórios, impressão e responsividade.


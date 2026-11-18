(function () {
  var KEY_PREFIX = "bg_";

  var KEYS = {
    users: KEY_PREFIX + "users_v1",
    admins: KEY_PREFIX + "admins_v1",
    simulations: KEY_PREFIX + "simulations_v1",
    faqs: KEY_PREFIX + "faqs_v1",
    wastes: KEY_PREFIX + "wastes_v1",
    params: KEY_PREFIX + "params_v1",
    contacts: KEY_PREFIX + "contacts_v1",
    reports: KEY_PREFIX + "reports_v1",
    session: KEY_PREFIX + "session_v1",
  };

  var defaultAdmins = [
    {
      id: "admin-1",
      name: "Administrador BioGas",
      email: "admin@biogasanalytics.com",
      password: "admin123",
      role: "admin",
      createdAt: "2026-01-15T09:00:00.000Z",
      updatedAt: "2026-01-15T09:00:00.000Z",
    },
  ];

  var defaultFaqs = [
    {
      id: "faq-1",
      category: "general",
      question: "O que é BioGas Analytics?",
      answer: "BioGas Analytics é uma plataforma web para análise de viabilidade técnica e econômica de projetos de biogás, organizada para funcionar com formulários simples e resultados claros.",
      published: true,
      createdAt: "2026-01-15T09:00:00.000Z",
      updatedAt: "2026-01-15T09:00:00.000Z",
    },
    {
      id: "faq-2",
      category: "general",
      question: "Para quem a plataforma foi pensada?",
      answer: "A solução atende gestores públicos, restaurantes, propriedades rurais, hotéis, indústrias de alimentos, estudantes e pesquisadores que precisam avaliar cenários de biodigestão.",
      published: true,
      createdAt: "2026-01-15T09:10:00.000Z",
      updatedAt: "2026-01-15T09:10:00.000Z",
    },
    {
      id: "faq-3",
      category: "biogas",
      question: "O que é biogás?",
      answer: "Biogás é um combustível renovável gerado pela decomposição anaeróbia de matéria orgânica, com uso possível em aquecimento, eletricidade e substituição parcial de GLP.",
      published: true,
      createdAt: "2026-01-15T09:20:00.000Z",
      updatedAt: "2026-01-15T09:20:00.000Z",
    },
    {
      id: "faq-4",
      category: "biogas",
      question: "Como a biodigestão anaeróbia funciona?",
      answer: "Micro-organismos transformam resíduos orgânicos em biogás e biofertilizante dentro de um ambiente sem oxigênio, respeitando fatores como temperatura, umidade e composição do resíduo.",
      published: true,
      createdAt: "2026-01-15T09:30:00.000Z",
      updatedAt: "2026-01-15T09:30:00.000Z",
    },
    {
      id: "faq-5",
      category: "simulation",
      question: "Como funciona uma simulação?",
      answer: "Você informa o tipo de operação, a quantidade de resíduo, a temperatura média e outros dados básicos. A plataforma estima produção de biogás, economia e payback.",
      published: true,
      createdAt: "2026-01-15T09:40:00.000Z",
      updatedAt: "2026-01-15T09:40:00.000Z",
    },
    {
      id: "faq-6",
      category: "account",
      question: "Preciso de uma conta para usar o sistema?",
      answer: "Você pode explorar a área pública sem conta. Para salvar simulações, acompanhar histórico e personalizar o perfil, o ideal é realizar o cadastro.",
      published: true,
      createdAt: "2026-01-15T09:50:00.000Z",
      updatedAt: "2026-01-15T09:50:00.000Z",
    },
    {
      id: "faq-7",
      category: "technical",
      question: "Posso exportar relatórios?",
      answer: "Sim. Os relatórios podem ser gerados a partir das simulações salvas e ficam disponíveis para impressão ou apresentação dentro da área da aplicação.",
      published: true,
      createdAt: "2026-01-15T10:00:00.000Z",
      updatedAt: "2026-01-15T10:00:00.000Z",
    },
    {
      id: "faq-8",
      category: "technical",
      question: "Os dados ficam salvos onde?",
      answer: "Nesta versão front-end, os dados ficam armazenados localmente no navegador usando localStorage, sem dependência de back-end.",
      published: true,
      createdAt: "2026-01-15T10:10:00.000Z",
      updatedAt: "2026-01-15T10:10:00.000Z",
    },
  ];

  var defaultWastes = [
    {
      id: "waste-1",
      name: "Resíduo alimentar",
      category: "Orgânico",
      factor: 0.22,
      createdAt: "2026-01-15T10:30:00.000Z",
      updatedAt: "2026-01-15T10:30:00.000Z",
    },
    {
      id: "waste-2",
      name: "Dejetos animais",
      category: "Orgânico",
      factor: 0.38,
      createdAt: "2026-01-15T10:40:00.000Z",
      updatedAt: "2026-01-15T10:40:00.000Z",
    },
    {
      id: "waste-3",
      name: "Lodo industrial",
      category: "Orgânico",
      factor: 0.31,
      createdAt: "2026-01-15T10:50:00.000Z",
      updatedAt: "2026-01-15T10:50:00.000Z",
    },
  ];

  var defaultParams = {
    glp: 6.5,
    discount: 8,
    updatedAt: "2026-01-15T11:00:00.000Z",
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : clone(fallback);
    } catch (error) {
      return clone(fallback);
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  function normalizeAccount(item, role) {
    return {
      id: item.id || String(Date.now()),
      name: item.name || "Sem nome",
      email: item.email || "",
      password: item.password || (role === "admin" ? "admin123" : "12345678"),
      role: item.role || role,
      organization: item.organization || "",
      newsletter: !!item.newsletter,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
    };
  }

  function ensure() {
    var users = read(KEYS.users, []);
    if (!Array.isArray(users)) {
      write(KEYS.users, []);
    } else {
      write(
        KEYS.users,
        users.map(function (user) {
          return normalizeAccount(user, "user");
        })
      );
    }

    var admins = read(KEYS.admins, []);
    if (!Array.isArray(admins) || admins.length === 0) {
      write(KEYS.admins, clone(defaultAdmins));
    } else {
      write(
        KEYS.admins,
        admins.map(function (admin) {
          return normalizeAccount(admin, "admin");
        })
      );
    }

    var faqs = read(KEYS.faqs, []);
    if (!Array.isArray(faqs) || faqs.length === 0) {
      write(KEYS.faqs, clone(defaultFaqs));
    }

    var wastes = read(KEYS.wastes, []);
    if (!Array.isArray(wastes) || wastes.length === 0) {
      write(KEYS.wastes, clone(defaultWastes));
    }

    var params = read(KEYS.params, null);
    if (!params || typeof params !== "object" || Array.isArray(params)) {
      write(KEYS.params, clone(defaultParams));
    } else {
      write(
        KEYS.params,
        {
          glp: Number(params.glp || defaultParams.glp),
          discount: Number(params.discount || defaultParams.discount),
          updatedAt: params.updatedAt || new Date().toISOString(),
        }
      );
    }

    if (!Array.isArray(read(KEYS.simulations, []))) {
      write(KEYS.simulations, []);
    }

    if (!Array.isArray(read(KEYS.contacts, []))) {
      write(KEYS.contacts, []);
    }

    if (!Array.isArray(read(KEYS.reports, []))) {
      write(KEYS.reports, []);
    }
  }

  function getUsers() {
    return read(KEYS.users, []);
  }

  function saveUsers(users) {
    return write(KEYS.users, users);
  }

  function getAdmins() {
    return read(KEYS.admins, clone(defaultAdmins));
  }

  function saveAdmins(admins) {
    return write(KEYS.admins, admins);
  }

  function getFaqs() {
    return read(KEYS.faqs, clone(defaultFaqs));
  }

  function saveFaqs(faqs) {
    return write(KEYS.faqs, faqs);
  }

  function getWastes() {
    return read(KEYS.wastes, clone(defaultWastes));
  }

  function saveWastes(wastes) {
    return write(KEYS.wastes, wastes);
  }

  function getParams() {
    return read(KEYS.params, clone(defaultParams));
  }

  function saveParams(params) {
    return write(KEYS.params, params);
  }

  function getSimulations() {
    return read(KEYS.simulations, []);
  }

  function saveSimulations(simulations) {
    return write(KEYS.simulations, simulations);
  }

  function getContacts() {
    return read(KEYS.contacts, []);
  }

  function saveContacts(contacts) {
    return write(KEYS.contacts, contacts);
  }

  function getReports() {
    return read(KEYS.reports, []);
  }

  function saveReports(reports) {
    return write(KEYS.reports, reports);
  }

  function getSession() {
    return read(KEYS.session, null);
  }

  function setSession(session) {
    return write(KEYS.session, session);
  }

  function clearSession() {
    remove(KEYS.session);
  }

  function findAccountByEmail(email) {
    var normalized = String(email || "").trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    var account = getUsers().find(function (user) {
      return String(user.email).trim().toLowerCase() === normalized;
    });

    if (account) {
      return account;
    }

    return getAdmins().find(function (admin) {
      return String(admin.email).trim().toLowerCase() === normalized;
    }) || null;
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatNumber(value, digits) {
    return Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits || 0,
    });
  }

  function formatDate(value) {
    return new Date(value).toLocaleString("pt-BR");
  }

  function resolveFactor(type) {
    var normalized = String(type || "").toLowerCase();

    if (normalized.indexOf("faz") >= 0) {
      return 0.38;
    }

    if (normalized.indexOf("ind") >= 0) {
      return 0.31;
    }

    return 0.22;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function calculateSimulation(data) {
    var params = getParams();
    var quantity = Number(data.quantity || 0);
    var people = Number(data.people || 0);
    var temp = Number(data.temp || 0);
    var factor = resolveFactor(data.type);
    var tempFactor = clamp(temp / 30 || 0, 0.55, 1.2);
    var peopleFactor = 1 + Math.min(people, 500) / 1000;
    var monthlyBiogas = quantity * factor * tempFactor * peopleFactor * 30;
    var glpEquivalent = monthlyBiogas * 0.45;
    var monthlySavings = glpEquivalent * Number(params.glp || 0);
    var annualSavings = monthlySavings * 12;
    var implementationCost = 18000 + quantity * 35 + people * 12;
    var paybackYears = annualSavings > 0 ? implementationCost / annualSavings : 0;
    var viability = clamp((monthlyBiogas / 120) * 10 + tempFactor * 18, 35, 97);
    var verdict = "Baixa viabilidade";

    if (viability >= 65) {
      verdict = "Viável";
    } else if (viability >= 50) {
      verdict = "Viabilidade moderada";
    }

    return {
      monthlyBiogas: Number(monthlyBiogas.toFixed(2)),
      glpEquivalent: Number(glpEquivalent.toFixed(2)),
      monthlySavings: Number(monthlySavings.toFixed(2)),
      annualSavings: Number(annualSavings.toFixed(2)),
      implementationCost: Number(implementationCost.toFixed(2)),
      paybackYears: Number(paybackYears.toFixed(2)),
      viability: Number(viability.toFixed(1)),
      verdict: verdict,
    };
  }

  function saveUser(user) {
    var users = getUsers();
    var existingIndex = users.findIndex(function (item) {
      return item.id === user.id;
    });

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.unshift(user);
    }

    saveUsers(users);
    return user;
  }

  function saveAdmin(admin) {
    var admins = getAdmins();
    var existingIndex = admins.findIndex(function (item) {
      return item.id === admin.id;
    });

    if (existingIndex >= 0) {
      admins[existingIndex] = admin;
    } else {
      admins.unshift(admin);
    }

    saveAdmins(admins);
    return admin;
  }

  ensure();

  window.BioGasStore = {
    KEYS: KEYS,
    ensure: ensure,
    read: read,
    write: write,
    remove: remove,
    getUsers: getUsers,
    saveUsers: saveUsers,
    getAdmins: getAdmins,
    saveAdmins: saveAdmins,
    getFaqs: getFaqs,
    saveFaqs: saveFaqs,
    getWastes: getWastes,
    saveWastes: saveWastes,
    getParams: getParams,
    saveParams: saveParams,
    getSimulations: getSimulations,
    saveSimulations: saveSimulations,
    getContacts: getContacts,
    saveContacts: saveContacts,
    getReports: getReports,
    saveReports: saveReports,
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    findAccountByEmail: findAccountByEmail,
    calculateSimulation: calculateSimulation,
    formatCurrency: formatCurrency,
    formatNumber: formatNumber,
    formatDate: formatDate,
    saveUser: saveUser,
    saveAdmin: saveAdmin,
    normalizeAccount: normalizeAccount,
  };
})();

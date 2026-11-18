-- BioGas Analytics | Selecione um banco vazio antes de importar.
-- No phpMyAdmin, crie e selecione db_biogas.
SET NAMES utf8mb4;

CREATE TABLE user_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_type_id INT NOT NULL,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    photo VARCHAR(255),
    terms_accepted TINYINT(1) NOT NULL DEFAULT 0,
    newsletter TINYINT(1) NOT NULL DEFAULT 0,
    active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_type
        FOREIGN KEY (user_type_id)
        REFERENCES user_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- LOCATIONS
-- =====================================================

CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    name VARCHAR(120) NOT NULL,
    location_type VARCHAR(80),

    city VARCHAR(100),
    state VARCHAR(2),

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_locations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ENERGY CONSUMPTIONS
-- =====================================================

CREATE TABLE energy_consumptions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    location_id INT NOT NULL,

    energy_type VARCHAR(50),
    monthly_consumption DECIMAL(10,2),
    monthly_cost DECIMAL(10,2),

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_energy_location
        FOREIGN KEY (location_id)
        REFERENCES locations(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- WASTE TYPES
-- =====================================================

CREATE TABLE waste_types (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    description TEXT,

    estimated_yield DECIMAL(10,4),

    active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SCENARIOS
-- =====================================================

CREATE TABLE scenarios (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    title VARCHAR(120) NOT NULL,
    description TEXT,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_scenarios_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SCENARIO ITEMS
-- =====================================================

CREATE TABLE scenario_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    scenario_id INT NOT NULL,

    label VARCHAR(100),
    value VARCHAR(255),

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_scenario_items
        FOREIGN KEY (scenario_id)
        REFERENCES scenarios(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SIMULATIONS
-- =====================================================

CREATE TABLE simulations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    location_id INT NOT NULL,

    scenario_id INT NULL,
    waste_type_id INT NULL,

    people_quantity INT,

    daily_waste_kg DECIMAL(10,2),
    average_temperature DECIMAL(5,2),

    glp_consumption_kg DECIMAL(10,2),
    glp_monthly_cost DECIMAL(10,2),

    implementation_cost DECIMAL(10,2),

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_simulations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_simulations_location
        FOREIGN KEY (location_id)
        REFERENCES locations(id),

    CONSTRAINT fk_simulations_scenario
        FOREIGN KEY (scenario_id)
        REFERENCES scenarios(id),

    CONSTRAINT fk_simulations_waste
        FOREIGN KEY (waste_type_id)
        REFERENCES waste_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SIMULATION RESULTS
-- =====================================================

CREATE TABLE simulation_results (
    id INT AUTO_INCREMENT PRIMARY KEY,

    simulation_id INT NOT NULL,

    estimated_biogas_m3 DECIMAL(10,2),
    estimated_energy_kwh DECIMAL(10,2),

    monthly_saving DECIMAL(10,2),
    annual_saving DECIMAL(10,2),

    payback_months DECIMAL(10,2),

    efficiency_level VARCHAR(50),

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_results_simulation
        FOREIGN KEY (simulation_id)
        REFERENCES simulations(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- RECOMMENDATIONS
-- =====================================================

CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    simulation_result_id INT NOT NULL,

    title VARCHAR(120),
    description TEXT,

    priority ENUM('LOW','MEDIUM','HIGH'),

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recommendation_result
        FOREIGN KEY (simulation_result_id)
        REFERENCES simulation_results(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- REPORTS
-- =====================================================

CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    simulation_id INT NOT NULL,

    title VARCHAR(255),

    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_reports_simulation
        FOREIGN KEY (simulation_id)
        REFERENCES simulations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SYSTEM PARAMETERS
-- =====================================================

CREATE TABLE system_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    value DECIMAL(10,4),

    unit VARCHAR(30),
    description TEXT,

    active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- FAQ CATEGORIES
-- =====================================================

CREATE TABLE faqs_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- FAQS
-- =====================================================

CREATE TABLE faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    faqs_category_id INT NOT NULL,

    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,

    active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_faq_category
        FOREIGN KEY (faqs_category_id)
        REFERENCES faqs_categories(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fotos dos locais vinculados às simulações; preserva registros existentes.
CREATE TABLE location_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) NULL,
    position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_location_images_location_id (location_id),
    CONSTRAINT fk_location_images_location FOREIGN KEY (location_id)
        REFERENCES locations(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Dados de demonstração com os vínculos do banco de testes.
START TRANSACTION;

INSERT INTO user_types (id, name, active, created_at, updated_at) VALUES
    (1, 'Administrador', 1, '2026-11-06 15:15:18', '2026-11-06 15:15:18'),
    (2, 'Usuário', 1, '2026-11-06 15:15:18', '2026-11-06 15:15:18');

INSERT INTO users (id, user_type_id, active, created_at, updated_at, terms_accepted, newsletter, name, email, password) VALUES
    (3, 2, 1, '2026-11-06 15:15:36', '2026-11-06 15:15:36', 1, 1, 'Demonstração 3', 'demo3@example.test', '$2y$10$Qw4OL3bib0670132sp8AzeC.6D5hqX4PuNuO2lq/8ETHhM6B1Apqu'),
    (4, 2, 1, '2026-11-06 15:18:43', '2026-11-06 15:35:58', 1, 0, 'Demonstração 4', 'demo4@example.test', '$2y$10$BKEtR4.rzFOp1lQj4ibnbOKBu3ta7j4/h8kIWvqP.oW3HYhP5qKea'),
    (19, 1, 1, '2026-11-11 23:44:47', '2026-11-17 13:36:08', 1, 0, 'Demonstração 19', 'demo19@example.test', '!'),
    (20, 2, 1, '2026-11-11 23:49:55', '2026-11-17 13:36:08', 1, 0, 'Demonstração 20', 'demo20@example.test', '$2y$10$uZTrbABELMeynDNOf7Rh5OwozLx3BV6H6PAA9n5OrvMNc9XDy.0D2');

INSERT INTO system_parameters (id, name, value, unit, description, active, created_at, updated_at) VALUES
    (1, 'waste_per_person', '0.3840', 'kg/pessoa/dia', 'Resíduo orgânico diário estimado por pessoa.', 1, '2026-11-06 15:11:31', '2026-11-06 15:11:31'),
    (2, 'biogas_yield', '0.0820', 'm³/kg', 'Rendimento de produção de biogás por quilograma de resíduo orgânico.', 1, '2026-11-06 15:11:31', '2026-11-06 15:11:31'),
    (3, 'biogas_energy_conversion', '6.0000', 'kWh/m³', 'Energia estimada por metro cúbico de biogás.', 1, '2026-11-06 15:11:31', '2026-11-06 15:11:31'),
    (4, 'glp_energy_conversion', '12.9000', 'kWh/kg', 'Energia equivalente por quilograma de GLP.', 1, '2026-11-06 15:11:31', '2026-11-06 15:11:31');

INSERT INTO waste_types (id, name, description, estimated_yield, active, created_at, updated_at) VALUES
    (1, 'Resíduos orgânicos', 'Resíduos orgânicos utilizados na estimativa de produção de biogás.', '0.0820', 1, '2026-11-06 15:11:31', '2026-11-06 15:11:31'),
    (6, 'geafaf', '123eafsq', '124.0000', 1, '2026-11-11 23:46:46', '2026-11-11 23:46:46');

INSERT INTO faqs_categories (id, name, active, created_at) VALUES
    (5, 'fafafa', 1, '2026-11-11 23:47:05'),
    (6, 'farid', 1, '2026-11-12 00:17:33');

INSERT INTO faqs (id, faqs_category_id, question, answer, active, created_at) VALUES
    (6, 5, 'sei la', 'sei la', 1, '2026-11-11 23:47:18'),
    (7, 6, 'faeffae', 'fadfafaf', 1, '2026-11-12 00:17:45'),
    (8, 6, 'llllllllllllll', 'looooo', 1, '2026-11-12 00:17:53');

INSERT INTO locations (id, user_id, name, location_type, city, state, created_at, updated_at) VALUES
    (1, 4, 'Local de demonstração 1', 'Propriedade rural', 'Charqueadas', 'RS', '2026-11-06 15:27:57', '2026-11-06 15:27:57'),
    (2, 4, 'Local de demonstração 2', 'Propriedade rural', 'PORTO ALEGRE', 'RS', '2026-11-06 15:28:35', '2026-11-06 15:28:35'),
    (11, 20, 'Local de demonstração 11', 'Restaurante', 'eafaefafcae', 'FA', '2026-11-11 23:50:50', '2026-11-11 23:50:50'),
    (22, 20, 'Local de demonstração 22', 'Propriedade rural', 'faewfaf', 'RS', '2026-11-12 00:11:55', '2026-11-12 00:11:55');

INSERT INTO simulations (id, user_id, location_id, scenario_id, waste_type_id, people_quantity, daily_waste_kg, average_temperature, glp_consumption_kg, glp_monthly_cost, implementation_cost, created_at, updated_at) VALUES
    (1, 4, 1, NULL, 1, 32414, '12446.98', NULL, '41414.00', '41414.00', '414.00', '2026-11-06 15:27:57', '2026-11-06 15:27:57'),
    (2, 4, 2, NULL, 1, 1414, '542.98', NULL, '1414.00', '1414.00', '141.00', '2026-11-06 15:28:35', '2026-11-06 15:28:35'),
    (11, 20, 11, NULL, 1, 143432, '55077.89', NULL, '12311.00', '13131.00', '313131.00', '2026-11-11 23:50:50', '2026-11-11 23:50:50'),
    (22, 20, 22, NULL, 6, 12, '4.61', NULL, '15441.00', '123124.00', '14144.00', '2026-11-12 00:11:55', '2026-11-12 00:11:55');

INSERT INTO simulation_results (id, simulation_id, estimated_biogas_m3, estimated_energy_kwh, monthly_saving, annual_saving, payback_months, efficiency_level, created_at, updated_at) VALUES
    (1, 1, '1020.65', '6123.91', '14241.66', '170899.88', '0.03', NULL, '2026-11-06 15:27:57', '2026-11-06 15:27:57'),
    (2, 2, '44.52', '267.14', '621.27', '7455.19', '0.23', NULL, '2026-11-06 15:28:35', '2026-11-06 15:28:35'),
    (11, 11, '4516.39', '27098.32', '13131.00', '157572.00', '23.85', NULL, '2026-11-11 23:50:50', '2026-11-11 23:50:50'),
    (22, 22, '571.39', '3428.35', '63574.69', '762896.27', '0.22', NULL, '2026-11-12 00:11:55', '2026-11-12 00:11:55');

INSERT INTO reports (id, user_id, simulation_id, title, generated_at) VALUES
    (1, 4, 1, 'Relatório da simulação 1', '2026-11-06 15:28:11'),
    (6, 20, 11, 'Relatório da simulação 11', '2026-11-11 23:51:20'),
    (9, 20, 22, 'Relatório da simulação 22', '2026-11-12 00:13:21');

INSERT INTO location_images (id, location_id, image_path, alt_text, position, created_at) VALUES
    (5, 22, 'uploads/locations/e56ba988483286ab5da53cb7a45d6885.jpg', NULL, 0, '2026-11-12 00:12:28'),
    (6, 22, 'uploads/locations/01b8de990df3e52a6d3014ccc5cff31d.jpg', NULL, 0, '2026-11-12 00:12:28'),
    (7, 11, 'uploads/locations/6dce20181a7127a87db1d9ad7035c2e3.jpg', NULL, 0, '2026-11-12 00:12:36'),
    (8, 11, 'uploads/locations/74fc73120ede91adacbb258911017507.jpg', NULL, 0, '2026-11-12 00:12:36'),
    (9, 22, 'uploads/locations/8639f7d38e7ae7e8d2c3f6872872a1d5.jpg', NULL, 0, '2026-11-12 00:13:06');

COMMIT;

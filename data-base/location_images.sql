-- Fotos dos locais vinculados às simulações; preserva registros existentes.
CREATE TABLE IF NOT EXISTS location_images (
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

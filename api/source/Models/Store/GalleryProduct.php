<?php

namespace Source\Models\Store;

use PDO;
use Source\Core\Connect;

class GalleryProduct
{
    public function listByUser(int $userId): array
    {
        $stmt = Connect::getInstance()->prepare(
            'SELECT id, name, created_at FROM products WHERE user_id = :user_id ORDER BY id DESC'
        );
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findForUser(int $id, int $userId): array|false
    {
        $stmt = Connect::getInstance()->prepare(
            'SELECT id, name, created_at FROM products WHERE id = :id AND user_id = :user_id LIMIT 1'
        );
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(int $userId, string $name): int
    {
        $stmt = Connect::getInstance()->prepare(
            'INSERT INTO products (user_id, name) VALUES (:user_id, :name)'
        );
        $stmt->execute(['user_id' => $userId, 'name' => $name]);
        return (int) Connect::getInstance()->lastInsertId();
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = Connect::getInstance()->prepare(
            'DELETE FROM products WHERE id = :id AND user_id = :user_id'
        );
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->rowCount() > 0;
    }
}

<?php

namespace Source\Models;

use PDO;
use Source\Core\Model;
use Source\Core\Connect;
use Source\Core\JWTToken;

class User extends Model
{
    private ?int $id;
    private ?int $userTypeId;
    private ?string $name;
    private ?string $email;
    private ?string $password;
    private ?string $photo;
    private ?int $active;

    private ?int $termsAccepted;
    private ?int $newsletter;

    private ?string $token = null;

    public function __construct(
        ?int $id = null,
        ?int $typeId = null,
        ?string $name = null,
        ?string $email = null,
        ?string $password = null,
        ?string $photo = null,
        ?int $termsAccepted = null,
        ?int $newsletter = null
    ) {
        $this->id = $id;
        $this->userTypeId = $typeId;
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->photo = $photo;
        $this->termsAccepted = $termsAccepted;
        $this->newsletter = $newsletter;

        $this->table = 'users';
        $this->primaryKey = 'id';

        $this->fillable = [
            'userTypeId',
            'name',
            'email',
            'password',
            'photo',
            'termsAccepted',
            'newsletter'
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getUserTypeId(): ?int
    {
        return $this->userTypeId;
    }

    public function setUserTypeId(?int $userTypeId): void
    {
        $this->userTypeId = $userTypeId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): void
    {
        $this->email = $email;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): void
    {
        $this->password = $password;
    }

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(?string $photo): void
    {
        $this->photo = $photo;
    }

    public function getTermsAccepted(): ?int
    {
        return $this->termsAccepted;
    }

    public function setTermsAccepted(?int $termsAccepted): void
    {
        $this->termsAccepted = $termsAccepted;
    }

    public function getNewsletter(): ?int
    {
        return $this->newsletter;
    }

    public function setNewsletter(?int $newsletter): void
    {
        $this->newsletter = $newsletter;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function insert(): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $this->errorMessage = "E-mail já cadastrado.";
            return false;
        }

        $this->password = password_hash(
            $this->password,
            PASSWORD_DEFAULT
        );

        if (!parent::insert()) {
            return false;
        }

        return true;
    }

    public function login(
        string $email,
        string $password,
        int $typeId = 2
    ): bool {
        $query = "SELECT * FROM {$this->table}
                  WHERE email = :email
                  AND user_type_id = :typeId
                  AND active = 1";

        $stmt = Connect::getInstance()->prepare($query);

        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":typeId", $typeId);

        $stmt->execute();

        if ($stmt->rowCount() == 0) {
            $this->errorMessage = "E-mail não cadastrado.";
            return false;
        }

        $user = $stmt->fetch();

        if (!password_verify($password, $user->password)) {
            $this->errorMessage = "Senha incorreta.";
            return false;
        }

        $this->id = $user->id;
        $this->userTypeId = $user->user_type_id;
        $this->name = $user->name;
        $this->email = $user->email;
        $this->photo = $user->photo;
        $this->active = (int) $user->active;

        $jwt = new JWTToken();

        $this->token = $jwt->encode([
            "id" => $user->id,
            "name" => $user->name,
            "email" => $user->email,
            "type_id" => $user->user_type_id
        ]);

        return true;
    }

    public function permissionVerify(string $email, $typeId): bool
    {
        $query = "SELECT * FROM {$this->table}
                  WHERE email = :email
                  AND user_type_id = :typeId
                  AND active = 1";

        $stmt = Connect::getInstance()->prepare($query);

        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":typeId", $typeId);

        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    public function permissionVerifyId(int $id, int $typeId): bool
    {
        $stmt = Connect::getInstance()->prepare("SELECT id FROM {$this->table} WHERE id=:id AND user_type_id=:type_id AND active=1 LIMIT 1");
        $stmt->execute([':id' => $id, ':type_id' => $typeId]);
        return (bool)$stmt->fetch();
    }

    public function updateProfile(
        int $id,
        string $name,
        string $email,
        ?string $currentPassword = null,
        ?string $newPassword = null,
        int $typeId = 2
    ): bool {
        try {
            $query = "SELECT password, photo FROM {$this->table} WHERE id = :id AND user_type_id = :type_id AND active = 1 LIMIT 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->bindValue(":type_id", $typeId, PDO::PARAM_INT);
            $stmt->execute();
            $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$currentUser) {
                $this->errorMessage = "Perfil não encontrado.";
                return false;
            }

            $query = "SELECT id FROM {$this->table} WHERE email = :email AND id <> :id LIMIT 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":email", $email);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            if ($stmt->fetch(PDO::FETCH_ASSOC)) {
                $this->errorMessage = "Este e-mail já está cadastrado.";
                return false;
            }

            if ($currentPassword !== null || $newPassword !== null) {
                if ($currentPassword === null || $newPassword === null || strlen($newPassword) < 8) {
                    $this->errorMessage = "Informe a senha atual e uma nova senha com pelo menos 8 caracteres.";
                    return false;
                }

                if (!password_verify($currentPassword, $currentUser["password"])) {
                    $this->errorMessage = "A senha atual está incorreta.";
                    return false;
                }
            }

            $params = [
                ":name" => $name,
                ":email" => $email,
                ":id" => $id,
                ":type_id" => $typeId,
            ];
            $setParts = ["name = :name", "email = :email"];
            if ($newPassword !== null) {
                $setParts[] = "password = :password";
                $params[":password"] = password_hash($newPassword, PASSWORD_DEFAULT);
            }

            $query = "UPDATE {$this->table} SET " . implode(", ", $setParts) . " WHERE id = :id AND user_type_id = :type_id AND active = 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute($params);

            $this->id = $id;
            $this->userTypeId = $typeId;
            $this->name = $name;
            $this->email = $email;
            $this->photo = $currentUser["photo"];
            $this->token = (new JWTToken())->encode([
                "id" => $id,
                "name" => $name,
                "email" => $email,
                "type_id" => $typeId,
            ]);

            return true;
        } catch (\PDOException $exception) {
            $this->errorMessage = (string)$exception->getCode() === "23000"
                ? "Este e-mail já está cadastrado."
                : "Não foi possível atualizar o perfil.";
            return false;
        }
    }

    public function selectProfile(int $id): ?array
    {
        $stmt = Connect::getInstance()->prepare("SELECT id, name, email, photo, user_type_id, created_at FROM {$this->table} WHERE id=:id AND user_type_id=2 AND active=1 LIMIT 1");
        $stmt->execute([':id' => $id]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        return $profile ?: null;
    }
    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(?int $active): void
    {
        $this->active = $active;
    }

    public function updatePhoto(int $id, string $photo, int $typeId = 2): bool
    {
        try {
            $query = "UPDATE {$this->table} SET photo = :photo WHERE id = :id AND user_type_id = :type_id AND active = 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":photo", $photo);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->bindValue(":type_id", $typeId, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() !== 1) {
                $this->errorMessage = "Perfil não encontrado ou foto não alterada.";
                return false;
            }

            $this->id = $id;
            $this->photo = $photo;
            return true;
        } catch (\PDOException $exception) {
            $this->errorMessage = "Não foi possível atualizar a foto do perfil.";
            return false;
        }
    }

    public function listManaged(int $typeId): array
    {
        $stmt = Connect::getInstance()->prepare("SELECT id, user_type_id, name, email, photo, active, created_at, updated_at FROM users WHERE user_type_id = :type_id AND active = 1 ORDER BY created_at DESC");
        $stmt->execute([':type_id' => $typeId]);
        return $stmt->fetchAll();
    }

    public function updateManaged(int $id, string $name, string $email): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare("SELECT id FROM users WHERE email = :email AND id <> :id LIMIT 1");
            $stmt->execute([':email' => $email, ':id' => $id]);
            if ($stmt->fetch()) {
                $this->errorMessage = "Este e-mail já está cadastrado.";
                return false;
            }
            $stmt = Connect::getInstance()->prepare("UPDATE users SET name = :name, email = :email WHERE id = :id AND active = 1");
            $stmt->execute([':name' => $name, ':email' => $email, ':id' => $id]);
            return true;
        } catch (\PDOException $exception) {
            $this->errorMessage = "Não foi possível atualizar a conta.";
            return false;
        }
    }
}

<?php

namespace Source\Controller;

use Source\Models\User;
use Source\Support\Upload;

class Users extends Api
{
    public function register(array $data): void
{
    $name = trim($data["name"] ?? "");
    $email = trim($data["email"] ?? "");
    $password = $data["password"] ?? "";
    $passwordConfirm = $data["password_confirm"] ?? "";

    if (
        empty($name) &&
        empty($email) &&
        empty($password) &&
        empty($passwordConfirm)
    ) {
        $this->call(
            400,
            "bad_request",
            "Os campos obrigatórios estão vazios.",
            "error"
        )->back();

        return;
    }

    if (empty($name)) {
        $this->call(
            400,
            "bad_request",
            "O campo nome está vazio.",
            "error"
        )->back();

        return;
    }

    if (empty($email)) {
        $this->call(
            400,
            "bad_request",
            "O campo e-mail está vazio.",
            "error"
        )->back();

        return;
    }

    if (empty($password)) {
        $this->call(
            400,
            "bad_request",
            "O campo senha está vazio.",
            "error"
        )->back();

        return;
    }

    if (empty($passwordConfirm)) {
        $this->call(
            400,
            "bad_request",
            "O campo confirmar senha está vazio.",
            "error"
        )->back();

        return;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->call(
            400,
            "bad_request",
            "O e-mail informado é inválido.",
            "error"
        )->back();

        return;
    }

    if ($password !== $passwordConfirm) {
        $this->call(
            400,
            "bad_request",
            "As senhas informadas não coincidem.",
            "error"
        )->back();

        return;
    }

    if (
        strlen($password) < 8 ||
        !preg_match('/[A-Za-z]/', $password) ||
        !preg_match('/[0-9]/', $password)
    ) {
        $this->call(
            400,
            "bad_request",
            "A senha deve ter no mínimo 8 caracteres, contendo letras e números.",
            "error"
        )->back();

        return;
    }

    if (!isset($data["terms"])) {
        $this->call(
            400,
            "bad_request",
            "Você deve aceitar os Termos de Uso.",
            "error"
        )->back();

        return;
    }

    $termsAccepted = 1;

    $newsletter = isset($data["newsletter"]) ? 1 : 0;

    $user = new User(
        null,
        2,
        $name,
        $email,
        $password,
        null,
        $termsAccepted,
        $newsletter
    );

    if (!$user->insert()) {
        $this->call(
            500,
            "internal_server_error",
            $user->getErrorMessage(),
            "error"
        )->back();

        return;
    }

    $response = [
        "id" => $user->getId(),
        "name" => $user->getName(),
        "email" => $user->getEmail()
    ];

    $this->call(
        201,
        "success",
        "Usuário cadastrado com sucesso.",
        "success"
    )->back($response);
}

    public function auth(array $data): void
{
    $email = trim($data["email"] ?? "");
    $password = $data["password"] ?? "";

    if (empty($email) && empty($password)) {
        $this->call(
            400,
            "bad_request",
            "Os campos e-mail e senha estão vazios.",
            "error"
        )->back();

        return;
    }

    if (empty($email)) {
        $this->call(
            400,
            "bad_request",
            "O campo e-mail está vazio.",
            "error"
        )->back();

        return;
    }

    if (empty($password)) {
        $this->call(
            400,
            "bad_request",
            "O campo senha está vazio.",
            "error"
        )->back();

        return;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->call(
            400,
            "bad_request",
            "O e-mail informado é inválido.",
            "error"
        )->back();

        return;
    }

    $user = new User();

    if (!$user->login($email, $password)) {
        $this->call(
            401,
            "unauthorized",
            $user->getErrorMessage(),
            "error"
        )->back();

        return;
    }

    $response = [
        "id" => $user->getId(),
        "name" => $user->getName(),
        "photo" => $user->getPhoto(),
        "type_id" => $user->getUserTypeId(),
        "token" => $user->getToken(),
    ];

    $this->call(
        200,
        "success",
        "Usuário logado com sucesso.",
        "success"
    )->back($response);
}

    public function authAdmin (array $data): void
    {
        if(!isset($data['email'], $data['password']) ||
            empty($data['email']) || empty($data['password']) ||
            !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios. O e-mail deve ser válido.",
                "error")->back();
            return;
        }

        $user = new User();
        if(!$user->login($data['email'], $data['password'], 1)) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error")->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "name" => $user->getName(),
            "photo" => $user->getPhoto(),
            "type_id" => $user->getUserTypeId(),
            "token" => $user->getToken(),
        ];

        $this->call(
            200,
            "success",
            "Usuário logado com sucesso",
            "success")->back($response);
    }

    public function update (array $data): void
    {
        $this->saveProfile($data, 2);
    }

    private function saveProfile(array $data, int $typeId): void
    {
        if (!$this->authToken($typeId)) {
            $this->call(
                401,
                "unauthorized",
                "Usuário não está autenticado (sem token ou token inválido).",
                "error"
            )->back();
            return;
        }

        $name = isset($data["name"]) && is_string($data["name"]) ? trim($data["name"]) : "";
        $email = isset($data["email"]) && is_string($data["email"]) ? trim($data["email"]) : "";
        if ($name === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->call(400, "bad_request", "Informe um nome e um e-mail válido.", "error")->back();
            return;
        }
        if (mb_strlen($name) > 100 || mb_strlen($email) > 150) {
            $this->call(400, "bad_request", "Use até 100 caracteres no nome e 150 no e-mail.", "error")->back();
            return;
        }

        $passwordFieldsProvided = array_key_exists("current_password", $data) || array_key_exists("new_password", $data);
        $currentPassword = null;
        $newPassword = null;
        if ($passwordFieldsProvided) {
            $currentPassword = $data["current_password"] ?? null;
            $newPassword = $data["new_password"] ?? null;
            if (!is_string($currentPassword) || $currentPassword === "" ||
                !is_string($newPassword) || strlen($newPassword) < 8) {
                $this->call(400, "bad_request", "Informe a senha atual e uma nova senha com pelo menos 8 caracteres.", "error")->back();
                return;
            }
            if (!preg_match('/[A-Za-z]/', $newPassword) || !preg_match('/[0-9]/', $newPassword)) {
                $this->call(400, "bad_request", "A nova senha deve conter letras e números.", "error")->back();
                return;
            }
        }

        $user = new User();
        if (!$user->updateProfile($this->userAuthId, $name, $email, $currentPassword, $newPassword, $typeId)) {
            $message = $user->getErrorMessage() ?? "Não foi possível atualizar o perfil.";
            $code = match ($message) {
                "Perfil não encontrado." => 404,
                "Este e-mail já está cadastrado." => 409,
                "A senha atual está incorreta." => 400,
                default => 500,
            };
            $status = match ($code) {
                400 => "bad_request",
                404 => "not_found",
                409 => "conflict",
                default => "internal_server_error",
            };
            $this->call($code, $status, $message, "error")->back();
            return;
        }

        $this->call(200, "success", "Perfil atualizado com sucesso.", "success")->back([
            "id" => $user->getId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $this->photoUrl($user->getPhoto()),
            "token" => $user->getToken(),
        ]);
    }

    public function me(array $data): void
    {
        $this->loadProfile(2);
    }

    public function meAdmin(array $data): void
    {
        $this->loadProfile(1);
    }

    private function loadProfile(int $typeId): void
    {
        if (!$this->authToken($typeId)) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, "not_found", "Perfil não encontrado.", "error")->back();
            return;
        }

        $this->call(200, "success", "Perfil carregado com sucesso.", "success")->back([
            "id" => $user->getId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $this->photoUrl($user->getPhoto()),
        ]);
    }

    public function updateAdmin (array $data): void
    {
        $this->saveProfile($data, 1);
    }

    // Valida somente Nome e Email, mas pode ser alterada para validar mais campos
    private function validateNameEmail(array $data): bool
    {
        if(!isset($data["name"],$data["email"]) ||
            empty($data["name"]) || empty($data["email"]) ||
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
            return false;
        }
        return true;
    }
    public function uploadPhoto (array $data): void
    {
        $this->savePhoto(2);
    }

    public function uploadPhotoAdmin(array $data): void
    {
        $this->savePhoto(1);
    }

    private function savePhoto(int $typeId): void
    {
        if (!$this->authToken($typeId)) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        if (!isset($_FILES["photo"]) || !is_array($_FILES["photo"])) {
            $this->call(400, "bad_request", "Selecione uma imagem para enviar.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, "not_found", "Perfil não encontrado.", "error")->back();
            return;
        }
        $oldPhoto = $user->getPhoto();

        $uploadDirectory = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "users";
        $uploader = new Upload($uploadDirectory);
        try {
            $filename = $uploader->image($_FILES["photo"]);
        } catch (\RuntimeException $exception) {
            $this->call(400, "bad_request", $exception->getMessage(), "error")->back();
            return;
        }

        $photoPath = "uploads/users/" . $filename;
        $photoUrl = $this->photoUrl($photoPath);
        if (!$user->updatePhoto($this->userAuthId, $photoPath, $typeId)) {
            $savedPath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
            if (is_file($savedPath) && !unlink($savedPath)) {
                error_log("Não foi possível remover a foto enviada após falha ao atualizar o perfil.");
            }
            $this->call(500, "internal_server_error", $user->getErrorMessage() ?? "Não foi possível atualizar a foto.", "error")->back();
            return;
        }

        $this->deletePreviousPhoto($oldPhoto, $uploadDirectory);

        $this->call(200, "success", "Foto atualizada com sucesso.", "success")->back([
            "photo" => $photoUrl,
        ]);
    }

    public function listManaged(array $data): void
    {
        if (!$this->authorizeManagement($data)) return;
        $this->call(200, "success", "Contas carregadas com sucesso.", "success")
            ->back((new User())->listManaged((int)$data['type_id']));
    }

    public function registerAdmin(array $data): void
    {
        $data['type_id'] = 1;
        $this->insertManaged($data);
    }

    public function insertManaged(array $data): void
    {
        if (!$this->authorizeManagement($data)) return;
        if (!$this->validManagedAccount($data)) return;
        $password = $data['password'] ?? '';
        if (!is_string($password) || strlen($password) < 8 ||
            !preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
            $this->call(400, "bad_request", "A senha deve ter pelo menos 8 caracteres, com letras e números.", "error")->back();
            return;
        }
        $user = new User(null, (int)$data['type_id'], trim($data['name']), trim($data['email']), $password, null, 1, 0);
        if (!$user->insert()) {
            $code = $user->getErrorMessage() === 'E-mail já cadastrado.' ? 409 : 500;
            $this->call($code, $code === 409 ? 'conflict' : 'internal_server_error', $user->getErrorMessage(), 'error')->back();
            return;
        }
        $this->call(201, 'success', 'Conta cadastrada com sucesso.', 'success')->back([
            'id' => $user->getId(), 'name' => $user->getName(), 'email' => $user->getEmail()
        ]);
    }

    public function updateManaged(array $data): void
    {
        if (!$this->authorizeManagement($data)) return;
        if (!$this->validManagedAccount($data)) return;
        $user = $this->managedAccount($data);
        if (!$user) return;
        if (!$user->updateManaged($user->getId(), trim($data['name']), trim($data['email']))) {
            $code = $user->getErrorMessage() === 'Este e-mail já está cadastrado.' ? 409 : 500;
            $this->call($code, $code === 409 ? 'conflict' : 'internal_server_error', $user->getErrorMessage(), 'error')->back();
            return;
        }
        $this->call(200, 'success', 'Conta atualizada com sucesso.', 'success')->back([
            'id' => $user->getId(), 'name' => trim($data['name']), 'email' => trim($data['email'])
        ]);
    }

    public function deleteManaged(array $data): void
    {
        if (!$this->authorizeManagement($data)) return;
        $user = $this->managedAccount($data);
        if (!$user) return;
        if ($user->getId() === $this->userAuthId) {
            $this->call(400, 'bad_request', 'Você não pode excluir a própria conta administrativa.', 'error')->back();
            return;
        }
        if (!$user->softDeleteById($user->getId())) {
            $this->call(500, 'internal_server_error', $user->getErrorMessage(), 'error')->back();
            return;
        }
        $this->call(200, 'success', 'Conta excluída com sucesso.', 'success')->back();
    }

    private function authorizeManagement(array $data): bool
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Token de autenticação inválido ou expirado.', 'error')->back();
            return false;
        }
        if (!in_array((string)($data['type_id'] ?? ''), ['1', '2'], true)) {
            $this->call(400, 'bad_request', 'Tipo de conta inválido.', 'error')->back();
            return false;
        }
        return true;
    }

    private function validManagedAccount(array $data): bool
    {
        if (!isset($data['name'], $data['email']) || !is_string($data['name']) || !is_string($data['email']) ||
            trim($data['name']) === '' || !filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL) ||
            mb_strlen(trim($data['name'])) > 100 || mb_strlen(trim($data['email'])) > 150) {
            $this->call(400, 'bad_request', 'Informe nome (até 100 caracteres) e e-mail válido (até 150 caracteres).', 'error')->back();
            return false;
        }
        return true;
    }

    private function managedAccount(array $data): ?User
    {
        $id = filter_var($data['user_id'] ?? null, FILTER_VALIDATE_INT);
        $user = new User();
        if (!$id || !$user->selectById($id) || $user->getActive() !== 1 || $user->getUserTypeId() !== (int)$data['type_id']) {
            $this->call(404, 'not_found', 'Conta não encontrada.', 'error')->back();
            return null;
        }
        return $user;
    }

    private function photoUrl(?string $photoPath): ?string
    {
        if ($photoPath === null || trim($photoPath) === "") {
            return null;
        }

        if (filter_var($photoPath, FILTER_VALIDATE_URL)) {
            return $photoPath;
        }

        return url(ltrim($photoPath, "/"));
    }

    private function deletePreviousPhoto(?string $photoUrl, string $uploadDirectory): void
    {
        if ($photoUrl === null || $photoUrl === "") {
            return;
        }

        $photoPath = parse_url($photoUrl, PHP_URL_PATH);
        $uploadsUrlPath = parse_url(url("uploads/users/"), PHP_URL_PATH);
        if (!is_string($photoPath) || !is_string($uploadsUrlPath)) {
            return;
        }

        $normalizedPath = ltrim($photoPath, "/");
        $managedPrefixes = ["uploads/users/", ltrim(rtrim($uploadsUrlPath, "/") . "/", "/")];
        $filename = null;
        foreach ($managedPrefixes as $managedPrefix) {
            if ($managedPrefix !== "" && str_starts_with($normalizedPath, $managedPrefix)) {
                $candidate = substr($normalizedPath, strlen($managedPrefix));
                if (preg_match('/\A[a-f0-9]{32}\.(?:jpg|png|webp)\z/', $candidate)) {
                    $filename = $candidate;
                    break;
                }
            }
        }

        if ($filename === null) {
            return;
        }

        $oldFilePath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
        if (is_file($oldFilePath) && !unlink($oldFilePath)) {
            error_log("Não foi possível remover a foto antiga do perfil.");
        }
    }

}

<?php

namespace Source\Controller;

use Source\Models\Store\WasteType;

class WasteTypes extends Api
{
    public function listAll(array $data): void
    {
        if (!$this->authorizeRead()) return;
        $this->call(200, 'success', 'Lista de tipos de resíduo', 'success')
            ->back((new WasteType())->selectAll(['active = 1']));
    }

    public function listById(array $data): void
    {
        if (!$this->authorizeRead()) return;
        $waste = $this->find($data);
        if ($waste) $this->call(200, 'success', 'Tipo de resíduo encontrado.', 'success')->back($this->toArray($waste));
    }

    public function insert(array $data): void
    {
        if (!$this->authorizeWrite() || !$this->validate($data)) return;
        $waste = new WasteType(null, trim($data['name']), trim($data['description']), (float)$data['estimated_yield']);
        if (!$waste->insert()) {
            $this->call(500, 'internal_server_error', $waste->getErrorMessage(), 'error')->back();
            return;
        }
        $waste->selectById($waste->getId());
        $this->call(201, 'success', 'Tipo de resíduo cadastrado com sucesso.', 'success')->back($this->toArray($waste));
    }

    public function update(array $data): void
    {
        if (!$this->authorizeWrite() || !$this->validate($data)) return;
        $waste = $this->find($data);
        if (!$waste) return;
        $unchanged = $waste->getName() === trim($data['name']) && $waste->getDescription() === trim($data['description']) &&
            (float)$waste->getEstimatedYield() === (float)$data['estimated_yield'];
        $waste->setName(trim($data['name']));
        $waste->setDescription(trim($data['description']));
        $waste->setEstimatedYield((float)$data['estimated_yield']);
        if (!$unchanged && !$waste->updateById($waste->getId())) {
            $this->call(500, 'internal_server_error', $waste->getErrorMessage(), 'error')->back();
            return;
        }
        $this->call(200, 'success', 'Tipo de resíduo atualizado com sucesso.', 'success')->back($this->toArray($waste));
    }

    public function delete(array $data): void
    {
        if (!$this->authorizeWrite()) return;
        $waste = $this->find($data);
        if (!$waste) return;
        if (!$waste->softDeleteById($waste->getId())) {
            $this->call(500, 'internal_server_error', $waste->getErrorMessage(), 'error')->back();
            return;
        }
        $this->call(200, 'success', 'Tipo de resíduo excluído com sucesso.', 'success')->back();
    }

    public function validate(array $data): bool
    {
        if (!isset($data['name'], $data['description'], $data['estimated_yield']) ||
            !is_string($data['name']) || !is_string($data['description']) ||
            trim($data['name']) === '' || trim($data['description']) === '' ||
            !is_numeric($data['estimated_yield']) || !is_finite((float)$data['estimated_yield']) ||
            round((float)$data['estimated_yield'], 4) <= 0 || (float)$data['estimated_yield'] > 999999.9999) {
            $this->call(400, 'bad_request', 'Informe nome, descrição e rendimento estimado maior que zero.', 'error')->back();
            return false;
        }
        return true;
    }

    private function find(array $data): ?WasteType
    {
        $id = filter_var($data['waste_type_id'] ?? null, FILTER_VALIDATE_INT);
        $waste = new WasteType();
        if (!$id || !$waste->selectById($id) || $waste->getActive() !== 1) {
            $this->call(404, 'not_found', 'Tipo de resíduo não encontrado.', 'error')->back();
            return null;
        }
        return $waste;
    }

    private function authorizeRead(): bool
    {
        if ($this->authToken(2) || $this->authToken(1)) return true;
        $this->call(401, 'unauthorized', 'Token de autenticação inválido ou expirado.', 'error')->back();
        return false;
    }

    private function authorizeWrite(): bool
    {
        if ($this->authToken(1)) return true;
        $this->call(401, 'unauthorized', 'Token de autenticação inválido ou expirado.', 'error')->back();
        return false;
    }

    private function toArray(WasteType $waste): array
    {
        return ['id' => $waste->getId(), 'name' => $waste->getName(), 'description' => $waste->getDescription(),
            'estimated_yield' => $waste->getEstimatedYield(), 'active' => $waste->getActive(),
            'created_at' => $waste->getCreatedAt(), 'updated_at' => $waste->getUpdatedAt()];
    }
}

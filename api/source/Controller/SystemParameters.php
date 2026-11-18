<?php

namespace Source\Controller;

use Source\Models\Store\SystemParameter;

class SystemParameters extends Api
{
    public function listById(array $data): void
    {
        if (!$this->authToken(2) && !$this->authToken(1)) {
            $this->unauthorized();
            return;
        }

        $id = filter_var($data['system_parameter_id'] ?? null, FILTER_VALIDATE_INT);
        $parameter = new SystemParameter();
        if (!$id || !$parameter->selectById($id) || (int)$parameter->getActive() !== 1) {
            $this->call(404, 'not_found', 'Parâmetro não encontrado.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Parâmetro encontrado.', 'success')->back($this->toArray($parameter));
    }

    public function listAll(array $data): void
    {
        if (!$this->authToken(2) && !$this->authToken(1)) {
            $this->unauthorized();
            return;
        }

        $parameters = (new SystemParameter())->selectAll(['active = 1'], 'name', 'ASC');
        $this->call(200, 'success', 'Parâmetros do sistema', 'success')->back($parameters);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->unauthorized();
            return;
        }
        if (!$this->valid($data)) {
            $this->call(400, 'bad_request', 'Informe nome, valor numérico, unidade e descrição do parâmetro.', 'error')->back();
            return;
        }

        $parameter = $this->newParameter($data);
        if (!$parameter->insert()) {
            $this->call(500, 'internal_server_error', $parameter->getErrorMessage(), 'error')->back();
            return;
        }

        $this->call(201, 'success', 'Parâmetro cadastrado com sucesso.', 'success')->back($this->toArray($parameter));
    }

    public function update(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->unauthorized();
            return;
        }

        $id = filter_var($data['system_parameter_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || !$this->valid($data)) {
            $this->call(400, 'bad_request', 'Informe um ID e dados válidos para atualizar o parâmetro.', 'error')->back();
            return;
        }

        $parameter = new SystemParameter();
        if (!$parameter->selectById($id) || $parameter->getActive() !== 1) {
            $this->call(404, 'not_found', 'Parâmetro não encontrado.', 'error')->back();
            return;
        }
        if ($parameter->getName() !== trim($data['name'])) {
            $this->call(400, 'bad_request', 'O nome do parâmetro é usado pelo sistema e não pode ser alterado.', 'error')->back();
            return;
        }
        if (in_array($parameter->getName(), ['waste_per_person', 'biogas_yield', 'biogas_energy_conversion', 'glp_energy_conversion'], true) &&
            (round((float)$data['value'], 4) <= 0 || (isset($data['active']) && (int)$data['active'] !== 1))) {
            $this->call(400, 'bad_request', 'O valor deste parâmetro deve ser maior que zero.', 'error')->back();
            return;
        }
        $unchanged = (float)$parameter->getValue() === (float)$data['value'] &&
            $parameter->getUnit() === trim($data['unit']) && $parameter->getDescription() === trim($data['description']) &&
            $parameter->getActive() === (isset($data['active']) ? (int)$data['active'] : 1);
        $parameter = $this->newParameter($data);
        if (!$unchanged && !$parameter->updateById($id)) {
            $this->call(404, 'not_found', $parameter->getErrorMessage(), 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Parâmetro atualizado com sucesso.', 'success')->back([
            'id' => $id,
            'name' => trim($data['name']),
            'value' => (float)$data['value'],
            'unit' => trim($data['unit']),
            'description' => trim($data['description']),
            'active' => $parameter->getActive()
        ]);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->unauthorized();
            return;
        }

        $id = filter_var($data['system_parameter_id'] ?? null, FILTER_VALIDATE_INT);
        $parameter = new SystemParameter();
        if (!$id || !$parameter->softDeleteById($id)) {
            $this->call(404, 'not_found', $parameter->getErrorMessage() ?: 'Parâmetro não encontrado.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Parâmetro desativado com sucesso.', 'success')->back();
    }

    private function valid(array $data): bool
    {
        return isset($data['name'], $data['value'], $data['unit'], $data['description'])
            && trim((string)$data['name']) !== ''
            && is_numeric($data['value'])
            && is_finite((float)$data['value'])
            && abs((float)$data['value']) <= 999999.9999
            && trim((string)$data['unit']) !== ''
            && trim((string)$data['description']) !== '';
    }

    private function newParameter(array $data): SystemParameter
    {
        return new SystemParameter(
            null,
            trim($data['name']),
            (float)$data['value'],
            trim($data['unit']),
            trim($data['description']),
            isset($data['active']) ? (int)$data['active'] : 1
        );
    }

    private function toArray(SystemParameter $parameter): array
    {
        return [
            'id' => $parameter->getId(),
            'name' => $parameter->getName(),
            'value' => $parameter->getValue(),
            'unit' => $parameter->getUnit(),
            'description' => $parameter->getDescription(),
            'active' => $parameter->getActive(),
            'created_at' => $parameter->getCreatedAt(),
            'updated_at' => $parameter->getUpdatedAt()
        ];
    }

    private function unauthorized(): void
    {
        $this->call(401, 'unauthorized', 'Token de autenticação inválido ou expirado.', 'error')->back();
    }
}

<?php

namespace Source\Controller;

use Source\Core\Connect;
use Source\Models\Store\Location;
use Source\Models\Store\Simulation;
use Source\Models\Store\SimulationResult;
use Source\Models\Store\SystemParameter;
use Source\Models\Store\WasteType;

class Simulations extends Api

{
    public function listAll(array $data): void
    {
        $this->listForRole(2);
    }

    public function listAdmin(array $data): void
    {
        $this->listForRole(1);
    }

    private function listForRole(int $typeId): void
    {
        if (!$this->authToken($typeId)) {
            $this->unauthorized();
            return;
        }

        $this->call(200, 'success', 'Lista de simulações', 'success')
            ->back((new Simulation())->listByUser($typeId === 1 ? null : $this->userAuthId));
    }

    public function listById(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->unauthorized();
            return;
        }

        $id = filter_var($data['simulation_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id) {
            $this->call(400, 'bad_request', 'ID da simulação inválido.', 'error')->back();
            return;
        }

        $simulation = (new Simulation())->findForUser($id, $this->userAuthId);
        if (!$simulation) {
            $this->call(404, 'not_found', 'Simulação não encontrada.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Simulação encontrada.', 'success')->back($simulation);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->unauthorized();
            return;
        }

        $required = [
            'location_name' => 'nome do local',
            'location_type' => 'tipo do local',
            'city' => 'cidade',
            'state' => 'estado',
            'people_quantity' => 'quantidade de pessoas',
            'waste_type_id' => 'tipo de resíduo',
            'glp_consumption_kg' => 'consumo mensal de GLP',
            'glp_monthly_cost' => 'custo mensal de GLP',
            'implementation_cost' => 'custo de implantação'
        ];

        foreach ($required as $field => $label) {
            if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
                $this->call(400, 'bad_request', "O campo {$label} está vazio.", 'error')->back();
                return;
            }
        }

        foreach (['people_quantity', 'glp_consumption_kg', 'glp_monthly_cost', 'implementation_cost'] as $field) {
            if (!is_numeric($data[$field]) || !is_finite((float)$data[$field]) || (float)$data[$field] < 0) {
                $this->call(400, 'bad_request', "O campo {$required[$field]} deve ser numérico e não negativo.", 'error')->back();
                return;
            }
        }

        if (filter_var($data['people_quantity'], FILTER_VALIDATE_INT) === false || (int)$data['people_quantity'] < 1) {
            $this->call(400, 'bad_request', 'A quantidade de pessoas deve ser um inteiro maior que zero.', 'error')->back();
            return;
        }

        if (strlen(trim((string)$data['state'])) !== 2) {
            $this->call(400, 'bad_request', 'O estado deve ser informado com a sigla de duas letras.', 'error')->back();
            return;
        }

        $parameters = [];
        foreach ((new SystemParameter())->selectAll(['active = 1']) as $parameter) {
            $parameters[$parameter->name] = (float)$parameter->value;
        }

        foreach (['waste_per_person', 'biogas_energy_conversion', 'glp_energy_conversion'] as $key) {
            if (empty($parameters[$key]) || $parameters[$key] <= 0) {
                $this->call(500, 'configuration_error', 'Os parâmetros necessários para a simulação não estão configurados.', 'error')->back();
                return;
            }
        }

        $wasteTypeId = filter_var($data['waste_type_id'], FILTER_VALIDATE_INT);
        $wasteType = new WasteType();
        if (!$wasteTypeId || !$wasteType->selectById($wasteTypeId) || $wasteType->getActive() !== 1) {
            $this->call(400, 'bad_request', 'Selecione um tipo de resíduo ativo.', 'error')->back();
            return;
        }
        $yield = (float)$wasteType->getEstimatedYield();
        if (!is_finite($yield) || $yield <= 0) {
            $this->call(400, 'bad_request', 'O resíduo selecionado precisa ter um rendimento maior que zero.', 'error')->back();
            return;
        }

        $people = (int)$data['people_quantity'];
        $glpConsumption = (float)$data['glp_consumption_kg'];
        $glpCost = (float)$data['glp_monthly_cost'];
        $implementationCost = (float)$data['implementation_cost'];
        $dailyWaste = $people * $parameters['waste_per_person'];
        $dailyBiogas = $dailyWaste * $yield;
        $dailyEnergy = $dailyBiogas * $parameters['biogas_energy_conversion'];
        $monthlyGlpEquivalent = ($dailyEnergy / $parameters['glp_energy_conversion']) * 30;
        $monthlySaving = min($monthlyGlpEquivalent, $glpConsumption) * ($glpConsumption > 0 ? $glpCost / $glpConsumption : 0);
        $annualSaving = $monthlySaving * 12;
        $payback = $monthlySaving > 0 ? $implementationCost / $monthlySaving : null;

        $pdo = Connect::getInstance();
        try {
            $pdo->beginTransaction();

            $location = new Location(
                null,
                $this->userAuthId,
                trim($data['location_name']),
                trim($data['location_type']),
                trim($data['city']),
                strtoupper(trim($data['state']))
            );
            if (!$location->insert()) {
                throw new \RuntimeException($location->getErrorMessage() ?: 'Não foi possível salvar o local.');
            }

            $simulation = new Simulation(
                null,
                $this->userAuthId,
                $location->getId(),
                null,
                $wasteType->getId(),
                $people,
                $dailyWaste,
                $glpConsumption,
                $glpCost,
                $implementationCost
            );
            if (!$simulation->insert()) {
                throw new \RuntimeException($simulation->getErrorMessage() ?: 'Não foi possível salvar a simulação.');
            }

            $result = new SimulationResult(null, $simulation->getId(), $dailyBiogas, $dailyEnergy, $monthlySaving, $annualSaving, $payback);
            if (!$result->insert()) {
                throw new \RuntimeException($result->getErrorMessage() ?: 'Não foi possível salvar os resultados.');
            }

            $pdo->commit();
            $record = (new Simulation())->findForUser($simulation->getId(), $this->userAuthId);
            $this->call(201, 'success', 'Simulação criada com sucesso.', 'success')->back($record);
        } catch (\Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $this->call(500, 'internal_server_error', $error->getMessage(), 'error')->back();
        }
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->unauthorized();
            return;
        }

        $id = filter_var($data['simulation_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id) {
            $this->call(400, 'bad_request', 'ID da simulação inválido.', 'error')->back();
            return;
        }

        try {
            if (!(new Simulation())->deleteForUser($id, $this->userAuthId)) {
                $this->call(404, 'not_found', 'Simulação não encontrada.', 'error')->back();
                return;
            }
            $this->call(200, 'success', 'Simulação excluída com sucesso.', 'success')->back();
        } catch (\Throwable $error) {
            $this->call(500, 'internal_server_error', 'Não foi possível excluir a simulação.', 'error')->back();
        }
    }

    private function unauthorized(): void
    {
        $this->call(401, 'unauthorized', 'Token de autenticação inválido ou expirado.', 'error')->back();
    }
}

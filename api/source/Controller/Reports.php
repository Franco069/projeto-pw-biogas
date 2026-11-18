<?php

namespace Source\Controller;

use Source\Models\Store\Report;
use Source\Models\Store\Simulation;

class Reports extends Api
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

        $reports = (new Report())->listByUser($typeId === 1 ? null : $this->userAuthId);
        $this->call(200, 'success', 'Lista de relatórios', 'success')->back($reports);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->unauthorized();
            return;
        }

        $simulationId = filter_var($data['simulation_id'] ?? null, FILTER_VALIDATE_INT);
        $title = trim((string)($data['title'] ?? ''));
        if (!$simulationId || $title === '') {
            $this->call(400, 'bad_request', 'Informe uma simulação e o título do relatório.', 'error')->back();
            return;
        }

        if (!(new Simulation())->findForUser($simulationId, $this->userAuthId)) {
            $this->call(404, 'not_found', 'Simulação não encontrada.', 'error')->back();
            return;
        }

        $report = new Report(null, $this->userAuthId, $simulationId, $title);
        if (!$report->insert()) {
            $this->call(500, 'internal_server_error', $report->getErrorMessage(), 'error')->back();
            return;
        }

        $this->call(201, 'success', 'Relatório registrado com sucesso.', 'success')->back([
            'id' => $report->getId(),
            'simulation_id' => $simulationId,
            'title' => $title
        ]);
    }

    private function unauthorized(): void
    {
        $this->call(401, 'unauthorized', 'Token de autenticação inválido ou expirado.', 'error')->back();
    }
}

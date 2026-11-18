<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Store\EnergyConsumption;

class EnergyConsumptions extends Api
{

     public function register(array $data): void
    {
        if(!$this->authToken(2)){
            $this->call(401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error")->back();
            return;
        }
    }

    public function listById(array $data): void
    {
       
        if(!$this->authToken(2)){
            $this->call(401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error")->back();
            return;
        }
    

        if(!isset($data["energy_consumption_id"]) || empty($data["energy_consumption_id"]) || !filter_var($data["energy_consumption_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID do consumo de energia é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $energyConsumption = new EnergyConsumption();
        if(!$energyConsumption->selectById($data["energy_consumption_id"])) {
            $this->call(
                404,
                "not_found",
                "Consumo de energia não encontrado",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $energyConsumption->getId(),
            "location_id" => $energyConsumption->getLocationId(),
            "energy_type" => $energyConsumption->getEnergyType(),
            "monthly_consumption" => $energyConsumption->getMonthlyConsumption(),
            "monthly_cost" => $energyConsumption->getMonthlyCost(),
            "created_at" => $energyConsumption->getCreatedAt(),
            "updated_at" => $energyConsumption->getUpdatedAt()
        ];

        $this->call(200,"success","Consumo de energia encontrado","success")->back($response);
    }

    public function listAll (array $data): void
    {

           if(!$this->authToken(2)){
            $this->call(401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error")->back();
            return;
        }
    

        $energyConsumptions = new EnergyConsumption();
        $this->call(200,"success","Lista de Consumos de Energia","success")->back($energyConsumptions->selectAll());
    }

    public function listPaginator (array $data): void
    {

           if(!$this->authToken(2)){
            $this->call(401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error")->back();
            return;
        }
    

        if(!isset($data["page"]) || !isset($data["per_page"]) ||
            empty($data["page"]) || empty($data["per_page"]) ||
            !filter_var($data["page"], FILTER_VALIDATE_INT) ||
            !filter_var($data["per_page"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "Os campos page e per_page são obrigatórios, devem ser números inteiros e maiores que zero",
                "error"
            )->back(null);
            return;
        }

        $energyConsumptions  = new EnergyConsumption();
        $response = $energyConsumptions->selectPaginator($data["page"], $data["per_page"], [], 'id', 'ASC');
        $this->call(200,"success","Lista de Consumos de Energia com Paginação","success")->back($response);
    }

    public function insert (array $data): void
    {

           if(!$this->authToken(2)){
            $this->call(401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error")->back();
            return;
        }
    

        if(!$this->validate($data)){
            $this->call(
                400,
                "bad_request",
                "Os campos location_id, energy_type, monthly_consumption e monthly_cost são obrigatórios",
                "error"
            )->back();
            return;
        }

        $energyConsumption = new EnergyConsumption(
            null,
            $data["location_id"],
            $data["energy_type"],
            $data["monthly_consumption"],
            $data["monthly_cost"]
        );

        if(!$energyConsumption->insert()){
            $this->call(500, "internal_server_error", $energyConsumption->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "id" => $energyConsumption->getId(),
            "location_id" => $energyConsumption->getLocationId(),
            "energy_type" => $energyConsumption->getEnergyType(),
            "monthly_consumption" => $energyConsumption->getMonthlyConsumption(),
            "monthly_cost" => $energyConsumption->getMonthlyCost(),
            "created_at" => $energyConsumption->getCreatedAt(),
            "updated_at" => $energyConsumption->getUpdatedAt()
        ];

        $this->call(201,"success","Consumo de energia inserido com sucesso","success")->back($response);

    }

    public function update (array $data): void
    {

           if(!$this->authToken(2)){
            $this->call(401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error")->back();
            return;
        }
    

        if(!filter_var($data["energy_consumption_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID do consumo de energia é obrigatório e deve ser um número inteiro",
                "error"
            )->back();
            return;
        }

        if(!$this->validate($data)){
            $this->call(
                400,
                "bad_request",
                "Os campos location_id, energy_type, monthly_consumption e monthly_cost são obrigatórios",
                "error"
            )->back();
            return;
        }

        $energyConsumption = new EnergyConsumption(
            null,
            $data["location_id"],
            $data["energy_type"],
            $data["monthly_consumption"],
            $data["monthly_cost"]
        );

        if(!$energyConsumption->updateById($data["energy_consumption_id"])){
            $this->call(500, "internal_server_error", $energyConsumption->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "id" => $energyConsumption->getId(),
            "location_id" => $energyConsumption->getLocationId(),
            "energy_type" => $energyConsumption->getEnergyType(),
            "monthly_consumption" => $energyConsumption->getMonthlyConsumption(),
            "monthly_cost" => $energyConsumption->getMonthlyCost(),
            "created_at" => $energyConsumption->getCreatedAt(),
            "updated_at" => $energyConsumption->getUpdatedAt()
        ];

        $this->call(200,"success","Consumo de energia atualizado com sucesso","success")->back($response);
    }

    public function delete (array $data): void
    {

           if(!$this->authToken(2)){
            $this->call(401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error")->back();
            return;
        }
    

        if(!filter_var($data["energy_consumption_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID do consumo de energia é obrigatório e deve ser um número inteiro",
                "error"
            )->back();
            return;
        }

        $energyConsumption = new EnergyConsumption();
        if(!$energyConsumption->deleteById($data["energy_consumption_id"])){
            $this->call(500, "internal_server_error", $energyConsumption->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200,"success","Consumo de energia excluído com sucesso","success")->back();
    }

    public function validate (array $data): bool
    {
        if(!isset($data["location_id"]) || !isset($data["energy_type"]) || !isset($data["monthly_consumption"]) || !isset($data["monthly_cost"]) ||
            empty($data["location_id"]) || empty($data["energy_type"]) || empty($data["monthly_consumption"]) || empty($data["monthly_cost"]) ||
           !filter_var($data["location_id"], FILTER_VALIDATE_INT) || !filter_var($data["monthly_consumption"], FILTER_VALIDATE_FLOAT) || !filter_var($data["monthly_cost"], FILTER_VALIDATE_FLOAT)) {
            return false;
        }
        return true;
    }
}

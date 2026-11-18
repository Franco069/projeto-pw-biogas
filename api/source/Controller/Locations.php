<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Store\Location;

class Locations extends Api
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

        if(!isset($data["location_id"]) || empty($data["location_id"]) || !filter_var($data["location_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da localização é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $location = new Location();
        if(!$location->selectById($data["location_id"]) || $location->getUserId() !== $this->userAuthId) {
            $this->call(
                404,
                "not_found",
                "Localização não encontrada",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $location->getId(),
            "user_id" => $location->getUserId(),
            "name" => $location->getName(),
            "location_type" => $location->getLocationType(),
            "city" => $location->getCity(),
            "state" => $location->getState(),
            "created_at" => $location->getCreatedAt(),
            "updated_at" => $location->getUpdatedAt()
        ];

        $this->call(200,"success","Localização encontrada","success")->back($response);
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
        $locations = new Location();
        $this->call(200,"success","Lista de Localizações","success")->back($locations->selectAll(["user_id = {$this->userAuthId}"]));
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

        $locations  = new Location();
        $response = $locations->selectPaginator($data["page"], $data["per_page"], ["user_id = {$this->userAuthId}"], 'id', 'ASC');
        $this->call(200,"success","Lista de Localizações com Paginação","success")->back($response);
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
                "Os campos name, location_type, city e state são obrigatórios",
                "error"
            )->back();
            return;
        }

        $location = new Location(
            null,
            $this->userAuthId,
            $data["name"],
            $data["location_type"],
            $data["city"],
            $data["state"]
        );

        if(!$location->insert()){
            $this->call(500, "internal_server_error", $location->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "id" => $location->getId(),
            "user_id" => $location->getUserId(),
            "name" => $location->getName(),
            "location_type" => $location->getLocationType(),
            "city" => $location->getCity(),
            "state" => $location->getState(),
            "created_at" => $location->getCreatedAt(),
            "updated_at" => $location->getUpdatedAt()
        ];

        $this->call(201,"success","Localização inserida com sucesso","success")->back($response);

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

        if(!filter_var($data["location_id"] ?? null, FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da localização é obrigatório e deve ser um número inteiro",
                "error"
            )->back();
            return;
        }

        $existing = new Location();
        if (!$existing->selectById((int)$data['location_id']) || $existing->getUserId() !== $this->userAuthId) {
            $this->call(404, "not_found", "Localização não encontrada.", "error")->back();
            return;
        }

        if(!$this->validate($data)){
            $this->call(
                400,
                "bad_request",
                "Os campos name, location_type, city e state são obrigatórios",
                "error"
            )->back();
            return;
        }

        $location = new Location(
            null,
            $this->userAuthId,
            $data["name"],
            $data["location_type"],
            $data["city"],
            $data["state"]
        );

        if(!$location->updateById($data["location_id"])){
            $this->call(500, "internal_server_error", $location->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "id" => $location->getId(),
            "user_id" => $location->getUserId(),
            "name" => $location->getName(),
            "location_type" => $location->getLocationType(),
            "city" => $location->getCity(),
            "state" => $location->getState(),
            "created_at" => $location->getCreatedAt(),
            "updated_at" => $location->getUpdatedAt()
        ];

        $this->call(200,"success","Localização atualizada com sucesso","success")->back($response);
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

        if(!filter_var($data["location_id"] ?? null, FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da localização é obrigatório e deve ser um número inteiro",
                "error"
            )->back();
            return;
        }

        $location = new Location();
        if (!$location->selectById((int)$data['location_id']) || $location->getUserId() !== $this->userAuthId) {
            $this->call(404, "not_found", "Localização não encontrada.", "error")->back();
            return;
        }
        $location = new Location();
        if(!$location->deleteById($data["location_id"])){
            $this->call(500, "internal_server_error", $location->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200,"success","Localização excluída com sucesso","success")->back();
    }

    public function validate (array $data): bool
    {
        if(!isset($data["name"]) || !isset($data["location_type"]) || !isset($data["city"]) || !isset($data["state"]) ||
           trim((string)$data["name"]) === '' || trim((string)$data["location_type"]) === '' || trim((string)$data["city"]) === '' || trim((string)$data["state"]) === '') {
            return false;
        }
        return true;
    }
}

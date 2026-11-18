<?php

namespace Source\Controller;

use Source\Models\Store\Location;
use Source\Models\Store\LocationImage;
use Source\Support\Upload;

class LocationImages extends Api
{
    public function listAll(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Token de autenticação inválido ou expirado.", "error")->back();
            return;
        }

        if (!filter_var($data["location_id"] ?? null, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID do local inválido.", "error")->back();
            return;
        }

        $locationId = (int)$data["location_id"];
        $location = new Location();

        if (!$location->selectById($locationId) || $location->getUserId() !== $this->userAuthId) {
            $this->call(404, "not_found", "Local não encontrado.", "error")->back();
            return;
        }

        $images = new LocationImage();
        $records = $images->selectAll(["location_id = {$locationId}"]);
        $response = [];

        foreach ($records as $item) {
            $response[] = [
                "id" => (int)$item->id,
                "location_id" => (int)$item->location_id,
                "image_path" => $item->image_path,
                "image_url" => url($item->image_path),
                "alt_text" => $item->alt_text,
                "position" => (int)$item->position,
                "created_at" => $item->created_at
            ];
        }

        $this->call(200, "success", "Imagens do local.", "success")->back($response);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Token de autenticação inválido ou expirado.", "error")->back();
            return;
        }

        if (!filter_var($data["location_id"] ?? null, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID do local inválido.", "error")->back();
            return;
        }

        $locationId = (int)$data["location_id"];
        $location = new Location();

        if (!$location->selectById($locationId) || $location->getUserId() !== $this->userAuthId) {
            $this->call(404, "not_found", "Local não encontrado.", "error")->back();
            return;
        }

        if (!isset($_FILES["image"]) || !is_array($_FILES["image"])) {
            $this->call(400, "bad_request", "Selecione uma imagem.", "error")->back();
            return;
        }

        $altText = trim((string)($data["alt_text"] ?? ""));

        if (mb_strlen($altText) > 255) {
            $this->call(400, "bad_request", "Texto alternativo muito longo.", "error")->back();
            return;
        }

        $uploadDirectory = dirname(__DIR__, 3) . "/uploads/locations";
        $uploader = new Upload($uploadDirectory);

        try {
            $filename = $uploader->image($_FILES["image"]);
        } catch (\RuntimeException $error) {
            $this->call(400, "bad_request", $error->getMessage(), "error")->back();
            return;
        }

        $imagePath = "uploads/locations/" . $filename;

        $image = new LocationImage(
            null,
            $locationId,
            $imagePath,
            $altText === "" ? null : $altText
        );

        if (!$image->insert()) {
            $savedPath = $uploadDirectory . "/" . $filename;

            if (is_file($savedPath)) {
                unlink($savedPath);
            }

            $this->call(500, "internal_server_error", "Não foi possível salvar a imagem.", "error")->back();
            return;
        }

        $response = [
            "id" => $image->getId(),
            "location_id" => $locationId,
            "image_path" => $imagePath,
            "image_url" => url($imagePath),
            "alt_text" => $image->getAltText(),
            "position" => $image->getPosition()
        ];

        $this->call(201, "success", "Imagem enviada com sucesso.", "success")->back($response);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Token de autenticação inválido ou expirado.", "error")->back();
            return;
        }

        if (!filter_var($data["location_id"] ?? null, FILTER_VALIDATE_INT) ||
            !filter_var($data["image_id"] ?? null, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID do local ou da imagem inválido.", "error")->back();
            return;
        }

        $locationId = (int)$data["location_id"];
        $imageId = (int)$data["image_id"];

        $location = new Location();

        if (!$location->selectById($locationId) || $location->getUserId() !== $this->userAuthId) {
            $this->call(404, "not_found", "Local não encontrado.", "error")->back();
            return;
        }

        $image = new LocationImage();

        if (!$image->selectById($imageId) || $image->getLocationId() !== $locationId) {
            $this->call(404, "not_found", "Imagem não encontrada neste local.", "error")->back();
            return;
        }

        $imagePath = $image->getImagePath();

        if (!$image->deleteById($imageId)) {
            $this->call(500, "internal_server_error", "Não foi possível excluir a imagem.", "error")->back();
            return;
        }

        if (preg_match('~^uploads/locations/([a-f0-9]{32}\.(?:jpg|png|webp))$~', $imagePath, $matches)) {
            $savedPath = dirname(__DIR__, 3) . "/uploads/locations/" . $matches[1];

            if (is_file($savedPath) && !unlink($savedPath)) {
                error_log("Não foi possível remover o arquivo da imagem: " . $matches[1]);
            }
        }

        $this->call(200, "success", "Imagem excluída com sucesso.", "success")->back();
    }
}

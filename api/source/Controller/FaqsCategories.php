<?php

namespace Source\Controller;

use Source\Models\Faqs\FaqCategory;

class FaqsCategories extends Api
{
    public function list(): void
    {
        $faqCategory = new FaqCategory();

        $categories = $faqCategory->selectAll();

        $this->call(
            200,
            "success",
            "Lista de Categorias de FAQ",
            "success"
        )->back($categories);
    }

    public function findById(array $data): void
{
    if (
        !isset($data["categoryId"]) ||
        !filter_var($data["categoryId"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID da categoria é obrigatório e deve ser um número inteiro",
            "error"
        )->back();
        return;
    }

    $faqCategory = new FaqCategory();
    $category = $faqCategory->findById((int)$data["categoryId"]);

    if (!$category) {
        $this->call(
            404,
            "not_found",
            "Categoria não encontrada",
            "error"
        )->back();
        return;
    }

    $this->call(
        200,
        "success",
        "Categoria encontrada",
        "success"
    )->back($category);
}

public function create(array $data): void
{
    if (!$this->authToken(1)) {
        $this->call(401, 'unauthorized', 'Token de autenticação inválido ou expirado.', 'error')->back();
        return;
    }
    $body = json_decode(file_get_contents("php://input"), true) ?? $data;

    if (
        empty($body["name"]) ||
        empty(trim($body["name"]))
    ) {
        $this->call(
            400,
            "bad_request",
            "O campo name é obrigatório",
            "error"
        )->back();
        return;
    }

    $faqCategory = new FaqCategory(null, trim($body["name"]));
    if (!$faqCategory->insert()) {
        $this->call(
            500,
            "internal_server_error",
            "Não foi possível cadastrar a categoria",
            "error"
        )->back();
        return;
    }

    $category = ['id' => $faqCategory->getId(), 'name' => $faqCategory->getName(), 'active' => $faqCategory->getActive()];

    $this->call(
        201,
        "success",
        "Categoria de FAQ criada com sucesso",
        "success"
    )->back($category);
}

public function update(array $data): void
{
    $body = json_decode(file_get_contents("php://input"), true);

    if (
        !isset($data["categoryId"]) ||
        !filter_var($data["categoryId"], FILTER_VALIDATE_INT) ||
        empty($body["name"]) ||
        empty(trim($body["name"]))
    ) {
        $this->call(
            400,
            "bad_request",
            "ID inválido ou campo name é obrigatório",
            "error"
        )->back();
        return;
    }

    $faqCategory = new FaqCategory();

    $existingCategory = $faqCategory->findById((int)$data["categoryId"]);

    if (!$existingCategory) {
        $this->call(
            404,
            "not_found",
            "Categoria não encontrada",
            "error"
        )->back();
        return;
    }

    $faqCategory->update(
        (int)$data["categoryId"],
        trim($body["name"])
    );

    $updatedCategory = $faqCategory->findById((int)$data["categoryId"]);

    $this->call(
        200,
        "success",
        "Categoria atualizada com sucesso",
        "success"
    )->back($updatedCategory);
}

public function delete(array $data): void
{
    if (
        !isset($data["categoryId"]) ||
        !filter_var($data["categoryId"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID da categoria é obrigatório e deve ser um número inteiro",
            "error"
        )->back();
        return;
    }

    $faqCategory = new FaqCategory();
    $categoryId = (int)$data["categoryId"];

    $existingCategory = $faqCategory->findById($categoryId);

    if (!$existingCategory) {
        $this->call(
            404,
            "not_found",
            "Categoria não encontrada",
            "error"
        )->back();
        return;
    }

    if ($faqCategory->hasActiveFaqs($categoryId)) {
        $this->call(
            400,
            "bad_request",
            "Não é possível remover uma categoria que possui FAQs ativos",
            "error"
        )->back();
        return;
    }

    if (!$faqCategory->softDelete($categoryId)) {
        $this->call(
            404,
            "not_found",
            "Categoria não encontrada",
            "error"
        )->back();
        return;
    }

    $this->call(
        200,
        "success",
        "Categoria removida com sucesso",
        "success"
    )->back();
}

}

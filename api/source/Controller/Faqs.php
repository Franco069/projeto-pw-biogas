<?php

namespace Source\Controller;

use Source\Models\Faqs\Faq;
use Source\Models\Faqs\FaqCategory;

class Faqs extends Api
{
    public function list(): void
    {
        $this->call(200, 'success', 'Lista de FAQs', 'success')->back((new Faq())->selectAll(['active = 1']));
    }

    public function listAdmin(): void
    {
        if (!$this->authorize()) return;
        $this->call(200, 'success', 'Lista de FAQs', 'success')->back((new Faq())->selectAll());
    }

    public function findById(array $data): void
    {
        $faq = $this->find($data);
        if (!$faq) return;
        if ($faq->getActive() !== 1) {
            $this->call(404, 'not_found', 'FAQ não encontrado.', 'error')->back();
            return;
        }
        $this->call(200, 'success', 'FAQ encontrado.', 'success')->back($this->toArray($faq));
    }

    public function create(array $data): void
    {
        if (!$this->authorize()) return;
        $data = $this->body($data);
        if (!$this->valid($data)) return;
        $faq = new Faq(null, trim($data['question']), trim($data['answer']), (int)$data['faqs_category_id'], (int)($data['active'] ?? 1));
        if (!$faq->insert()) {
            $this->call(500, 'internal_server_error', $faq->getErrorMessage(), 'error')->back();
            return;
        }
        $this->call(201, 'success', 'FAQ criado com sucesso.', 'success')->back($this->toArray($faq));
    }

    public function update(array $data): void
    {
        if (!$this->authorize()) return;
        $data = $this->body($data);
        if (!$this->valid($data)) return;
        $faq = $this->find($data);
        if (!$faq) return;
        $active = (int)($data['active'] ?? $faq->getActive());
        $unchanged = $faq->getQuestion() === trim($data['question']) && $faq->getAnswer() === trim($data['answer']) &&
            $faq->getFaqsCategoryId() === (int)$data['faqs_category_id'] && $faq->getActive() === $active;
        $faq->setQuestion(trim($data['question']));
        $faq->setAnswer(trim($data['answer']));
        $faq->setFaqsCategoryId((int)$data['faqs_category_id']);
        $faq->setActive($active);
        if (!$unchanged && !$faq->updateById($faq->getId())) {
            $this->call(500, 'internal_server_error', $faq->getErrorMessage(), 'error')->back();
            return;
        }
        $this->call(200, 'success', 'FAQ atualizado com sucesso.', 'success')->back($this->toArray($faq));
    }

    public function delete(array $data): void
    {
        if (!$this->authorize()) return;
        $faq = $this->find($data);
        if (!$faq) return;
        if (!$faq->deleteById($faq->getId())) {
            $this->call(500, 'internal_server_error', $faq->getErrorMessage(), 'error')->back();
            return;
        }
        $this->call(200, 'success', 'FAQ removido com sucesso.', 'success')->back();
    }

    private function authorize(): bool
    {
        if ($this->authToken(1)) return true;
        $this->call(401, 'unauthorized', 'Token de autenticação inválido ou expirado.', 'error')->back();
        return false;
    }

    private function body(array $data): array
    {
        $body = json_decode(file_get_contents('php://input'), true);
        return is_array($body) ? array_merge($body, $data) : $data;
    }

    private function valid(array $data): bool
    {
        $categoryId = filter_var($data['faqs_category_id'] ?? null, FILTER_VALIDATE_INT);
        $category = new FaqCategory();
        if (!isset($data['question'], $data['answer']) || !is_string($data['question']) || !is_string($data['answer']) ||
            trim($data['question']) === '' || trim($data['answer']) === '' ||
            !$categoryId || !$category->selectById($categoryId) || $category->getActive() !== 1 ||
            (isset($data['active']) && !in_array((string)$data['active'], ['0', '1'], true))) {
            $this->call(400, 'bad_request', 'Informe pergunta, resposta, categoria ativa e estado de publicação válido.', 'error')->back();
            return false;
        }
        return true;
    }

    private function find(array $data): ?Faq
    {
        $id = filter_var($data['faqId'] ?? null, FILTER_VALIDATE_INT);
        $faq = new Faq();
        if (!$id || !$faq->selectById($id)) {
            $this->call(404, 'not_found', 'FAQ não encontrado.', 'error')->back();
            return null;
        }
        return $faq;
    }

    private function toArray(Faq $faq): array
    {
        return ['id' => $faq->getId(), 'question' => $faq->getQuestion(), 'answer' => $faq->getAnswer(),
            'faqs_category_id' => $faq->getFaqsCategoryId(), 'active' => $faq->getActive()];
    }
}

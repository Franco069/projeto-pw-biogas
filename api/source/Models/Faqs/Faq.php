<?php

namespace Source\Models\Faqs;

use Source\Core\Model;

class Faq extends Model
{

    private ?int $id;
    private ?string $question;
    private ?string $answer;
    private ?int $faqsCategoryId;
    private ?int $active;


    public function __construct(
        ?int $id = null,
        ?string $question = null,
        ?string $answer = null,
        ?int $faqsCategoryId = null,
        ?int $active = 1
    )
    {
        $this->id = $id;
        $this->question = $question;
        $this->answer = $answer;
        $this->faqsCategoryId = $faqsCategoryId;
        $this->active = $active;


        $this->table = "faqs";
        $this->primaryKey = "id";

        $this->fillable = [
            "question",
            "answer",
            "faqsCategoryId",
            "active"
        ];
    }



    public function getId(): ?int
    {
        return $this->id;
    }


    public function setId(int $id): void
    {
        $this->id = $id;
    }



    public function getQuestion(): ?string
    {
        return $this->question;
    }


    public function setQuestion(string $question): void
    {
        $this->question = $question;
    }



    public function getAnswer(): ?string
    {
        return $this->answer;
    }


    public function setAnswer(string $answer): void
    {
        $this->answer = $answer;
    }



    public function getFaqsCategoryId(): ?int
    {
        return $this->faqsCategoryId;
    }


    public function setFaqsCategoryId(int $faqsCategoryId): void
    {
        $this->faqsCategoryId = $faqsCategoryId;
    }



    public function getActive(): ?int
    {
        return $this->active;
    }


    public function setActive(int $active): void
    {
        $this->active = $active;
    }

}
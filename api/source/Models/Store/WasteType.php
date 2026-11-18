<?php

namespace Source\Models\Store;

use Source\Core\Model;
use Source\Core\Connect;

class WasteType extends Model
{
    private ?int $id;
    private ?string $name;
    private ?string $description;
    private ?float $estimatedYield;
    private ?string $createdAt;
    private ?string $updatedAt;
    private ?int $active;

    public function __construct(?int $id = null, ?string $name = null, ?string $description = null, ?float $estimatedYield = null, ?int $active = 1, ?string $createdAt = null, ?string $updatedAt = null)
    {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->estimatedYield = $estimatedYield;
        $this->active = $active;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;

        $this->table = 'waste_types';
        $this->primaryKey = 'id';
        $this->fillable = ['name', 'description', 'estimatedYield', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }


    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    public function getEstimatedYield(): ?float
    {
        return $this->estimatedYield;
    }

    public function setEstimatedYield(float $estimatedYield): void
    {
        $this->estimatedYield = $estimatedYield;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setCreatedAt(string $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(string $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
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

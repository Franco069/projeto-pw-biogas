<?php

namespace Source\Models\Store;

use Source\Core\Model;

class SystemParameter extends Model
{
    private ?int $id;
    private ?string $name;
    private ?float $value;
    private ?string $unit;
    private ?string $description;
    private ?int $active;
    private ?string $createdAt;
    private ?string $updatedAt;

    public function __construct(?int $id = null, ?string $name = null, ?float $value = null, ?string $unit = null, ?string $description = null, ?int $active = 1, ?string $createdAt = null, ?string $updatedAt = null)
    {
        $this->id = $id;
        $this->name = $name;
        $this->value = $value;
        $this->unit = $unit;
        $this->description = $description;
        $this->active = $active;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->table = 'system_parameters';
        $this->primaryKey = 'id';
        $this->fillable = ['name', 'value', 'unit', 'description', 'active'];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(int $id): void { $this->id = $id; }
    public function getName(): ?string { return $this->name; }
    public function setName(string $name): void { $this->name = $name; }
    public function getValue(): ?float { return $this->value; }
    public function setValue(float $value): void { $this->value = $value; }
    public function getUnit(): ?string { return $this->unit; }
    public function setUnit(string $unit): void { $this->unit = $unit; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(string $description): void { $this->description = $description; }
    public function getActive(): ?int { return $this->active; }
    public function setActive(int $active): void { $this->active = $active; }
    public function getCreatedAt(): ?string { return $this->createdAt; }
    public function setCreatedAt(string $createdAt): void { $this->createdAt = $createdAt; }
    public function getUpdatedAt(): ?string { return $this->updatedAt; }
    public function setUpdatedAt(string $updatedAt): void { $this->updatedAt = $updatedAt; }
}

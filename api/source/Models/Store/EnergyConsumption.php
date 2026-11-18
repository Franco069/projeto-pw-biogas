<?php

namespace Source\Models\Store;

use Source\Core\Model;
use Source\Core\Connect;

class EnergyConsumption extends Model
{
    private ?int $id;
    private ?int $locationId;
    private ?string $energyType;
    private ?float $monthlyConsumption;
    private ?float $monthlyCost;
    private ?string $createdAt;
    private ?string $updatedAt;

    public function __construct(?int $id = null, ?int $locationId = null, ?string $energyType = null, ?float $monthlyConsumption = null, ?float $monthlyCost = null, ?string $createdAt = null, ?string $updatedAt = null)
    {
        $this->id = $id;
        $this->locationId = $locationId;
        $this->energyType = $energyType;
        $this->monthlyConsumption = $monthlyConsumption;
        $this->monthlyCost = $monthlyCost;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;

        $this->table = 'energy_consumptions';
        $this->primaryKey = 'id';
        $this->fillable = [
            'locationId',
            'energyType',
            'monthlyConsumption',
            'monthlyCost'
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

    public function getLocationId(): ?int
    {
        return $this->locationId;
    }

    public function setLocationId(int $locationId): void
    {
        $this->locationId = $locationId;
    }

    public function getEnergyType(): ?string
    {
        return $this->energyType;
    }

    public function setEnergyType(string $energyType): void
    {
        $this->energyType = $energyType;
    }

    public function getMonthlyConsumption(): ?float
    {
        return $this->monthlyConsumption;
    }

    public function setMonthlyConsumption(float $monthlyConsumption): void
    {
        $this->monthlyConsumption = $monthlyConsumption;
    }

    public function getMonthlyCost(): ?float
    {
        return $this->monthlyCost;
    }

    public function setMonthlyCost(float $monthlyCost): void
    {
        $this->monthlyCost = $monthlyCost;
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

}

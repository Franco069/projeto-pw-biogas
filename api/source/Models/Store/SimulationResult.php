<?php

namespace Source\Models\Store;

use Source\Core\Model;

class SimulationResult extends Model
{
    private ?int $id;
    private ?int $simulationId;
    private ?float $estimatedBiogasM3;
    private ?float $estimatedEnergyKwh;
    private ?float $monthlySaving;
    private ?float $annualSaving;
    private ?float $paybackMonths;

    public function __construct(?int $id = null, ?int $simulationId = null, ?float $estimatedBiogasM3 = null, ?float $estimatedEnergyKwh = null, ?float $monthlySaving = null, ?float $annualSaving = null, ?float $paybackMonths = null)
    {
        $this->id=$id; $this->simulationId=$simulationId; $this->estimatedBiogasM3=$estimatedBiogasM3;
        $this->estimatedEnergyKwh=$estimatedEnergyKwh; $this->monthlySaving=$monthlySaving; $this->annualSaving=$annualSaving; $this->paybackMonths=$paybackMonths;
        $this->table='simulation_results'; $this->primaryKey='id';
        $this->fillable=['simulationId','estimatedBiogasM3','estimatedEnergyKwh','monthlySaving','annualSaving','paybackMonths'];
    }
    public function getId(): ?int { return $this->id; }
    public function setId(int $value): void { $this->id=$value; }
    public function getSimulationId(): ?int { return $this->simulationId; }
    public function setSimulationId(int $value): void { $this->simulationId=$value; }
    public function getEstimatedBiogasM3(): ?float { return $this->estimatedBiogasM3; }
    public function setEstimatedBiogasM3(float $value): void { $this->estimatedBiogasM3=$value; }
    public function getEstimatedEnergyKwh(): ?float { return $this->estimatedEnergyKwh; }
    public function setEstimatedEnergyKwh(float $value): void { $this->estimatedEnergyKwh=$value; }
    public function getMonthlySaving(): ?float { return $this->monthlySaving; }
    public function setMonthlySaving(float $value): void { $this->monthlySaving=$value; }
    public function getAnnualSaving(): ?float { return $this->annualSaving; }
    public function setAnnualSaving(float $value): void { $this->annualSaving=$value; }
    public function getPaybackMonths(): ?float { return $this->paybackMonths; }
    public function setPaybackMonths(?float $value): void { $this->paybackMonths=$value; }
}

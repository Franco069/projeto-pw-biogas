<?php

namespace Source\Models\Store;

use PDO;
use Source\Core\Connect;
use Source\Core\Model;

class Simulation extends Model
{
    private ?int $id;
    private ?int $userId;
    private ?int $locationId;
    private ?int $scenarioId;
    private ?int $wasteTypeId;
    private ?int $peopleQuantity;
    private ?float $dailyWasteKg;
    private ?float $glpConsumptionKg;
    private ?float $glpMonthlyCost;
    private ?float $implementationCost;

    public function __construct(?int $id = null, ?int $userId = null, ?int $locationId = null, ?int $scenarioId = null, ?int $wasteTypeId = null, ?int $peopleQuantity = null, ?float $dailyWasteKg = null, ?float $glpConsumptionKg = null, ?float $glpMonthlyCost = null, ?float $implementationCost = null)
    {
        $this->id = $id; $this->userId = $userId; $this->locationId = $locationId;
        $this->scenarioId = $scenarioId; $this->wasteTypeId = $wasteTypeId; $this->peopleQuantity = $peopleQuantity;
        $this->dailyWasteKg = $dailyWasteKg; $this->glpConsumptionKg = $glpConsumptionKg;
        $this->glpMonthlyCost = $glpMonthlyCost; $this->implementationCost = $implementationCost;
        $this->table = 'simulations'; $this->primaryKey = 'id';
        $this->fillable = ['userId','locationId','scenarioId','wasteTypeId','peopleQuantity','dailyWasteKg','glpConsumptionKg','glpMonthlyCost','implementationCost'];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(int $id): void { $this->id = $id; }
    public function getUserId(): ?int { return $this->userId; }
    public function setUserId(int $value): void { $this->userId = $value; }
    public function getLocationId(): ?int { return $this->locationId; }
    public function setLocationId(int $value): void { $this->locationId = $value; }
    public function getScenarioId(): ?int { return $this->scenarioId; }
    public function setScenarioId(?int $value): void { $this->scenarioId = $value; }
    public function getWasteTypeId(): ?int { return $this->wasteTypeId; }
    public function setWasteTypeId(?int $value): void { $this->wasteTypeId = $value; }
    public function getPeopleQuantity(): ?int { return $this->peopleQuantity; }
    public function setPeopleQuantity(?int $value): void { $this->peopleQuantity = $value; }
    public function getDailyWasteKg(): ?float { return $this->dailyWasteKg; }
    public function setDailyWasteKg(?float $value): void { $this->dailyWasteKg = $value; }
    public function getGlpConsumptionKg(): ?float { return $this->glpConsumptionKg; }
    public function setGlpConsumptionKg(?float $value): void { $this->glpConsumptionKg = $value; }
    public function getGlpMonthlyCost(): ?float { return $this->glpMonthlyCost; }
    public function setGlpMonthlyCost(?float $value): void { $this->glpMonthlyCost = $value; }
    public function getImplementationCost(): ?float { return $this->implementationCost; }
    public function setImplementationCost(?float $value): void { $this->implementationCost = $value; }

    public function listByUser(?int $userId): array
    {
        $sql = 'SELECT s.*, l.name AS location_name, l.location_type, l.city, l.state, w.name AS waste_type_name,
                       r.id AS result_id, r.estimated_biogas_m3, r.estimated_energy_kwh, r.monthly_saving, r.annual_saving, r.payback_months
                FROM simulations s JOIN locations l ON l.id=s.location_id
                LEFT JOIN waste_types w ON w.id=s.waste_type_id
                LEFT JOIN simulation_results r ON r.simulation_id=s.id
                ' . ($userId === null ? '' : 'WHERE s.user_id=:user_id ') . 'ORDER BY s.created_at DESC';
        $stmt = Connect::getInstance()->prepare($sql);
        if ($userId !== null) $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $this->withImages($stmt->fetchAll());
    }

    public function findForUser(int $id, int $userId): ?object
    {
        $stmt = Connect::getInstance()->prepare('SELECT s.*, l.name AS location_name, l.location_type, l.city, l.state, w.name AS waste_type_name,
            r.id AS result_id, r.estimated_biogas_m3, r.estimated_energy_kwh, r.monthly_saving, r.annual_saving, r.payback_months
            FROM simulations s JOIN locations l ON l.id=s.location_id LEFT JOIN waste_types w ON w.id=s.waste_type_id
            LEFT JOIN simulation_results r ON r.simulation_id=s.id WHERE s.id=:id AND s.user_id=:user_id LIMIT 1');
        $stmt->execute([':id' => $id, ':user_id' => $userId]);
        $row = $stmt->fetch();
        return $row ? $this->withImages([$row])[0] : null;
    }

    private function withImages(array $simulations): array
    {
        if (!$simulations) return [];
        $locationIds = array_unique(array_map(fn($simulation) => (int)$simulation->location_id, $simulations));
        $images = (new LocationImage())->selectAll(['location_id IN (' . implode(',', $locationIds) . ')']);
        $byLocation = [];
        foreach ($images as $image) {
            $byLocation[(int)$image->location_id][] = [
                'id' => (int)$image->id,
                'location_id' => (int)$image->location_id,
                'image_url' => url($image->image_path),
                'alt_text' => $image->alt_text,
            ];
        }
        foreach ($simulations as $simulation) {
            $simulation->images = $byLocation[(int)$simulation->location_id] ?? [];
        }
        return $simulations;
    }

    public function deleteForUser(int $id, int $userId): bool
    {
        $pdo = Connect::getInstance();
        $pdo->beginTransaction();
        try {
            $reports = $pdo->prepare('DELETE FROM reports WHERE simulation_id=:id AND user_id=:user_id');
            $reports->execute([':id' => $id, ':user_id' => $userId]);
            $stmt = $pdo->prepare('DELETE FROM simulations WHERE id=:id AND user_id=:user_id');
            $stmt->execute([':id' => $id, ':user_id' => $userId]);
            $deleted = $stmt->rowCount() > 0;
            $pdo->commit();
            return $deleted;
        } catch (\Throwable $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $error;
        }
    }
}

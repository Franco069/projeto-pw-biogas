<?php

namespace Source\Models\Store;

use PDO;
use Source\Core\Connect;
use Source\Core\Model;

class Report extends Model
{
    private ?int $id;
    private ?int $userId;
    private ?int $simulationId;
    private ?string $title;
    private ?string $generatedAt;

    public function __construct(?int $id = null, ?int $userId = null, ?int $simulationId = null, ?string $title = null, ?string $generatedAt = null)
    {
        $this->id=$id; $this->userId=$userId; $this->simulationId=$simulationId; $this->title=$title; $this->generatedAt=$generatedAt;
        $this->table='reports'; $this->primaryKey='id'; $this->fillable=['userId','simulationId','title'];
    }
    public function getId(): ?int { return $this->id; }
    public function setId(int $value): void { $this->id=$value; }
    public function getUserId(): ?int { return $this->userId; }
    public function setUserId(int $value): void { $this->userId=$value; }
    public function getSimulationId(): ?int { return $this->simulationId; }
    public function setSimulationId(int $value): void { $this->simulationId=$value; }
    public function getTitle(): ?string { return $this->title; }
    public function setTitle(string $value): void { $this->title=$value; }
    public function getGeneratedAt(): ?string { return $this->generatedAt; }
    public function setGeneratedAt(string $value): void { $this->generatedAt=$value; }

    public function listByUser(?int $userId): array
    {
        $stmt=Connect::getInstance()->prepare('SELECT r.id, r.user_id, r.simulation_id, r.title, r.generated_at, l.name AS location_name
            FROM reports r JOIN simulations s ON s.id=r.simulation_id JOIN locations l ON l.id=s.location_id
            ' . ($userId === null ? '' : 'WHERE r.user_id=:report_user_id AND s.user_id=:simulation_user_id ') . 'ORDER BY r.generated_at DESC');
        if ($userId !== null) {
            $stmt->bindValue(':report_user_id',$userId,PDO::PARAM_INT);
            $stmt->bindValue(':simulation_user_id',$userId,PDO::PARAM_INT);
        }
        $stmt->execute(); return $stmt->fetchAll();
    }
}

<?php

namespace Source\Models\Store;

use Source\Core\Model;
use Source\Core\Connect;

class Location extends Model
{
    private ?int $id;
    private ?int $userId;
    private ?string $name;
    private ?string $locationType;
    private ?string $city;
    private ?string $state;
    private ?string $createdAt;
    private ?string $updatedAt;

    public function __construct(?int $id = null, ?int $userId = null, ?string $name = null, ?string $locationType = null, ?string $city = null, ?string $state = null, ?string $createdAt = null, ?string $updatedAt = null)
    {
        $this->id = $id;
        $this->userId = $userId;
        $this->name = $name;
        $this->locationType = $locationType;
        $this->city = $city;
        $this->state = $state;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;

        $this->table = 'locations';
        $this->primaryKey = 'id';
        $this->fillable = [ 'userId', 'name', 'locationType', 'city', 'state'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getLocationType(): ?string
    {
        return $this->locationType;
    }

    public function setLocationType(string $locationType): void
    {
        $this->locationType = $locationType;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(string $city): void
    {
        $this->city = $city;
    }

    public function getState(): ?string
    {
        return $this->state;
    }

    public function setState(string $state): void
    {
        $this->state = $state;
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

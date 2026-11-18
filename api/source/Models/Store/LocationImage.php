<?php

namespace Source\Models\Store;

use Source\Core\Model;
use Source\Core\Connect;

class LocationImage extends Model
{
    private ?int $id;
    private ?int $locationId;
    private ?string $imagePath;
    private ?string $altText;
    private ?int $position;
    private ?string $createdAt;

    public function __construct(
        ?int $id = null,
        ?int $locationId = null,
        ?string $imagePath = null,
        ?string $altText = null,
        ?int $position = 0,
        ?string $createdAt = null
    ) {
        $this->id = $id;
        $this->locationId = $locationId;
        $this->imagePath = $imagePath;
        $this->altText = $altText;
        $this->position = $position;
        $this->createdAt = $createdAt;

        $this->table = 'location_images';
        $this->primaryKey = 'id';
        $this->fillable = [
            'locationId',
            'imagePath',
            'altText',
            'position'
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

    public function getImagePath(): ?string
    {
        return $this->imagePath;
    }

    public function setImagePath(string $imagePath): void
    {
        $this->imagePath = $imagePath;
    }

    public function getAltText(): ?string
    {
        return $this->altText;
    }

    public function setAltText(?string $altText): void
    {
        $this->altText = $altText;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(int $position): void
    {
        $this->position = $position;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setCreatedAt(string $createdAt): void
    {
        $this->createdAt = $createdAt;
    }
}

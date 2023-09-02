<?php

namespace Iqm\AdminUiBundle\Model\DataObject\ClassDefinition\Data;

use Pimcore\Model\DataObject\Traits\DataHeightTrait;
use Pimcore\Model\DataObject\Traits\DataWidthTrait;

trait IqmDocumentTrait
{
    use DataWidthTrait;
    use DataHeightTrait;

    /**
     * @internal
     *
     * @var string
     */
    public string $uploadPath;

    public function setUploadPath(string $uploadPath): static
    {
        $this->uploadPath = $uploadPath;

        return $this;
    }

    public function getUploadPath(): string
    {
        return $this->uploadPath;
    }
}

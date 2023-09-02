<?php

namespace Iqm\AdminUiBundle;

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;
use Pimcore\Extension\Bundle\PimcoreBundleAdminClassicInterface;
use Pimcore\Extension\Bundle\Traits\BundleAdminClassicTrait;

class IqmAdminUiBundle extends AbstractPimcoreBundle implements PimcoreBundleAdminClassicInterface
{
    use BundleAdminClassicTrait;

    public function getPath(): string
    {
        return \dirname(__DIR__);
    }

    public function getJsPaths(): array
    {
        return [
            '/bundles/iqmadminui/js/pimcore/object/data/iqmdocument.js',
            '/bundles/iqmadminui/js/pimcore/object/tags/iqmdocument.js'
        ];
    }

    public function getCssPaths(): array
    {
        return [
            '/bundles/iqmadminui/css/pimcore/object/iqmdocument.css'
        ];
    }

}

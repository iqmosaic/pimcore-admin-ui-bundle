# Iqmosaic Admin UI Bundle for Pimcore 11.

The Pimcore 11 Admin UI Data Component Bundle—an advanced addition to your content management toolkit. 
This bundle significantly extends Pimcore's core functionality, 
enhancing the versatility and efficiency of your data and content management processes.


Currently, it includes one additional UI component for document uploading. 
Upcoming components will feature a Document Gallery (with GraphQL integration) and a Video Gallery.


# Installation

To install the module via composer, run the appropriate composer command
```
composer require  iqmosaic/pimcore-admin-ui-bundle:"^0.1.0" 
```
and enable module in the `config/bundles.php` by adding value to return array:
```
<?php
return [
    ....
    Iqm\AdminUiBundle\IqmAdminUiBundle::class => ['all' => true],
]
```


# Adding a Data Component to the Data Object class.

https://github.com/iqmosaic/pimcore-admin-ui-bundle/assets/18754070/c250ea53-69c8-46f3-8330-83c7577981e1


# Uploading Document to the Data Object.
https://github.com/iqmosaic/pimcore-admin-ui-bundle/assets/18754070/4f05e064-dec1-4a67-af02-2e9f250afdf3

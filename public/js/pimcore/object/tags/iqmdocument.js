pimcore.registerNS("pimcore.object.tags.iqmdocument");
/**
 * @private
 */
pimcore.object.tags.iqmdocument = Class.create(pimcore.object.tags.abstract, {

    type: "iqmdocument",
    dirty: false,

    initialize: function (data, fieldConfig) {
        if (data) {
            this.data = data;
        } else {
            this.data = {};
        }

        this.fieldConfig = fieldConfig;
    },

    getGridColumnConfig: function (field, forGridConfigPreview) {

        return {
            text: t(field.label), width: 100, sortable: false, dataIndex: field.key,
            getEditor: this.getWindowCellEditor.bind(this, field),
            getRelationFilter: this.getRelationFilter,
            renderer: function (key, value, metaData, record, rowIndex, colIndex, store, view) {
                this.applyPermissionStyle(key, value, metaData, record);

                console.log(key, value, metaData, record);
                if (record.data.inheritedFields && record.data.inheritedFields[key] && record.data.inheritedFields[key].inherited == true) {
                    metaData.tdCls += " grid_value_inherited";
                }

                console.log(value && value.id);
                if (value && value.id) {

                    if (forGridConfigPreview) {
                        var params = {
                            id: value.id,
                            width: 88,
                            height: 20,
                            frame: true
                        };
                        var path = Routing.generate('pimcore_admin_asset_getdocumentthumbnail', params);
                        return '<img src="'+path+'" loading="lazy" />';
                    }

                    var params = {
                        id: value.id,
                        width: 88,
                        height: 88,
                        frame: true
                    };

                    var path = Routing.generate('pimcore_admin_asset_getdocumentthumbnail', params);

                    return '<img src="'+path+'" style="width:88px; height:88px;" loading="lazy" />';
                }
            }.bind(this, field.key)
        };
    },

    getRelationFilter: function (dataIndex, editor) {
        var filterValue = editor.data && editor.data.id !== undefined ? editor.data.id : null;
        return new Ext.util.Filter({
            operator: "=",
            type: "int",
            id: "x-gridfilter-" + dataIndex,
            property: dataIndex,
            dataIndex: dataIndex,
            value: filterValue === null ? 'null' : filterValue
        });
    },

    getLayoutEdit: function () {
        if (!this.fieldConfig.width) {
            this.fieldConfig.width = 300;
        }
        if (!this.fieldConfig.height) {
            this.fieldConfig.height = 300;
        }

        const tbarItems = [
            {
                xtype: "tbspacer",
                width: 48,
                height: 24,
                cls: "pimcore_icon_droptarget_upload"

            },
            {
                xtype: "tbtext",
                text: "<b>" + this.fieldConfig.title + "</b>"
            }, "->", {
                xtype: "button",
                iconCls: "pimcore_icon_upload",
                overflowText: t("upload"),
                cls: "pimcore_inline_upload",
                handler: this.uploadDialog.bind(this)
            }, {
                xtype: "button",
                iconCls: "pimcore_icon_open",
                overflowText: t("open"),
                handler: this.openDocument.bind(this)
            }, {
                xtype: "button",
                iconCls: "pimcore_icon_delete",
                overflowText: t("delete"),
                handler: this.empty.bind(this)
            }
        ];

        if(pimcore.helpers.hasSearchImplementation()){
            tbarItems.push({
                xtype: "button",
                iconCls: "pimcore_icon_search",
                overflowText: t("search"),
                handler: this.openSearchEditor.bind(this)
            });
        }

        const conf = {
            width: this.fieldConfig.width,
            height: this.fieldConfig.height,
            border: true,
            style: "padding-bottom: 10px",
            tbar: {
                overflowHandler: 'menu',
                items: tbarItems
            },
            componentCls: this.getWrapperClassNames(),
            bodyCls: "pimcore_droptarget_document pimcore_document_container"
        };

        this.component = new Ext.Panel(conf);

        this.component.on("afterrender", function (el) {

            // add drop zone
            new Ext.dd.DropZone(el.getEl(), {
                reference: this,
                ddGroup: "element",
                getTargetFromEvent: function (e) {
                    return this.reference.component.getEl();
                },

                onNodeOver: function (target, dd, e, data) {
                    if (data.records.length === 1 && data.records[0].data.type === "document") {
                        return Ext.dd.DropZone.prototype.dropAllowed;
                    }
                },

                onNodeDrop: this.onNodeDrop.bind(this)
            });

            el.getEl().on("contextmenu", this.onContextMenu.bind(this));

            pimcore.helpers.registerAssetDnDSingleUpload(el.getEl().dom, this.fieldConfig.uploadPath, 'path', function (e) {
                console.log(e['asset']['type']);
                if (e['asset']['type'] === "document") {
                    this.empty(true);
                    this.dirty = true;
                    this.data.id = e['asset']['id'];
                    this.updateIqmDocument();

                    return true;
                } else {
                    pimcore.helpers.showNotification(t("error"), t('unsupported_filetype'), "error");
                }
            }.bind(this), null, this.context);

            this.updateIqmDocument();

        }.bind(this));

        return this.component;
    },

    getLayoutShow: function () {
        if (!this.fieldConfig.width) {
            this.fieldConfig.width = 300;
        }
        if (!this.fieldConfig.height) {
            this.fieldConfig.height = 300;
        }

        var conf = {
            width: this.fieldConfig.width,
            height: this.fieldConfig.height,
            border: true,
            style: "padding-bottom: 10px",
            tbar: {
                overflowHandler: 'menu',
                items:
                    [{
                        xtype: "tbtext",
                        text: "<b>" + this.fieldConfig.title + "</b>"
                    }, "->",{
                        xtype: "button",
                        iconCls: "pimcore_icon_open",
                        overflowText: t("open"),
                        handler: this.openDocument.bind(this)
                    }]
            },
            cls: "object_field",
            bodyCls: "pimcore_droptarget_document pimcore_document_container"
        };

        this.component = new Ext.Panel(conf);

        this.component.on("afterrender", function (el) {
            el.getEl().on("contextmenu", this.onContextMenu.bind(this));
            this.updateIqmDocument();
        }.bind(this));

        return this.component;
    },

    onNodeDrop: function (target, dd, e, data) {

        if(!pimcore.helpers.dragAndDropValidateSingleItem(data)) {
            return false;
        }

        data = data.records[0].data;
        if (data.type === "document") {
            this.empty(true);

            if (this.data.id !== data.id) {
                this.dirty = true;
            }
            this.data.id = data.id;

            this.updateIqmDocument();
            return true;
        }

        return false;
    },

    openSearchEditor: function () {
        pimcore.helpers.itemselector(false, this.addDataFromSelector.bind(this), {
                type: ["asset"],
                subtype: {
                    asset: ["document"]
                }
            },
            {
                context: Ext.apply({scope: "objectEditor"}, this.getContext())
            });
    },

    uploadDialog: function () {
        pimcore.helpers.assetSingleUploadDialog(this.fieldConfig.uploadPath, "path", function (res) {
                try {
                    this.empty(true);

                    var data = Ext.decode(res.response.responseText);
                    if (data["id"] && data["type"] == "document") {
                        this.data.id = data["id"];
                        this.dirty = true;
                    }
                    this.updateIqmDocument();
                } catch (e) {
                    console.log(e);
                }
            }.bind(this),
            function (res) {
                const response = Ext.decode(res.response.responseText);
                if (response && response.success === false) {
                    pimcore.helpers.showNotification(t("error"), response.message, "error",
                        res.response.responseText);
                } else {
                    pimcore.helpers.showNotification(t("error"), res, "error",
                        res.response.responseText);
                }
            }.bind(this), this.context, "document");
    },

    addDataFromSelector: function (item) {

        this.empty(true);

        if (item) {
            if (!this.data || this.data.id != item.id) {
                this.dirty = true;
            }

            this.data = this.data || {};
            this.data.id = item.id;

            this.updateIqmDocument();
            return true;
        }
    },

    openDocument: function () {
        if (this.data) {
            pimcore.helpers.openAsset(this.data.id, "document");
        }
    },

    updateIqmDocument: function () {
        if(this.data && this.data["id"]) {
            // 5px padding (-10)
            var body = this.getBody();
            var width = body.getWidth() - 10;
            var height = this.fieldConfig.height - 60; // strage body.getHeight() returns 2? so we use the config instead

            var path = Routing.generate('pimcore_admin_asset_getdocumentthumbnail', {
                id: this.data.id,
                width: width,
                height: height,
                contain: true
            });

            body.removeCls("pimcore_droptarget_document");
            var innerBody = body.down('.x-autocontainer-innerCt');
            innerBody.setStyle({
                backgroundImage: "url(" + path + ")",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat"
            });
            body.repaint();
        }
    },

    getBody: function () {
        // get the id from the body element of the panel because there is no method to set body's html
        // (only in configure)

        var elements = Ext.get(this.component.getEl().dom).query(".pimcore_document_container");
        var bodyId = elements[0].getAttribute("id");
        var body = Ext.get(bodyId);
        return body;

    },

    onContextMenu: function (e) {

        var menu = new Ext.menu.Menu();

        if (this.data) {
            if(!this.fieldConfig.noteditable) {
                menu.add(new Ext.menu.Item({
                    text: t('empty'),
                    iconCls: "pimcore_icon_delete",
                    handler: function (item) {
                        item.parentMenu.destroy();

                        this.empty();
                    }.bind(this)
                }));
            }

            menu.add(new Ext.menu.Item({
                text: t('open'),
                iconCls: "pimcore_icon_open",
                handler: function (item) {
                    item.parentMenu.destroy();

                    this.openDocument();
                }.bind(this)
            }));
        }

        if(!this.fieldConfig.noteditable && pimcore.helpers.hasSearchImplementation()) {
            menu.add(new Ext.menu.Item({
                text: t('search'),
                iconCls: "pimcore_icon_search",
                handler: function (item) {
                    item.parentMenu.destroy();
                    this.openSearchEditor();
                }.bind(this)
            }));

            menu.add(new Ext.menu.Item({
                text: t('upload'),
                cls: "pimcore_inline_upload",
                iconCls: "pimcore_icon_upload",
                handler: function (item) {
                    item.parentMenu.destroy();
                    this.uploadDialog();
                }.bind(this)
            }));
        }

        menu.showAt(e.getXY());

        e.stopEvent();
    },

    empty: function () {
        if (this.data) {
            this.data = {};
        }

        var body = this.getBody();
        body.down('.x-autocontainer-innerCt').setStyle({
            backgroundImage: ""
        });
        body.addCls("pimcore_droptarget_document");
        this.dirty = true;
        body.repaint();
    },

    getValue: function () {
        return this.data;
    },

    getName: function () {
        return this.fieldConfig.name;
    },

    isDirty: function () {
        if (!this.isRendered()) {
            return false;
        }

        return this.dirty;
    },


    getCellEditValue: function () {
        return this.getValue();
    }
});

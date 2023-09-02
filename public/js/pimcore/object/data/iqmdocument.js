
pimcore.registerNS("pimcore.object.classes.data.iqmdocument");
/**
 * @private
 */
pimcore.object.classes.data.iqmdocument = Class.create(pimcore.object.classes.data.data, {

    type: "iqmdocument",
    /**
     * define where this datatype is allowed
     */
    allowIn: {
        object: true,
        objectbrick: true,
        fieldcollection: true,
        localizedfield: true,
        classificationstore : false,
        block: true
    },

    initialize: function (treeNode, initData) {
        this.type = "iqmdocument";

        this.initData(initData);

        this.treeNode = treeNode;
    },

    getTypeName: function () {
        return t("iqm_document");
    },

    getIconClass: function () {
        return "pimcore_icon_document";
    },

    getGroup: function () {
        return "media";
    },

    getLayout: function ($super) {

        $super();

        this.specificPanel.removeAll();
        this.specificPanel.add([
            {
                xtype: "textfield",
                fieldLabel: t("width"),
                name: "width",
                value: this.datax.width
            },
            {
                xtype: "displayfield",
                hideLabel: true,
                value: t('width_explanation')
            },
            {
                xtype: "textfield",
                fieldLabel: t("height"),
                name: "height",
                value: this.datax.height
            },
            {
                xtype: "displayfield",
                hideLabel: true,
                value: t('height_explanation')
            }
        ]);

        if(!this.isInCustomLayoutEditor()) {
            this.specificPanel.add({
                fieldLabel: t("upload_path"),
                name: "uploadPath",
                fieldCls: "input_drop_target",
                value: this.datax.uploadPath,
                disabled: this.isInCustomLayoutEditor(),
                width: 500,
                xtype: "textfield",
                listeners: {
                    "render": function (el) {
                        new Ext.dd.DropZone(el.getEl(), {
                            //reference: this,
                            ddGroup: "element",
                            getTargetFromEvent: function (e) {
                                return this.getEl();
                            }.bind(el),

                            onNodeOver: function (target, dd, e, data) {
                                if (data.records.length === 1 && data.records[0].data.elementType === "asset") {
                                    return Ext.dd.DropZone.prototype.dropAllowed;
                                }
                            },

                            onNodeDrop: function (target, dd, e, data) {

                                if (!pimcore.helpers.dragAndDropValidateSingleItem(data)) {
                                    return false;
                                }

                                try {
                                    data = data.records[0].data;
                                    if (data.elementType === "asset") {
                                        this.setValue(data.path);
                                        return true;
                                    }
                                } catch (e) {
                                    console.log(e);
                                }

                                return false;
                            }.bind(el)
                        });
                    }
                }
            });
        }
        return this.layout;
    },

    applySpecialData: function(source) {
        if (source.datax) {
            if (!this.datax) {
                this.datax =  {};
            }
            Ext.apply(this.datax,
                {
                    width: source.datax.width,
                    height: source.datax.height,
                    uploadPath: source.datax.uploadPath
                });
        }
    }

});

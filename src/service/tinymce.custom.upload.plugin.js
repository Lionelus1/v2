import {FileService} from "@/service/file.service";

export class TinymceCustomUploadPlugin {

    openDialog(editor, self) {
        let anchorNode = this.getAnchorElement(editor)
        let collectData = null;
        let targetFile = null;
        let selectedFile = null;
        let target = ""
        let link = ""
        let resultLink = ""
        const $this = this;

        if (anchorNode) {
            collectData = this.initData(editor, anchorNode)
            if (collectData && collectData.id) {
                this.getFile(collectData.id).then(res => {
                    selectedFile = res.data;
                }).catch(error => {
                    self.$toast.add({severity: "error", summary: error, life: 3000})
                })
            }
        }
        editor.windowManager.open({
            title: self.$t('hdfs.uploadTitle'),
            body: {
                type: 'panel',
                items: [
                    {
                        type: 'button', // component type
                        text: self.$t('hdfs.chooseFile'),
                        buttonType: 'primary',
                        name: 'customUploadBtn',
                        enabled: false,
                        borderless: false
                    },
                    {
                        type: 'input', // component type
                        name: 'link_input', // identifier
                        inputMode: 'text',
                        label: self.$t('common.link'), // text for the label
                        enabled: false
                    },
                    {
                        type: 'selectbox',
                        name: 'link_type',
                        label: self.$t('common.linkType'),
                        enabled: true,
                        items: [
                            {value: 'download', text: self.$t("common.linkTypeDownload")},
                            {value: 'view', text: self.$t('common.linkTypeView')}
                        ]
                    },
                    {
                        type: 'input',
                        name: 'title_input',
                        inputMode: 'text',
                        label: self.$t('common.nameIn'),
                        enabled: true
                    },
                    {
                        type: 'selectbox',
                        name: 'link_open_type',
                        label: self.$t('common.openLinkIn'),
                        enabled: false,
                        items: [
                            {value: 'current', text: self.$t('common.currentWindowLink')},
                            {value: 'blank', text: self.$t('common.newWindowLink')},
                            {value: 'pdfview', text: self.$t('common.dialogWindowsPdf')},
                        ]
                    },
                ]
            },
            initialData: {
                link_input: collectData && collectData.href ? collectData.href : "",
                title_input: collectData && collectData.title ? collectData.title : "",
                link_type: collectData && collectData.link && collectData.class ? 'view' : collectData && collectData.href && collectData.href.includes('serve?path=') ? 'view' : 'download',
                link_open_type: collectData && collectData.link && collectData.class ? 'pdfview' : collectData && collectData.target ? 'blank' : 'current'
            },
            onSubmit: function (api) {
                if (anchorNode) {
                    editor.focus();
                    $this.updateLink(editor, anchorNode, api.getData());
                } else {
                    editor.insertContent(resultLink);
                    self.$emit('onAfterUpload', selectedFile);
                }
                api.close();
            },
            onChange: function (api) {
                let link = self.generateListLink(selectedFile, api.getData().link_type)
                api.setData({link_input: link})
                resultLink = `<a href="${api.getData().link_input}">${api.getData().title_input}</a>`

                if (selectedFile && api.getData().link_open_type) {
                    switch (api.getData().link_open_type) {
                        case 'current':
                            api.setData({target: ''})
                            resultLink = `<a href="${link}" data-id="${selectedFile.uuid}">${api.getData().title_input}</a>`
                            break;
                        case 'blank':
                            api.setData({link_open_type: 'blank'})
                            resultLink = `<a href="${link}" target="_blank" data-id="${selectedFile.uuid}">${api.getData().title_input}</a>`
                            break;
                        case 'pdfview':
                            if (!$this.isPdf(targetFile ? targetFile : selectedFile)) {
                                api.setData({link_open_type: 'current'})
                                self.$toast.add({severity: "error", summary: self.$t('common.pdfTypeError'), life: 3000});
                                return;
                            }
                            api.setData({link_type: 'view'})
                            api.setData({link_input: self.generateListLink(selectedFile, 'view')})
                            resultLink = `<a href="javascript:void(0)" data-id="${selectedFile.uuid}" data-link="${self.generateListLink(selectedFile, 'view')}" class="pdfview">${api.getData().title_input}</a>`
                            break;
                        default:
                            resultLink = `<a href="${link}">${api.getData().title_input}</a>`
                            break;
                    }
                }
            },
            onAction: function (dialogApi, details) {
                if (details.name === 'customUploadBtn') {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        targetFile = e.target.files[0];
                        const fd = new FormData();
                        fd.append("files[]", file)
                        self.fileService.uploadFile(fd).then(res => {
                            selectedFile = res.data[0];
                            let linkType = dialogApi.getData().link_type
                            link = self.generateListLink(selectedFile, linkType)
                            dialogApi.setData({link_input: link, title_input: selectedFile.filename})
                            resultLink = `<a href="${dialogApi.getData().link_input}" data-id="${selectedFile.uuid}">${dialogApi.getData().title_input}</a>`
                            //window.tinymce.activeEditor.execCommand('mceInsertContent', false, this.generateList(item));
                            //self.$emit('onAfterUpload', item);
                        }).catch(error => {
                            self.$toast.add({severity: "error", summary: error, life: 3000});
                        });

                    });
                    input.click();
                }
            },
            buttons: [
                {
                    text: 'Close',
                    type: 'cancel',
                    onclick: 'close'
                },
                {
                    text: anchorNode ? 'Save' : 'Insert',
                    type: 'submit',
                    primary: true,
                    enabled: false
                }
            ]
        });
    }

    getAnchorElement(editor, selectedElm) {
        selectedElm = selectedElm || editor.selection.getNode();
        if (this.isImageFigure(selectedElm)) {
            return editor.dom.select('a[href]', selectedElm)[0];
        } else {
            return editor.dom.getParent(selectedElm, 'a[href]');
        }
    }

    isImageFigure(elm) {
        return elm && elm.nodeName === 'FIGURE' && /\bimage\b/i.test(elm.className);
    }

    initData(editor, anchorNode) {
        const dom = editor.dom
        let result = {}

        result.href = dom.getAttrib(anchorNode, 'href');
        result.class = dom.getAttrib(anchorNode, 'class');
        result.link = dom.getAttrib(anchorNode, 'data-link');
        result.title = this.getAnchorText(editor.selection, anchorNode)
        result.target = dom.getAttrib(anchorNode, 'target');
        result.id = dom.getAttrib(anchorNode, 'data-id');

        return result;
    }

    getAnchorText(selection, anchorElm) {
        let text = selection.getContent({format: 'text'});
        if (!text && text === "") {
            text = anchorElm.innerText || anchorElm.textContent || '';
        }
        return text.replace(/\uFEFF/g, '');
    }

    getFile(id) {
        const fileService = new FileService();
        return fileService.getFile({uuid: id})
    }

    isPdf(file) {
        if (file && file.type && file.type === 'application/pdf') {
            return true;
        }
        if (file && file.filepath && file.filepath.split(".").pop() === "pdf") {
            return true;
        }

        return false;
    }

    updateLink(editor, anchorElm, api) {
        if (this.has(anchorElm, 'innerText')) {
            anchorElm.innerText = api.title_input;
        } else {
            anchorElm.textContent = api.title_input;
        }

        let attrs = {
            href: api.link_input
        }
        if (api.link_open_type === "blank")
            attrs.target = "_blank"
        else
            attrs.target = ""

        if (api.link_open_type === "pdfview") {
            attrs.class = "pdfview";
            attrs["data-link"] = api.link_input
            attrs.href = "javascript:void(0)"
        } else {
            attrs["data-link"] = "";
            editor.dom.removeClass(anchorElm, "pdfview")
        }

        editor.dom.setAttribs(anchorElm, attrs);
        editor.selection.select(anchorElm);
    }

    has(obj, key) {
        return Object.hasOwnProperty.call(obj, key);
    }

    toggleActiveState(editor) {
        const self = this;
        return function (api) {
            function updateState() {
                api.setActive(!editor.mode.isReadOnly() && self.isInAnchor(editor, editor.selection.getNode()));
            }
            updateState();
            return self.toggleState(editor, updateState);
        };
    }

    toggleState(editor, toggler) {
        editor.on('NodeChange', toggler);
        return function () {
            editor.off('NodeChange', toggler);
        };
    }

    isInAnchor(editor, selectedElm) {
        return this.getAnchorElement(editor, selectedElm);
    }

    contractElementsDialog(editor, self) {
        editor.windowManager.open({
            title: self.$t('doctemplate.editor.addElement'),
            body: {
                type: 'panel',
                items: [
                    {
                        type: 'input',
                        name: 'link_input', // identifier
                        inputMode: 'text',
                        label: self.$t('common.description'),
                        enabled: false
                    },
                ]
            },
            buttons: [
                {
                    text: self.$t('common.no'),
                    type: 'cancel',
                    onclick: 'close'
                },
                {
                    text: self.$t('common.yes'),
                    type: 'submit',
                    primary: true,
                    enabled: false
                }
            ],
            onSubmit: function (api) {
                if(api.getData().link_input === '') return
                const enteredText = `<span style="color: blue; font-weight: bold; font-style: italic;">${`{text:` + api.getData().link_input + `}`}</span>`;
                editor.selection.setContent(enteredText);
                api.close();
            }
        })
    }
}
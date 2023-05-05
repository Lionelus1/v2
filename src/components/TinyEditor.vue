<template>
    <editor ref="myEditor" :api-key="editorApi" v-model="content" :init="editorOptions" :disabled="readonly"/>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import {uploadSingFile} from "../helpers/HelperUtil";
import {FileService} from "@/service/file.service";
import {downloadRoute, fileRoute, smartEnuApi} from "@/config/config";

export default {
    name: "TinyEditor",
    components: {
        'editor': Editor
    },
    props: {
        value: null,
        customFileUpload: {
            type: Boolean,
            default: false
        },
        height: {
            type: Number,
            default: 500
        },
        readonly: {
            type: Boolean,
            default: false
        }
    },
    emits: ['onAfterUpload'],
    data() {
        return {
            content: this.value,
            editorOptions: {
                height: this.height,
                fontsize_formats: "8px 10px 12px 14px 16px 18px 20px 22px 24px 36px 48px",
                menubar: false,
                toolbar_mode: 'wrap',
                allow_script_urls: true,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                ],
                toolbar:
                    `undo redo | fontselect fontsizeselect formatselect | formatselect | bold italic forecolor backcolor |
            alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |
            removeformat | table | link | image media ${this.customFileUpload ? `fileupload` : ''} | code `,
                images_upload_handler: uploadSingFile,
                language: this.$i18n.locale === "en" ? "en_US" : this.$i18n.locale === "kz" ? "kk" : this.$i18n.locale,
                content_style: "body { font-size: 14px; }",
                setup: editor => {
                    const self = this;
                    let targetFile = null;
                    let selectedFile = null;
                    let target = ""
                    let link = ""
                    let resultLink = ""
                    editor.ui.registry.addButton('fileupload', {
                        text: '<i class="fa-solid fa-file-arrow-up" style="font-size: 20px;"></i>',
                        onAction: () => {
                            //this.uploadFile();
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
                                                { value: 'download', text: self.$t("common.linkTypeDownload") },
                                                { value: 'view', text: self.$t('common.linkTypeView') }
                                            ]
                                        },
                                        {
                                            type: 'input', // component type
                                            name: 'title_input', // identifier
                                            inputMode: 'text',
                                            label: self.$t('common.nameIn'), // text for the label
                                            enabled: true
                                        },
                                        {
                                            type: 'selectbox',
                                            name: 'link_open_type',
                                            label: self.$t('common.openLinkIn'),
                                            enabled: false,
                                            items: [
                                                { value: 'current', text: self.$t('common.currentWindowLink') },
                                                { value: 'blank', text: self.$t('common.newWindowLink') },
                                                { value: 'pdfview', text: self.$t('common.dialogWindowsPdf') },
                                            ]
                                        },
                                    ]
                                },
                                onSubmit: function (api) {
                                    editor.insertContent(resultLink);
                                    self.$emit('onAfterUpload', selectedFile);
                                    // close the dialog
                                    api.close();
                                },
                                onChange: function(api) {
                                    let data = api.getData();
                                    if (selectedFile)
                                        api.setData({link_input: self.generateListLink(selectedFile, data.link_type)})

                                    if (selectedFile && data.link_open_type) {
                                        switch (data.link_open_type) {
                                            case 'current':
                                                resultLink = `<a href="${data.link_input}">${data.title_input}</a>`
                                                break;
                                            case 'blank':
                                                resultLink = `<a href="${data.link_input}" target="_blank">${data.title_input}</a>`
                                                break;
                                            case 'pdfview':
                                                if (targetFile.type !== 'application/pdf') {
                                                    api.setData({link_open_type: 'current'})
                                                    self.$toast.add({severity: "error", summary: self.$t('common.pdfTypeError'), life: 3000});
                                                    return;
                                                }
                                                api.setData({link_type: 'view'})
                                                api.setData({link_input: self.generateListLink(selectedFile, 'view')})
                                                resultLink = `<a href="javascript:void(0)" data-link="${self.generateListLink(selectedFile, 'view')}" class="pdfview">${data.title_input}</a>`
                                                break;
                                            default:
                                                resultLink = `<a href="${data.link_input}">${data.title_input}</a>`
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
                                        text: 'Insert',
                                        type: 'submit',
                                        primary: true,
                                        enabled: false
                                    }
                                ]
                            });
                        }
                    });
                }
            },
            editorApi: "60lj0ro6ojutgtjvqom1a5txsxm2azkl8pftmzhf8ddim86d",
            fileService: new FileService()
        }
    },
    watch: {
        value(newValue) {
            this.content = newValue;
        }
    },
    methods: {
        uploadFile() {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                const fd = new FormData();
                fd.append("files[]", file)
                this.fileService.uploadFile(fd).then(res => {
                    let item = res.data[0];
                    window.tinymce.activeEditor.execCommand('mceInsertContent', false, this.generateList(item));
                    this.$emit('onAfterUpload', item);
                }).catch(error => {
                    this.$toast.add({severity: "error", summary: error, life: 3000});
                });

            });
            input.click();
        },
        generateList(file) {
            return `<a href="${smartEnuApi + downloadRoute + file.uuid}">${file.filename}</a>`;
        },
        generateListLink(file, type) {
            let result = ""
            switch (type) {
                case 'view':
                    result = smartEnuApi + fileRoute + file.filepath;
                    break;
                case 'download':
                    result = smartEnuApi + downloadRoute + file.uuid;
                    break;
                default:
                    result = smartEnuApi + fileRoute + file.filepath;
                    break;
            }
            return result;
        },
    }
}
</script>

<style scoped>

</style>

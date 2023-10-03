<template>
    <editor  ref="myEditor" :api-key="editorApi" v-model="content" :init="editorOptions" :disabled="readonly"/>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import {uploadSingFile} from "../helpers/HelperUtil";
import {FileService} from "@/service/file.service";
import {downloadRoute, fileRoute, smartEnuApi} from "@/config/config";
import {TinymceCustomUploadPlugin} from "@/service/tinymce.custom.upload.plugin";

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
        contractElements: {
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
            showModal: false,
            content: this.value,
            tinyEditorService: new TinymceCustomUploadPlugin(),
            editorApi: "60lj0ro6ojutgtjvqom1a5txsxm2azkl8pftmzhf8ddim86d",
            fileService: new FileService(),
            editorOptions: {
                height: this.height,
                fontsize_formats: "8px 10px 12px 14px 16px 18px 20px 22px 24px 36px 48px",
                menubar: false,
                toolbar_mode: 'wrap',
                allow_script_urls: true,
                remove_script_host: false,
                relative_urls: false,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount pagebreak'
                ],
                toolbar:
                    `undo redo | fontselect fontsizeselect formatselect | ${this.contractElements ? `customSelect` : ''} | bold italic forecolor backcolor |
            alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |
            removeformat | table | link | image media ${this.customFileUpload ? `fileupload` : ''} | code | pagebreak`,
                contextmenu: 'link | customUploadContext',
                images_upload_handler: uploadSingFile,
                language: this.$i18n.locale === "en" ? "en_US" : this.$i18n.locale === "kz" ? "kk" : this.$i18n.locale,
                content_style: "html{background: #f7f7f7;display: flex; justify-content: center; } " +
                    "body {background: #fff; font-size: 14px; width: 794px; min-height:1122px; padding: 20px}" +
                    ".mce-pagebreak { background: #f7f7f7;border: none; height: 15px; width:900px; margin-left:-50px }" +
                    " @media(max-width: 500px){html{display: block; }}",
                setup: editor => {
                    const self = this;
                    this.content = this.value;
                    editor.ui.registry.addToggleButton('fileupload', {
                        text: '<i class="fa-solid fa-file-arrow-up" style="font-size: 20px;"></i>',
                        onAction: () => {
                            //this.uploadFile();
                            this.tinyEditorService.openDialog(editor, self)
                        },
                        onSetup: this.tinyEditorService.toggleActiveState(editor)
                    });
                    editor.ui.registry.addMenuButton('customSelect', {
                        text: this.$t('doctemplate.editor.contractElements'),
                        fetch: (callback) => {
                            const items = [
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.ourside'),
                                    onAction: () => onSelectItem('{ourside}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.contragent'),
                                    onAction: () => onSelectItem('{contragent}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.place'),
                                    onAction: () => onSelectItem('{place}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.date'),
                                    onAction: () => onSelectItem('{date}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.period'),
                                    onAction: () => onSelectItem('{period}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.student'),
                                    onAction: () => onSelectItem('{student}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.individualEntrepreneur'),
                                    onAction: () => onSelectItem('{individualEntrepreneur}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.text'),
                                    onAction: () => onSelectItem('text'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('common.number'),
                                    onAction: () => onSelectItem('{number}&nbsp;'),
                                },
                            ];
                            callback(items);
                        },
                    });
                    const onSelectItem = (value) => {
                        if (value === "text") {
                            this.tinyEditorService.contractElementsDialog(editor, self)
                        } else {
                            const styledText = `<span style="font-weight: bold ;color: blue;font-style: italic;">${value}</span>`;
                            editor.selection.setContent(styledText);
                        }
                        editor.execCommand('removeformat', false, null);
                    };
                }
            },
            modalText: true,
            displayModal: false,
            agreementDesctiption: "",
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
        insertModal() {},
        closeModal() {
            this.displayModal = false;
        },
    }
}
</script>

<style scoped>
.mce-pagebreak{
    background: #cccccc!important;
}
</style>

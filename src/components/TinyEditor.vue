<template>
    <editor ref="myEditor" :api-key="editorApi" v-model="content" :init="editorOptions" :disabled="readonly"/>
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
            tinyEditorService: new TinymceCustomUploadPlugin(),
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
                    'insertdatetime media table paste code help wordcount'
                ],
                toolbar:
                    `undo redo | fontselect fontsizeselect formatselect | formatselect | bold italic forecolor backcolor |
            alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |
            removeformat | table | link | image media ${this.customFileUpload ? `fileupload` : ''} | code `,
                contextmenu: 'link | customUploadContext',
                images_upload_handler: uploadSingFile,
                //language: this.$i18n.locale === "en" ? "en_US" : this.$i18n.locale === "kz" ? "kk" : this.$i18n.locale,
                content_style: "body { font-size: 14px; }",
                setup: editor => {
                    const self = this;
                    editor.ui.registry.addToggleButton('fileupload', {
                        text: '<i class="fa-solid fa-file-arrow-up" style="font-size: 20px;"></i>',
                        onAction: () => {
                            //this.uploadFile();
                            this.tinyEditorService.openDialog(editor, self)
                        },
                        onSetup: this.tinyEditorService.toggleActiveState(editor)
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

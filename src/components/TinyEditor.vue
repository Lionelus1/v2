<template>
  <editor ref="myEditor" :api-key="editorApi" v-model="content" :init="editorOptions" :disabled="readonly" />
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import {uploadSingFile} from "../helpers/HelperUtil";
import {FileService} from "@/service/file.service";
import {fileRoute, smartEnuApi} from "@/config/config";

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
          editor.ui.registry.addButton('fileupload', {
            text: '<i class="fa-solid fa-file-arrow-up" style="font-size: 20px;"></i>',
            onAction: () => {
              this.uploadFile();
              //window.tinymce.activeEditor.execCommand('mceInsertContent', false, `<ul><li>Custom FIle YPLOAD</li><li>Custom FIle YPLOAD</li><li>Custom FIle YPLOAD</li></ul>`);
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
        fd.append("files", file)
        this.fileService.uploadFile(fd).then(res => {
          let item = {filename: file.name, filepath: res.data[0].filePath};
          window.tinymce.activeEditor.execCommand('mceInsertContent', false, this.generateList(item));
          this.$emit('onAfterUpload', item);
        }).catch(error => {
          this.$toast.add({severity: "error", summary: error, life: 3000});
        });

      });
      input.click();
    },
    generateList(file) {
      return `<a href="${smartEnuApi + fileRoute + file.filepath}">${file.filename}</a>`;
    },
  }
}
</script>

<style scoped>

</style>

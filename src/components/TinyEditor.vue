<template>
  <editor ref="myEditor" :api-key="editorApi" v-model="content" :init="editorOptions"/>
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
    }
  },
  emits: ['customUpload'],
  data() {
    return {
      content: this.value,
      editorOptions: {
        height: this.height,
        fontsize_formats: "8px 10px 12px 14px 16px 18px 20px 22px 24px 36px 48px",
        menubar: false,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar:
            `undo redo | fontselect fontsizeselect formatselect | formatselect | bold italic backcolor |
            alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |
            removeformat | table | image media ${this.customFileUpload ? `fileupload` : ''} | code `,
        images_upload_handler: uploadSingFile,
        language: this.$i18n.locale === "en" ? "en_US" : this.$i18n.locale === "kz" ? "kk" : this.$i18n.locale,
        content_style: "body { font-size: 14px; }",
        setup: editor => {
          editor.ui.registry.addButton('fileupload', {
            text: '<i class="fa-solid fa-file-arrow-up" style="font-size: 20px;"></i>',
            onAction: () => {
              // Open file upload form
              this.uploadFile()
              //this.$refs.myEditor.click();
              //window.tinymce.activeEditor.execCommand('mceInsertContent', false, `<ul><li>Custom FIle YPLOAD</li><li>Custom FIle YPLOAD</li><li>Custom FIle YPLOAD</li></ul>`);
            }
          });
        }
      },
      editorApi: "60lj0ro6ojutgtjvqom1a5txsxm2azkl8pftmzhf8ddim86d",
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
      //event listeners
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        this.$emit('customUpload', file);
      });
      input.click();
    },
    generateList(list) {
      let listHtml = '';
      list.forEach(file => {
        listHtml += `<li><a href="${smartEnuApi + fileRoute + file.filePath}">${file.filePath}</a></li>`;
      });
      return listHtml;
    }
  }
}
</script>

<style scoped>

</style>

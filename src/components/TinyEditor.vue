<template>
  <editor ref="myEditor" :id="'tiny'" :api-key="editorApi" v-model="content" :init="editorOptions"/>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import {uploadSingFile} from "../helpers/HelperUtil";

export default {
  name: "TinyEditor",
  components: {
    'editor': Editor
  },
  props: {
    value: null,
    height: {
      type: Number,
      default: 500
    }
  },
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
            'undo redo | fontselect fontsizeselect formatselect | formatselect | bold italic backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | table | image media | code ',
        images_upload_handler: uploadSingFile,
        language: this.$i18n.locale === "en" ? "en_US" : this.$i18n.locale === "kz" ? "kk" : this.$i18n.locale,
        content_style: "body { font-size: 14px; }",
        file_picker_callback: this.uploadFile,
        setup: editor => {
          editor.ui.registry.addButton('customUpload', {
            text: '<i class="fa-solid fa-file-arrow-up" style="font-size: 20px;"></i>',
            onAction: () => {
              // Open file upload form
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
    uploadFile(cb, value, meta) {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      //event listeners
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.addEventListener('load', () => {
          //handle data processing with a blob
          const id = 'blobid' + (new Date()).getTime();
          const blobCache = window.tinymce.activeEditor.editorUpload.blobCache;
          const base64 = reader.result.split(',')[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { title: file.name });
        });
        reader.readAsDataURL(file);
      });
      input.click();
    }
  }
}
</script>

<style scoped>

</style>

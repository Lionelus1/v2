<template>
  <editor :api-key="editorApi" v-model="content" :init="editorOptions"/>
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
        language: this.$i18n.locale === "en" ? "en_US" : this.$i18n.locale === "kz" ? "kk" : this.$i18n.locale
      },
      editorApi: "60lj0ro6ojutgtjvqom1a5txsxm2azkl8pftmzhf8ddim86d",
    }
  },
  watch: {
    value(newValue) {
      console.log(newValue)
    }

  }
}
</script>

<style scoped>

</style>

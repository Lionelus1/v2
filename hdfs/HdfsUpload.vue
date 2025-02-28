<template>
  <div class="card">
    <h4>{{ $t('hdfs.uploadTitle') }}</h4>
    <vue-element-loading
        :active="loading"
        spinner="line-scale"
        color="#FF6700"
    />
    <FileUpload ref="form" mode="advanced" name="myFile" :customUpload="true" @uploader="upload($event)"
                v-bind:chooseLabel="$t('hdfs.chooseFile')" v-bind:uploadLabel="$t('hdfs.uploadBtn')" v-bind:cancelLabel="$t('hdfs.cancelBtn')" fileLimit="1">
      <template #empty>
        <p>{{ $t('hdfs.dragMsg') }}</p>
      </template>
    </FileUpload>
    <Message v-if="!isHidden" severity="success">{{ uploadedPath }}</Message>
  </div>
</template>

<script>
import api from "@/service/api";
import {smartEnuApi} from "@/config/config";

export default {
  data() {
    return {
      loading: false,
      dir: '',
      uploadedPath: null,
      isHidden: true
    }
  },
  mounted() {
    this.emitter.on("selectedDir", data => {
      this.dir = data ? data : "";
    });
  },
  methods: {
    onUpload() {
      this.$toast.add({severity: 'success', summary: this.$t('hdfs.success'), detail: this.$t('hdfs.toastMsg'), life: 3000});
    },
    upload(event) {
      this.loading = true;
      const fd = new FormData();
      fd.append('myFile', event.files[0]);
      fd.append('filePath', this.dir ? this.dir + '/' + event.files[0].name : event.files[0].name);
      api.post("/upload", fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }, ).then((r) => {
        if (r.data?.isUpload !== false) {
          this.onUpload();
          this.emitter.emit("updateAfterUpload", true);
          this.isHidden = false;
          this.uploadedPath = r.data.path;
          this.emitter.emit("uploadedFilePath", r.data.path)
        } else {
          this.$toast.add({severity: 'error', summary: 'Error', detail: r.data.msg, life: 3000});
          this.emitter.emit("updateAfterUpload", false);
        }
        this.loading = false;
        this.$refs['form'].clear();
      }, (error) => {
        this.$toast.add({severity: 'error', summary: 'Error', detail: error.message, life: 3000});
      });
    }
  }
}
</script>

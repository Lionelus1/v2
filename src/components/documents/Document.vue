<template>
  <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
  <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
  <div>
    <embed :src="pdf" style="width: 100%; height: 1000px" v-if="pdf" type="application/pdf"/>
  </div>
</template>
<script>
import api from '@/service/api';

import { getHeader, smartEnuApi, b64toBlob } from "@/config/config";

export default {
  name: 'References',
  data() {
    return {
      loading: false,

      pdf: null,
    }
  },
  mounted() {
    this.getPdf()
  },
  methods: {
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    getPdf() {
      this.loading = true

      api.post('/document/download', {
        uuid: this.$route.params.uuid,
      }, {
        headers: getHeader() 
      }).then(res => {
        this.pdf = b64toBlob(res.data);

        this.loading = false
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      })
    },
  }
}
</script> 

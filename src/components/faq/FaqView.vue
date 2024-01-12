<template>
  <div class="col-12">
    <Card v-if="!loading">
      <template #content>
        <h5 class="card-title mb-2" v-html="faq.content"></h5>
        <div class="mt-2">
          <span>{{ formatDate(faq.sendDate) }}</span>
          <span :class="'ml-5 customer-badge status-' + faq.status.id">
            {{
              $i18n.locale === "kz"
                ? faq.status.nameKz
                : $i18n.locale === "ru"
                ? faq.status.nameRu
                : faq.status.nameEn
            }}
          </span>
        </div>
      </template>
      <template #footer v-if="faq.filePath || faq.image">
        <Button
          type="button"
          icon="pi pi-image"
          @click="downloadFile(faq.image, 0)"
          class="p-button-rounded p-button-success mr-2"
          v-if="faq.image != null"
        ></Button>
        <Button
          type="button"
          icon="pi pi-file"
          @click="downloadFile(faq.filePath, 1)"
          class="p-button-rounded p-button-success"
          v-if="faq.filePath != null"
        ></Button>
      </template>
    </Card>
    <Card class="mt-3" v-if="!loading">
      <template #title> <h5 class="card-title">{{ $t('faq.answer') }}</h5> </template>
      <template #content>
        <div v-html="faq.answer.answer"></div>
        <div v-if="!faq.answer.answer">
          <h5>{{ $t('common.noData') }}</h5>
        </div>
      </template>
      <template #footer v-if="faq.answer.filePath">
        <Button
          type="button"
          icon="pi pi-file"
          @click="downloadFile(faq.answer.filePath, 1)"
          class="p-button-rounded p-button-success"
          v-if="faq.answer.filePath != null"
        ></Button>
      </template>
    </Card>
  </div>
</template>

<script>
import { getHeader, smartEnuApi } from "../../config/config";
import {FaqService} from "@/service/faq.service"
export default {
  data() {
    return {
      faqId: null,
      faq: null,
      loading: true,
      currentUser: null,
      faqService: new FaqService()
    };
  },
  created() {
    this.faqId = this.$route.params.id;
    this.getFaqById();
    this.currentUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  methods: {
    getFaqById() {
      const req = {
            faqId: parseInt(this.faqId),
          }
      this.faqService.getById(req).then((response) => {
          this.faq = response.data;

          this.loading = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    downloadFile(fileName, fileType) {
      const req = { filename: fileName, fileType: fileType }
      this.faqService.downloadFile(req).then((response) => {
          // const blob = new Blob([response.data], )
          const link = document.createElement("a");
          link.href = "data:application/octet-stream;base64," + response.data;
          link.setAttribute("download", fileName);
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: "downloadFileError:\n" + error,
            life: 3000,
          });
        });
    },
    formatDate(value) {
      var result = "";
      if (value == null) {
        return result;
      }
      var date = new Date(value);
      result = date.toLocaleDateString("kk-KZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return result == "Invalid Date" ? "" : result;
    },
  },
};
</script>

<style lang="scss" scoped>
.card-title {
  color: #495057;
  font-weight: 500;
}
</style>

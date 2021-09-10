<template>
  <div class="p-col-12">
    <Card v-if="!loading">
      <template #content>
        <h5 class="card-title p-mb-2" v-html="faq.content"></h5>
        <div class="p-mt-2">
          <span>{{ formatDate(faq.sendDate) }}</span>
          <span :class="'p-ml-5 customer-badge status-' + faq.status.id">
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
          class="p-button-rounded p-button-success p-mr-2"
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
    <Card class="p-mt-3" v-if="!loading">
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
import axios from "axios";
import { getHeader, smartEnuApi } from "../../config/config";
export default {
  data() {
    return {
      faqId: null,
      faq: null,
      loading: true,
      currentUser: null,
    };
  },
  created() {
    this.faqId = this.$route.params.id;
    this.getFaqById();
    this.currentUser = JSON.parse(localStorage.getItem("loginedUser"));
    console.log(this.currentUser);
  },
  methods: {
    getFaqById() {
      axios
        .post(
          smartEnuApi + "/faq/getById",
          {
            faqId: parseInt(this.faqId),
          },
          { headers: getHeader() }
        )
        .then((response) => {
          this.faq = response.data;

          this.loading = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    downloadFile(fileName, fileType) {
      axios
        .post(
          smartEnuApi + "/faq/downloadFile",
          { filename: fileName, fileType: fileType },
          {
            headers: getHeader(),
          }
        )
        .then((response) => {
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
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-2 {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-3 {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-negotiation {
    background: #feedaf;
    color: #8a5340;
  }

  &.status-1 {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-4 {
    background: #eccfff;
    color: #694382;
  }

  &.status-proposal {
    background: #ffd8b2;
    color: #805b36;
  }

  &.online {
    background: #c8e6c9;
    color: #256029;
  }

  &.offline {
    background: #ffcdd2;
    color: #c63737;
  }
}

.card-title {
  color: #495057;
  font-weight: 500;
}
</style>

<template>
  <div class="card">
    <BlockUI :blocked="loading" :fullScreen="true">
      <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
    </BlockUI>
    <div v-if="question" class="grid">
      <div class="product-grid-item card">
        <h5>{{ $t("faq.question") }}</h5>

        <div class="product-grid-item-top p-mb-2 grid">
          <div class="lg:col-2 md:col-6 p-sm-6">
                        <span>
                        <i class="fa-solid fa-at product-category-icon"></i>
                        <small>№&nbsp;{{ question.id }} </small><br/>
                        <small class="product-category">{{ question.lastName + " " + question.firstName }}</small>
                        </span>
          </div>
          <div class="lg:col-2 md:col-6 p-sm-6">
                        <span>
                        <small class="product-category">{{ question.mobile + " " + question.email }}</small>
                        </span>
          </div>
          <div class="lg:col-2 md:col-6 p-sm-6">
            <i class="fa-solid fa-tags product-category-icon"></i>
            <small class="product-category">{{ question.category['name' + $i18n.locale].split("(")[0] }}</small>
          </div>
          <div class="lg:col-3 md:col-6 p-sm-6">
            <span v-if="loginedUser" :class="'customer-badge status-' + question.state.id">{{ $t("common.states." + question.state.code) }}</span>
          </div>

          <div class="lg:col-3 md:col-6 p-sm-12 text-right">
            <i class="fa-solid fa-calendar-days product-category-icon"></i>
            <small class="product-category">{{ moment(new Date(question.createdDate)).utc().format("DD.MM.YYYY") }}</small>
          </div>
        </div>
        <div class="product-grid-item-content">
          <p class="block-with-text">{{ question.question }}</p>
        </div>
        <div v-if="question.filePath" class="p-w-100 text-right">
          <Button :label="$t('faq.attachments')" icon="pi pi-download" @click="downloadFile(question.filePath)"></Button>
        </div>
        <div v-if="question.state.id ==1 && findRole(null, 'faq_receiption_request_admin')" class="p-w-100 text-right">
          <Button :label="$t('common.send')" @click="sendDialog = true" class="p-button-info p-mt-2 "></Button>
        </div>


      </div>

      <div v-if="question.replier" class="product-grid-item card">
        <h5>{{ $t("faq.answer") }}</h5>

        <div class="product-grid-item-top p-mb-2">
          <div class="col-12 grid">
            <div v-if="loginedUser" class="lg:col-6  md:col-6 p-sm-6">
                            <span v-if="question.replier != null">
                                <i class="fa-solid fa-user-tag product-category-icon"></i>
                                <small class="product-category">{{ question.replier.fullName }}</small>
                            </span>
            </div>
            <div v-if="question.replyDate" class="lg:col-6  md:col-6 p-sm-6 text-right">
              <i class="fa-solid fa-calendar-days product-category-icon"></i>
              <small class="product-category">{{ moment(new Date(question.replyDate)).utc().format("DD.MM.YYYY") }}</small>
            </div>
          </div>
        </div>
        <div class="product-grid-item-content text-left">
          <div v-if="loginedUser && question.replier.userID && loginedUser.userID == question.replier.userID">
            <Editor :readonly="question.state.id !=8" v-model="question.answer" editorStyle="height: 200px"/>
            <div class="p-w-100 text-right">
              <Button v-if="question.state.id ==8" :label="$t('faq.toAnswer')" class="p-button-info p-mt-2" @click="answer"></Button>
            </div>
          </div>
          <div v-else class="block-with-text" v-html="question.answer"></div>
        </div>

      </div>
    </div>
    <Dialog @hide="responsible=null" :header="$t('common.sendToResponsible')" v-model:visible="sendDialog" :modal="true" :style="{width: '75vw'}">
      <div class="p-field">
        <label>{{ this.$t("queue.responsible") }}</label>
        <FindUser v-model="responsible" :max="1" style="width:100%" :editMode="false"/>
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" @click="sendDialog=false"/>
        <Button :label="$t('common.yes')" autofocus @click="sendToResponsible"/>
      </template>
    </Dialog>

  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi, findRole} from "../../config/config";
import moment from "moment";
import ReceptionService from "@/service/reception.service";

export default {
  data() {
    return {
      questionID: null,
      question: null,
      loading: false,
      loginedUser: null,
      sendDialog: false,
      request: {
        questionID: -1,
        replierID: -1,
      },
      responsible: null,
      receptionService: new ReceptionService()
    };
  },
  methods: {
    moment: moment,
    findRole: findRole,
    getQuestion() {
      this.loading = true;
      let data = {questionID: this.questionID};
      this.receptionService.getQuestion(data).then(response => {
        this.question = response.data;
        this.loading = false;
      }).catch(error => {
        this.loading = false;
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    downloadFile(filePath) {
      this.loading = true;
      let data = {filePath: filePath};
      this.receptionService.downloadFile(data).then(response => {
        const link = document.createElement("a");
        link.href = "data:application/octet-stream;base64," + response.data;
        link.setAttribute("download", filePath);
        link.download = filePath;
        link.click();
        URL.revokeObjectURL(link.href);
        this.loading = false;
      })
          .catch((error) => {
            this.$toast.add({
              severity: "error",
              summary: "downloadFileError:\n" + error,
              life: 3000,
            });
            this.loading = false;
          });

    },
    answer() {
      this.$confirm.require({
        message: this.$t("faq.answerConfirm"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {

          if (this.question.answer === null || this.question.answer === "") {
            this.$toast.add({
              severity: "error",
              summary: this.$t('common.message.fillError'),
              life: 3000,
            });
          }
          this.loading = true
          let data = {questionID: this.questionID, answer: this.question.answer};
          this.receptionService.answer(data).then(_ => {
            this.question.state.id = 7;
            this.question.state.code = "replied";
            this.loading = false;
          }).catch(error => {
            this.loading = false;
            if (error.response && error.response.status === 405) {
              this.$toast.add({
                severity: "error",
                summary: this.$t("common.message.notAllowed"),
                life: 3000,
              });
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("common.message." + error),
                life: 3000,
              });
            }
          });
        },
        reject: () => {
          this.$toast.add({severity: 'info', summary: 'Rejected', detail: this.$t("faq.rejected"), life: 3000});
        }
      });
    },
    sendToResponsible() {
      this.loading = true;
      if (this.responsible === null || this.responsible.length < 0) {
        this.$toast.add({
          severity: "error",
          summary: this.$t('common.message.fillError'),
          life: 3000,
        });
        this.loading = false;
        return
      }
      this.request.questionID = this.question.id
      this.request.replierID = this.responsible[0].userID
      this.receptionService.sendToResponsible(this.request).then(_ => {
        this.question.replier = JSON.parse(JSON.stringify(this.responsible[0]))
        this.question.state.id = 8
        this.question.state.code = "pending"

        this.responsible = null
        this.loading = false;
        this.sendDialog = false;
        this.$toast.add({
          severity: "success",
          summary: this.$t("common.message.successCompleted"),
          life: 3000,
        });
      }).catch((error) => {
        this.loading = false;
        if (error.response && error.response.status === 405) {
          {
            this.$toast.add({
              severity: "error",
              summary: this.$t("common.message.notAllowed"),
              life: 3000,
            });
          }
        }
      });

    },
  },
  created() {
    this.questionID = Number(this.$route.params.id);
    this.getQuestion();
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"))

  },
}
</script>
<style lang="scss" scoped>
::v-deep(.product-list-item) {
  display: flex;
  align-items: center;
  padding: 1rem;
  width: 100%;

  img {
    width: 150px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    margin-right: 2rem;
  }

  .product-list-detail {
    flex: 1 1 0;
  }

  .p-rating {
    margin: 0 0 .5rem 0;
  }

  .product-price {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: .5rem;
    align-self: flex-end;
  }

  .product-list-action {
    display: flex;
    flex-direction: column;
  }

  .p-button {
    margin-bottom: .5rem;
  }

}

.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-7 {
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

  &.status-8 {
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

::v-deep(.product-grid-item) {
  margin: .5em;
  border: 1px solid #dee2e6;
  width: 100%;

  .product-grid-item-top,
  .product-grid-item-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }


  .product-grid-item-content {
    text-align: center;
  }

  .product-price {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .product-category-icon {
    vertical-align: middle;
    margin-right: .5rem;
  }

  .block-with-text {
    overflow: visible;
    position: relative;
    line-height: normal;
    text-align: justify;
    margin-right: -1em;
    padding-right: 1em;
  }
}
</style>
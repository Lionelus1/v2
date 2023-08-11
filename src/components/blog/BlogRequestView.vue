<template>
  <div class="col-12">
    <div class="card">
      <BlockUI :blocked="loading" :fullScreen="true">
        <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em" />
      </BlockUI>
      <div v-if="question" class="grid">
        <div class="product-grid-item card">
          <h5>{{ $t("faq.question") }}</h5>

          <div class="product-grid-item-top mb-2 grid">
            <div class="lg:col-2 md:col-6 p-sm-6">
              <span>
                <i class="fa-solid fa-at product-category-icon"></i>
                <small>№&nbsp;{{ question.id }} </small><br />
                <small class="product-category">{{ question.fullName }}</small>
              </span>
            </div>
            <div class="lg:col-2 md:col-6 p-sm-6" v-if="question.mobile && question.email">
              <span><small class="product-category">{{ question.mobile + " " + question.email }}</small></span>
            </div>
            <!--          <div class="lg:col-2 md:col-6 p-sm-6">
                        <i class="fa-solid fa-tags product-category-icon"></i>
                        <small class="product-category">{{ question.category['name' + $i18n.locale].split("(")[0] }}</small>
                      </div>-->
            <div class="lg:col-3 md:col-6 p-sm-6">
              <span v-if="loginedUser && question.state" :class="'customer-badge status-' + question.state.id">{{
                $t("common.states." + question.state.code) }}</span>
            </div>

            <div class="lg:col-3 md:col-6 p-sm-12 text-right">
              <i class="fa-solid fa-calendar-days product-category-icon"></i>
              <small class="product-category">{{ moment(new Date(question.created_date)).utc().format("DD.MM.YYYY")
              }}</small>
            </div>
          </div>
          <div class="product-grid-item-content">
            <p class="block-with-text">{{ question.question }}</p>
          </div>
          <!--        <div v-if="question.filePath" class="p-w-100 text-right">
                    <Button :label="$t('faq.attachments')" icon="pi pi-download" @click="downloadFile(question.filePath)"></Button>
                  </div>-->
        </div>

        <div v-if="question.ownedBy" class="product-grid-item card">
          <h5>{{ $t("faq.answer") }}</h5>

          <div class="product-grid-item-top mb-2">
            <div class="col-12 grid">
              <div v-if="loginedUser" class="lg:col-6  md:col-6 p-sm-6">
                <span v-if="question.ownedBy">
                  <i class="fa-solid fa-user-tag product-category-icon"></i>
                  <small class="product-category">{{ question.ownedBy.fullName }}</small>
                </span>
              </div>
              <div v-if="question.answered_date" class="lg:col-6  md:col-6 p-sm-6 text-right">
                <i class="fa-solid fa-calendar-days product-category-icon"></i>
                <small class="product-category">{{ moment(new Date(question.answered_date)).utc().format("DD.MM.YYYY")
                }}</small>
              </div>
            </div>
          </div>
          <div class="product-grid-item-content text-left">
            <div v-if="loginedUser && question.ownedBy.userID && loginedUser.userID === question.ownedBy.userID">
              <TinyEditor :readonly="question.state.id !== 8" v-model="question.answer" :height="300" />
              <div class="p-w-100 text-right">
                <Button v-for="(button, index) in actionButtons" :key="index" :label="button.label" :icon="button.icon"
                  :class="['p-button-info', 'mt-2', button.customClass]" @click="button.handler" />
              </div>
            </div>
            <div v-else class="block-with-text" v-html="question.answer"></div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from "vue-i18n/dist/vue-i18n.esm-bundler";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router/dist/vue-router";
import { BlogService } from "../../service/blog.service";
import { formatDate } from "../../helpers/HelperUtil";
import TitleBlock from "@/components/TitleBlock.vue";
import moment from "moment";

export default {
  name: "BlogRequestView",
  setup() {
    const route = useRoute()
    const i18n = useI18n()
    const toast = useToast()
    const confirm = useConfirm()
    const loading = ref(false)
    const question = ref([])
    const blogService = new BlogService()
    const questionId = ref(route.params.id)
    const loginedUser = ref(JSON.parse(localStorage.getItem("loginedUser")))

    const getBlogRequestById = () => {
      loading.value = true;
      blogService.getBlogRequestById(questionId.value).then(res => {
        if (res.data)
          question.value = res.data
        loading.value = false;
      }).catch(error => {
        loading.value = false
        toast.add({ severity: "error", summary: error, life: 3000 });
      });
    }
    getBlogRequestById();

    const editAnswer = () => {
      confirm.require({
        message: i18n.t("web.editAnswerConfirm"),
        header: i18n.t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          if (question.value.answer === null || question.value.answer === "") {
            toast.add({
              severity: "error",
              summary: i18n.t('common.message.fillError'),
              life: 3000,
            });
          }
          question.value.state.id = 8;
        },
        reject: () => {
          toast.add({ severity: 'info', summary: 'Rejected', detail: i18n.t("faq.rejected"), life: 3000 });
        }
      });

    }

    const answer = () => {
      confirm.require({
        message: i18n.t("faq.answerConfirm"),
        header: i18n.t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {

          if (question.value.answer === null || question.value.answer === "") {
            toast.add({
              severity: "error",
              summary: i18n.t('common.message.fillError'),
              life: 3000,
            });
          }
          loading.value = true
          let data = { id: parseInt(questionId.value), answer: question.value.answer };
          blogService.sendBlogRequestAnswer(data).then(_ => {
            question.value.state.id = 7;
            question.value.state.code = "replied";
            loading.value = false;
          }).catch(error => {
            loading.value = false;
            if (error.response && error.response.status === 405) {
              toast.add({
                severity: "error",
                summary: i18n.t("common.message.notAllowed"),
                life: 3000,
              });
            } else {
              toast.add({
                severity: "error",
                summary: i18n.t("common.message." + error),
                life: 3000,
              });
            }
          });
        },
        reject: () => {
          toast.add({ severity: 'info', summary: 'Rejected', detail: i18n.t("faq.rejected"), life: 3000 });
        }
      });
    }

    return {
      loading, question, loginedUser,
      formatDate, answer, moment, editAnswer
    }
  },
  computed: {
    actionButtons() {
      const buttons = [];

      if (this.question.state.id === 8) {
        buttons.push({
          label: this.$t('faq.toAnswer'),
          icon: 'pi pi-reply',
          customClass: '',
          handler: this.answer,
        });
      }

      if (this.question.state.id === 7) {
        buttons.push({
          label: this.$t('web.editAnswer'),
          icon: 'pi pi-check',
          customClass: '',
          handler: this.editAnswer,
        });
      }

      return buttons;
    },
  },
}
</script>

<style scoped lang="scss">
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
    flex-order-: space-between;
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
  .edit-answer {
    background-color: #256029;
  }
}
</style>

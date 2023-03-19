<template>
  <div class="col-12">
    <div class="card">
      <BlockUI :blocked="loading" :fullScreen="true">
        <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
      </BlockUI>
      <div v-if="question" class="grid">
        <div class="product-grid-item card">
          <h5>{{ $t("faq.question") }}</h5>

          <div class="product-grid-item-top mb-2 grid">
            <div class="lg:col-2 md:col-6 p-sm-6">
              <span>
                <i class="fa-solid fa-at product-category-icon"></i>
                <small class="m-1">№&nbsp;{{ question.id }} </small><br/>
                <small class="product-category">{{ question.last_name + " " + question.first_name }}</small>
              </span>
            </div>
            <div class="lg:col-2 md:col-6 p-sm-6">
              <span v-if="question.mobile && question.email">
                <small class="product-category">{{ question.mobile + " " + question.email }}</small>
              </span>
            </div>
            <!--            <div class="lg:col-2 md:col-6 p-sm-6">
                          <i class="fa-solid fa-tags product-category-icon"></i>
                          <small class="product-category">{{ question.category['name' + $i18n.locale].split("(")[0] }}</small>
                        </div>-->
            <!--            <div class="lg:col-3 md:col-6 p-sm-6">
                          <span v-if="loginedUser" :class="'customer-badge status-' + question.state.id">
                            {{ $t("common.states." + question.state.code) }}
                          </span>
                        </div>-->
            <div class="lg:col-3 md:col-6 p-sm-12 text-right">
              <i class="fa-solid fa-calendar-days product-category-icon"></i>
              <small class="product-category m-1">
                {{ formatDate(new Date(question.created_date)) }}
              </small>
            </div>
          </div>
          <div class="product-grid-item-content">
            <p class="block-with-text">{{ question.question }}</p>
          </div>
          <div v-if="question.filePath" class="p-w-100 text-right">
            <Button :label="$t('faq.attachments')" icon="pi pi-download"
                    @click="downloadFile(question.filePath)"></Button>
          </div>
          <!--          <div v-if="question.state.id ==1 && findRole(null, 'faq_receiption_request_admin')"
                         class="p-w-100 text-right">
                      <Button :label="$t('common.send')" @click="sendDialog = true" class="p-button-info mt-2 "></Button>
                    </div>-->
        </div>

        <!--        <div v-if="question.owner_id" class="product-grid-item card">-->
        <div class="product-grid-item card">
          <h5>{{ $t("faq.answer") }}</h5>

          <div class="product-grid-item-top mb-2">
            <div class="col-12 grid">
<!--              <div v-if="loginedUser" class="lg:col-6  md:col-6 p-sm-6">
                            <span v-if="question.replier != null">
                                <i class="fa-solid fa-user-tag product-category-icon"></i>
                                <small class="product-category">{{ question.replier.fullName }}</small>
                            </span>
              </div>-->
              <div v-if="question.answered_date" class="lg:col-6  md:col-6 p-sm-6 text-right">
                <i class="fa-solid fa-calendar-days product-category-icon"></i>
                <small class="product-category">
                  {{ formatDate(question.answered_date) }}
                </small>
              </div>
            </div>
          </div>
          <div class="product-grid-item-content text-left">
            <!--            <div v-if="loginedUser && question.owner_id && loginedUser.userID === question.owner_id">-->
            <div>
              <TinyEditor v-model="question.answer"/>
              <!--              <Editor :readonly="question.state.id !=8" v-model="question.answer" editorStyle="height: 200px"/>-->
              <div class="p-w-100 text-right">
                <Button v-if="question.state && question.state.id === 8" :label="$t('faq.toAnswer')" class="p-button-info mt-2"
                        @click="answer"></Button>
              </div>
            </div>
            <!--            <div v-else class="block-with-text" v-html="question.answer"></div>-->
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script>
import {useI18n} from "vue-i18n/dist/vue-i18n.esm-bundler";
import {useToast} from "primevue/usetoast";
import {useConfirm} from "primevue/useconfirm";
import {ref} from "vue";
import {useRoute, useRouter} from "vue-router/dist/vue-router";
import {BlogService} from "../../service/blog.service";
import {formatDate} from "../../helpers/HelperUtil";

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
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }
    getBlogRequestById();

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
          let data = {id: parseInt(questionId.value), answer: question.value.answer};
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
          toast.add({severity: 'info', summary: 'Rejected', detail: i18n.t("faq.rejected"), life: 3000});
        }
      });
    }

    return {
      loading, question, loginedUser,
      formatDate, answer
    }
  }
}
</script>

<style scoped>

</style>

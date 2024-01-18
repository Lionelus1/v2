<template>
  <div class="request_card">
    <div class="grid">
        <BlockUI :blocked="uploading" :fullScreen="true">
          <ProgressBar v-if="uploading" mode="indeterminate" style="height: .5em" />
        </BlockUI>

        <div class="card p-fluid">
          <h5 class="text-center uppercase">{{$t("publicReception.title")}}</h5>

          <SelectButton class="mb-2" v-model="language" :options="languages" optionLabel="name" @change="changeLanguage" />

          <p class="message" v-if="$i18n.locale ==='kz'" style="text-align:justify">
            <b>Құрметті Еуразиялық!</b>
            Сіз сырт қалмай, университетіміздің болашағына қатысты өз ойларыңызбен, ескертулеріңізбен және ұсыныстарыңызбен бөлісуге дайындығыңызға қуаныштымыз.
            Сіздің пікіріңіз біз үшін өте маңызды. Университетіміздің басты құжаты – Даму стратегиясын жаңарту кезінде оларды барынша ескеруге тырысамыз.
            Университетіміздің дамуына қосқан үлесіңіз үшін рақмет.
          </p>
          <p class="message" v-if="$i18n.locale ==='ru'" style="text-align:justify">
            <b>Дорогой Евразиец!</b>
            Мы рады, что Вы не остались в стороне и готовы поделиться своими идеями, замечаниями и предложениями относительно будущего нашего университета.
            Ваше мнение для нас очень важно. Мы постараемся их учесть при актуализации главного документа нашего университета – Стратегии развития.
            Благодарим Вас за вклад в развитие нашего университета.

          </p>
          <p class="message" v-if="$i18n.locale ==='en'" style="text-align:justify">
            <b>Dear Eurasian!</b>
            We are glad that you have not stayed away and are ready to share your ideas, comments and suggestions regarding the future of our university.
            Your every opinion is very important to us. We will try to take them into account to update the main document of our university – the Development Strategy.
            Thank you for your contribution to the development of our university.
          </p>
          <div class="field">
            <label for="question">
              <span v-if="$i18n.locale ==='kz'">Ұсыныс*</span>
              <span v-if="$i18n.locale ==='ru'">Предложение*</span>
              <span v-if="$i18n.locale ==='en'">Suggestion*</span>
            </label>
            <Textarea id="question" :autoResize="true" v-model="request.question"/>
            <small class="p-error" v-if="validation.question">{{$t("common.requiredField")}}</small>
          </div>
          <div class="field">
            <vue-recaptcha ref="captcha" sitekey="6LfSS5MjAAAAAAmSxN43yiDEQJdFRhoF5Ctc8uPj" @verify="isCaptchaSuccess = true"></vue-recaptcha>
            <small class="p-error" v-if="validation.captcha">{{$t("common.requiredField")}}</small>
          </div>
          <div class="field">
            <Button :label="$t('common.action.submit')" @click="sendQuestion" />
          </div>
          <span class="footer-text no-print" style="margin-right: 5px">@ {{$t("common.orgname")}}</span>
        </div>
      </div>
      <Dialog v-model:visible="uploaded" :containerStyle="{width: '50vw'}" :modal="true" @hide="clear">
        <p>Сұрақ <b>{{request.number}}</b> нөмірімен сәтті тіркелді. Жауап сіз көрсеткен электрондық поштаға хабарлама ретінде келіп түседі немесе жауапты тұлға телефон нөмірі бойынша хабарласады.</p>

        <p>Вопрос успешно зарегистрирован под номером  <b>{{request.number}}</b> . Ответ придет в виде сообщения на ваш e-mail или ответственное лицо свяжется по указанному вами номеру телефона.</p>

        <p>Question successfully registered under number <b>{{request.number}}</b>. The answer will come in the form of a message to your e-mail or the responsible person will contact you on the phone number specified by you.</p>

      </Dialog>
    </div>
  <Toast/>
</template>
<script>
import api from "@/service/api";
import {smartEnuApi} from "@/config/config";
import {VueRecaptcha} from "vue-recaptcha";
import ReceptionService from "@/service/reception.service";

export default {
  components: {VueRecaptcha},
  props: {
    pagemenu: null,
  },
  data() {
    return {
      languages: [
        { name: "Қазақ", value: "kz" },
        { name: "Русский", value: "ru" },
        { name: "English", value: "en" },
      ],
      uploading: false,
      uploaded: false,
      language: null,
      request: {
        email: "smartenu@enu.kz",
        lastName: "Стратегия",
        firstName: "Стратегия",
        mobile: "Стратегия",
        question: "",
        category: {id:19},
        count: 0,
        number: null,
      },
      validation: {
        email: false,
        lastName: false,
        firstName: false,
        mobile: false,
        question: false,
        category: false,
        captcha: false
      },
      categories : null,
      isCaptchaSuccess: false,
      receptionService: new ReceptionService()
    };
  },
  methods: {
    changeLanguage() {
      if (this.$i18n.locale !== this.language.value) {
        localStorage.setItem("lang", this.language.value);
        this.$i18n.locale = this.language.value;
      }
    },
    validateEmail() {
      // eslint-disable-next-line
      if (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.request.email)) {
        this.validation.email = false;
      }
      else {
        this.validation.email = true;
      }
    },
    clear() {
      this.request = {
        question: "",
        count: 0,
        number: null,
      }
    },
    upload(event) {
      this.request.document = event.files[0]
    },
    notValid() {
      this.validation.question = this.request.question === null || this.request.question === ''
      this.validation.captcha = !this.isCaptchaSuccess;
      var errors = [];
      var validation = this.validation;
      Object.keys(this.validation).forEach(function(k)
      {
        if (validation[k] === true) errors.push(validation[k])
      });
      return errors.length > 0
    },
    sendToResponsiblee(id) {
      this.uploading = true
      this.receptionService.sendToResponsible({questionID: id, replierID: 134219}).then(_ => {
        this.uploading = false;
        this.$toast.add({
          severity: "success",
          summary: this.$t("common.message.successCompleted"),
          life: 3000,
        });
      }).catch((error) => {
        this.uploading = false;
        this.$toast.add({
          severity: "error",
          summary: this.$t("common.message.saveError"),
          life: 3000,
        });
      });
    },
    sendQuestion() {
      if (this.notValid()) {
        return
      }
      this.uploading = true
      const fd = new FormData();
      this.request.count = 0
      this.request.language = this.$i18n.locale
      fd.append('question', JSON.stringify({question: this.request, count: this.request.count}));
      api.post("/reception/sendQuestion", fd)
          .then(resp => {
            this.request.number = resp.data
            this.uploading = false;
            this.$refs.captcha.reset()
            this.isCaptchaSuccess = false;
            this.$toast.add({
              severity: "success",
              summary: this.$t("common.message.successCompleted"),
              life: 3000,
            });
            this.clear();
          })
          .catch(error => {
            this.uploading = false;
            this.isCaptchaSuccess = false;
            this.$refs.captcha.reset()
            this.$toast.add({severity: 'error', summary: 'Error', detail: error.message, life: 3000});
            if (error.response.status === 401) {
              this.$store.dispatch("logLout");
            }
          });
    }
  },

  created() {
    localStorage.setItem("lang", this.$i18n.locale);
    this.language = this.languages.filter(function (item) {
      return item.value === localStorage.getItem("lang");
    })[0];
    this.changeLanguage();
  },
}
</script>
<style lang="scss" scoped>
.request_card{
  max-width: 700px;
  margin: auto;
  margin-top: 50px;
}
@media (max-width: 500px) {
  .request_card{
    padding: 20px;
    max-width: 100%;
    margin: 0;
  }
}
.message {
  background: #B3E5FC;
  border-width: 0 0 0 6px;
  color: #044868;
  padding: 5px;
}
</style>

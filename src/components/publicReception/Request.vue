<template>
    <div class="p-grid">
        <div class="p-col-12">
        <BlockUI :blocked="uploading" :fullScreen="true">
            <ProgressBar v-if="uploading" mode="indeterminate" style="height: .5em" />
        </BlockUI>

			<div class="card p-fluid">
				<h5 class="p-text-center p-text-uppercase">{{$t("publicReception.title")}}</h5>
                
                <SelectButton class="p-mb-2" v-model="language" :options="languages" optionLabel="name" @change="changeLanguage" />
		        
                <p class="message" v-if="$i18n.locale =='kz'" style="text-align:justify">
                    Құрметті пайдаланушылар! Халықпен кері байланыс университетке байланысты проблемалар бойынша уақытылы әрекет етуге және қабылданатын шаралар мен бастамалардың тиімділігін қадағалап отыруға көмектеседі. Осы сервистің көмегімен Сіз университет атына оның қызмет саласы шегінде өзіңізді қызықтыратын сұрақтарды қоя аласыз. Сұрақ қою үшін ТАӘ, телефоныңыздың нөмірін, e-mail көрсетіңіз, содан кейін қажетті санатты таңдап, сұрақтың мәнін нақты жазыңыз. Жіберер алдында көрсетілген деректердің дұрыстығын қайта тексеріңіз. Сұрақ модератор тексергеннен кейін ғана тіркеледі, ал жауап дәл осы жерде жарияланады. Сонымен қатар, Сіз көрсеткен электрондық поштаға хабарлама келіп түседі.
                </p>
                <p class="message" v-if="$i18n.locale =='ru'">
                    Уважаемые пользователи! Обратная связь с населением помогает университету своевременно реагировать на проблемы и отслеживать эффективность принимаемых мер и инициатив. С помощью данного сервиса Вы можете задать интересующие Вас вопросы в адрес университета в пределах его сферы деятельности. Чтобы задать вопрос, укажите ФИО, номер телефона, e-mail, а затем выберите категорию и четко изложите суть вопроса. Перед отправкой перепроверьте корректность указанных данных. Вопрос будет зарегистрирован после проверки модератором, а ответ опубликуется здесь же. При этом на указанный Вами e-mail поступит уведомление.
                </p>
                <p class="message" v-if="$i18n.locale =='en'">
                    Dear users! Feedback from the public helps to respond to issues in a timely manner and monitor the effectiveness of measures and initiatives taken. With the help of this service you can ask the questions you are interested in the university within the scope of its activities. To ask a question, specify your name, phone number, e-mail, and then select a category and clearly outline the essence of the question. Before sending, double-check the correctness of these data. The question will be registered after verification by the moderator and the answer will be published here. At the same time, you will receive a notification to the e-mail address you specified.
                </p>
				<div class="p-field">
					<label for="lname">{{$t("contact.lname")}}*</label>
					<InputText v-model="request.lastName" id="lname" type="text" />
                    <small class="p-error" v-if="validation.lastName">{{$t("common.requiredField")}}</small>				
				</div>
				<div class="p-field">
					<label for="fname">{{$t("contact.fname")}}*</label>
					<InputText id="fname" v-model="request.firstName" type="text" />
                    <small class="p-error" v-if="validation.firstName">{{$t("common.requiredField")}}</small>				
				</div>
                <div class="p-field">
					<label for="email">{{$t("contact.email")}}*</label>
					<InputText v-model="request.email" id="email" type="email" @blur="validateEmail"/>
                    <small class="p-error" v-if="validation.email">{{$t("contact.message.validEmail")}}</small>				
                </div>
				<div class="p-field">
					<label for="mobile">{{$t("contact.phone")}}*</label>
                    <InputMask id="mobile" v-model="request.mobile" mask="+7-(999)-999-99-99" />
                    <small class="p-error" v-if="validation.mobile">{{$t("common.requiredField")}}</small>				
				</div>
                <div class="p-field">
					<label for="category">{{$t("smartenu.category")}}*</label>
                    <Dropdown v-model="request.category" :options="categories" :optionLabel="'name'+$i18n.locale" :placeholder="$t('smartenu.chooseCategory')" />
                    <small class="p-error" v-if="validation.mobile">{{$t("smartenu.selectedCatInvalid")}}</small>				
				</div>
                <div class="p-field">
					<label for="question">{{$t("faq.question")}}*</label>
                    <Textarea id="question" :autoResize="true" v-model="request.question"/>
                    <small class="p-error" v-if="validation.question">{{$t("common.requiredField")}}</small>				
				</div>
                <div class="p-field">
                    <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="upload($event)" v-bind:chooseLabel="$t('faq.uploadFile')"></FileUpload>
				</div>
                <div class="p-field">
                    <Button :label="$t('common.action.submit')" @click="sendQuestion" />
                </div>
		        <span class="footer-text no-print" style="margin-right: 5px">@ {{$t("common.orgname")}}</span>

			</div>
        </div>
        <Dialog v-model:visible="uploaded" :containerStyle="{width: '50vw'}" :modal="true" @hide="clear">
            <p>Сұрақ {{request.number}} нөмірімен сәтті тіркелді. Жауап сіз көрсеткен электрондық поштаға хабарлама ретінде келіп түседі немесе жауапты тұлға телефон нөмірі бойынша хабарласады.</p>

            <p>Вопрос успешно зарегистрирован под номером  {{request.number}} . Ответ придет в виде сообщения на ваш e-mail или ответственное лицо свяжется по указанному вами номеру телефона.</p>

            <p>Question successfully registered under number {{request.number}}. The answer will come in the form of a message to your e-mail or the responsible person will contact you on the phone number specified by you.</p>
           
        </Dialog>
    </div>
</template>
<script>
    import axios from "axios";
    import {getHeader, smartEnuApi} from "@/config/config";

    export default {
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
                email: "",
                lastName: "",
                firstName: "",
                mobile: "",
                question: "",
                category: null,
                document: null,
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
            },
            categories : null,
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
            if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(this.request.email)) {
                this.validation.email = false;
            }
            else {
                this.validation.email = true;
            }
        },
        getCategories() {
            axios
                .post(
                smartEnuApi + "/auth/getDictionary",
                { name: "req_category" },
              
                )
                .then((res) => {
                    this.categories = res.data
                })
                .catch((error) => {
                    this.$toast.add({
                    severity: "error",
                    summary: "Dictionary load error:\n" + error,
                    life: 3000,
                    });
                });
        },
        clear() {
            this.request = {
                email: "",
                lastName: "",
                firstName: "",
                mobile: "",
                question: "",
                category: null,
                document: null,
                count: 0,
                number: null,
            }
        },
        upload(event) {
            this.request.document = event.files[0]
        },
        notValid() {
            this.validation.email = this.request.email === null || this.request.email === '' || this.validation.email
            this.validation.lastName = this.request.lastName === null || this.request.lastName=== ''
            this.validation.firstName = this.request.firstName === null || this.request.firstName=== ''
            this.validation.mobile = this.request.mobile === null || this.request.mobile === ''
            this.validation.question = this.request.question === null || this.request.question === '' 
            this.validation.category = this.request.category === null
            var errors = [];
            var validation = this.validation
            Object.keys(this.validation).forEach(function(k)
            {
                if (validation[k] === true) errors.push(validation[k])
            });
            return errors.length > 0
        },
        sendQuestion() {
            if (this.notValid()) {
                return
            }
            this.uploading = true
            const fd = new FormData();
            this.request.count = 0
            this.request.language = this.$i18n.locale
            if (this.request.document != null) {
                fd.append("f0", this.request.document);
                this.request.count  = 1
            }
            fd.append('question', JSON.stringify({question: this.request, count: this.request.count}));
            axios.post(smartEnuApi + "/reception/sendQuestion", fd)
            .then(resp => {
                this.request.number = resp.data
                this.uploading = false;
                this.uploaded = true;
            })
            .catch(error => {
                this.uploading = false;
                this.$toast.add({severity: 'error', summary: 'Error', detail: error.message, life: 3000});
                if (error.response.status == 401) {
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
        this.getCategories();
    },
}
</script>
<style lang="scss">
    .message {
        background: #B3E5FC;
        border-width: 0 0 0 6px;
        color: #044868;
        padding: 5px;
    }
</style>
<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{ $t('hr.crAndUpdEdu') }}</h3>
      <div>
        <Menubar :model="menu2" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('telegram.questionkz') }}<span class="p-error">*</span></label>
            <InputText class="mt-2" type="text" :placeholder="$t('telegram.questionkz')" v-model="telegram.title_kz"></InputText>
            <small class="p-error" v-if="validation.titlekz">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('telegram.questionen') }}<span class="p-error">*</span></label>
            <inputText class="mt-2"  type="text" :placeholder="$t('telegram.questionen')" v-model="telegram.title_en"></inputText>
            <small class="p-error" v-if="validation.titleen">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('telegram.questionru') }}<span class="p-error">*</span></label>
            <InputText class="mt-2" type="text" :placeholder="$t('telegram.questionru')" v-model="telegram.title_ru"></InputText>
            <small class="p-error" v-if="validation.titleru">{{ $t("common.requiredField") }}</small>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('telegram.anwerskz') }}<span class="p-error">*</span></label>
            <Textarea rows="5" cols="30" class="mt-2" type="text" :placeholder="$t('telegram.anwerskz')" v-model="telegram.anwers_kz"></Textarea>
            <small class="p-error" v-if="validation.anwerskz">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('telegram.anwersru') }}<span class="p-error">*</span></label>
            <Textarea  rows="5" cols="30" class="mt-2" type="text" :placeholder="$t('telegram.anwersru')" v-model="telegram.anwers_ru"></Textarea>
            <small class="p-error" v-if="validation.anwersru">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('telegram.anwersen') }}<span class="p-error">*</span></label>
            <Textarea  rows="5" cols="30" class="mt-2" type="text" :placeholder="$t('telegram.anwersen')" v-model="telegram.anwers_en"></Textarea>
            <small class="p-error" v-if="validation.anwersen">{{ $t("common.requiredField") }}</small>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
      <FileUpload ref="form" mode="basic" class="mt-2" :customUpload="true"  accept=".pdf,.docx,.png, .jpeg, .jpg" :class="{'p-invalid': validation.file}" @uploader="upload($event)"  :auto="true" v-bind:chooseLabel="$t('ncasigner.chooseFile')"/>
      <InlineMessage severity="info" class="mt-2" show v-if="telegram?.doc?.filePath">
        {{ $t('ncasigner.chosenFile', {fn: telegram?.doc?.filePath  ? telegram?.doc?.filePath : ""}) }}
      </InlineMessage>
      <InlineMessage severity="info" class="mt-2" show v-if="file">
        {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
      </InlineMessage>
      <small class="p-error"  v-if="validation.file" >{{ $t("common.requiredField") }}</small>
    </div>
  </div>
</template>

<script setup>
import { inject, defineProps, ref } from 'vue';
import { useI18n } from "vue-i18n";
import { QuestionService } from "@/service/question.service";
import { useToast } from "primevue/usetoast";
import InputText from "primevue/inputtext";
const { t,  } = useI18n();
const toast = useToast();

const props = defineProps({
  userID: {
    type: Number,
    default: null,
  },
  modelValue: {
    type: null,
    default: null
  },
  readonly: {
    type: Boolean,
    default: true,
  },
  customType: {
    type: String,
    default: ''
  }
});

const loginedUser = JSON.parse(localStorage.getItem("loginedUser"));

const emitter = inject("emitter");

const validation = ref({
  titlekz: false,
  titleen: false,
  titleru: false,
  anwerskz: false,
  anwersen: false,
  anwersru: false,
});

const telegram = ref(props.modelValue);
const file = ref(null);
const questionService = new QuestionService();

const create = () => {
  const fd = new FormData();
  telegram.value.userID = loginedUser.id;
  fd.append("id", JSON.stringify(telegram.value));
  if (file.value !== null) {
    fd.append("idImage", file.value);
  }
  questionService.createQuestion(fd).then(res => {
    toast.add({ severity: 'success', summary: t('common.success'), life: 3000 });
    emitter.emit('telegram', true);
    emitter.emit('node', true); // Эмитирование события
  }).catch(err => {
    toast.add({
      summary: t('message.actionError'),
      life: 3000,
      severity: "error",
    });
  });
};

const upload = (event) => {
  file.value = event.files[0];
};

const validationForm = () => {
  validation.value.titlekz = !telegram.value.title_kz || telegram.value.title_kz == "";
  validation.value.titleen = !telegram.value.title_en || telegram.value.title_en == "";
  validation.value.titleru = !telegram.value.title_ru || telegram.value.title_ru == "";
  validation.value.anwerskz = !telegram.value.anwers_kz || telegram.value.anwers_kz == "";
  validation.value.anwersen = !telegram.value.anwers_en || telegram.value.anwers_en == "";
  validation.value.anwersru = !telegram.value.anwers_ru || telegram.value.anwers_ru == "";
  return (
      !validation.value.titlekz &&
      !validation.value.titleen &&
      !validation.value.titleru &&
      !validation.value.anwersru &&
      !validation.value.anwersen &&
      !validation.value.anwerskz
  );
};

const menu2 = ref([
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    command: () => {
      if (validationForm()) {
        create();
      }
    },
  },
]);
</script>

<style>
#carddiv label {
  position: inherit;
}
</style>
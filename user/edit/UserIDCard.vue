<template>
  

  <div v-if="!loading" class="card">
    <div class="grid formgrid">

      <!-- НОМЕР -->
      <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ t('common.number') }}</label>
        <InputText :readonly="readonly" class="mt-2" :class="{'p-invalid': validation.number}" type="text"  :placeholder="t('common.number')" v-if="user" v-model="user.idnumber" @input="updateUserData"></InputText>
        <small class="p-error" v-if="validation.number">{{ t("common.requiredField") }}</small>
      </div>

      <!-- ДАТА ВЫДАЧИ -->
      <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ t('hr.id.startDate') }}</label>
        <PrimeCalendar :readonly="readonly" class="mt-2" :class="{'p-invalid': validation.startDate}" :placeholder="t('hr.id.startDate')" v-if="user" v-model="user.iddate" dateFormat="dd.mm.yy" @input="updateUserData"/>
        <small class="p-error" v-if="validation.startDate">{{ t("common.requiredField") }}</small>
      </div>

      <!-- КЕМ ВЫДАН -->
      <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ t('hr.id.issuedBy') }}</label>
        <InputText :readonly="readonly" class="mt-2" :class="{'p-invalid': validation.issuedBy}" type="text" :placeholder="t('hr.id.issuedBy')" v-if="user" v-model="user.idissued" @input="updateUserData"></InputText>
        <small class="p-error" v-if="validation.issuedBy">{{ t("common.requiredField") }}</small>
      </div>

      <!-- ИИН -->
      <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ t('contact.iin') }}<span class="p-error" v-if="!readonly">*</span></label>
        <InputMask mask="999999999999" class="mt-2" :class="{'p-invalid': validation.iin}" type="text" :placeholder="t('contact.iin')" v-if="user" v-model="user.IIN"  :readonly="customType != 'createUser'" @input="updateUserData"></InputMask>
        <small class="p-error" v-if="validation.iin">{{ t("common.requiredField") }}</small>
      </div>

      <!-- ФОТО ЗАГРУЗИТЬ-->
      <div v-if="!readonly" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ t('hr.title.id') }}</label>
        <FileUpload ref="form" mode="basic" class="mt-2" :customUpload="true" accept=".pdf, image/*" :class="{'p-invalid': validation.file}" @uploader="upload($event)" :auto="true" v-bind:chooseLabel="t('ncasigner.chooseFile')"/>
        <InlineMessage severity="info" class="mt-2" show v-if="file">
            {{ t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
        </InlineMessage>
        <small class="p-error"  v-if="validation.file" >{{ t("common.requiredField") }}</small>
      </div>

      <Button v-if="user.idcardpath" :label="t('hr.title.id')" style="text-align: left" class="p-button-link" @click="downloadFile(t('hr.title.id'), user.idcardpath)" />

    </div>
  </div>


  <Dialog v-model:visible="fileView" :style="{ width: '650px' }" :modal="true">
    <div style="padding: 0 100px">
        <img :src="fileData" style="width: 100%; height: 100%"/>
    </div>
    <template #footer>
        <Button
            v-bind:label="t('common.close')"
            icon="pi pi-times"
            class="p-button p-component p-button-primary"
            @click="fileView = false" />
    </template>
  </Dialog>
</template>

<script setup>

  import {getHeader,  smartEnuApi} from "@/config/config";
  import {ref, defineProps, inject, onMounted} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import axios from "axios";
  import {UserService} from "@/service/user.service"
  import {useStore} from "vuex";

  const userService = new UserService
  const {t, locale} = useI18n()
  const toast = useToast()
  const emitter = inject("emitter");
  const store = useStore()

  const props = defineProps({
    userID: {
      type: Number,
      default: null
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
  })

  const fileData = ref(null)
  const fileView = ref(false)
  const emitPersonalInformationUpdate = defineEmits(["personal-information-updated"]);

  const validation = ref({
    number: false,
    startDate: false,
    issuedBy: false,
    iin: false,
    file: false
  })  
  const loading = ref(false)
  const file = ref(null)

  const user = ref(props.modelValue)

  const upload = (event) =>  {
      file.value = event.files[0];
      emitter.emit("idcardpath", file.value);
  }

  const getUserAccount= () => {
    loading.value = true
    if (props.modelValue != null) {
      user.value = props.modelValue
      if (user.value.iddate) {
        const dateObject = new Date(user.value.iddate);
        
        const formattedBirthday = `${(dateObject.getMonth() + 1).toString().padStart(2, '0')}.${dateObject.getDate().toString().padStart(2, '0')}.${dateObject.getFullYear().toString().padStart(4, '0')}`;
  
        user.value.iddate = dateObject
      }
      loading.value = false
      return
    }

    const req = {
      userID: props.userID
    }

    userService.getUserAccount(req).then(response=>{

      user.value = response.data.user

      if (user.value.iddate) {
        const dateObject = new Date(user.value.iddate);
        
        const formattedBirthday = `${(dateObject.getMonth() + 1).toString().padStart(2, '0')}.${dateObject.getDate().toString().padStart(2, '0')}.${dateObject.getFullYear().toString().padStart(4, '0')}`;
  
        user.value.iddate = dateObject
      }
      loading.value = false
    }).catch(error => {
      loading.value = false
      toast.add({
        severity: "error",
        summary: t('message.actionError'),
        life: 3000,
      })
    })
  }

  const updateUserData = () => {
    emitPersonalInformationUpdate("personal-information-updated", user.value);
  };


  const showFile = (data) => {
      if (!data) {
        return
      }
      fileData.value = data
      fileView.value = true
  }

  const downloadFile= (filename, filepath)=> {
      loading.value = true;

      fetch(`${smartEnuApi}/serve?path=${filepath}`, {
        method: 'GET',
        headers: getHeader(),
      }).then(res => res.blob()).then(blob => {
        loading.value = false;

        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();
        a.remove();
      }).catch(err => {
        loading.value = false;

        if (err.response && err.response.status == 401) {
          store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          toast.add({
            severity: "error",
            summary: t('message.actionError'),
            life: 3000,
          })
        } else {
          toast.add({
            severity: "error",
            summary: t('message.actionError'),
            life: 3000,
          })
        }
      })
    }
  onMounted(() => {
      getUserAccount()
  })
</script>

<template>  

  <div id="carddiv" class="grid">
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <div class="p-field">
                  <label>{{ $t('bank.title2') }}<span class="p-error" v-if="!readonly">*</span></label>
                  <Dropdown  v-model="bank" :optionLabel="bankLabel"
                  :options="banks" :placeholder="$t('bank.title2')" 
                  class="dropdown w-full mt-2" :readonly="readonly" @input="updateUserData"></Dropdown>
              <small class="p-error" v-if="validation.bankname">{{ $t("common.requiredField") }}</small>
              </div>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <div class="p-field">
                  <label>{{ $t('bank.accnumber') }}<span class="p-error" v-if="!readonly">*</span></label>
                  <InputText
                      :readonly="readonly"
                      class="mt-2"
                      type="text"
                      :placeholder="$t('bank.accnumber')"
                      v-model=" user.bankaccount" @input="updateUserData"></InputText>
                  <small class="p-error" v-if="validation.accnumber">{{ $t("common.requiredField") }}</small>
              </div>
          </div>
          
          <div v-if="!readonly" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{$t("supportingDocument")}}</label>
            <FileUpload ref="form" mode="basic" class="mt-2" :customUpload="true" accept=".pdf, image/*" :class="{'p-invalid': validation.file}" @uploader="upload($event)" :auto="true" v-bind:chooseLabel="$t('ncasigner.chooseFile')"/>
            <InlineMessage severity="info" class="mt-2" show v-if="file">
                {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
            </InlineMessage>
            <small class="p-error"  v-if="validation.file" >{{ $t("common.requiredField") }}</small>
          </div>
          
          <Button v-if="user.bankRequisitePath" :label="t('supportingDocument')" style="text-align: left" class="p-button-link" @click="downloadFile(t('supportingDocument'), user.bankRequisitePath)" />

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

  import { ref, defineProps, inject, onMounted } from 'vue';
  import api from "@/service/api";
  import {getHeader, smartEnuApi} from "@/config/config";
  import {useI18n} from "vue-i18n";
  import { useToast } from "primevue/usetoast";
  import {UserService} from "@/service/user.service"
  import {useStore} from "vuex";

  const emitter = inject("emitter");
  const {t, locale} = useI18n()
  const toast = useToast();
  const userService = new UserService
  const store = useStore()

  const emitPersonalInformationUpdate = defineEmits(["personal-information-updated"]);
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
  
  const loading = ref(false)
  const banks = ref({})
  const bank = ref(null);
  const file = ref(null)
  const accept = {
    default: ".doc,.docx,.pdf,.image/*"
  }
  const user = ref(props.modelValue)

  const payload = ref({
      userID: props.userID,
      bank_id: null,
      bankaccount: null,
      name: null
  })

  const validation = ref({
      accnumber: false,
      bankname: false,
  })

  const getBanks = () => {
      var req = {"id" : 0, "count": 0};
      api.post('/contragent/banks', req, {headers: getHeader()}).then(res  => {
          const data = ref(null)
          if (user.value != null && user.value.bank != null ) {
              data.value = res.data.find(item => item.id == user.value.bank.id);
          }
          if (data.value !== null) {
              banks.value = res.data;
              bank.value = data.value
          } else {
              bank.value = {}
              banks.value = res.data
          }

      }).catch(err => {
          if (err.data.status != 404) {
            toast.add({severity: 'error', summary: t('common.error'), life: 3000})
          }
      })
  }

  const bankLabel = (item) => {
      if (item != null && user.value.bank != null) {
        user.value.bank.id = item.id
        return item.organization.name
      }
  }

  const getUserAccount= () => {
    if (props.modelValue != null) {
      user.value = props.modelValue
      return
    }

    const req = {
      userID: props.userID
    }

    userService.getUserAccount(req).then(response=>{  

      payload.value.userID = response.data.user.userID
      payload.value.bank_id = response.data.user.bank.id
      payload.value.name = response.data.user.bank.name
      payload.value.bankaccount = response.data.user.bankaccount
    }).catch(error => {
      toast.add({
        severity: "error",
        summary: t('message.actionError'),
        life: 3000,
      })
    })
  }

  const updateUserData = () => {
    if (bank.value != null) {
      user.value.bank = bank.value
      emitPersonalInformationUpdate("personal-information-updated", user.value);
    }
  };

  const upload = (event) =>  {
      file.value = event.files[0];
      emitter.emit("bankrequisite", file.value);
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
          console.log(err)
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
      getBanks()
  })

</script>
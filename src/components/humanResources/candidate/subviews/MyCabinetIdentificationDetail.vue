
<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{ $t('hr.title.id') }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px">
                </Menubar>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.number') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.number}"
                type="text"
                :placeholder="$t('common.number')"
                v-model="payload.idnumber"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.number"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.id.startDate') }}</label>
            <PrimeCalendar
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.startDate}"
                :placeholder="$t('hr.id.startDate')"
                v-model="payload.iddate"
                dateFormat="dd.mm.yy"/>
            <small
                class="p-error"
                v-if="validation.startDate"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.id.issuedBy') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.issuedBy}"
                type="text"
                :placeholder="$t('hr.id.issuedBy')"
                v-model="payload.idsourceStr"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.issuedBy"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('contact.iin') }}</label>
            <InputText
                class="mt-2"
                :class="{'p-invalid': validation.iin}"
                type="text"
                :placeholder="$t('contact.iin')"
                v-model="payload.iin" readonly
            ></InputText>
            <small
                class="p-error"
                v-if="validation.iin"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.title.id') }}</label>
            <FileUpload ref="form" mode="basic"
                        class="mt-2"
                        :customUpload="true"
                        accept="image/*"
                        :class="{'p-invalid': validation.file}"
                        @uploader="upload($event)" :auto="true"
                        v-bind:chooseLabel="$t('ncasigner.chooseFile')"/>
            <InlineMessage severity="info"
                           class="mt-2"
                           show v-if="file">
              {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
            </InlineMessage>
            <small
                class="p-error"
                v-if="validation.file"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <Button :label="$t('common.save')" class="p-button-text" :onclick="update"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, inject, ref } from 'vue';
import {getHeader,  smartEnuApi} from "@/config/config";
import api from "@/service/api";
const emitter = inject("emitter");
  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({
        idnumber: null,
        iddate: null,
        idexpire: null,
        idsourceStr: null,
        iin: null,
      })
     }
    })

  const payload = ref({ 
    idnumber: props.modelValue.idnumber,
    iddate:  props.modelValue.iddate,
    idexpire: props.modelValue.idexpire,
    idsourceStr: props.modelValue.idsourceStr,
    iin: props.modelValue.IIN,
    userId: props.modelValue.id
  })  

  const validation = ref({
    number: false,
    startDate: false,
    issuedBy: false,
    iin: false,
    file: false
  })  


  const file = ref(null)

  const upload = (event) =>  {
      file.value = event.files[0];
  }

  const update = () => { 
    if (!validateForm()) {
      return
    }

    const fd = new FormData();
    fd.append("id", JSON.stringify(payload.value))
    fd.append("idImage", file.value);  

    api.post('/account/cardID/update', fd, {headers: getHeader()}).then(res  => {
        emitter.emit('educationUpdated', true)
      }).catch(err => {
        console.log(err)
      })
  
  }
  const validateForm = () => {
      validation.value.number = !payload.value.idnumber || payload.value.idnumber == ""
      validation.value.startDate = !payload.value.iddate || payload.value.iddate == ""
      validation.value.issuedBy = !payload.value.idsourceStr || payload.value.idsourceStr == ""
      validation.value.iin = !payload.value.iin || payload.value.iin == ""
      validation.value.file = !file.value || file.value == ""
      return (
          !validation.value.number &&
          !validation.value.startDate &&
          !validation.value.issuedBy &&
          !validation.value.file
      )
    }


  const check = (data) => {
      console.log(data, 'id')
    }
</script>
<template>
    <div class="card def-border">
      <p><b>{{ $t('common.number') }}:</b> <em>{{ payload.idnumber }}</em></p>
      <p><b>{{ $t('hr.id.startDate') }}:</b> <em>{{ new Date(payload.iddate).toLocaleDateString() }}</em></p>
      <p><b>{{ $t('hr.id.issuedBy') }}:</b> <em>{{ payload.idexpire }}</em></p>
      <p><b>{{ $t('contact.iin') }}:</b> <em>{{ payload.iin }}</em></p>
      <hr>
      <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
      <!-- <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteValue"/> -->
    </div>
  </template>
  
<script setup>
    import {getHeader,  smartEnuApi} from "@/config/config";
    import {computed, onMounted, ref, defineProps, inject} from "vue";
    import {useI18n} from "vue-i18n"

    const {t, locale} = useI18n()
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
  
    const update = () => { 
        emitter.emit("idMyAccountUpdate", payload.value)
    }
  </script>
  
  <style scoped>
  .def-border {
    border: 1px solid #dee2e6;
  
    border-radius: 0;
  }
  </style>
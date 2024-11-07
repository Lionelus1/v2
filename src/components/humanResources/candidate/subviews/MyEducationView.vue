<template>
    <div class="card def-border">
      <p><b>{{ $t('hr.edu.institution') }}:</b> <em>{{ validation.institution }}</em></p>
      <p><b>{{ $t('hr.edu.institutionAddress') }}:</b> <em>{{ validation.institutionAddress }}</em></p>
      <p><b>{{$t('common.faculty')}}:</b> <em>{{ validation.faculty }}</em></p>
      <p><b>{{ $t('common.speciality') }}:</b> <em>{{ validation.speciality }}</em></p>
      <p><b>{{ $t('hr.ad.diplomaNumber') }}:</b> <em>{{ validation.diplomaNumber }}</em></p>
      <p><b>{{ $t('hr.edu.receiptDate') }}:</b> <em>{{ new Date(validation.receiptDate).getFullYear() }}</em></p>
      <p><b>{{ $t('hr.edu.expirationDate') }}:</b> <em>{{ new Date(validation.expirationDate).getFullYear() }}</em></p>
      <hr>
      <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
      <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteEducation"/>
    </div>
  </template>
  
<script setup>
    import axios from "axios";
    import {getHeader, smartEnuApi} from "@/config/config";
    import { inject, defineProps, ref } from 'vue';
    import {AccountService} from "@/service/account.service"
    import { useI18n } from "vue-i18n";
    import { useToast } from "primevue/usetoast";
  
    const { t } = useI18n()
    const toast = useToast()
    const accountService = new AccountService()
    const props = defineProps({
        modelValue: {
            type: Object,
            default: () => ({
            id: 0,
            institution: null,
            institutionAddress: null,
            faculty: null,
            speciality: null,
            diplomaNumber: null,
            receiptDate: null,
            expirationDate: null
            })
        },
        userID: {
            type: null,
            default:null
        }
    }) 

    const emitter = inject("emitter");
    const validation =  ref({
        institution: false,
        institutionAddress: false,
        faculty: false,
        speciality: false,
        receiptDate: false,
        expirationDate: false,
        diplomaNumber: false
    })

    const payload = ref({
        id: props.modelValue.id,
        userId: props.modelValue.userId,
        institution: props.modelValue.institution,
        speciality: props.modelValue.speciality,
        faculty: props.modelValue.faculty,
        diplomaNumber: props.modelValue.diplomaNumber,
        institutionAddress: props.modelValue.institutionAddress,
        receiptDate: props.modelValue.receiptDate,
        expirationDate: props.modelValue.expirationDate,
    });

    const deleteEducation = () => {
        const data = {
        id: Number(payload.value.id),
        userId: Number(props.userID)
        }

        accountService.deleteEducation(data).then(res  => {
            emitter.emit("educationMyAccount", true)
        }).catch(err => {
            toast.add({
            severity: "error",
            summary: t('message.actionError'),
            life: 3000,
            })
        })
    }

    const update = ()=> {
        emitter.emit("educationMyAccountUpdate", payload.value);
    }

  </script>
<style>
.def-border {
border: 1px solid #dee2e6;

border-radius: 0;
}
</style>
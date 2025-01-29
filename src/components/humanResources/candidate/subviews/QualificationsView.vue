<template>
    <div class="card def-border">
        <p><b>{{ $t('science.qualification.trainingForm') }}:</b> <em>{{ payload.training_form }}</em></p>
        <p><b>{{ $t('science.qualification.country') }}:</b> <em>{{ payload.country }}</em></p>
        <p><b>{{ $t('science.qualification.city') }}:</b> <em>{{ payload.city }}</em></p>
        <p><b>{{ $t('science.qualification.durationAndScope') }}:</b> <em>{{ payload.hours }}</em></p>
        <p><b>{{ $t('science.qualification.start') }}:</b> <em>{{ moment(payload.start_date).format("DD.MM.YYYY") }}</em></p>
        <p><b>{{ $t('science.qualification.end') }}:</b> <em>{{ moment(payload.end_date).format("DD.MM.YYYY") }}</em></p>
        <p><b>{{ $t('science.qualification.fundingSource') }}:</b> <em>{{ payload.funding_source }}</em></p>
        <p><b>{{ $t('science.qualification.typeSupportingDoc') }}:</b> <em>{{ payload.proof_document_type }}</em></p>
        <hr>
        <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
        <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteQualification"/>
    </div>

</template>

<script setup>
    import {computed, onMounted, ref, defineProps, inject, popScopeId} from "vue";
    import {useI18n} from "vue-i18n";
    import {useToast} from "primevue/usetoast";
    import {ScienceService} from "@/service/science.service";
    import moment from 'moment';

    const {t, locale} = useI18n()
    const toast = useToast()
    const scienceService = new ScienceService()
    const emitter = inject("emitter");

    const props = defineProps({
      modelValue: {
        type: Object,
        default: () => ({
          id: null,
          userID:null,
          training_form: null,
          country: null,
          city: null,
          start_date: null,
          end_date: null,
          hours: 0,
          funding_source: null,
          proof_document_type: null,
          upload_path: null
        })
       }
    })

    const payload = ref({
        id: props.modelValue.id,
        userID:props.modelValue.userID,
        training_form: props.modelValue.training_form,
        country: props.modelValue.country,
        city: props.modelValue.city,
        start_date: props.modelValue.start_date,
        end_date: props.modelValue.end_date,
        hours: props.modelValue.hours,
        funding_source: props.modelValue.funding_source,
        proof_document_type: props.modelValue.proof_document_type,
        upload_path: props.modelValue.upload_path
    })

    const deleteQualification = () => {
        const data = {
        id: Number(payload.value.id),
        userID: Number(props.userID)
        }

        scienceService.deleteQualificationsScience(data).then(res  => {
            emitter.emit("qualifications", true)
        }).catch(_ => {
        })
    }

    const update = ()=> {
        emitter.emit("qualificationsUpdate", payload.value);
    }


</script>
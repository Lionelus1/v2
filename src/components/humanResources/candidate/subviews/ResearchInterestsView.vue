<template>
    <div class="card def-border">
      <p><b>{{ props.modelValue['name_'+locale] }}</b></p>
      <hr>
      <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
      <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" @click="deleteValue"/>
    </div>
</template>

<script setup>
    import {computed, onMounted, ref, defineProps, inject} from "vue";
    import {useI18n} from "vue-i18n";
    import {useToast} from "primevue/usetoast";
    import {ScienceService} from "@/service/science.service";

    const emitter = inject("emitter");
    const {t, locale} = useI18n()
    const toast = useToast()
    const loading = ref(false)
    const scienceService = new ScienceService()
    
    const props = defineProps({
        modelValue: {
            type:  Object,
            default: null
        },
        userID: {
            type: Number,
            default: null
        }
    })

    const deleteValue =()=> {
        const req = {
            id: props.modelValue ? props.modelValue.id : null,
            userID: props.userID || null,
        }
        loading.value = true
        scienceService.deleteScienceInterests(req).then(_ => {
            loading.value = false
            emitter.emit('researchInterest', true)
        }).catch(error => {
            toast.add({severity: 'error', summary: t('common.error'), life: 3000})
            loading.value = false;
        })
    }

    const update = () => {
        emitter.emit("researchInterestUpdate", props.modelValue);
    }


</script>
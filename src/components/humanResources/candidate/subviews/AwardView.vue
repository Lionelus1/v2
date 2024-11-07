<template>
    <div class="card def-border">
        <p><b>{{ $t('science.typeOfAward') }}:</b> <em>{{ award.award_type }}</em></p>
        <p><b>{{ $t('science.reward') }}:</b> <em>{{ award.award_name }}</em></p>
        <p><b>{{ $t('common.startDate') }}:</b> <em>{{ new Date(award.start_time).toLocaleDateString() }}</em></p>
        <hr>
        <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
        <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteValue"/>
    </div>
</template>

<script setup>
    import {useI18n} from "vue-i18n";
    import {useToast} from "primevue/usetoast";
    import {ref, defineProps, inject} from "vue";
    import {ScienceService} from "@/service/science.service";

    const {t, locale} = useI18n()
    const toast = useToast()
    const loading = ref(false)
    const props = defineProps(['modelValue', 'typeCustom', 'userID']);
    const emitter = inject("emitter");

    const award = ref(props.modelValue)
    const customType = ref(props.typeCustom)
    const scienceService = new ScienceService()

    const deleteValue=() => {
        const req = {
            id: props.modelValue ? props.modelValue.id : null,
            userID: props.userID || null,
        }
        loading.value = true

        scienceService.deleteAwards(req).then(_ => {
            loading.value = false
            emitter.emit('award', true)
        }).catch(_ => {
            loading.value = false;
        })
    }

    const update = () => {
        emitter.emit("awardUpdate", props.modelValue);
    }

</script>
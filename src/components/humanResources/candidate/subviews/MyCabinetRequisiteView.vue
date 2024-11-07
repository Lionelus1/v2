<template>
        <div class="card def-border">
          <b>{{ t('bank.title2') }}:</b> <em>{{ payload.name + '\n' }}</em>
          <b>{{ t('bank.accnumber') }}:</b> <em>{{ payload.bankaccount + '\n' }}</em>
        <hr>
        <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
        <!-- <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteQualification"/> -->
    </div>
</template>

<script setup>
     import {ref, defineProps, inject, popScopeId} from "vue";
    import {useI18n} from "vue-i18n";

    const {t, locale} = useI18n()
    const emitter = inject("emitter");

    const props = defineProps({
      modelValue: {
        type: Object,
        default: () => ({
            userID: null,  
            bank: {},
            bank_id: null,
            bankaccount: null,
            name: null,
        })
       }
    })

    const payload = ref({
        userID: props.modelValue.userID,
        bank_id: props.modelValue.bank_id,
        bankaccount: props.modelValue.bankaccount,
        name: props.modelValue.name
    })

    const update = () => {
        emitter.emit("requisiteUpdate", payload.value);
    }

</script>
<template>
    <div id="carddiv" class="grid">  
        <div class="col-12">
            <h3>{{ $t('bank.requisite') }}</h3>
            <div>
                <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
            </div>
        </div>     
        <div class="col-12 md:col-12 p-fluid">
            <div class="card">
                <div class="grid formgrid">
                    <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                        <div class="p-field">
                            <label>{{ $t('bank.title2') }}</label>
                            <Dropdown v-model="bank" :optionLabel="bankLabel"
                            :options="banks" :placeholder="$t('bank.title2')" 
                            class="dropdown w-full mt-2"></Dropdown>
                        <small class="p-error" v-if="validation.bankname">{{ $t("common.requiredField") }}</small>
                        </div>
                    </div>
                    <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                        <div class="p-field">
                            <label>{{ $t('bank.accnumber') }}</label>
                            <InputText
                                :readonly="readonly"
                                class="mt-2"
                                type="text"
                                :placeholder="$t('bank.accnumber')"
                                v-model=" payload.bankaccount"></InputText>
                            <small class="p-error" v-if="validation.accnumber">{{ $t("common.requiredField") }}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
    import { ref, defineProps, inject, onMounted } from 'vue';
    import axios from "axios";
    import {getHeader, smartEnuApi} from "@/config/config";
    import {useI18n} from "vue-i18n";
    import { useToast } from "primevue/usetoast";

    const emitter = inject("emitter");
    const {t, locale} = useI18n()
    const toast = useToast();

    const props = defineProps({
        modelValue: {
        type:  Object,
        default: () => ({ 
            userID: null,  
            bank: {},
            bank_id: null,
            bankaccount: null,
            name: null,
        })
        }
    })

    const banks = ref({})
    const bank = ref(null);

    const payload = ref({
        userID: props.modelValue.userID,
        bank_id: props.modelValue.bank_id,
        bankaccount: props.modelValue.bankaccount,
        name: props.modelValue.name
    })

    const validation = ref({
        accnumber: false,
        bankname: false,
    })

    const updateBank = () => {
        if (!validateForm) {
            return
        }

        if (bank.value) {
            payload.value.bank_id = bank.value.id
        } else {
            validation.value.bankname = false
            return
        }
        
        axios.post(smartEnuApi + '/account/bank/update', payload.value, {headers: getHeader()}).then(res  => {
            emitter.emit('requisite', true)
        }).catch(err => {
            toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        })
    }

    const getBanks = () => {
        var req = {"id" : 0, "count": 0};
        axios.post(smartEnuApi + '/contragent/banks', req, {headers: getHeader()}).then(res  => {
            const data = res.data.find(item => item.id === payload.value.bank_id);
            if (data) {
                banks.value = [data];
                bank.value = data
            } else {
                banks.value = res.data
            }
        }).catch(err => {
            toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        })
    }

    const bankLabel = (item) => {
        return item.organization.name
    }

    const menu= ref([
        {
          label: t("common.save"),
          icon: "pi pi-fw pi-save",
          command: () => {
            updateBank()
          },
        },
    ])

    const validateForm = () => {
        validation.value.accnumber = !payload.value.bankaccount || payload.value.bankaccount == ""
        validation.value.bankname = !bank.value || bank.value == ""
        return (
            !validation.value.accnumber &&
            !validation.value.bankname
        )
    }

    onMounted(() => {
        getBanks()
    })
</script>

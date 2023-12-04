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
                            class="dropdown w-full mt-2" :readonly="readonly"></Dropdown>
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
                                v-model=" user.bankaccount"></InputText>
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
    import {UserService} from "@/service/user.service"

    const emitter = inject("emitter");
    const {t, locale} = useI18n()
    const toast = useToast();
    const userService = new UserService

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

    const banks = ref({})
    const bank = ref(null);

    const user = ref(props.modelValue)

    const payload = ref({
        userID: props.userID.userID,
        bank_id: null,
        bankaccount: null,
        name: null
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
            user.value.value.bank_id = bank.value.id
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
            const data = ref(null)
            if (user.value != null && user.value.bank ) {
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
            toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        })
    }

    const bankLabel = (item) => {
        user.value.bank.id = item.id
        return item.organization.name
    }

    const validateForm = () => {
        validation.value.accnumber = !user.value.bankaccount || user.value.bankaccount == ""
        validation.value.bankname = !bank.value || bank.value == ""
        return (
            !validation.value.accnumber &&
            !validation.value.bankname
        )
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

    onMounted(() => {
        getUserAccount()
        getBanks()
    })

</script>
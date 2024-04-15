<template>
    <div id="carddiv" class="grid">
        <div class="col-12">   
            <h3>{{  $t('bank.requisite')  }}</h3>       
            <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px">
            </Menubar>
        </div>

        <div class="col-12 md:col-12 p-fluid">
            <div class="card">
                <div class="grid formgrid">

                    <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                        <label>{{ $t('bank.title2') }}</label>
                        <!-- <InputText
                            :readonly="readonly"
                            class="mt-2"
                            type="text"
                            :placeholder="$t('bank.title2')"
                            v-model="payload.name"
                        ></InputText> -->
                        <Dropdown v-model="bank" :optionLabel="bankLabel"
					    :options="banks" :placeholder="$t('bank.title2')" 
                         class="dropdown w-full md:w-14rem mt-2"></Dropdown>
                        <small
                            class="p-error"
                            v-if="validation.bankname">
                            {{ $t("common.requiredField") }}
                        </small>
                    </div>

                    <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                        <label>{{ $t('bank.accnumber') }}</label>
                        <InputText
                            :readonly="readonly"
                            class="mt-2"
                            type="text"
                            :placeholder="$t('bank.accnumber')"
                            v-model=" payload.bankaccount"
                        ></InputText>
                        <small
                            class="p-error"
                            v-if="validation.accnumber"
                        >{{ $t("common.requiredField") }}</small>
                    </div>
                    
                </div>
                <Button :label="$t('common.save')" class="p-button-text" :onclick="updateBank"/>
            </div>
        </div>

    </div>
</template>
<script setup>
    import { ref, defineProps, inject, onMounted } from 'vue';
    import api from "@/service/api";
    import {getHeader, smartEnuApi} from "@/config/config";
    
    const emitter = inject("emitter");

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
    })

    const validation = ref({
        accnumber: false,
        bankname: false,
    })

    const updateBank = () => {
        if (bank.value) {
            payload.value.bank_id = bank.value.id
            console.log(bank.value.id)
        }
        
        api.post('/account/bank/update', payload.value, {headers: getHeader()}).then(res  => {
            emitter.emit('educationUpdated', true)
        }).catch(err => {
          console.log(err)
        })
    }

    const getBanks = () => {
        var req = {"id" : 0, "count": 0};
        api.post('/contragent/banks', req, {headers: getHeader()}).then(res  => {
            const data = res.data.find(item => item.id === payload.value.bank_id);
            if (data) {
                banks.value = [data];
                bank.value = data
            } else {
                banks.value = res.data
            }
        }).catch(err => {
          if (err?.response?.status !== 404) {
            console.error(err)
          }
        })
    }

    const bankLabel = (item) => {
        return item.organization.name
    }

    onMounted(() => {
        getBanks()
    })



</script>
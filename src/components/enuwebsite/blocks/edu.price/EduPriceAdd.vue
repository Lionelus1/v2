<template>
    <Dialog v-model:visible="showModal" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
            :header="currentData ? $t('common.edit') : $t('common.add') " :modal="true" class="p-fluid" @hide="hideDialog">
        <div class="field">
            <label>{{ $t('web.chooseDegree') }}</label>
            <Dropdown v-model="selectedDegree" :options="eduFields" @change="selectDegree"
                      :optionLabel="'name_' + $i18n.locale" :placeholder="$t('common.select')"/>
        </div>
        <div class="field" v-if="fields">
            <label>{{ $t('web.chooseEduProgram') }}</label>
            <Dropdown v-model="formData.edu_field_id" :options="fields"
                      :optionLabel="'name_' + $i18n.locale" optionValue="id" :placeholder="$t('common.select')"/>
        </div>
        <div v-if="formData.edu_field_id">
            <div class="field">
                <label>{{ $t('web.year') }}</label>
                <Dropdown v-model="formData.year" :options="years" :placeholder="$t('common.select')"/>
            </div>
            <div class="field">
                <label>{{ $t('web.price') }}</label>
                <InputNumber v-model="formData.price"/>
            </div>
            <div class="field">
                <label>{{ $t('web.currency') }}</label>
                <Dropdown v-model="formData.currency" :options="currencies" optionValue="value" optionLabel="name" :placeholder="$t('common.select')"/>
            </div>
        </div>
        <template #footer>
            <Button v-if="currentData" :label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success mr-2"
                    @click="save"/>
            <Button v-if="!currentData" :label="$t('common.add')" icon="pi pi-check" class="p-button p-component p-button-success mr-2" @click="add"/>
            <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger"
                    @click="hideDialog"/>
        </template>
    </Dialog>
</template>

<script>
import {inject, onUnmounted, ref, unref} from "vue";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {AdmissionInfoService} from "@/service/admission.info.service";
import {EnuWebService} from "@/service/enu.web.service";
import RichEditor from "@/components/documents/editor/RichEditor.vue";
import {generateYears} from "@/helpers/HelperUtil";
import {EduPriceService} from "@/service/edu.price.service";
import {EduService} from "@/service/edu.service";
import {useRoute} from "vue-router";

export default {
    name: "EduPriceAdd",
    props: ['isShow', 'selectedData'],
    setup(props, context) {
        const emitter = inject('emitter');
        const toast = useToast()
        const i18n = useI18n()
        const formData = ref(props.selectedData ? props.selectedData : {})
        const showModal = ref(props.isShow)
        const submitted = ref(false)
        const eduPriceService = new EduPriceService()
        const eduService = new EduService()
        const currentData = ref(props.selectedData ? props.selectedData : null)
        const years = ref(generateYears())
        const eduFields = ref()
        const selectedDegree = ref()
        const fields = ref()
        const route = useRoute()
        const currencies = [
            {
                name: 'KZT',
                value: 'KZT'
            },
            {
                name: 'USD',
                value: 'USD',
            },
            {
                name: 'EUR',
                value: 'EUR',
            }
        ]

        const getEduFields = () => {
            eduService.getEduFields().then(res => {
                if (res.data) eduFields.value = res.data
                selectedDegree.value = currentData.value ? filter(eduFields.value, currentData.value.edu_field_id) : null;
            }).catch(error => {
                toast.add({severity: "error", summary: error, life: 3000});
            });
        }

        getEduFields();

        const add = () => {
            submitted.value = true;
            formData.value.category_id = parseInt(route.params.id)
            if (!isValid()) return;
            eduPriceService.addPrice(formData.value).then(res => {
                if (res.data && res.data.is_success) {
                    toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
                }
                submitted.value = false;
                hideDialog();
            }).catch(error => {
                hideDialog();
                submitted.value = false;
                toast.add({severity: "error", summary: error, life: 3000});
            });
        }

        const save = () => {
            submitted.value = true;
            if (!isValid()) {
                return;
            }

            eduPriceService.editPrice(unref(formData)).then(res => {
                if (res.data && res.data.is_success) {
                    toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
                }
                submitted.value = false;
                hideDialog();
            }).catch(error => {
                submitted.value = false;
                toast.add({severity: "error", summary: error, life: 3000});
            });
        }

        const hideDialog = () => {
            formData.value = {}
            currentData.value = null
            emitter.emit("showEduPriceAddDialog", false)
        }

        const isValid = () => {
            let errors = [];

            if (!formData.value.edu_field_id)
                errors.push(1);
            if (!formData.value.year)
                errors.push(1);
            if (!formData.value.price)
                errors.push(1);
            if (!formData.value.currency)
                errors.push(1);
            return errors.length === 0
        }

        const selectDegree = (event) => {
            let degree = event.value;
            fields.value = degree.options;
        }

        const filter = (array, value) => {
            let res = array.find(e => {
                return e.options.find(x => x.id === value)
            });
            fields.value = res.options || null
            return res;
        }

        return {
            formData, showModal, currentData, submitted, eduFields, years, selectedDegree, fields, currencies,
            hideDialog, add, save, selectDegree
        }
    }
}
</script>

<style scoped>

</style>

<template>
    <div class="col-12 flex flex-column">
        <TitleBlock :title="i18n.t('web.siteSettings')" />
        <div class="card">
            <TabView>
                <TabPanel :header="$t('web.properties')">
                    <div class="py-3">{{ i18n.t('web.mourningMode') }}</div>
                    <InputSwitch v-model="formData.mourning" @change="mourningChange" />
                    <div class="flex flex-column gap-2 pt-3" v-if="formData.mourning">
                        <label>{{ $t('common.startDate') }}</label>
                        <div>
                            <PrimeCalendar v-model="formData.mourning_start" dateFormat="dd.mm.yy" show-icon />
                        </div>
                        <label>{{ $t('common.endDate') }}</label>
                        <div>
                            <PrimeCalendar @date-select="endDateSelect" v-model="formData.mourning_end"
                                dateFormat="dd.mm.yy" :class="{ 'p-invalid': !formData.mourning_end && submitted }"
                                show-icon />
                            <div><small v-show="!formData.mourning_end && submitted" class="p-error">{{
                                $t("common.requiredField") }}</small></div>
                        </div>
                    </div>
                    <div class="field">
                        <Button :label="$t('common.save')" class="mt-3" @click="update" />
                    </div>
                </TabPanel>
                <TabPanel :header="$t('web.history')" @click="getTableLogs()">
                    <WebLogs :TN="TN" :key="TN" />
                </TabPanel>
            </TabView>

        </div>

    </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { EnuWebService } from "@/service/enu.web.service";
import { useToast } from "primevue/usetoast";
import WebLogs from "@/components/enuwebsite/EnuSiteLogs.vue";

const formData = ref({})
const i18n = useI18n()
const enuService = new EnuWebService()
const loading = ref(false)
const toast = useToast()
const submitted = ref(false)
const TN = ref(null)
const getSettings = () => {
    loading.value = true;

    enuService.getSiteSettings().then(res => {
        if (res.data) {
            formData.value = res.data.settings;
            TN.value = res.data.tn_res
            initMourning(formData.value)
        }
        loading.value = false;
    }).catch(error => {
        loading.value = false;
        toast.add({ severity: "error", summary: error, life: 3000 });
    });
}

onMounted(() => {
    getSettings();
})

const update = () => {
    loading.value = true;
    submitted.value = true;

    if (!isValid()) return;

    if (!formData.value.mourning) {
        formData.value.mourning_start = null;
        formData.value.mourning_end = null;
    }

    enuService.setSiteSettings(formData.value).then(res => {
        if (res.data) {
            toast.add({ severity: "success", summary: i18n.t('common.success'), life: 3000 });
        }
        submitted.value = false;
        loading.value = false;
    }).catch(error => {
        submitted.value = false;
        loading.value = false;
        toast.add({ severity: "error", summary: error, life: 3000 });
    });
}

const endDateSelect = (event) => {
    let date = new Date(event);
    date.setHours(23, 59, 59, 0);
    formData.value.mourning_end = date;
}

const mourningChange = () => {
    if (formData.value.mourning && !formData.value.mourning_start) {
        let date = new Date();
        date.setHours(0, 0, 0, 0)
        formData.value.mourning_start = date;
    }
}

const initMourning = (data) => {
    let currentDate = new Date()

    if (data.mourning_start)
        data.mourning_start = new Date(data.mourning_start.replace('Z', ''));

    if (data.mourning_end)
        data.mourning_end = new Date(data.mourning_end.replace('Z', ''));

    if (data.mourning_start && data.mourning_end && currentDate < data.mourning_start && currentDate < data.mourning_end) {
        data.mourning = true;
    }
}

const isValid = () => {
    let errors = [];

    if (formData.value.mourning && !formData.value.mourning_end)
        errors.push(1)

    return errors.length === 0
}

</script>

<style scoped></style>
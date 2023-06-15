<template>
  <div class="col-12">
    <TitleBlock :title="$t('common.faculties')" />
    <div class="card">
      <TabView>
        <TabPanel :header="$t('web.properties')">
          <DataTable :lazy="true" :value="list" dataKey="id" :loading="loading" responsiveLayout="scroll" :rows="10"
            :rowHover="true">
            <template #empty>{{ $t("common.noData") }}</template>
            <template #loading>{{ $t("common.loading") }}</template>
            <Column :field="'title_' + $i18n.locale" :header="$t('common.nameIn')">
              <template #body="{ data }">
                {{ data['name_' + $i18n.locale] }}
              </template>
            </Column>
            <Column :header="$t('cafedra.responsible')">
              <template #body="{ data }">
                <span v-if="data.user_info">{{ data.user_info.fullName }}</span>
              </template>
            </Column>
            <Column v-if="isWebAdmin" class="text-right">
              <template #body="{ data }">
                <Button type="button" @click="toggle($event, data)" class="p-button" icon="fa-solid fa-pen" label="" />
                <OverlayPanel ref="op">
                  <div class="p-fluid">
                    <div class="field" style="width: 50vh">
                      <label>{{ $t('cafedra.responsible') }}</label>
                      <FindUser v-model="formData.user" :max="1" :editMode="false" />
                    </div>
                  </div>
                  <div class="grid">
                    <Button :label="$t('common.save')" @click="setFacultyAdmin" class="mt-2" />
                  </div>
                </OverlayPanel>
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        <TabPanel :header="$t('web.history')">
          <WebLogs :TN="TN" :key="TN"/>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { computed, ref } from "vue";
import { EnuWebService } from "@/service/enu.web.service";
import { useRouter } from "vue-router";
import { findRole } from "@/config/config";
import WebLogs from "@/components/enuwebsite/EnuSiteLogs.vue";

const { t } = useI18n()
const toast = useToast()
const TN = ref(null)
const loading = ref(false)
let submitted = ref(false)
const list = ref([])
const enuService = new EnuWebService()
const formData = ref({})
const op = ref()
const selectedData = ref()
const authUser = computed(() => JSON.parse(localStorage.getItem('loginedUser')))
const isWebAdmin = computed(() => findRole(authUser.value, "enu_web_admin"))

const getSlugs = () => {
  loading.value = true;
  enuService.getSlugs().then(res => {
    if (res.data)
      list.value = res.data.slugs
      TN.value = res.data.tn_res
    loading.value = false
  }).catch(error => {
    loading.value = false
    toast.add({ severity: 'error', summary: error, life: 3000 })
  })
}
getSlugs()

const setFacultyAdmin = () => {
  console.log(formData.value)
  const userId = formData.value.user && formData.value.user.length !== 0 ? formData.value.user[0].userID : null
  enuService.setFacultyAdmin(selectedData.value.id, userId).then(res => {
    if (res.data) {
      toast.add({ severity: 'success', summary: t('common.success'), life: 3000 })
    }
    op.value.hide();
    getSlugs();
  }).catch(error => {
    toast.add({ severity: 'error', summary: error, life: 3000 })
  })
}

const toggle = (event, data) => {
  selectedData.value = data;
  if (data.user_info) {
    formData.value.user = new Array(data.user_info)
  } else {
    formData.value = {}
  }
  op.value.toggle(event);
}
</script>

<style scoped></style>
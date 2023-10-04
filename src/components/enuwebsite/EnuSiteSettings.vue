<template>
  <div class="col-12 flex flex-column">
    <TitleBlock
      :title="`${$t('web.siteSettings')}${facultyAbbrev ? ' - ' + facultyAbbrev['name_' + $i18n.locale] : ''}`" />


    <TabView>
      <TabPanel :header="$t('web.properties')">
        <Panel :header="$t('web.commonSettings')" v-if="isWebAdmin || isFacultyWebAdmin">
          <div v-if="isWebAdmin">
            <div class="py-3">{{ i18n.t('web.mourningMode') }}</div>
            <InputSwitch v-model="formData.mourning" @change="mourningChange" />
            <div class="flex flex-column gap-2 pt-3" v-if="formData.mourning">
              <label>{{ $t('common.startDate') }}</label>
              <div>
                <PrimeCalendar v-model="formData.mourning_start" dateFormat="dd.mm.yy" show-icon />
              </div>
              <label>{{ $t('common.endDate') }}</label>
              <div>
                <PrimeCalendar @date-select="endDateSelect" v-model="formData.mourning_end" dateFormat="dd.mm.yy"
                  :class="{ 'p-invalid': !formData.mourning_end && submitted }" show-icon />
                <div><small v-show="!formData.mourning_end && submitted" class="p-error">{{
                  $t("common.requiredField")
                }}</small></div>
              </div>
            </div>

          </div>
          <div>
            <div class="py-3">{{ i18n.t('web.SiteMaintenanceMode') }}</div>
            <InputSwitch v-model="formData.is_closed" />
            <div class="py-3" v-if="formData.is_closed"><a :href="facultySite" target="_blank">{{
              i18n.t('web.sitePreviewLink') }}</a></div>
            <div class="field">
              <Button :label="$t('common.save')" class="mt-3" @click="update" />
            </div>

          </div>
        </Panel>
        <div v-if="isUserExist">
          <Panel v-if="isFacultyWebAdmin || isWebAdmin" :header="$t('web.universityAddressInfo')" class="mt-3">
            <div class="p-fluid">
              <div class="field">
                <label>{{ $t('web.universityFax') }}</label>
                <InputText v-model="infoData.fax" />
              </div>
              <div class="field">
                <label>{{ $t('contact.email') }}</label>
                <InputText v-model="infoData.email" type="email" />
              </div>
              <div class="field">
                <label>{{ $t('web.websiteAddress') }}</label>
                <InputText v-model="infoData.website" />
              </div>
              <div class="field">
                <label>{{ $t('web.universityAddressKZ') }}</label>
                <InputText v-model="infoData.address_kz" />

              </div>
              <div class="field">
                <label>{{ $t('web.universityAddressRU') }}</label>
                <InputText v-model="infoData.address_ru" />

              </div>
              <div class="field">
                <label>{{ $t('web.universityAddressEN') }}</label>
                <InputText v-model="infoData.address_en" />

              </div>
              <div class="field">
                <label>{{ $t('web.bgImg') }}</label>
                <FileUpload mode="basic" :customUpload="true" @uploader="uploadBg" :auto="true"
                  v-bind:chooseLabel="$t('hdfs.chooseFile')" accept="image/*" />
                <div v-if="infoData.bg_image" class="img-block">
                  <br/>
                  <Image :src="infoData.bgUrl ? infoData.bgUrl : getImgUrl(infoData.bg_image)" alt="Image" width="350" preview />
                </div>
              </div>
            </div>
            <div class="field">
              <Button :label="$t('common.save')" class="mt-3" @click="saveSiteInfo" />
            </div>
          </Panel>
        </div>
      </TabPanel>
      <TabPanel v-if="isWebAdmin" :header="$t('web.history')" @click="getTableLogs()">
        <WebLogs :TN="TN" :key="TN" />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { EnuWebService } from "@/service/enu.web.service";
import { useToast } from "primevue/usetoast";
import WebLogs from "@/components/enuwebsite/EnuSiteLogs.vue";
import { findRole, smartEnuApi, fileRoute } from "@/config/config";
import { useStore } from "vuex";
import {FileService} from "@/service/file.service";
import TitleBlock from "@/components/TitleBlock.vue";

const store = useStore()
const formData = ref({})
const infoData = ref({})
const isClosed = ref()
const i18n = useI18n()
const enuService = new EnuWebService()
const loading = ref(false)
const toast = useToast()
const submitted = ref(false)
const TN = ref(null)
const isUserExist = ref(false)
const authUser = computed(() => JSON.parse(localStorage.getItem("loginedUser")))
const isWebAdmin = computed(() => findRole(authUser.value, "enu_web_admin"))
const isFacultyWebAdmin = computed(() => findRole(authUser.value, "enu_web_fac_admin"))
const facultyAbbrev = ref()
const userParams = ref({ user_id: authUser.value.userID })
const fileService = new FileService()
const bgImg = ref(null)

const facultySite = computed(() => {
  return `${enuService.getSiteUrl(store, null)}?mode=preview`
})

const getFacultyAbb = () => {
  loading.value = true;
  enuService.getSlugByUserId(userParams.value).then(res => {
    if (res.data) {
      facultyAbbrev.value = res.data
      isUserExist.value = true

    }
    loading.value = false;
  }).catch(error => {
    loading.value = false;
    toast.add({ severity: "error", summary: error, life: 3000 });
  });
}
const getSettings = () => {
  loading.value = true;

  enuService.getSiteSettings().then(res => {
    if (res.data) {
      formData.value = res.data.settings;
      infoData.value = res.data.site_info || {}
      formData.value.is_closed = infoData.value.is_closed
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
  // getSettings();
  getFacultyAbb();

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

const getImgUrl = (url) => {
  return smartEnuApi + fileRoute + url
}

const uploadBg = (event) => {
  bgImg.value = event.files[0]
  const fd = new FormData()
  fd.append("files[]", event.files[0])
  fd.append("watermark", true)
  fileService.uploadFile(fd).then(res => {
    if (res.data) {
      infoData.value.bg_image = res.data[0].filepath;
      infoData.value.bgUrl = smartEnuApi + fileRoute + infoData.value.bg_image;
    }
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
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

const siteMaintenanceChange = () => {
  isClosed.value = !isClosed.value;
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

const saveSiteInfo = () => {
  enuService.setSiteInfo(infoData.value).then(res => {
    if (res.data)
      toast.add({ severity: "success", summary: i18n.t('common.success'), life: 3000 });
    // getSettings();
  }).catch(error => {
    toast.add({ severity: "error", summary: error, life: 3000 });
  })
}

const saveMaintenaceMode = () => {
  enuService.setSiteMaintenanceMode({ is_closed: isClosed.value }).then(res => {
    if (res.data)
      toast.add({ severity: "success", summary: i18n.t('common.success'), life: 3000 });
    // getSettings();
  }).catch(error => {
    toast.add({ severity: "error", summary: error, life: 3000 });
  })
}

const isValid = () => {
  let errors = [];

  if (formData.value.mourning && !formData.value.mourning_end)
    errors.push(1)

  return errors.length === 0
}

const onSlugSelect = (event) => {

}

</script>

<style scoped></style>
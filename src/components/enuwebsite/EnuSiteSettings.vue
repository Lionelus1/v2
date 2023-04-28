<template>
  <div class="col-12">
      <TitleBlock :title="i18n.t('web.siteSettings')" />
      <div class="card">
          <div class="py-3">{{ i18n.t('web.mourningMode') }}</div>
          <InputSwitch v-model="formData.mourning" />
          <div class="field">
              <Button :label="$t('common.save')" class="mt-3" @click="update" />
          </div>
      </div>

  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {EnuWebService} from "@/service/enu.web.service";
import {useToast} from "primevue/usetoast";

const formData = ref({})
const i18n = useI18n()
const enuService = new EnuWebService()
const loading = ref(false)
const toast = useToast()

const getSettings = () => {
    loading.value = true;
    enuService.getSiteSettings().then(res => {
        if (res.data) {
            formData.value = res.data;
        }
    }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
    });
}

onMounted(() => {
    getSettings();
})

const update = () => {
    loading.value = true;
    enuService.setSiteSettings(formData.value).then(res => {
        if (res.data.is_success) {
            toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
    }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
    });
}
</script>

<style scoped>

</style>
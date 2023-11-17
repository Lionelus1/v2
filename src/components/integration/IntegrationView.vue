<script setup>
import TitleBlock from "@/components/TitleBlock.vue";
import {useI18n} from "vue-i18n";
import {IntegrationService} from "@/service/integration.service";
import {computed, onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {useToast} from "primevue/usetoast";

const {t, locale} = useI18n()
const service = new IntegrationService()
const route = useRoute()
const id = computed(() => route.params.id)

const integration = ref()
const loading = ref(false)
const toast = useToast()

const getIntegration = () => {
  loading.value = false
  service.getIntegration(id.value).then(res => {
    integration.value = res.data
    loading.value = false
  }).catch(error => {
    toast.add({severity: 'error', summary: t('common.error'), detail: error, life: 3000})
    loading.value = false
  })
}

onMounted(() => {
  getIntegration()
})
</script>

<template>
  <div class="col-12">
    <TitleBlock :title="t('common.view')" />

    <div class="card">

    </div>
  </div>
</template>

<style scoped>

</style>
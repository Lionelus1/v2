<template>
    <div class="col-12">
      <TitleBlock :title="$t('science.profile')" :show-back-button="true"/>
    </div>

    <div>
      <div class="col-12 md:col-12 p-fluid">
        <MyCabinetView :id="id" customType="scientists"></MyCabinetView>
      </div>
    </div>

</template>
  
<script setup>
  import TitleBlock from "@/components/TitleBlock"
  import {computed, onMounted, ref} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {useRouter, useRoute} from "vue-router";
  import {useConfirm} from "primevue/useconfirm";
  import {ScienceService} from "@/service/science.service";
  import OverlayPanel from 'primevue/overlaypanel';
  import Image from 'primevue/image';
  import MyCabinetView from "@/components/humanResources/candidate/MyCabinetView";

  const {t, locale} = useI18n()
  const toast = useToast()
  const router = useRouter()
  const route = useRoute()
  const confirm = useConfirm()
  const scientist = ref(null)
  const loading = ref(false)
  const scienceService = new ScienceService()
  const id = parseInt(route.params.id) 
  const getScientist = () => {
      const req = { 
        id: parseInt(route.params.id)
      }
      
      scienceService.getScientists(req).then(res => {
          scientist.value = res.data
          loading.value = false
      }).catch(error => {
          toast.add({severity: 'error', summary: t('common.error'), life: 3000})
          loading.value = false;
      })
  }
  onMounted(() => {
      getScientist()
  })
</script>
  
<template>
  <div class="col-12" v-if="slugs">
    <h5>{{ $t('web.domain') }}</h5>
    <Dropdown v-model="selectedSlug" :options="slugs" optionLabel="name"
              placeholder="Выберите факультет" class="w-full" :loading="loading" @change="select" />
  </div>
</template>

<script setup>
import {EnuWebService} from "@/service/enu.web.service";
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {useStore} from "vuex";

const enuService = new EnuWebService()
const slugs = ref()
const loading = ref(false)
const i18n = useI18n()
const toast = useToast()
const store = useStore()
const emit = defineEmits(['onSelect'])

const selectedSlug = ref()
//selectedSlug.value = computed(() => localStorage.getItem('selectedSlug') ? JSON.parse(localStorage.getItem('selectedSlug')) : null).value

const getSlugs = () => {
  loading.value = true;
  enuService.getSlugs().then(res => {
    slugs.value = res.data.slugs
    slugs.value.map(e => {
      e.name = `${e.slug ? e.slug + "." : ""}enu.kz - ${e['name_' + i18n.locale.value]}`
    })

    if (localStorage.getItem('selectedSlug')) {
      selectedSlug.value = JSON.parse(localStorage.getItem('selectedSlug'))
    } else if (store.state.userSlug) {
      let slug = store.state.userSlug
      selectedSlug.value = slugs.value.find(x => x.id === slug.id)
    }
    loading.value = false
  }).catch(error => {
    loading.value = false;
    toast.add({ severity: "error", summary: error, life: 3000 })
  })
}

const select = (event) => {
  localStorage.setItem("selectedSlug", JSON.stringify(event.value))
  emit('onSelect', event.value)
}

onMounted(() => {
  if (store.state.userSlug) {
    let slug = store.state.userSlug
    slug.name = `${slug.slug ? slug.slug + "." : ""}enu.kz - ${slug['name_' + i18n.locale.value]}`
    selectedSlug.value = slug
  }
  getSlugs()
})
</script>

<style scoped>

</style>
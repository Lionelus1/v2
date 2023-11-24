<template>
  <h3>{{ $t('Конструктор образовательных программ - Бакалавриат') }}</h3>
  <div>
  <div class="card">
    <Button @click="goToAdd()" icon="pi pi-plus-circle" label="Создать ОП" />
    <Button class="ml-2" icon="pi pi-filter" label="Фильтр" />

  </div>
</div>
</template>

<script setup>

import {useRouter} from "vue-router";

const router = useRouter()
const goToAdd = () =>{
  router.push({name: "addEducationalPrograms"})
}
</script>

<style scoped>

</style>
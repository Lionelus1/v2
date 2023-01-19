<template>
  <div class="p-grid">
    <div class="p-col-12">
      <h3>Добавить страницу</h3>
    </div>
    <div class="p-col-12 p-fluid">
      <div class="p-field">
        <label>{{ $t('common.nameInQazaq') }}</label>
        <InputText :placeholder="$t('common.nameInQazaq')" v-model="formData.title_kz" />
      </div>
      <div class="p-field">
        <label>{{ $t('common.nameInRussian') }}</label>
        <InputText :placeholder="$t('common.nameInRussian')" v-model="formData.title_ru" />
      </div>
      <div class="p-field">
        <label>{{ $t('common.nameInEnglish') }}</label>
        <InputText :placeholder="$t('common.nameInEnglish')" v-model="formData.title_en" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AddPage",
  data() {
    return {
      formData: null
    }
  }
}
</script>

<style scoped>

</style>
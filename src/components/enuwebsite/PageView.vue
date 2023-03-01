<template>
  <Dialog v-model:visible="pageViewVisible" :style="{ width: '1000px' }" @hide="closeModal"
      :modal="true" class="p-fluid" :closable="true" :breakpoints="{'960px': '75vw', '640px': '90vw'}">
    <Card style="box-shadow: none">
      <template #title>
        <div class="card_title">
          {{ $i18n.locale === 'kz' ? selectedPage.title_kz : $i18n.locale === 'ru' ? selectedPage.title_ru : selectedPage.title_en }}
        </div>
      </template>
      <template #content>
        <div class="news_content"
             v-html="$i18n.locale === 'kz' ? selectedPage.content_kz : $i18n.locale === 'ru' ? selectedPage.content_ru : selectedPage.content_en">
        </div>
      </template>
    </Card>
    <template #footer>
      <Button v-bind:label="$t('common.close')" icon="pi pi-times"
          class="p-button p-component p-button-primary" @click="closeModal"/>
    </template>
  </Dialog>
</template>

<script>
export default {
  name: "PageView",
  props: ['isVisible', 'selectedPage'],
  data() {
    return {
      pageViewVisible: this.isVisible ?? false
    }
  },
  methods: {
    closeModal() {
      this.emitter.emit("pageViewModalClose", false);
    }
  }
}
</script>

<style scoped>

</style>
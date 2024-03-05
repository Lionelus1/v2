<template>
  <Dialog v-model:visible="pageViewVisible" :style="{ width: '1000px' }"
      :modal="true" class="p-fluid" :closable="false" :breakpoints="{'960px': '75vw', '640px': '90vw'}">
    <Card style="box-shadow: none">
      <template #title>
        <div class="card_title">
          {{ $i18n.locale === 'kz' ? selectedPage.title_kz : $i18n.locale === 'ru' ? selectedPage.title_ru : selectedPage.title_en }}
        </div>
      </template>
      <template #content>
        <div class="news_content" ref="dynamicContent"
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

<script setup>
import {computed, inject, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";

const dynamicContent = ref()
const props = defineProps(['isVisible', 'selectedPage'])
const pageViewVisible = computed(() => props.isVisible ?? false)
const emit = defineEmits(['pageViewModalClose'])
const emitter = inject('emitter');
const {locale} = useI18n()

const openAccordion = (event) => {
  let accordionNode = event.target.closest('accordion')
  if (accordionNode) {
    let bodyNode = accordionNode.querySelector('.body');
    let header = accordionNode.querySelector('.accordion_icon');
    if (bodyNode) {
      if (bodyNode.classList.contains('fade-in')) {
        bodyNode.classList.remove('fade-in')
        header.classList.remove('rotate')
      } else {
        bodyNode.classList.add('fade-in');
        header.classList.add('rotate');
      }
    }
  }
}

onMounted(() => {
  setTimeout(() => {
    if (props.selectedPage && dynamicContent.value) {
      const accordionEl = dynamicContent.value.querySelectorAll('accordion_header');
      if (accordionEl.length !== 0 ) {
        accordionEl.forEach(el => {
          el.addEventListener('click', openAccordion)
        })
      }
    }
  }, 50)
})

const closeModal = () => {
  emitter.emit("pageViewModalClose", false);
}
</script>

<style scoped>

</style>
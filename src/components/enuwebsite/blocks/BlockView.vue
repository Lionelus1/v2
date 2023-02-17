<template>
  <div class="col-12">
    <TitleBlock :title="$t('web.blocks') + ' | ' + ($i18n.locale === 'kz' ? block.title_kz : $i18n.locale === 'ru' ? block.title_ru : block.title_en)" :showBackButton="true" />
    <div class="card" v-if="block && content && !block.is_list">
      <TabView class="p-fluid">
        <TabPanel header="Қазақша">
          <div class="field mt-3">
            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
            <InputText v-model="content.title_kz" rows="3" :class="{ 'p-invalid': !content.title_kz && submitted }"/>
            <small v-show="!content.title_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
          </div>
          <div class="field">
            <label>{{ $t("common.contentInQazaq") }}</label>
            <RichEditor ref="kztext" v-model="content.content_kz" editorStyle="height: 320px"></RichEditor>
            <small v-show="!content.content_kz && submitted" class="p-error">
              {{ $t("smartenu.contentKzInvalid") }}
            </small>
          </div>
        </TabPanel>
        <TabPanel header="Русский">
          <div class="field mt-3" style="margin-bottom: 1.5rem">
            <label>{{ $t("common.nameInRussian") }}</label>
            <InputText v-model="content.title_ru" rows="3" :class="{ 'p-invalid': !content.title_ru && submitted }"/>
            <small v-show="!content.title_ru && submitted" class="p-error">
              {{ $t("smartenu.titleRuInvalid") }}
            </small>
          </div>
          <div class="field">
            <label for="ru-content">{{ $t("common.contentInRussian") }}</label>
            <RichEditor id="ru-content" v-model="content.content_ru" editorStyle="height: 320px"/>
            <small v-show="!content.content_ru && submitted" class="p-error">
              {{ $t("smartenu.contentRuInvalid") }}
            </small>
          </div>
        </TabPanel>
        <TabPanel header="English">
          <div class="field mt-3" style="margin-bottom: 1.5rem">
            <label>{{ $t("common.nameInEnglish") }}</label>
            <InputText v-model="content.title_en" rows="3" :class="{ 'p-invalid': !content.title_en && submitted }"/>
            <small v-show="!content.title_en && submitted" class="p-error">
              {{ $t("smartenu.titleEnInvalid") }}
            </small>
          </div>
          <div class="field">
            <label>{{ $t("common.contentInEnglish") }}</label>
            <RichEditor v-model="content.content_en" editorStyle="height: 320px"/>
            <small v-show="!content.content_en && submitted" class="p-error">
              {{ $t("smartenu.contentEnInvalid") }}
            </small>
          </div>
        </TabPanel>
      </TabView>
      <Button :label="$t('common.save')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2" @click="saveBlocContent"/>
    </div>
    <BlockElementsList v-if="block.is_list" />
  </div>
</template>

<script>
import {onMounted, ref} from "vue";
import {EnuWebService} from "@/service/enu.web.service";
import BlockElementsList from "@/components/enuwebsite/blocks/BlockElementsList.vue";
import {useRoute, useRouter} from "vue-router";
import RichEditor from "@/components/documents/editor/RichEditor.vue";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import TitleBlock from "@/components/TitleBlock.vue";

export default {
  name: "BlockView",
  components: {BlockElementsList, RichEditor, TitleBlock},
  setup() {
    const loading = ref(false), submitted = ref(false)
    const enuService = new EnuWebService()
    const toast = useToast()
    const i18n = useI18n()
    let block = ref({})
    let elements = ref([])
    let content = ref({})
    const route = useRoute()
    const blockId = route.params.id

    const getBlockInfo = () => {
      loading.value = true;
      enuService.getBlockById(blockId).then(res => {
        block.value = res.data
        if (block.value.is_list) {
          getBlockElements(block.value.block_id)
        } else {
          getBlockContent(block.value.block_id)
        }
      }).catch(error => {
        loading.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const getBlockContent = (blockId) => {
      enuService.getBlockContentByBlockId(blockId).then(res => {
        if (res.data)
          content.value = res.data
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const getBlockElements = (blockId) => {
      enuService.getBlockListByBlockId(blockId).then(res => {
        elements.value = res.data
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const saveBlocContent = () => {
      submitted.value = true;
      console.log(content.value)
      if (!isValid()) return;
      if (content.value.block_content_id != null) {
        enuService.editBlockContent(content.value).then(res => {
          if (res.data.is_success) {
            submitted.value = false;
            toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
          }
        }).catch(error => {
          submitted.value = false;
          toast.add({severity: "error", summary: error, life: 3000});
        });
      } else {
        enuService.addBlockContent(content.value).then(res => {
          if (res.data.is_success) {
            submitted.value = false;
            toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
          }
        }).catch(error => {
          submitted.value = false;
          toast.add({severity: "error", summary: error, life: 3000});
        });
      }
    }

    function isValid() {
      let errors = [];
      if (!content.value.title_kz)
        errors.push(1);
      if (!content.value.title_ru)
        errors.push(1);
      if (!content.value.title_en)
        errors.push(1);
      if (!content.value.content_kz)
        errors.push(1);
      if (!content.value.content_ru)
        errors.push(1);
      if (!content.value.content_en)
        errors.push(1);

      return errors.length === 0
    }

    onMounted(() => {
      getBlockInfo()
    })

    return {
      loading, block, elements,
      content, submitted, saveBlocContent
    }
  }
}
</script>

<style scoped>

</style>
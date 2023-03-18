<template>
  <div class="col-12">
    <TitleBlock :showBackButton="true" :title="$t('web.menuMainPage') + ' | ' + ($i18n.locale === 'kz' ? pageData.title_kz : $i18n.locale === 'ru' ? pageData.title_ru : pageData.title_en)"/>
    <div class="card">
      <Button :label="$t('web.addBlock')" @click="toggle" />
    </div>
    <div class="card">
      <DataTable :lazy="true" :value="pageBlocks" :rows="10" dataKey="id" :rowHover="true" :loading="loading" @rowReorder="onRowReorder" responsiveLayout="scroll">
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column :rowReorder="true" headerStyle="width: 3rem" :reorderableColumn="false" />
        <Column field="block_title" :header="$t('web.blockName')">
          <template #body="{ data }">
            <a href="javascript:void(0)" @click="navigateToBlock(data)">
              {{ $i18n.locale === "kz" ? data.block.title_kz : $i18n.locale === "ru" ? data.block.title_ru : data.block.title_en }}
            </a>
          </template>
        </Column>
        <Column field="block_type" :header="$t('web.blockType')">
          <template #body="{ data }">
            {{ data.block.is_list ? $t('web.list') : !data.block.is_plugin ? $t('web.content') : $t('web.plugin') }}
          </template>
        </Column>
        <Column field="actions" header="">
          <template #body="{ data }">
            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="deleteConfirm(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <OverlayPanel ref="op" appendTo="body" :showCloseIcon="true" id="overlay_panel"
                style="width: 450px" :breakpoints="{'960px': '75vw'}" >
    <div class="p-fluid">
      <div class="field">
        <label>{{ $t('web.blocks') }}</label>
        <Dropdown v-model="selectedBlock" :options="blocks" :optionLabel="('title_' + $i18n.locale)"
                  :filter="true" :show-clear="true" @change="initSelect"/>
      </div>
      <div v-if="selectedBlock.is_plugin && selectedBlock.is_plugin === true">
        <div class="field" v-for="param in selectedBlock.params" :key="param.id">
          <label>{{ param["name_" + $i18n.locale] }}</label>
          <Dropdown v-model="param.value" :options="param.options" :optionLabel="'name_' + $i18n.locale"
                    :filter="true" :show-clear="true" @change="initParamSelect($event, param)" />
        </div>
      </div>
    </div>
    <div class="field">
      <Button :label="$t('common.add')" @click="addBlockToPage" class="mt-2"/>
    </div>
  </OverlayPanel>

</template>

<script>
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {EnuWebService} from "@/service/enu.web.service";
import TitleBlock from "@/components/TitleBlock.vue";
import {useConfirm} from "primevue/useconfirm";

export default {
  name: "LandingPageView",
  components: {TitleBlock},
  setup() {
    const toast = useToast()
    const i18n = useI18n()
    const route = useRoute()
    const confirm = useConfirm()
    const router = useRouter()
    const enuService = new EnuWebService()
    const pageData = ref({})
    const pageBlocks = ref({})
    const blocks = ref({})
    const loading = ref(false)
    const pageId = route.params.id
    const selectedBlock = ref({})
    const op = ref();
    const selectedParams = ref([])

    const getPageData = () => {
      enuService.getPageById(pageId).then(res => {
        pageData.value = res.data
        pageBlocks.value = res.data.page_blocks
        getBlocks();
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const getBlocks = () => {
      enuService.getBlockList({}).then(res => {
        if (res.data) {
          blocks.value = res.data.blocks
        }
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const onRowReorder = (event) => {
      let data = {
        drag_id: pageBlocks.value[event.dragIndex].id,
        drop_id: pageBlocks.value[event.dropIndex].id
      }
      enuService.orderBlockIntoPage(data).then(res => {
        if (res.data && res.data.is_success) {
          getPageData()
        } else {
          toast.add({severity: "error", summary: i18n.t('common.error'), life: 3000});
        }
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const toggle = (event) => {
      op.value.toggle(event);
    }

    const addBlockToPage = () => {
      let data = {
        block_id: selectedBlock.value.block_id,
        page_id: pageData.value.enu_page_id,
        position: pageBlocks.value ? pageBlocks.value[pageBlocks.value.length - 1].position + 1 : 0,
        params: selectedParams.value
      }
      enuService.addBlockToPage(data).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        selectedBlock.value = {}
        op.value.hide();
        getPageData()
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const getBlockTitle = (block) => {
      return i18n.locale === "kz" ? block.title_kz : i18n.locale === "ru" ? block.title_ru : block.title_en
    }

    const deleteConfirm = (data) => {
      confirm.require({
        message: i18n.t('common.doYouWantDelete'),
        header: i18n.t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          remove(data.id)
        },
      });
    }

    const remove = (id) => {
      enuService.deleteBlockFromPage(id).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        } else {
          toast.add({severity: "warn", summary: i18n.t('common.error'), life: 3000});
        }
        getPageData();
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const initSelect = () => {
      if (selectedBlock.value.is_plugin) {
        getBlockParams()
      }
    }

    const getBlockParams = () => {
      enuService.getBlockParamsByBlockId(selectedBlock.value.block_id).then(res => {
        if (res.data) {
          selectedBlock.value.params = res.data;
        }
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const initParamSelect = (event, param) => {
      selectedParams.value.push({parameter_id: event.value.parameter_id, catalog_value_id: event.value.id})
    }

    const navigateToBlock = (data) => {
      if (!data.block.is_plugin)
        router.push({name: 'BlockView', params: {id: data.block_id}})
      if (data.block && data.block.block_plugin) {
        const compName = enuService.navigateToPlugin(data.block.block_plugin.component_name)

        router.push({name: compName});
      }
    }

    onMounted(() => {
      getPageData();
    });

    return {
      loading, pageData, blocks, selectedBlock, op, pageBlocks,
      onRowReorder, toggle, getBlockTitle, addBlockToPage, deleteConfirm,
      navigateToBlock, initSelect, initParamSelect
    }
  }
}
</script>

<style scoped>

</style>
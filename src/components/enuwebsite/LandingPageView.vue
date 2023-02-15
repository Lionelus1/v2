<template>
  <div class="col-12">
    <TitleBlock :showBackButton="true" :title="$t('enuNewSite.menuMainPage') + ' | ' + ($i18n.locale === 'kz' ? pageData.title_kz : $i18n.locale === 'ru' ? pageData.title_ru : pageData.title_en)"/>
    <div class="card">
      <Button label="Добавить блок" @click="toggle" />
    </div>
    <div class="card">
      <DataTable :lazy="true" :value="pageBlocks" :rows="10" dataKey="id" :rowHover="true" :loading="loading" @rowReorder="onRowReorder" responsiveLayout="scroll">
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column :rowReorder="true" headerStyle="width: 3rem" :reorderableColumn="false" />
        <Column field="block_title" header="Название блока">
          <template #body="{ data }">
            <a href="javascript:void(0)" @click="navigateToBlock(data)">
              {{ $i18n.locale === "kz" ? data.block.title_kz : $i18n.locale === "ru" ? data.block.title_ru : data.block.title_en }}
            </a>
          </template>
        </Column>
        <Column field="block_type" header="Тип блока">
          <template #body="{ data }">
            {{ data.block.is_list ? 'Список' : 'Контент' }}
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
        <label>Блоки</label>
        <Dropdown v-model="selectedBlock" :options="blocks" :optionLabel="('title_' + $i18n.locale)"
                  :filter="true" :show-clear="true"/>
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
      enuService.getBlockList().then(res => {
        if (res.data) {
          blocks.value = res.data
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
        position: pageBlocks.value ? pageBlocks.value[pageBlocks.value.length - 1].position + 1 : 0
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

    const navigateToBlock = (data) => {
      router.push({name: 'BlockView', params: {id: data.block_id}})
    }

    onMounted(() => {
      getPageData();
    });

    return {
      loading, pageData, blocks, selectedBlock, op, pageBlocks,
      onRowReorder, toggle, getBlockTitle, addBlockToPage, deleteConfirm,
      navigateToBlock
    }
  }
}
</script>

<style scoped>

</style>
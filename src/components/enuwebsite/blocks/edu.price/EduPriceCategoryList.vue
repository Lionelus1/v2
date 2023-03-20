<template>
  <div class="col-12">
    <TitleBlock :show-back-button="true" :title="'Модуль Какие профессии есть?'" />
    <div class="card">
      <Button :label="$t('common.add')" @click="openDialog(null)" />
    </div>
    <div class="card">
      <TreeTable class="p-treetable-sm" :value="data" :lazy="true" :loading="loading"
                 @nodeExpand="onExpand" scrollHeight="flex" responsiveLayout="scroll"
                 :resizableColumns="true" columnResizeMode="fit">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <template #header>
          <h4 class="mb-2 m-md-0 align-self-md-center">{{ $t('smartenu.categories') }}</h4>
        </template>
        <Column :header="$t('common.nameIn')" :expander="true">
          <template #body="{ node }">
            <span v-if="!node.leaf">{{ node['name_' + $i18n.locale] }}</span>
            <a v-if="node.leaf" href="javascript:void(0)" @click="navigateToPrice(node.id)">{{ node['name_' + $i18n.locale] }}</a>
          </template>
        </Column>
        <Column :header="$t('web.degreeLevel')">
          <template #body="{node}">
            <div v-if="node.degree">{{ node.degree['name_' + $i18n.locale] }}</div>
          </template>
        </Column>
        <Column :header="$t('common.description')">
          <template #body="{node}">
            {{ node.desc ? node.desc : '' }}
          </template>
        </Column>
        <Column header="" class="text-right">
          <template #body="{node}">
            <Button type="button" icon="fa-solid fa-plus" class="p-button mr-2" @click="openDialog(node)"></Button>
            <Button icon="fa-solid fa-pen" class="p-button mr-2" @click="openEdit(node)" />
            <Button icon="fa-solid fa-trash" class="p-button-danger" @click="deleteConfirm(node)" />
          </template>
        </Column>
      </TreeTable>
    </div>
  </div>

  <EduPriceCategoryAdd v-if="showModal" :isShow="showModal" :selected-data="selectedData" :parent="parentParams" />
</template>

<script>
import TitleBlock from "@/components/TitleBlock.vue";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {useConfirm} from "primevue/useconfirm";
import {inject, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {EduPriceService} from "@/service/edu.price.service";
import EduPriceAdd from "@/components/enuwebsite/blocks/edu.price/EduPriceAdd.vue";
import {EnuWebService} from "@/service/enu.web.service";
import EduPriceCategoryAdd from "@/components/enuwebsite/blocks/edu.price/EduPriceCategoryAdd.vue";

export default {
  name: "EduPriceCategoryList",
  components: {TitleBlock, EduPriceCategoryAdd},
  setup() {
    const eduPriceService = new EduPriceService()
    const toast = useToast()
    const i18n = useI18n()
    const confirm = useConfirm()
    const loading = ref(false)
    const showModal = ref(false)
    const data = ref()
    const block = ref()
    const router = useRouter()
    const selectedData = ref()
    const emitter = inject('emitter');
    const parentNode = ref()
    const parentParams = ref()
    const lazyParams = ref({
      page: 1,
      rows: 10,
      parent_id: null,
    })

    const onExpand = (node) => {
      lazyParams.value.parent_id = Number(node.id)
      parentNode.value = node
      getCategories(node)
    }

    const getCategories = (parentData) => {
      loading.value = true;
      if (parentData == null) {
        lazyParams.value.parent_id = null;
      }
      eduPriceService.getPriceCategories(lazyParams.value).then(res => {
        if (parentData == null) {
          data.value = res.data;
        } else {
          parentData.children = res.data;
        }
        loading.value = false;
      }).catch(error => {
        loading.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }
    getCategories(null);

    const openDialog = (data) => {
      if (data) parentParams.value = data;
      selectedData.value = null;
      showModal.value = true;
    }

    const openEdit = (data) => {
      selectedData.value = data;
      showModal.value = true;
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
      eduPriceService.deletePriceCategory(id).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        } else {
          toast.add({severity: "warn", summary: i18n.t('common.message.title.saveError'), life: 3000});
        }
        getCategories(null);
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const navigateToPrice = (id) => router.push({name: 'EduPriceList', params: {id: id}})

    onMounted(() => {
      emitter.on('showEduPriceCategoryAddDialog', isShow => {
        showModal.value = isShow;
        getCategories(null)
      });
    });

    return {
      data, loading, showModal, block, selectedData, parentParams,
      openDialog, navigateToPrice, onExpand, openEdit, deleteConfirm
    }

  }
}
</script>

<style scoped>

</style>

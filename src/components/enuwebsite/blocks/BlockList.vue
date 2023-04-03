<template>
  <div class="col-12">
    <h3>{{ $t('web.blocks') }}</h3>
    <div class="card">
      <Button :label="$t('web.addBlock')" @click="openDialog" />
    </div>
    <div class="card">
      <DataTable :lazy="true" :value="blockList" dataKey="id" :loading="loading" responsiveLayout="scroll" :rows="10" :rowHover="true"
                 :paginator="true" :totalRecords="total" @page="onPage" @sort="onSort">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <template #header>
          <div class="text-right">
            <div class="p-input-icon-left">
              <i class="pi pi-search"/>
              <InputText type="search" v-model="lazyParams.searchText" :placeholder="$t('common.search')"
                         @search="getBlockList"/>
              <Button icon="pi pi-search" class="ml-1" @click="getBlockList"/>
            </div>
          </div>
        </template>
        <Column :field="'title_' + $i18n.locale" :header="$t('common.nameIn')" sortable>
          <template #body="{data}">
            <a href="javascript:void(0)" @click="navigateToView(data)">
              {{ data['title_' + $i18n.locale] }}
<!--              {{ $i18n.locale === "kz" ? data.title_kz : $i18n.locale === "ru" ? data.title_ru : data.title_en }}-->
            </a>
          </template>
        </Column>
        <Column :header="$t('web.blockType')" sortable>
          <template #body="{data}">
            {{ data.is_list ? $t('web.list') : !data.is_plugin ? $t('web.content') : $t('web.plugin') }}
          </template>
        </Column>
        <Column :header="$t('faq.createDate')">
          <template #body="{data}">
            {{ formatDate(data.create_date) }}
          </template>
        </Column>
        <Column class="text-right">
          <template #body="{data}">
            <Button icon="fa-solid fa-pen" class="p-button mr-2"
                    @click="openEdit(data)" />
            <Button icon="fa-solid fa-trash" class="p-button-danger" @click="deleteConfirm(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="isCreateModal" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
          :header="formData && formData.title_kz ? $t('web.editBlock') : $t('web.addBlock') " :modal="true" class="p-fluid" @hide="hideDialog">
    <div class="field">
      <label>{{ $t('common.nameInQazaq') }}</label>
      <InputText type="text" v-model="formData.title_kz"  />
      <small class="p-error" v-if="!formData.title_kz && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="field">
      <label>{{ $t('common.nameInRussian')}}</label>
      <InputText type="text" v-model="formData.title_ru"  />
      <small class="p-error" v-if="!formData.title_ru && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="field">
      <label>{{ $t('common.nameInEnglish') }}</label>
      <InputText type="text" v-model="formData.title_en"  />
      <small class="p-error" v-if="!formData.title_en && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="field">
      <label>{{ $t('common.type') }}</label>
      <div class="field-radiobutton">
        <RadioButton inputId="blockType1" name="blockType" :value="true" v-model="formData.is_list" />
        <label for="blockType1">{{ $t('web.list') }}</label>
      </div>
      <div class="field-radiobutton">
        <RadioButton inputId="blockType2" name="blockType" :value="false" @change="formData.is_grid = false" v-model="formData.is_list" />
        <label for="blockType2">{{ $t('web.content') }}</label>
      </div>
    </div>
    <div class="field" v-if="formData.is_list">
      <label>{{ $t('web.view') }}</label>
      <div class="field-radiobutton">
        <RadioButton inputId="listType1" name="listType" :value="false" v-model="formData.is_grid" />
        <label for="listType1">{{ $t('web.list') }}</label>
      </div>
      <div class="field-radiobutton">
        <RadioButton inputId="listType2" name="listType" :value="true" v-model="formData.is_grid" />
        <label for="listType2">{{ $t('web.grid') }}</label>
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger mr-2" @click="hideDialog"/>
      <Button v-if="selectedBlock" :label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success" @click="save" />
      <Button v-if="!selectedBlock" :label="$t('common.add')" icon="pi pi-check" class="p-button p-component p-button-success" @click="addBlock" />
    </template>
  </Dialog>
</template>

<script>
import {onMounted, ref, reactive, toRefs} from "vue";
import {EnuWebService} from "@/service/enu.web.service";
import { formatDate } from "@/helpers/HelperUtil";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {useConfirm} from "primevue/useconfirm";

export default {
  name: "BlockList",
  setup() {
    const i18n = useI18n()
    const toast = useToast()
    const confirm = useConfirm()
    const loading = ref(false)
    let selectedBlock = ref()
    let isCreateModal = ref(false)
    let submitted = ref(false)
    const blockList = ref([])
    const enuService = new EnuWebService()
    const router = useRouter()
    let formData = ref({})
    const options = ref([true, false]);
    const total = ref(0)
    const lazyParams = ref({
      page: 0,
      rows: 10,
      searchText: "",
      sortField: null,
      sortOrder: 0
    })

    const navigateToView = (data) => {
      if (!data.is_plugin) router.push({name: 'BlockView', params: {id: data.block_id}})

      if (data.block_plugin) {
        const compName = enuService.navigateToPlugin(data.block_plugin.component_name)
        router.push({name: compName});
      }
    };

    const getBlockList = () => {
      loading.value = true;
      enuService.getBlockList(lazyParams.value).then(res => {
        if (res.data) {
          blockList.value = res.data.blocks
          total.value = res.data.total;
        }
        loading.value = false
      }).catch(error => {
        loading.value = false
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const addBlock = () => {
      submitted.value = true;
      enuService.addBlock(formData.value).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        getBlockList()
      }).catch(error => {
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const save = () => {
      submitted.value = true;
      enuService.editBlock(formData.value).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        selectedBlock.value = null
        getBlockList()
      }).catch(error => {
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        selectedBlock.value = null
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const openEdit = (data) => {
      formData.value = data
      selectedBlock.value = data;
      isCreateModal.value = true;
    }

    const openDialog = () => {
      isCreateModal.value = true;
      formData.value = {};
    }

    const hideDialog = () => {
      isCreateModal.value = false;
    }

    const deleteConfirm = (data) => {
      confirm.require({
        message: i18n.t('common.doYouWantDelete'),
        header: i18n.t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          remove(data.block_id)
        },
      });
    }

    const remove = (id) => {
      enuService.deleteBlock(id).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        } else {
          toast.add({severity: "warn", summary: i18n.t('common.message.title.saveError'), life: 3000});
        }
        getBlockList();
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const onPage = (event) => {
      lazyParams.value.page = event.page
      lazyParams.value.rows = event.rows
      getBlockList();
    }

    const onSort = (event) => {
      lazyParams.value.sortField = event.sortField;
      lazyParams.value.sortOrder = event.sortOrder;
      getBlockList();
    }

    onMounted(() => {
      getBlockList();
    });

    return {
      blockList, isCreateModal, formData, lazyParams,
      loading, selectedBlock, submitted, options, total,
      navigateToView, openDialog, hideDialog, addBlock, save, deleteConfirm, openEdit, formatDate,
      onPage, onSort, getBlockList
    }
  }
}
</script>

<style lang="scss" scoped>
.field-radiobutton {
  align-items: center;
  display: flex;
  margin-bottom: 1rem;

  label {
    line-height: 1;
    margin-left: 0.5rem;
  }
}
</style>

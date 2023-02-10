<template>
  <div class="p-col-12">
    <h3>Блоки</h3>
    <div class="card">
      <Button label="Добавить блок" @click="openDialog" />
    </div>
    <div class="card">
      <DataTable :lazy="true" :value="blockList" dataKey="id" :rowHover="true" :loading="loading" responsiveLayout="scroll">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <Column field="title" :header="$t('common.nameIn')">
          <template #body="{data}">
            <a href="javascript:void(0)" @click="navigateToView(data)">{{ $i18n.locale === "kz" ? data.title_kz : $i18n.locale === "ru" ? data.title_ru : data.title_en }}</a>
          </template>
        </Column>
        <Column>
          <template #body="{data}">
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2"
                    @click="openEdit(data)" />
            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="deleteConfirm(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="isCreateModal" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
          :header="formData ? 'Редактировать блок' : 'Добавить блок' " :modal="true" class="p-fluid" @hide="hideDialog">
    <div class="p-field">
      <label>{{ $t('common.nameInQazaq') }}</label>
      <InputText type="text" v-model="formData.title_kz"  />
      <small class="p-error" v-if="!formData.title_kz && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="p-field">
      <label>{{ $t('common.nameInRussian')}}</label>
      <InputText type="text" v-model="formData.title_ru"  />
      <small class="p-error" v-if="!formData.title_ru && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="p-field">
      <label>{{ $t('common.nameInEnglish') }}</label>
      <InputText type="text" v-model="formData.title_en"  />
      <small class="p-error" v-if="!formData.title_en && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="p-field">
      <label>{{ $t('common.type') }}</label>
      <div class="field-radiobutton">
        <RadioButton inputId="blockType1" name="blockType" :value="true" v-model="formData.is_list" />
        <label for="blockType1">Список</label>
      </div>
      <div class="field-radiobutton">
        <RadioButton inputId="blockType2" name="blockType" :value="false" @change="formData.is_grid = false" v-model="formData.is_list" />
        <label for="blockType2">Контент</label>
      </div>
    </div>
    <div class="p-field" v-if="formData.is_list">
      <label>Отображение</label>
      <div class="field-radiobutton">
        <RadioButton inputId="listType1" name="listType" :value="false" v-model="formData.is_grid" />
        <label for="listType1">Список</label>
      </div>
      <div class="field-radiobutton">
        <RadioButton inputId="listType2" name="listType" :value="true" v-model="formData.is_grid" />
        <label for="listType2">Плитка</label>
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger p-mr-2" @click="hideDialog"/>
      <Button v-if="selectedBlock" :label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success" @click="save" />
      <Button v-if="!selectedBlock" :label="$t('common.add')" icon="pi pi-check" class="p-button p-component p-button-success" @click="addBlock" />
    </template>
  </Dialog>
</template>

<script>
import {onMounted, ref, reactive, toRefs} from "vue";
import {EnuWebService} from "@/service/enu.web.service";
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

    const navigateToView = (data) => {
      router.push({name: 'BlockView', params: {id: data.block_id}})
    };

    const getBlockList = () => {
      loading.value = true;
      enuService.getBlockList().then(res => {
        if (res.data) {
          blockList.value = res.data
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

    onMounted(() => {
      getBlockList();
    });

    return {
      blockList, isCreateModal, formData,
      loading, selectedBlock, submitted, options,
      navigateToView, openDialog, hideDialog, addBlock, save, deleteConfirm, openEdit
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
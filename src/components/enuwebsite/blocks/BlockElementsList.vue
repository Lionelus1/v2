<template>
  <ConfirmPopup group="deleteResult"></ConfirmPopup>
  <div class="card">
    <Button :label="$t('web.createElement')" @click="openDialog"/>
  </div>
  <div class="card">
    <DataTable  @rowReorder="onRowReorderBlock" :lazy="true" :value="blockElements" dataKey="id" :rowHover="true" :loading="loading"
               responsiveLayout="scroll">
      <template #empty>{{ $t("common.noData") }}</template>
      <template #loading>{{ $t("common.loading") }}</template>
      <Column :rowReorder="true" headerStyle="width: 3rem" :reorderableColumn="false"/>
      <Column field="title" :header="$t('common.nameIn')">
        <template #body="{ data }">
          <span>
            {{ $i18n.locale === "kz" ? data.title_kz : $i18n.locale === "ru" ? data.title_ru : data.title_en }}
          </span>
        </template>
      </Column>
      <Column class="text-right">
        <template #body="{ data }">
          <div class="grid">
            <Button class="p-button-text p-button-warning p-1 mr-2" @click="openEdit(data)">
              <i class="fa-solid fa-pencil fa-xl"></i>
            </Button>
            <Button class="p-button-text p-button-danger p-1 mr-2"  @click="confirmRemove(data)">
              <i class="fa-solid fa-trash-can fa-xl"></i>
            </Button>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>

  <Dialog v-model:visible="isCreateModal" :style="{ width: '1000px' }" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
          :header="formData && formData.title_kz ? $t('web.editElement') : $t('web.createElement')" :modal="true"
          class="p-fluid" @hide="hideDialog">

    <TabView>
      <TabPanel header="Қазақша">
        <div class="field">
          <label>{{ $t('common.nameInQazaq') }}</label>
          <InputText type="text" v-model="formData.title_kz"/>
          <small class="p-error" v-if="!formData.title_kz && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label>{{ $t("common.contentInQazaq") }}</label>
          <OptionalMessage :message="$t('web.optionalField')"/>
          <TinyEditor v-model="formData.content_kz" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
        </div>
      </TabPanel>
      <TabPanel header="Русский">
        <div class="field">
          <label>{{ $t('common.nameInRussian') }}</label>
          <InputText type="text" v-model="formData.title_ru"/>
          <small class="p-error" v-if="!formData.title_ru && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label for="ru-content">{{ $t("common.contentInRussian") }}</label>
          <OptionalMessage :message="$t('web.optionalField')"/>
          <TinyEditor v-model="formData.content_ru" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>

        </div>
      </TabPanel>
      <TabPanel header="English">
        <div class="field">
          <label>{{ $t('common.nameInEnglish') }}</label>
          <InputText type="text" v-model="formData.title_en"/>
          <small class="p-error" v-if="!formData.title_en && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label>{{ $t("common.contentInEnglish") }}</label>
          <OptionalMessage :message="$t('web.optionalField')"/>
          <TinyEditor v-model="formData.content_en" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
        </div>
      </TabPanel>
    </TabView>

    <div class="field">
      <Fieldset :legend="$t('workPlan.attachments')" :toggleable="true" v-if="formData && formData.files" collapsed>
        <div ref="content" class="p-fileupload-content">
          <div class="p-fileupload-files">
            <div class="p-fileupload-row" v-for="(item, index) of formData.files" :key="index">
              <span class="mr-3" style="cursor: pointer;" @click="downloadFile(item)">
                <i class="fa-solid fa-file-arrow-down text-green-500"></i>
              </span>
              <span @click="downloadFile(item)" style="cursor: pointer;">
                {{ item.file.filename ? item.file.filename : item.file.filepath }}
              </span>
              <span class="ml-2">
                <Button icon="pi pi-copy" class="p-button-rounded p-button-text"
                        v-clipboard:copy="copyToClipboard(item.file)" v-clipboard:success="onCopy"/>
              </span>
              <span v-if="item.id">
                <Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="deleteFileConfirm($event, item, index)"/>
              </span>
            </div>
          </div>
        </div>
      </Fieldset>
    </div>

    <div class="field">
      <label>{{ $t('common.link') }}</label>
      <OptionalMessage :message="$t('web.optionalField')"/>
      <InputText type="text" v-model="formData.block_list_link"/>
      <small class="p-error" v-if="!formData.block_list_link && submitted"></small>
    </div>
    <div class="card">
      <div class="card-title">{{ $t('common.image') }}</div>
      <div class="field">
        <div class="post-select-image-container" v-if="!(formData.main_image_file && formData.main_image_file.url || formData.imageUrl)&&!formData.block_list_image">
          <div class="btn-select-image">
            <div class="btn-select-image-inner">
              <i class="fa-regular fa-image"></i>
              <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadFile($event)"
                          :auto="true" v-bind:chooseLabel="$t('common.choose')" accept="image/*"
                          class="p-button-outlined" />
            </div>
          </div>
        </div>

        <small v-show="!formData.image_id && submitted" class="p-error">
          {{ $t("smartenu.image1Invalid") }}
        </small>
        <div class="relative w-fit" v-if="formData.block_list_image">
          <div class="svg_block" style="width: 100px;padding:10px;" v-html="formData.block_list_image">
          </div>
          <span class="btn-remove-image p-button p-button-danger p-button-sm" @click="removeMainImageFile(event)">
              <i class="fa-solid fa-xmark"></i>
            </span>
        </div>
        <div v-if="formData.main_image_file && formData.main_image_file.url" class="news-image-container mt-2">
          <img :src="!formData.block_list_image && formData.main_image_file.url"/>
          <span class="btn-remove-image p-button p-button-danger p-button-sm" @click="removeMainImageFile(formData.main_image_file)">
              <i class="fa-solid fa-xmark"></i>
            </span>
        </div>
        <div v-if="formData.imageUrl" class="news-image-container mt-2">
          <img :src="formData.imageUrl" />
          <span class="btn-remove-image p-button p-button-danger p-button-sm" @click="removeMainImageFile(formData.imageUrl)">
              <i class="fa-solid fa-xmark"></i>
            </span>
        </div>
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger mr-2"
              @click="hideDialog"/>
      <Button v-if="!selectedData" :label="$t('common.add')" icon="pi pi-check"
              class="p-button p-component p-button-success" @click="add"/>
      <Button v-if="selectedData" :label="$t('common.save')" icon="pi pi-check"
              class="p-button p-component p-button-success" @click="edit"/>
    </template>
  </Dialog>
</template>

<script>
import {onMounted, ref} from "vue";
import {EnuWebService} from "@/service/enu.web.service";
import {useRoute} from "vue-router";
import {useConfirm} from "primevue/useconfirm";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import OptionalMessage from "@/components/enuwebsite/OptionalMessage";
import TinyEditor from "@/components/TinyEditor.vue";
import {downloadRoute, fileRoute, getHeader, smartEnuApi} from "@/config/config";
import {useStore} from "vuex";
import {FileService} from "@/service/file.service";

export default {
  name: "BlockElementsList",
  components: {TinyEditor, OptionalMessage},
  setup() {
    const route = useRoute()
    const confirm = useConfirm()
    const i18n = useI18n()
    const toast = useToast()
    let loading = ref(false)
    let submitted = ref(false)
    let isCreateModal = ref(false)
    let blockElements = ref([])
    const enuService = new EnuWebService()
    const fileService = new FileService()
    const blockId = route.params.id
    let formData = ref({})
    let selectedData = ref(null)
    const fileList = ref([])
    const store = useStore()

    function getBlockElements() {
      loading.value = true
      enuService.getBlockListByBlockId(blockId).then(res => {
        blockElements.value = res.data
        blockElements.value.map(e => {
          const fileUrl = e.main_image_file ? e.main_image_file.filepath : null
          e.main_image_file ? e.imageUrl = smartEnuApi + fileRoute + fileUrl: null
        });
        loading.value = false;
      }).catch(error => {
        loading.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const hideDialog = () => {
      isCreateModal.value = false
      formData.value = {}
    }

    const openDialog = () => {
      formData.value = {}
      isCreateModal.value = true
    }

    const add = () => {
      submitted.value = true;

      if (!isValid()) return;
      formData.value.block_id = parseInt(blockId);
      enuService.addBlockContentListElement(formData.value).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        submitted.value = false;
        isCreateModal.value = false;
        getBlockElements();
      }).catch(error => {
        submitted.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const openEdit = (data) => {
      formData.value = data;
      selectedData.value = data;
      selectedData.value.content_kz = data.content_kz
      isCreateModal.value = true;
    }

    const edit = () => {
      submitted.value = true;
      if (!isValid()) return;

      enuService.editBlockListElement(formData.value).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        } else {
          toast.add({severity: "error", summary: i18n.t('common.message.title.saveError'), life: 3000});
        }
        submitted.value = false;
        selectedData.value = null;
        isCreateModal.value = false;
        getBlockElements()
      }).catch(error => {
        submitted.value = false;
        selectedData.value = null;
        isCreateModal.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      })
    }

    const remove = (data) => {
      enuService.deleteBlockListElement(data.block_list_id).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
          getBlockElements()
        }
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }
    const removeMainImageFile = (node) => {
      if (node && node.url) {
        formData.value.main_image_file.url = null
      } else {
        formData.value.imageUrl = null
        formData.value.block_list_image = null
      }
    }

    const confirmRemove = (data) => {
      confirm.require({
        message: i18n.t('common.doYouWantDelete'),
        header: i18n.t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          remove(data)
        },
      });
    }

    const getBlockListFiles = () => {
      enuService.getBlockListFiles(formData.value.block_list_id).then(res => {
        formData.value.files = res.data;
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const copyToClipboard = (file) => {
      return smartEnuApi + downloadRoute + file.uuid;
    }

    const onCopy = () => {
      toast.add({severity: 'success', summary: i18n.t('ncasigner.successCopy'), life: 3000});
    }

    const downloadFile = (item) => {
      let url = `${smartEnuApi + downloadRoute + item.file.uuid}`
      fetch(url, {
        method: 'GET',
        headers: getHeader()
      }).then(response => response.blob()).then(blob => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = item.file.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          store.dispatch("logLout");
        } else {
          toast.add({severity: "error", summary: error, life: 3000});
        }
      });
    }

    const deleteFileConfirm = (event, item, index) => {
      confirm.require({
        target: event.currentTarget,
        message: i18n.t('common.confirmation'),
        header: i18n.t('common.confirm'),
        group: 'deleteResult',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          if (item.id) {
            deleteFile(item.id);
          } else {
            formData.value.files.splice(index, 1);
          }
        }
      });
    }

    const deleteFile = (id) => {
      enuService.deleteBlockListFile(id).then(res => {
        if (res.data.is_success) {
          getBlockListFiles();
          toast.add({severity: 'success', detail: i18n.t('common.done'), life: 3000});
        }
      }).catch((error) => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }
    const uploadFile = (event) => {
      if (event.files[0] && event.files[0].name.endsWith('.svg')){
        const file = event.files[0]
        fetch(file.objectURL)
            .then(response => response.text())
            .then(text => {
              formData.value.block_list_image = text;
            });
      }else {
        const fd = new FormData()
        fd.append("files[]", event.files[0])
        fileService.uploadFile(fd).then(res => {
          if (res.data) {
            formData.value.main_image_file = res.data[0];
            formData.value.main_image_file.url = smartEnuApi + fileRoute + formData.value.main_image_file.filepath
            formData.value.image_id = formData.value.main_image_file.id
          }
        }).catch(error => {
          console.log(error)
          toast.add({severity: "error", summary: error, life: 3000});
        })
      }
    }

    const onAfterUpload = (file) => {
      fileList.value.push(file);
      if (formData.value.files && formData.value.files.length !== 0) {
        formData.value.files.push({file_id: file.id, file: file})
      } else {
        formData.value.files = [];
        formData.value.files.push({file_id: file.id, file: file})
      }
    }

    const isValid = () => {
      let errors = [];
      if (!formData.value.title_kz)
        errors.push(1);
      if (!formData.value.title_ru)
        errors.push(1);
      if (!formData.value.title_en)
        errors.push(1);

      return errors.length === 0
    };

    const onRowReorderBlock = (event) => {
      console.log(event)
      /*let data = {
        drag_id: blockElements.value[event.dragIndex].id,
        drop_id: blockElements.value[event.dropIndex].id
      }
      enuService.swapBlockListPositions(data).then(res => {
        if (res.data && res.data.is_success) {
          getBlockElements()
        } else {
          toast.add({severity: "error", summary: i18n.t('common.error'), life: 3000});
        }
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });*/
    }

    onMounted(() => {
      getBlockElements()
    });

    return {
      loading, blockElements, isCreateModal, formData, selectedData, hideDialog, openDialog,
      submitted, add, edit, confirmRemove, uploadFile, openEdit, onAfterUpload,
      onCopy, copyToClipboard, deleteFileConfirm, downloadFile, removeMainImageFile, onRowReorderBlock
    }
  }
}
</script>

<style scoped lang="scss">
.p-fileupload-row {
  display: flex;
  align-items: center;
}

.post-select-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  max-width: 280px;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 2px;
}

.btn-select-image {
  position: relative;
  display: block;
  overflow: hidden;
  text-align: center;
  background: #f8f9fb;
  border: 2px dashed #e4e5e7;
  border-radius: 3px;
  cursor: pointer;
}

.post-select-image-container .btn-select-image {
  width: 100%;
  height: 200px;
}

.btn-select-image .btn-select-image-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.btn-select-image svg {
  display: block;
  font-size: 48px;
  line-height: 48px;
  color: #dadbdd;
  margin-bottom: 15px;
}

.news-image-container {
  position: relative;
  width: 100%;
  max-width: 280px;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 2px;
}

.news-image-container img {
  display: block;
  height: auto;
  width: 280px;
  min-width: 100%;
}

.btn-remove-image {
  width: fit-content;
  font-size: 12px;
  position: absolute;
  right: 0;
  top: 0;
  color: #fff;
  cursor: pointer;
}
.svg_block{
  svg{
    width: 100px!important;
  }
}
</style>

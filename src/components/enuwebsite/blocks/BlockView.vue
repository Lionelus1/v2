<template>
  <ConfirmPopup group="deleteResult"></ConfirmPopup>
  <div class="col-12">
    <TitleBlock :title="$t('web.blocks') + ' | ' + ($i18n.locale === 'kz' ? block.title_kz : $i18n.locale === 'ru' ? block.title_ru : block.title_en)"
                :showBackButton="true"/>
    <div class="card" v-if="block && !block.is_list">
      <TabView class="p-fluid" v-if="formData">
        <TabPanel header="Қазақша">
          <div class="field mt-3">
            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
            <InputText v-model="formData.title_kz" rows="3" :class="{ 'p-invalid': !formData.title_kz && submitted }"/>
            <small v-show="!formData.title_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
          </div>
          <div class="field">
            <label>{{ $t("common.contentInQazaq") }}</label>
            <!--            <RichEditor ref="kztext" v-model="content.content_kz" editorStyle="height: 320px"></RichEditor>-->
            <TinyEditor v-model="formData.content_kz" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
            <small v-show="!formData.content_kz && submitted" class="p-error">
              {{ $t("smartenu.contentKzInvalid") }}
            </small>
          </div>
        </TabPanel>
        <TabPanel header="Русский">
          <div class="field mt-3" style="margin-bottom: 1.5rem">
            <label>{{ $t("common.nameInRussian") }}</label>
            <InputText v-model="formData.title_ru" rows="3" :class="{ 'p-invalid': !formData.title_ru && submitted }"/>
            <small v-show="!formData.title_ru && submitted" class="p-error">
              {{ $t("smartenu.titleRuInvalid") }}
            </small>
          </div>
          <div class="field">
            <label for="ru-content">{{ $t("common.contentInRussian") }}</label>
            <!--            <RichEditor id="ru-content" v-model="formData.content_ru" editorStyle="height: 320px"/>-->
            <TinyEditor v-model="formData.content_ru" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
            <small v-show="!formData.content_ru && submitted" class="p-error">
              {{ $t("smartenu.contentRuInvalid") }}
            </small>
          </div>
        </TabPanel>
        <TabPanel header="English">
          <div class="field mt-3" style="margin-bottom: 1.5rem">
            <label>{{ $t("common.nameInEnglish") }}</label>
            <InputText v-model="formData.title_en" rows="3" :class="{ 'p-invalid': !formData.title_en && submitted }"/>
            <small v-show="!formData.title_en && submitted" class="p-error">
              {{ $t("smartenu.titleEnInvalid") }}
            </small>
          </div>
          <div class="field">
            <label>{{ $t("common.contentInEnglish") }}</label>
            <!--            <RichEditor v-model="formData.content_en" editorStyle="height: 320px"/>-->
            <TinyEditor v-model="formData.content_en" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
            <small v-show="!formData.content_en && submitted" class="p-error">
              {{ $t("smartenu.contentEnInvalid") }}
            </small>
          </div>
        </TabPanel>
      </TabView>

      <div class="field" v-if="formData && formData.files">
        <label>{{ $t('workPlan.attachments') }}</label>
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
      </div>

      <Button :label="$t('common.save')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2" @click="saveBlocContent"/>
    </div>
    <BlockElementsList v-if="block.is_list"/>
  </div>
</template>

<script>
import {onMounted, ref} from "vue";
import {EnuWebService} from "@/service/enu.web.service";
import BlockElementsList from "@/components/enuwebsite/blocks/BlockElementsList.vue";
import {useRoute} from "vue-router";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import TitleBlock from "@/components/TitleBlock.vue";
import {FileService} from "../../../service/file.service";
import {downloadRoute, fileRoute, getHeader, smartEnuApi} from "../../../config/config";
import {useConfirm} from "primevue/useconfirm";
import {useStore} from "vuex";
import TinyEditor from "../../TinyEditor";

export default {
  name: "BlockView",
  components: {BlockElementsList, TitleBlock, TinyEditor},
  setup() {
    const loading = ref(false), submitted = ref(false)
    const enuService = new EnuWebService()
    const fileService = new FileService()
    const store = useStore()
    const toast = useToast()
    const confirm = useConfirm();
    const i18n = useI18n()
    let block = ref({})
    let elements = ref([])
    let formData = ref(null)
    const route = useRoute()
    const blockId = route.params.id
    const fileList = ref([])

    const getBlockInfo = () => {
      loading.value = true;
      enuService.getBlockById(blockId).then(res => {
        block.value = res.data
        if (block.value.is_list) {
          getBlockElements(block.value.block_id)
        } else {
          getBlockContent(block.value.block_id)
        }
        loading.value = false;
      }).catch(error => {
        loading.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }
    getBlockInfo();

    const getBlockContent = (blockId) => {
      enuService.getBlockContentByBlockId(blockId).then(res => {
        formData.value = res.data
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
      if (!isValid()) return;
      if (formData.value.block_content_id != null) {
        enuService.editBlockContent(formData.value).then(res => {
          if (res.data.is_success) {
            submitted.value = false;
            toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
          }
          getBlockContent(blockId)
        }).catch(error => {
          submitted.value = false;
          toast.add({severity: "error", summary: error, life: 3000});
        });
      } else {
        enuService.addBlockContent(formData.value).then(res => {
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
      if (!formData.value.title_kz)
        errors.push(1);
      if (!formData.value.title_ru)
        errors.push(1);
      if (!formData.value.title_en)
        errors.push(1);
      if (!formData.value.content_kz)
        errors.push(1);
      if (!formData.value.content_ru)
        errors.push(1);
      if (!formData.value.content_en)
        errors.push(1);

      return errors.length === 0
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
      enuService.deleteBlockContentFile(id).then(res => {
        if (res.data.is_success) {
          getBlockContentFiles();
          toast.add({severity: 'success', detail: i18n.t('common.done'), life: 3000});
        }
      }).catch((error) => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const getBlockContentFiles = () => {
      enuService.getBlockContentFiles(formData.value.block_content_id).then(res => {
        formData.value.files = res.data;
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    return {
      loading, block, elements, formData, submitted,
      saveBlocContent, onAfterUpload, copyToClipboard, onCopy, downloadFile, deleteFileConfirm
    }
  }
}
</script>

<style scoped>
.p-fileupload-row {
  display: flex;
  align-items: center;
}
</style>

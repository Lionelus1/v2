<template>
  <div class="template-editor-container">
    <ToolbarMenu :data="menu" />
    <div class="editor-body">
      <div class="rich-text-editor">
        <TinyEditor v-model="templateContent" :height="300" @click="handleEditorClick" />
      </div>
    </div>
    <div class="field">
<!--      <div class="grid">-->
<!--        <div class="col-12 md:col-5">-->
<!--          <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadMainImage($event)"-->
<!--                      :auto="true" v-bind:chooseLabel="$t('smartenu.chooseMainImage')" accept="image/*"/>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div v-if="main_image_file">-->
<!--        <img :src="main_image_file_url" style="width: 50%; height: 50%"/>-->
<!--      </div>-->
<!--      <div v-else>-->
<!--        <img :src="imageUrl" style="width: 50%; height: 50%"/>-->
<!--      </div>-->
    </div>
    <div class="field">
    <div class="grid">
      <div class="col-12 md:col-3">
        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadFile($event)" :auto="true"
                    v-bind:chooseLabel="this.$t('smartenu.chooseAdditionalFile')"/>
      </div>
      <div class="col-12 md:col-5">
        <InlineMessage severity="info" show v-if="additionalFileName">
          {{ this.$t("ncasigner.chosenFile", {fn: additionalFileName}) }}
        </InlineMessage>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import {fileRoute, smartEnuApi} from "@/config/config";
import { useToast } from "primevue/usetoast";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import { FileService } from "@/service/file.service";

const categories = [
  { id: 1, nameen: 'Контрагенты', namekz: 'білім алушы', nameru: 'Контрагенты' },
  { id: 2, nameen: 'personal', namekz: 'білім алушы', nameru: 'Сотрудники' },
  { id: 3, nameen: 'individual_entrepreneur', namekz: 'білім алушы', nameru: 'Частные лица' },
  { id: 4, nameen: 'student', namekz: 'білім алушы', nameru: 'Обучающиеся' },
  { id: 6, nameen: 'others', namekz: 'білім алушы', nameru: 'Другое' },
];

export default {
  components: { ToolbarMenu },
  data() {
    return {
      additionalFileId: 0,
      templateContent: '',
      selectedCategories: [],
      emails: [],
      description: '',
      fileService: new FileService(),
      toast: new useToast(),
      isDefaultTextRemoved: false,
      savedRange: null,
      additionalFileName: '',
      additional_file_path: '',
      main_image_file: '',
      main_image_file_url: '',
      main_image_id: 0,
    };
  },
  methods: {
    uploadFile(event) {
      const fd = new FormData()
      fd.append("files[]", event.files[0])
      this.fileService.uploadFile(fd).then(res => {
        if (res.data) {
          const file = res.data[0]
          this.additionalFileId = file.id;
          this.additionalFileName = file.filename;
          this.additional_file_path = smartEnuApi + fileRoute + file.filepath;
        }
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      })
    },
    sendMailing(statusID) {
      this.toast.add({
        severity: "success",
        detail: this.$t('common.dataSavedSuccessfully'),
        life: 3000,
      });

      const roles = this.selectedCategories.map(id => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.nameen : null;
      }).filter(role => role !== null);

      const processedEmails = this.emails.map(email => email.trim());

      const mailingData = {
        mailingID: null,
        filters: {
          roles: roles,
        },
        userID: null,
        docTemplateID: parseInt(this.$route.params.templateId, 10),
        description: this.templateContent,
        emails: processedEmails,
        filePath: null,
        statusID: statusID,
        mainImageID: this.main_image_id,
        AdditionalFileID: this.additionalFileId,
        MainImagePath: this.main_image_file_url,
        AdditionalFilePath: this.additional_file_path,
      };

      fetch(`${smartEnuApi}/mailing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailingData),
      })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
          })
          .then(text => {
            try {
              const data = JSON.parse(text);
              console.log('Success:', data);
              this.$router.push('/mailing');
            } catch (error) {
              console.error('Error parsing JSON:', error);
              this.toast.add({
                severity: "error",
                detail: this.$t('common.errorParsingResponse'),
                life: 3000,
              });
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            this.toast.add({
              severity: "error",
              detail: this.$t('common.requestFailed'),
              life: 3000,
            });
          });
    },
    handleEditorClick() {
      if (!this.isDefaultTextRemoved) {
        // Сохраняем текущую позицию курсора
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          this.savedRange = selection.getRangeAt(0);
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(this.templateContent, 'text/html');
        const mainContent = doc.querySelector('p:nth-of-type(2)'); // выбираем второй параграф как основной текст
        if (mainContent) {
          mainContent.innerHTML = '';
          this.templateContent = doc.documentElement.outerHTML;

          if (this.savedRange) {
            const range = document.createRange();
            range.setStart(mainContent, 0);
            range.setEnd(mainContent, 0);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
        this.isDefaultTextRemoved = true;
      }
    }
  },
  mounted() {
    this.selectedCategories = JSON.parse(this.$route.params.selectedCategories || '[]');
    this.emails = JSON.parse(this.$route.params.emails || '[]');

    const templateId = parseInt(this.$route.params.templateId, 10);
    fetch(`${smartEnuApi}/getMailingTemplateByID`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateID: templateId }),
    })
        .then(response => response.json())
        .then(data => {
          if (data.template_content_ru && data.template_content_ru.Valid) {
            this.templateContent = data.template_content_ru.String;
          }
        })
        .catch(error => {
          console.error('Error fetching template:', error);
        });
  },
  computed: {
    menu() {
      return [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: false,
          command: () => {
            this.sendMailing(1);
          },
        },
        {
          label: this.$t("common.saveToDrafts"),
          icon: "fa-solid fa-download",
          disabled: false,
          command: () => {
            this.sendMailing(2);
          },
        },
        {
          label: this.$t("common.sendMailing"),
          icon: "pi pi-fw pi-send",
          disabled: false,
          command: () => {
            this.sendMailing(3);
          },
        },
      ];
    },
  },
};
</script>

<style>
.template-editor-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-group {
  display: flex;
  gap: 10px;
}

.editor-body {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

.rich-text-editor {
  flex: 1;
}
</style>

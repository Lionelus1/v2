<template>
  <div class="template-editor-container">
    <ToolbarMenu :data="menu"/>
    <div class="editor-body">
      <div class="rich-text-editor">
        <TinyEditor v-model="templateContent" :height="300" />
      </div>
    </div>
  </div>
</template>

<script>
import {fileRoute, smartEnuApi} from "@/config/config";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import {FileService} from "@/service/file.service";

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
      templateContent: '',
      selectedCategories: [],
      emails: [],
      description: '',
      fileService: new FileService(),
    };
  },
  methods: {
    uploadMainImage(event) {
      const fd = new FormData()
      fd.append("files[]", event.files[0])
      this.fileService.uploadFile(fd).then(res => {
        if (res.data) {
          console.log(res)
        }
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      })
    },
    saveDraft() {
      // Implement save draft logic
      console.log('Save draft');
    },
    saveTemplate() {
      // Implement save template logic
      console.log('Save template');
    },
    sendMailing(statusID) {
      const roles = this.selectedCategories.map(id => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.nameen : null;
      }).filter(role => role !== null);

      const processedEmails = this.emails.map(email => email.trim());

      const mailingData = {
        filters: {
          roles: roles,
        },
        userID: null,
        docTemplateID: parseInt(this.$route.params.templateId, 10),
        description: this.templateContent,
        emails: processedEmails,
        filePath: null,
        statusID: statusID
      };

      fetch(`${smartEnuApi}/mailing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailingData),
      })
          .then(response => response.json())
          .then(data => {
            console.log('Success:', data);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
    },
    mapCategoryIdsToObjects(ids) {
      return ids.map(id => categories.find(category => category.id === id));
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

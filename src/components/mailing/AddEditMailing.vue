<template>
  <Dialog v-model:visible="editVisible" :closable="true" :style="{ width: '1200px' }"
          :breakpoints="{'960px': '75vw', '640px': '90vw'}" @close="hideDialog" @hide="hideDialog" :close-on-escape="true"
          :header="$t('smartenu.mailingCreateTitle')" :modal="true" class="p-fluid">
    <div>
      <div class="card p-fluid">
        <div class="flex align-items-center">
          <h4 class="m-0">{{ $t("smartenu.category") }}</h4>
        </div>
        <div class="flex flex-wrap gap-3 pt-4">
          <div v-for="category in categories" :key="category.id" class="flex align-items-center pr-3 pb-1">
            <Checkbox class="checkbox-container" v-model="selectedCategories" :id="'category-' + category.id"
                      :value="category.id" @change="handleCategoryChange(category.id)"/>
            <label class="ml-2 label-large" :for="'category-' + category.id">{{ category['name' + $i18n.locale] }}</label>
          </div>
        </div>
        <div v-if="showOtherEmailField" class="field mt-3">
          <FloatLabel>
            <Chips v-model="emails" placeholder="Введите почту"/>
          </FloatLabel>
        </div>
        <div class="template-selection-container">
          <div class="flex align-items-center">
            <h4 class="pb-2">{{ $t("smartenu.templateBuilder") }}</h4>
          </div>
          <div class="templates-grid">
            <div
                v-for="template in templates"
                :key="template.id"
                :class="['template-card', { selected: template.id === selectedTemplate }]"
                @click="selectTemplate(template.id)"
            >
              <h4>{{ template.template_name }}</h4>
              <div v-html="template.template_content_ru.String"></div>
            </div>
          </div>
        </div>
        <div class="flex justify-content-end pt-2">
          <Button class="p-button p-component w-max" label="Submit" @click="nextPage">Далее</Button>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import {getHeader, smartEnuApi} from "@/config/config";
import 'primeicons/primeicons.css'

export default {
  name: "AddEditMailing",
  props: ['isVisible'],
  data() {
    return {
      editVisible: this.isVisible,
      mailingData: null,
      submitted: false,
      emails: [],
      selectedTemplate: null,
      templates: [],
      showOtherEmailField: false,
      categories: [
        {id: 1, nameen: 'Контрагенты', namekz: 'білім алушы', nameru: 'Контрагенты'},
        {id: 2, nameen: 'Сотрудники', namekz: 'білім алушы', nameru: 'Сотрудники'},
        {id: 3, nameen: 'Частные лица', namekz: 'білім алушы', nameru: 'Частные лица'},
        {id: 4, nameen: 'Обучающиеся', namekz: 'білім алушы', nameru: 'Обучающиеся'},
        {id: 5, nameen: 'Выпускники', namekz: 'білім алушы', nameru: 'Выпускники'},
        {id: 6, nameen: 'Другое', namekz: 'білім алушы', nameru: 'Другое'},
      ],
      selectedCategories: [],
    };
  },
  methods: {
    async fetchTemplates() {
      try {
        const response = await fetch(`${smartEnuApi}/mailing/getAllMailingTemplates`, {
          method: 'GET',
          headers: getHeader(),
        });
        const data = await response.json();
        this.templates = data;
        console.log(this.templates);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    },
    handleCategoryChange(categoryId) {
      if (categoryId === 6) {
        this.selectedCategories = [6];
        this.showOtherEmailField = true;
      } else {
        this.selectedCategories = this.selectedCategories.filter(id => id !== 6);
        this.showOtherEmailField = false;
      }
    },
    selectTemplate(templateId) {
      this.selectedTemplate = templateId;
    },
    nextPage() {
      if (this.selectedTemplate) {
        this.$router.push({
          name: 'TemplateEditor2',
          params: {
            templateId: this.selectedTemplate,
            selectedCategories: JSON.stringify(this.selectedCategories),
            emails: JSON.stringify(this.emails),
          },
        });
      } else {
        alert('Please select a template');
      }
    },
    hideDialog() {
      this.emitter.emit('addEditMailingDialogHide', true);
    },
  },
  mounted() {
    this.fetchTemplates();
  }
};
</script>

<style>
.category-option input[type="checkbox"] {
  margin-right: 5px;
}

.template-selection-container {
  margin-top: 20px;
}

.templates-grid {
  display: flex;
  gap: 20px;
}

.template-card {
  border: 1px solid #ccc;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.template-card:hover {
  transform: scale(1.05);
}

.template-card.selected {
  border-color: #007bff;
  background-color: #e9f7fe;
}

.checkbox-container {
  width: 20px;
  height: 20px;
}

.checkbox-container input[type="checkbox"] {
  width: 100%;
  height: 100%;
  transform: scale(1.5);
  -webkit-transform: scale(1.5);
}

.label-large {
  font-size: 1.2rem;
  margin-left: 0.5rem;
}
</style>

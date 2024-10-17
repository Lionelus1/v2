<template>
  <div class="grid-container">
    <div
        class="card"
        v-for="folder in folders"
        :key="folder.key"
        @dblclick="openFolder(folder)"
        :class="{ selected: isSelected(folder) }"
        v-tooltip="folder.newParams?.FileDescription?.value || $t('common.noDescription')"
        data-pr-position="top"
    >
      <div class="card-icon">
        <i :class="getFileIconClass(folder.name)"></i>
      </div>
      <div class="card-name">
        {{ folder['name' + $i18n.locale] }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GridComponent',
  props: {
    folders: {
      type: Array,
      required: true
    }
  },
  methods: {
    /**
     * Определяет класс иконки на основе расширения файла.
     * @param {String} fileName - Имя файла.
     * @returns {String} - Класс иконки.
     */
    getFileIconClass(fileName) {
      if (!fileName || typeof fileName !== 'string') {
        return 'fa-solid fa-folder';
      }

      const extension = fileName.split('.').pop().toLowerCase();

      switch (extension) {
        case 'pdf':
          return 'fa-regular fa-file-pdf pdf-icon';
        case 'doc':
        case 'docx':
          return 'fa-solid fa-file-word word-icon';
        case 'xls':
        case 'xlsx':
          return 'fa-solid fa-file-excel excel-icon';
        default:
          return 'fa-solid fa-folder'; // Иконка по умолчанию для папки
      }
    },
    /**
     * Выбирает папку и эмитит событие в родительский компонент.
     * @param {Object} folder - Выбранная папка.
     */
    openFolder(folder) {
      console.log("folder: ", folder)
      this.$emit('open-folder', folder);
    },
    /**
     * Проверяет, является ли папка выбранной.
     * @param {Object} folder - Папка для проверки.
     * @returns {Boolean} - Результат проверки.
     */
    isSelected(folder) {
      return this.$parent.selectedNodeKey === folder.key;
    }
  }
};
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.3s, border-color 0.3s;
  position: relative;
}

.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.card.selected {
  border-color: #007ad9;
  box-shadow: 0 0 10px rgba(0, 122, 217, 0.5);
}

.card-icon {
  font-size: 2em;
  margin-bottom: 8px;
  color: #007ad9;
}

.card-name {
  font-size: 1em;
  font-weight: bold;
  word-wrap: break-word;
}

/* Кастомные стили для иконок */
.pdf-icon {
  color: red;
}

.word-icon {
  color: #2b579a;
}

.excel-icon {
  color: #217346;
}
</style>

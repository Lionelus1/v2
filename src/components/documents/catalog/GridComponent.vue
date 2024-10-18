<template>
  <div class="grid-container">
    <div
        class="card"
        v-for="folder in folders"
        :key="folder.key"
        @click="openFolder(folder)"
        :class="{ selected: isSelected(folder) }"
        v-tooltip="folder.newParams?.FileDescription?.value || folder['name' + $i18n.locale]"
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
    getFileIconClass(fileName) {

      if (!fileName || typeof fileName !== 'string') {
        return 'fa-solid fa-folder';
      }

      const extension = fileName.split('.').pop().toLowerCase();

      switch (extension) {
        case 'pdf':
          return 'fa-regular fa-file-pdf pdf-icon';
        case 'doc':
          return 'fa-solid fa-file-word word-icon';
        case 'docx':
          return 'fa-solid fa-file-word word-icon';
        case 'xls':
          return 'fa-solid fa-file-excel excel-icon';
        case 'xlsx':
          return 'fa-solid fa-file-excel excel-icon';
        case 'zip':
          return 'fa-solid fa-file-zipper zip-icon';
        default:
          return 'fa-solid fa-file';
      }
    },
    openFolder(folder) {
      this.$emit('open-folder', folder);
    },
    isSelected(folder) {
      return this.$parent.selectedNodeKey === folder.key;
    }
  }
};
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* Improved min size */
  gap: 20px; /* Increased gap for breathing room */
  padding: 10px; /* Added padding around the grid */
}

.card {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px; /* Softer corners */
  padding: 20px 10px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card:hover {
  transform: translateY(-5px); /* Subtle lift effect */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); /* Softer shadow */
}

.card.selected {
  border-color: #007ad9;
  box-shadow: 0 0 12px rgba(0, 122, 217, 0.5);
}

.card-icon {
  font-size: 2.5em; /* Slightly bigger icon */
  margin-bottom: 12px; /* Increased space between icon and name */
}

.card-name {
  font-size: 1.1em;
  font-weight: 600;
  color: #333;
  word-wrap: break-word;
  max-width: 100%;
  line-height: 1.4;
  white-space: nowrap; /* Текст будет отображаться в одну строку */
  overflow: hidden;    /* Скрываем текст, который не помещается */
  text-overflow: ellipsis; /* Добавляем троеточие для длинного текста */
}

/* Custom icon colors */
.pdf-icon {
  color: #e74c3c; /* More vibrant red */
}

.word-icon {
  color: #2b579a;
}

.excel-icon {
  color: #27ae60; /* Slightly more vivid green */
}

/* Responsive design */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); /* Adjusted for smaller screens */
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr; /* Single column layout for very small screens */
  }
}

.zip-icon {
  color: #805b36;
  font-size: 1.4em;
}
</style>

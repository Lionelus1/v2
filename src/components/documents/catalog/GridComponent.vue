<template>
  <div class="grid-container">
    <div
        class="card"
        v-for="folder in folders"
        :key="folder.key"
        @dblclick="openFolder(folder)"
        @click="click(folder)"
        :class="{ selected: folder === selectedNode }"
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
import {findRole} from "@/config/config";

export default {
  name: 'GridComponent',
  props: {
    folders: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      isAdmin: false,
      selectedNode: null,
      tooltip: {
        folder: false,
        file: false,
      },
      selectedCard: null,
    }
  },
  methods: {
    created() {
      this.isAdmin = this.findRole(null, 'main_administrator')
    },
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
    findRole: findRole,
    click(folder) {
      this.selectedCard = folder
      this.selectedNode = folder
      this.$emit('card-selected', folder);
    },
  },
};
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* Flexible grid */
  gap: 20px;
  padding: 10px;
  justify-items: center; /* Center cards in grid */
}

.card {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 12px; /* Softer corners */
  padding: 20px 10px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 180px;
  position: relative;
}

.card:hover {
  transform: translateY(-8px); /* Lift effect */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); /* Elevated shadow */
}

.card.selected {
  border: 2px solid #007ad9; /* More prominent border */
  box-shadow: 0 0 20px rgba(0, 122, 217, 0.5); /* Stronger shadow */
  background: linear-gradient(135deg, #f0f9ff, #e0f7ff); /* Subtle gradient for selected folder */
  transform: scale(1.05); /* Slightly larger when selected */
}

.card-icon {
  font-size: 3em; /* Larger icon */
  margin-bottom: 12px;
}

.card-name {
  font-size: 1.2em;
  font-weight: 600;
  color: #333;
  word-wrap: break-word;
  max-width: 100%;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Custom icon colors */
.pdf-icon {
  color: #e74c3c;
}

.word-icon {
  color: #2b579a;
}

.excel-icon {
  color: #27ae60;
}

.zip-icon {
  color: #805b36;
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

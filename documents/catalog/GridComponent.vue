<template>
  <div>
    <div class="grid-container">
      <div
          class="card"
          v-for="folder in folders"
          :key="folder.key"
          @dblclick="openFolder(folder)"
          @click="selectFolder(folder)"
          :class="{ selected: selectedCard === folder }"
          :title="folder.newParams?.FileDescription?.value || folder['name' + $i18n.locale]"
      >
        <div class="card-icon">
          <i :class="getFileIconClass(folder.name)"></i>
        </div>
        <div class="card-name">
          {{ folder['name' + $i18n.locale] }}
        </div>
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
    },
    folderHistory: {
      type: Array,
      default: () => []
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
        case 'pdf': return 'fa-regular fa-file-pdf pdf-icon';
        case 'doc': case 'docx': return 'fa-solid fa-file-word word-icon';
        case 'xls': case 'xlsx': return 'fa-solid fa-file-excel excel-icon';
        case 'zip': return 'fa-solid fa-file-zipper zip-icon';
        case 'mp4': case 'MP4': return 'fa-solid fa-file-video video-icon';
        case 'pptx': return 'fa-solid fa-file-powerpoint powerpoint-icon';
        default: return 'fa-solid fa-file';
      }
    },
    openFolder(folder) {
      if (folder.nodeType === "folder") {
        this.$emit('open-folder', folder);
      } else if (folder.nodeType === "file") {
        if (this.selectedCard.is_view_only) {
          this.$emit('open-side-bar', folder)
        } else {
          this.$emit('download-file', folder)
        }
      }
    },
    selectFolder(folder) {
      if (this.selectedCard === folder) {
        return;
      }
      this.selectedCard = folder;
      this.$emit('card-selected', folder); // Select folder
    },
    findRole: findRole,
    click(folder) {
      this.selectedCard = folder;
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
  justify-items: center;
  max-height: 100%;
  overflow-y: auto;
}

.card {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  width: 100%; /* Flexible width for responsive sizing */
  max-width: 180px; /* Limit max width */
  padding: 20px 10px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card.selected {
  border: 1px solid #007ad9;
  box-shadow: 0 0 10px rgba(0, 122, 217, 0.3);
  background: linear-gradient(135deg, #f0f9ff, #e0f7ff);
  transform: scale(1.05);
}

.card-icon {
  color: #007be5;
  font-size: 1.6em;
  margin-bottom: 12px;
}

.card-name {
  font-size: 0.9em;
  font-weight: 500;
  color: #333;
  word-wrap: break-word;
  max-width: 100%;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

/* Custom icon colors */
.pdf-icon { color: #e74c3c; }
.word-icon { color: #2b579a; }
.excel-icon { color: #27ae60; }
.zip-icon { color: #805b36; }
.powerpoint-icon { color: #ff6900; }
.video-icon { color: #4c4743; }

/* Responsive design */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr; /* Single column layout for very small screens */
    gap: 10px;
  }
}
</style>
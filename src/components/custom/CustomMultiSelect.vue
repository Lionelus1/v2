<template>
  <div class="custom-multiselect">
    <div class="multiselect-display" @click="toggleDropdown" :class="{ disabled: disabled }">
      <div class="chips-container">
        <span v-for="(label, index) in displayedLabels" :key="index" class="chip">
          {{ label }}
          <span v-if="label != 'Все'" class="chip-clear" @click.stop="removeSelection(index)">X</span>
        </span>

        <span v-if="!modelValue.length" class="placeholder">{{ placeholder }}</span>
      </div>
      <i class="pi" :class="dropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
    </div>

    <div v-if="dropdownOpen" class="multiselect-dropdown">
      <input
          type="text"
          v-model="searchTerm"
          class="search-input"
          placeholder="Поиск..."
          :disabled="disabled"
      />
      <div class="multiselect-option" @click="toggleAll" :class="{ disabled: disabled }">
        <input type="checkbox" :checked="isAllSelected" :disabled="disabled" />
        <label>Все</label>
      </div>
      <div
          v-for="option in filteredOptions"
          :key="option.value"
          class="multiselect-option"
          @click="toggleSelection(option)"
          :class="{ disabled: disabled }"
      >
        <input type="checkbox" :checked="isSelected(option)" :disabled="disabled" />
        <label>{{ option.name }}</label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CustomMultiSelect",
  props: {
    options: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: "Выберите элементы...",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dropdownOpen: false,
      searchTerm: "",
    };
  },
  computed: {
    isAllSelected() {
      return this.modelValue.length === this.options.length;
    },
    displayedLabels() {
      if (this.isAllSelected) {
        return ["Все"];
      }
      return this.modelValue.map((value) => {
        const option = this.options.find((opt) => opt.value === value);
        return option ? option.name : "";
      });
    },
    filteredOptions() {
      if (!this.searchTerm) {
        return this.options;
      }
      return this.options.filter((option) =>
          option.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },
  },
  methods: {
    toggleDropdown() {
      if (this.disabled) return;
      this.dropdownOpen = !this.dropdownOpen;
    },
    closeDropdown() {
      this.dropdownOpen = false;
    },
    handleOutsideClick(event) {
      // Проверяем, произошел ли клик вне компонента
      if (!this.$el.contains(event.target)) {
        this.closeDropdown();
      }
    },
    toggleAll() {
      if (this.disabled) return;
      if (this.isAllSelected) {
        this.$emit("update:modelValue", []);
      } else {
        this.$emit("update:modelValue", this.options.map((opt) => opt.value));
      }
    },
    toggleSelection(option) {
      if (this.disabled) return;
      const index = this.modelValue.indexOf(option.value);
      if (index === -1) {
        this.$emit("update:modelValue", [...this.modelValue, option.value]);
      } else {
        const newValue = [...this.modelValue];
        newValue.splice(index, 1);
        this.$emit("update:modelValue", newValue);
      }
    },
    isSelected(option) {
      return this.modelValue.includes(option.value);
    },
    removeSelection(index) {
      const newValue = [...this.modelValue];
      newValue.splice(index, 1);
      this.$emit("update:modelValue", newValue);
    },
  },
  mounted() {
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  },
};
</script>


<style scoped>
.custom-multiselect {
  position: relative;
  width: 100%;
}

.multiselect-display {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.multiselect-display.disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.chip {
  background-color: #007ad9;
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.chip-clear {
  margin-left: 5px;
  font-size: 14px;
  cursor: pointer;
  color: white;
}

.placeholder {
  color: #aaa;
  font-size: 14px;
}

.multiselect-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.search-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 8px;
}

.multiselect-option {
  padding: 8px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.multiselect-option.disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

.multiselect-option:hover {
  background-color: #f0f0f0;
}
</style>

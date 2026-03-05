<template>
  <div class="filter-bar">
    <div class="filter-group">
      <slot>
        <select v-model="localValue" class="filter-select">
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterBar',
  props: {
    modelValue: { type: String, default: '' },
    options: { 
      type: Array, 
      default: () => [
        { label: '全部', value: '' },
        { label: '选项 1', value: '1' },
        { label: '选项 2', value: '2' }
      ]
    }
  },
  emits: ['update:modelValue'],
  computed: {
    localValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 8px;
  flex: 1;
  min-width: 150px;
}

.filter-group {
  display: flex;
  align-items: center;
  width: 100%;
}

.filter-select {
  padding: clamp(8px, 2vw, 9px) clamp(12px, 3vw, 14px);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: clamp(12px, 2.5vw, 13px);
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
  min-width: 0;
  flex: 1;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-select:hover {
  border-color: var(--text-tertiary);
}

.filter-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

@media (max-width: 768px) {
  .filter-bar {
    width: 100%;
  }
  
  .filter-select {
    max-width: none;
  }
}
</style>

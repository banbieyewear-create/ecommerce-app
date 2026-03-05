<template>
  <div class="search-bar">
    <div class="search-input-wrapper" :class="{ 'focus': isFocus }">
      <span class="search-icon">🔍</span>
      <input 
        type="text" 
        :value="modelValue"
        :placeholder="placeholder"
        class="search-input"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="isFocus = true"
        @blur="isFocus = false"
      />
      <span v-if="modelValue" class="clear-btn" @click="$emit('update:modelValue', '')">✕</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '搜索...' }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isFocus: false
    }
  }
}
</script>

<style scoped>
.search-bar {
  flex: 1;
  min-width: 200px;
  width: 100%;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: clamp(8px, 2vw, 9px) clamp(12px, 3vw, 14px);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.search-input-wrapper.focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.search-icon {
  font-size: clamp(14px, 3vw, 15px);
  opacity: 0.5;
  flex-shrink: 0;
}

.search-input {
  border: none;
  background: none;
  outline: none;
  font-size: clamp(12px, 2.5vw, 13px);
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  font-size: clamp(12px, 3vw, 14px);
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.clear-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

@media (max-width: 480px) {
  .search-bar {
    min-width: 100%;
  }
}
</style>

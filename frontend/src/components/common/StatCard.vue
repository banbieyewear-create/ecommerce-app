<template>
  <div class="stat-card" :style="{ background: cardBg }">
    <div class="stat-icon" v-if="icon" :style="{ background: iconBg }">
      {{ icon }}
    </div>
    <div class="stat-content">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value" :class="valueClass">{{ value }}</div>
      <div class="stat-trend" v-if="trend" :class="trendClass">
        {{ trend > 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    icon: { type: String, default: '' },
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    trend: { type: Number, default: null },
    color: { type: String, default: 'blue' } // blue/green/yellow/red
  },
  computed: {
    cardBg() {
      return 'var(--bg-secondary)'
    },
    iconBg() {
      const colors = {
        blue: 'linear-gradient(135deg, #3b82f6, #6366f1)',
        green: 'linear-gradient(135deg, #10b981, #059669)',
        yellow: 'linear-gradient(135deg, #f59e0b, #d97706)',
        red: 'linear-gradient(135deg, #ef4444, #dc2626)'
      }
      return colors[this.color] || colors.blue
    },
    valueClass() {
      return `text-${this.color}`
    },
    trendClass() {
      return this.trend > 0 ? 'positive' : 'negative'
    }
  }
}
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  padding: clamp(12px, 3vw, 20px);
  display: flex;
  align-items: center;
  gap: clamp(12px, 2.5vw, 16px);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  min-width: 0;
  flex: 1;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: clamp(40px, 10vw, 48px);
  height: clamp(40px, 10vw, 48px);
  min-width: clamp(40px, 10vw, 48px);
  min-height: clamp(40px, 10vw, 48px);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(18px, 4vw, 20px);
  color: white;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.stat-label {
  font-size: clamp(11px, 2.5vw, 13px);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: clamp(20px, 5vw, 24px);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-trend {
  font-size: clamp(10px, 2.5vw, 12px);
  font-weight: 600;
}

.stat-trend.positive {
  color: var(--success-color);
}

.stat-trend.negative {
  color: var(--danger-color);
}

.text-blue { color: var(--primary-color); }
.text-green { color: var(--success-color); }
.text-yellow { color: var(--warning-color); }
.text-red { color: var(--danger-color); }
</style>

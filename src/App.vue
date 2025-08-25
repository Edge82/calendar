<template>
  <div id="app" class="full-h">
    <h1>Тестовое задание</h1>

    <MyCalendar v-model="selectedDate" :locale="currentLanguage"/>
    <div class="language-switcher">
      <button
        @click="currentLanguage = 'ru'"
        :class="{ active: currentLanguage === 'ru' }"
        class="language-btn"
      >
        🇷🇺
      </button>
      <button
        @click="currentLanguage = 'en'"
        :class="{ active: currentLanguage === 'en' }"
        class="language-btn"
      >
        🇺🇸
      </button>
    </div>

    <p>Выбранная дата: {{ selectedDate ? formatDate(selectedDate) : 'Дата не выбрана' }}</p>
  </div>
</template>

<script>
import MyCalendar from './components/MyCalendar.vue'

export default {
  name: 'App',
  components: {
    MyCalendar
  },
  data () {
    return {
      currentLanguage: 'ru',
      selectedDate: null
    }
  },
  methods: {
    formatDate (date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = (d.getMonth() + 1).toString().padStart(2, '0')
      const day = d.getDate().toString().padStart(2, '0')
      return `${year}.${month}.${day}`
    }
  }
}
</script>

<style scoped>
.full-h{
  height: 100vh;
}
.language-switcher {
  display: inline-flex;
  margin-bottom: 20px;
  margin-left: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.language-btn {
  padding: 8px 16px;
  border: none;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.language-btn:hover {
  background: #e9ecef;
}

.language-btn.active {
  background: #007bff;
  color: white;
  font-weight: bold;
}

.language-btn:first-child {
  border-right: 1px solid #ddd;
}
</style>

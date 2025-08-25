<template>
  <div
    v-click-outside="closeCalendar"
    class="calendar-wrapper"
    :class="{ '-active': isCalendarVisible }"
  >
    <div
      v-if="!hideInput"
      class="calendar-input"
      @click="toggleCalendar"
    >
      <input
        ref="input"
        :value="displayValue"
        :readonly="readonly"
        :placeholder="placeholder"
        class="calendar-input__field"
        @focus="onInputFocus"
      />
      <span class="calendar-input__icon" @click.stop="onIconClick">
        {{ displayValue ? '×' : '📅' }}
      </span>
    </div>

    <slot v-else name="trigger" :toggle="toggleCalendar" />

    <div
      v-show="isCalendarVisible"
      ref="calendar"
      class="calendar"
    >
      <div class="calendar__header">
        <button
          v-show="PrevMonth"
          class="calendar__nav-button calendar__nav-button--prev"
          @click="showPrevMonth"
        >
          ‹
        </button>

        <div class="calendar__month-label">
          {{ currentMonthName }} {{ currentYear }}
        </div>

        <button
          v-show="NextMonth"
          class="calendar__nav-button calendar__nav-button--next"
          @click="showNextMonth"
        >
          ›
        </button>
      </div>

      <div class="calendar__weekdays">
        <div
          v-for="day in localizedWeekdays"
          :key="day"
          class="calendar__weekday"
        >
          {{ day }}
        </div>
      </div>

      <div class="calendar__days">
        <div
          v-for="day in calendarDays"
          :key="day.date.getTime()"
          class="calendar__day"
          :class="getDayClasses(day)"
          @click="selectDate(day)"
        >
          {{ day.number }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ClickOutside from '../directives/ClickOutside'
import DateTimes from '../utils/DateTimes'

const LOCALES = {
  en: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  },
  ru: {
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  }
}

export default {
  name: 'MyCalendar',
  directives: {
    'click-outside': ClickOutside
  },
  props: {
    value: {
      type: [Date, String],
      default: null
    },
    locale: {
      type: String,
      default: 'ru',
      validator: value => Object.keys(LOCALES).includes(value)
    },
    minDate: {
      type: [Date, String],
      default: null
    },
    maxDate: {
      type: [Date, String],
      default: null
    },
    hideInput: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Выберите дату'
    }
  },
  emits: ['input', 'update:value', 'date-select'],
  data () {
    return {
      isCalendarVisible: false,
      currentDate: new Date(),
      selectedDate: null,
      internalValue: null
    }
  },
  computed: {
    displayValue () {
      if (!this.internalValue) return ''
      return DateTimes.getFormattedDate(this.internalValue, '.')
    },
    localizedMonths () {
      return LOCALES[this.locale].months
    },
    localizedWeekdays () {
      return LOCALES[this.locale].weekdays
    },
    currentMonth () {
      return this.currentDate.getMonth()
    },
    currentYear () {
      return this.currentDate.getFullYear()
    },
    currentMonthName () {
      return this.localizedMonths[this.currentMonth]
    },
    calendarDays () {
      const year = this.currentYear
      const month = this.currentMonth

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      const firstDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay()

      const prevMonthLastDay = new Date(year, month, 0).getDate()

      const days = []

      for (let i = firstDayOfWeek - 2; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i)
        days.push({
          date,
          number: prevMonthLastDay - i,
          isCurrentMonth: false,
          isSelectable: this.isDateSelectable(date)
        })
      }

      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i)
        days.push({
          date,
          number: i,
          isCurrentMonth: true,
          isSelectable: this.isDateSelectable(date)
        })
      }

      const totalCells = 42 // 6 недель * 7 дней
      const nextMonthDays = totalCells - days.length

      for (let i = 1; i <= nextMonthDays; i++) {
        const date = new Date(year, month + 1, i)
        days.push({
          date,
          number: i,
          isCurrentMonth: false,
          isSelectable: this.isDateSelectable(date)
        })
      }

      return days
    },
    PrevMonth () {
      if (!this.minDate) return true

      const minDate = new Date(this.minDate)
      const prevMonth = new Date(this.currentYear, this.currentMonth - 1, 1)

      return prevMonth >= new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    },
    NextMonth () {
      if (!this.maxDate) return true

      const maxDate = new Date(this.maxDate)
      const nextMonth = new Date(this.currentYear, this.currentMonth + 1, 1)

      return nextMonth <= new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0)
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (newValue) {
        if (newValue) {
          const date = new Date(newValue)
          if (!isNaN(date.getTime())) {
            this.internalValue = date
            this.selectedDate = date
            this.currentDate = new Date(date.getFullYear(), date.getMonth(), 1)
          }
        } else {
          this.internalValue = null
          this.selectedDate = null
        }
      }
    }
  },
  mounted () {
    if (!this.value) {
      this.currentDate = new Date()
    }
  },
  methods: {
    parseDate (date) {
      if (date instanceof Date) return date
      if (typeof date === 'string') return new Date(date)
      return null
    },

    isDateSelectable (date) {
      const currentDate = new Date(date.setHours(0, 0, 0, 0))

      if (this.minDate) {
        const minDate = new Date(this.minDate)
        minDate.setHours(0, 0, 0, 0)
        if (currentDate < minDate) return false
      }

      if (this.maxDate) {
        const maxDate = new Date(this.maxDate)
        maxDate.setHours(0, 0, 0, 0)
        if (currentDate > maxDate) return false
      }

      return true
    },

    getDayClasses (day) {
      const classes = []

      if (!day.isCurrentMonth) {
        classes.push('calendar__day--other-month')
      }

      if (!day.isSelectable) {
        classes.push('calendar__day--disabled')
      }

      if (this.selectedDate && this.isSameDay(day.date, this.selectedDate)) {
        classes.push('calendar__day--selected')
      }

      if (this.isToday(day.date)) {
        classes.push('calendar__day--today')
      }

      return classes
    },

    isSameDay (date1, date2) {
      if (!date1 || !date2) return false

      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear()
    },

    isToday (date) {
      const today = new Date()
      return this.isSameDay(date, today)
    },

    selectDate (day) {
      if (!day.isSelectable) return

      this.selectedDate = day.date
      this.internalValue = day.date

      this.$emit('input', day.date)
      this.$emit('update:value', day.date)
      this.$emit('date-select', day.date)

      if (!this.hideInput) {
        this.closeCalendar()
      }
    },

    showPrevMonth () {
      if (!this.PrevMonth) return

      this.currentDate = new Date(
        this.currentYear,
        this.currentMonth - 1,
        1
      )
    },

    showNextMonth () {
      if (!this.NextMonth) return

      this.currentDate = new Date(
        this.currentYear,
        this.currentMonth + 1,
        1
      )
    },

    toggleCalendar () {
      if (this.readonly) return

      this.isCalendarVisible = !this.isCalendarVisible

      if (this.isCalendarVisible && this.$refs.input) {
        this.$refs.input.focus()
      }
    },

    closeCalendar () {
      this.isCalendarVisible = false
    },

    onInputFocus () {
      if (!this.readonly) {
        this.isCalendarVisible = true
      }
    },

    onIconClick () {
      if (this.internalValue) {
        this.internalValue = null
        this.selectedDate = null
        this.$emit('input', null)
        this.$emit('update:value', null)
      } else {
        this.toggleCalendar()
      }
    }
  }
}
</script>

<style scoped>
.calendar-wrapper {
  position: relative;
  display: inline-block;
}

.calendar-wrapper.-active .calendar-input {
  border-color: #007bff;
}

.calendar-input {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}

.calendar-input__field {
  border: none;
  outline: none;
  flex: 1;
  background: transparent;
  cursor: pointer;
}

.calendar-input__icon {
  margin-left: 8px;
  cursor: pointer;
  user-select: none;
}

.calendar {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 1000;
  min-width: 280px;
}

.calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.calendar__month-label {
  font-weight: bold;
  font-size: 16px;
}

.calendar__nav-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 18px;
}

.calendar__nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.calendar__weekday {
  text-align: center;
  font-weight: bold;
  font-size: 12px;
  color: #666;
  padding: 4px;
}

.calendar__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar__day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.calendar__day:hover:not(.calendar__day--disabled) {
  background-color: #f0f0f0;
}

.calendar__day--selected {
  background-color: #007bff;
  color: white;
}

.calendar__day--today {
  border: 1px solid #007bff;
}

.calendar__day--other-month {
  color: #ccc;
}

.calendar__day--disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style>

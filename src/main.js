import Vue from 'vue'
import App from './App.vue'
import ClickOutside from './directives/ClickOutside'

Vue.directive('click-outside', ClickOutside)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')

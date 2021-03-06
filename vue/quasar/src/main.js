// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
// require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
require(`quasar/dist/quasar.${__THEME}.css`)
// ==============================

// Uncomment the following lines if you need IE11/Edge support
// require(`quasar/dist/quasar.ie`)
// require(`quasar/dist/quasar.ie.${__THEME}.css`)

import Vue from 'vue'
import Quasar, {
  QCard,
  QCardTitle,
  QCardSeparator,
  QCardMain,
  QCollapsible,
  QSelect
} from 'quasar'

import router from './router'
import numeral from 'numeral'

import Census from './plugins/Census'

Vue.config.productionTip = false

// register global quasar components
Vue.use(Quasar, {
  components: {
    QCard,
    QCardTitle,
    QCardSeparator,
    QCardMain,
    QCollapsible,
    QSelect
  }
})

// add our custom census data service plugin
Vue.use(Census)

// add global number formatters
Vue.filter('formatNumber', function (value) {
  return numeral(value).format('0,0')
})

Vue.filter('formatDecimal', function (value) {
  return numeral(value).format('0,0.00')
})

if (__THEME === 'mat') {
  require('quasar-extras/roboto-font')
}
import 'quasar-extras/material-icons'
// import 'quasar-extras/ionicons'
// import 'quasar-extras/fontawesome'
// import 'quasar-extras/animate'

// create Quasar Vue SPA
Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    router,
    render: h => h(require('./App').default)
  })
})

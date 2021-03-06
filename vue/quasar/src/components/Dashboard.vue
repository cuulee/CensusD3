<template>
  <q-layout ref="layout"
    view="lHh Lpr fFf">

    <!-- app toolbar -->
    <q-toolbar slot="header" class="app-toolbar">
      <q-btn flat @click="$refs.layout.toggleLeft()">
        <q-icon name="menu" />
      </q-btn>
      <q-toolbar-title>
        <q-btn small flat class="app-title" @click="appTitleClick()">USA Census Vue</q-btn>
        <div slot="subtitle">powered by
          <a class="text-cyan-11" 
            href="http://quasar-framework.org/" target="_blank"
            title="quasar-framework">Quasar v{{$q.version}}</a>
        </div>
      </q-toolbar-title>
    </q-toolbar>

    <!-- left side panel -->
    <div slot="left">
      <!--
        Use <q-side-link> component
        instead of <q-item> for
        internal vue-router navigation
      -->
      <q-list no-border link inset-delimiter>
        <q-list-header>
          <img src="statics/quasar-logo.png" height="24" />
          Quasar Framework Links
        </q-list-header>
        <q-item @click="launch('http://quasar-framework.org')">
          <q-item-side icon="school" />
          <q-item-main label="Docs" sublabel="quasar-framework.org" />
        </q-item>
        <q-item @click="launch('http://forum.quasar-framework.org')">
          <q-item-side icon="record_voice_over" />
          <q-item-main label="Forum" sublabel="forum.quasar-framework.org" />
        </q-item>
        <q-item @click="launch('https://gitter.im/quasarframework/Lobby')">
          <q-item-side icon="chat" />
          <q-item-main label="Gitter Channel" sublabel="Quasar Lobby" />
        </q-item>
        <q-item @click="launch('https://twitter.com/quasarframework')">
          <q-item-side icon="rss feed" />
          <q-item-main label="Twitter" sublabel="@quasarframework" />
        </q-item>
      </q-list>
    </div>

    <!--
      Replace following <div> with
      <router-view /> component
      if using subRoutes
    -->
    <!-- app content -->
    <div class="app-content sm-gutter">
      <div class="row">
        <div class="col-xs-12 col-sm-8 col-md-8 col-lg-8 colcl-8 map-card">
          <usa-map ref="map" :map-data="populationData" />
        </div>
        <div class="col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4 table-card">
          <population-table ref="dataTable" :table-data="populationData" />
        </div>
      </div>
      <div class="row">
        <div class="col-12 chart-card">
          <population-chart ref="populationChart" :chart-data="populationData" />
        </div>
      </div>
    </div>

    <!-- footer -->
    <q-toolbar slot="footer" color="light" class="app-footer">
      <small>
	      <span class="text-faded">data:</span>
        <a href="http://api.census.gov/data.html" target="_blank"
          title="http://api.census.gov/data.html">api.census.gov</a>      
	      <span class="text-faded">| code:</span>
        <a href="https://github.com/RandomFractals/CensusD3/tree/master/vue/quasar" target="_blank"
          title="census vue project on github">census-vue</a>
        <span class="text-faded">&copy;Random Fractals Inc. 2017</span>
      </small>
    </q-toolbar>
    </footer>
  </q-layout>
</template>

<style>
/* app container styles */
.app-toolbar {
  padding: 0px;
  min-height: 40px;
}
.app-title {
  padding: 2px;
}
.app-content {
  margin: 5px 20px 5px 0px;
}
.app-footer {
  min-height: 30px;
  padding: 0px 5px 0px 10px;
}

/* app card styles */
.map-card, .table-card {
  height: 360px;
  padding: 0px;
}

.table-card {
  margin-left: 0px;
  margin-right: 0px;
}

.chart-card {
  height: 280px;
}

/* override q-card styles to slim them down */
.q-card {
  padding: 0px;
  margin: 0px;
}
.q-card-title {
  padding: 0px;
  padding-left: 5px;
  font-size: 16px;
}
.q-card-container {
  padding: 0px;
}
</style>

<script>
import {
  dom,
  event,
  openURL,
  QLayout,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
  QList,
  QListHeader,
  QItem,
  QItemSide,
  QItemMain,
  Events
} from 'quasar'

import USAMap from './USAMap.vue'
import PopulationTable from './PopulationTable.vue'
import PopulationChart from './PopulationChart.vue'

const
  { viewport } = dom,
  { position } = event,
  moveForce = 30,
  rotateForce = 40,
  RAD_TO_DEG = 180 / Math.PI

function getRotationFromAccel (accelX, accelY, accelZ) {
  /* Reference: http://stackoverflow.com/questions/3755059/3d-accelerometer-calculate-the-orientation#answer-30195572 */
  const sign = accelZ > 0 ? 1 : -1
  const miu = 0.001

  return {
    roll: Math.atan2(accelY, sign * Math.sqrt(Math.pow(accelZ, 2) + miu * Math.pow(accelX, 2))) * RAD_TO_DEG,
    pitch: -Math.atan2(accelX, Math.sqrt(Math.pow(accelY, 2) + Math.pow(accelZ, 2))) * RAD_TO_DEG
  }
}

export default {
  name: 'index',
  components: {
    QLayout,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QList,
    QListHeader,
    QItem,
    QItemSide,
    QItemMain,
    usaMap: USAMap,
    PopulationTable,
    PopulationChart
  },

  data () {
    return {
      // hardcoded USA population data for initial app load
      usaData: {
        regionId: '00',
        regionName: 'USA',
        regionType: 'country',
        population: 320832714,
        density: 87.4 // per squar mile according to 2015 census data
      },
      selectedRegion: this.usaData,
      populationData: [],
      loaded: false,
      showError: false,
      errorMessage: 'Error loading population data',
      orienting: window.DeviceOrientationEvent && !this.$q.platform.is.desktop,
      rotating: window.DeviceMotionEvent && !this.$q.platform.is.desktop,
      moveX: 0,
      moveY: 0,
      rotateY: 0,
      rotateX: 0
    }
  },

  computed: {
    position () {
      const transform = `rotateX(${this.rotateX}deg) rotateY(${this.rotateY}deg)`
      return {
        top: this.moveY + 'px',
        left: this.moveX + 'px',
        '-webkit-transform': transform,
        '-ms-transform': transform,
        transform
      }
    }
  },

  methods: {

    /**
     * Launch url util for the app footer and quasar framework menu links.
     */
    launch (url) {
      openURL(url)
    },

    /**
     * Resets view and error message display view state.
     */
    resetState () {
      this.loaded = false
      this.showError = false
    },

    /**
     * Reloads USA states population census data display.
     */
    appTitleClick () {
      Events.$emit(this.$census.events.REGION, this.usaData)
      // get USA states population data
      this.$census.getPopulation()
    },

    // TODO: retrofit these for proper device rotation event handling
    // and responsive UI layout and components sizing updates later
    move (evt) {
      const
        {width, height} = viewport(),
        {top, left} = position(evt),
        halfH = height / 2,
        halfW = width / 2

      this.moveX = (left - halfW) / halfW * -moveForce
      this.moveY = (top - halfH) / halfH * -moveForce
      this.rotateY = (left / width * rotateForce * 2) - rotateForce
      this.rotateX = -((top / height * rotateForce * 2) - rotateForce)
    },
    rotate (evt) {
      if (evt.rotationRate &&
          evt.rotationRate.beta !== null &&
          evt.rotationRate.gamma !== null) {
        this.rotateX = evt.rotationRate.beta * 0.7
        this.rotateY = evt.rotationRate.gamma * -0.7
      }
      else {
        /* evt.acceleration may be null in some cases, so we'll fall back
           to evt.accelerationIncludingGravity */
        const
          accelX = evt.acceleration.x || evt.accelerationIncludingGravity.x,
          accelY = evt.acceleration.y || evt.accelerationIncludingGravity.y,
          accelZ = evt.acceleration.z || evt.accelerationIncludingGravity.z - 9.81,
          rotation = getRotationFromAccel(accelX, accelY, accelZ)

        this.rotateX = rotation.roll * 0.7
        this.rotateY = rotation.pitch * -0.7
      }
    },
    orient (evt) {
      if (evt.beta === null || evt.gamma === null) {
        window.removeEventListener('deviceorientation', this.orient, false)
        this.orienting = false

        window.addEventListener('devicemotion', this.rotate, false)
      }
      else {
        this.rotateX = evt.beta * 0.7
        this.rotateY = evt.gamma * -0.7
      }
    }

  }, // end of methods

  /**
   * Adds app view visibility handler.
   */
  created () {
    // add quasar app visibility handler
    this.onAppViewUpdate = appViewState => {
      console.log('app:visibility:', appViewState)
    }
    this.$q.events.$on('app:visibility', this.onAppViewUpdate)

    // add region selection change event handler
    this.onRegionSelectionChange = regionData => {
      this.selectedRegion = regionData
      console.log('dashboard:selectedRegion:', regionData)
    }
    this.$q.events.$on(this.$census.events.REGION, this.onRegionSelectionChange)

    console.log('dashboard created')
  },

  /**
   * Adds app view change event handlers,
   * and gets initial USA population data
   * to display on app load for now.
   */
  mounted () {
    this.$nextTick(() => {
      if (this.orienting) {
        window.addEventListener('deviceorientation', this.orient, false)
      }
      else if (this.rotating) {
        window.addEventListener('devicemove', this.rotate, false)
      }
      else {
        document.addEventListener('mousemove', this.move)
      }
    })
    console.log('dashboard mounted')

    // triggeer USA region selection on dashboard app init
    Events.$emit(this.$census.events.REGION, this.usaData)

    // get initial USA states population data for now
    this.$census.getPopulation()
  },

  /**
   * Removes app view event handlers.
   */
  beforeDestroy () {
    if (this.orienting) {
      window.removeEventListener('deviceorientation', this.orient, false)
    }
    else if (this.rotating) {
      window.removeEventListener('devicemove', this.rotate, false)
    }
    else {
      document.removeEventListener('mousemove', this.move)
    }

    // remove app view and census data event handlers
    this.$q.events.$off('app:visibility', this.onAppViewUpdate)
    this.$q.events.$off(this.$census.events.REGION, this.onRegionSelectionChange)
  }
}
</script>
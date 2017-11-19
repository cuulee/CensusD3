import axios from 'axios'
import {Events} from 'quasar'

export default {
  install: (Vue) => {
    Vue.prototype.$census = {

      /**
      * Gets USA or state population data.
      */
      getPopulationData (region = 'USA') {
        // get USA population data for all states
        axios.get(`http://censusd3.herokuapp.com/census/population/state:*`)
          .then(response => {
            console.log('census::getPopulationData:regions:', response.data.length)

            // strip out header row and Puerto Rico data (last row)
            let popData = response.data.slice(1, 51)

            // create selected region population data object
            // for the total USA population count display
            let selectedRegion = {
              regionName: region,
              population: popData.map(regionData => Number(regionData[0]))
                .reduce((a, b) => a + b, 0) // total count
            }

            // create population data for sub-regions (states or counties)
            let populationData = popData.map(function (regionData) {
              return { // create simple region population data object
                regionName: regionData[1].substr(0, regionData[1].indexOf(',')), // region name without state
                regionId: regionData[4], // numeric region code
                population: Number(regionData[0]), // population count column data
                density: Number(regionData[3]) // density column data
              }
            })
            console.log('census:population:data:', populationData)

            // push new census data to the global quasar app event bus
            Events.$emit('census:population', {
              selectedRegion: selectedRegion,
              populationData: populationData
            })
          })
          .catch(err => {
            Events.$emit('census:population:error', err.response) // .data.error)
          })
      }
    }
  }
}
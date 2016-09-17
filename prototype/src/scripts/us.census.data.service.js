/**
 * US census data service.
 * 
 * TODO: some data can be lazy loaded later.
 **/ 
function USCensusDataService() {
  console.log('USCensusDataService::created');
}


/**
 * Gets the latest (2015) USA states population data from ../data/us-state-population.csv.
 */
USCensusDataService.prototype.getUSPopulationData = function(onDataReady, map) {
  console.log('USCensusDataService::getUSPopulationData::loading ../data/us-state-population.csv...');
  d3.csv('../data/us-state-population.csv')
    .row( function(d) { 
      return {
        population: +d.population, // + to convert to numbers :)
        state: d.state,        
        region: d.region,
        coast: d.coast 
      }; 
    }) 
    .get( function(error, usPopulation) {
      // update map comp.
      //console.log(usPopulation);
      onDataReady(usPopulation, map);
  });  
}

/**
 * Gets states population data from census data service.
 */
USCensusDataService.prototype.getStatesPopulation = function(onDataReady, map) {
  console.log('USCensusDataService::getStatesPopulation::loading ./census/population/state:*');  
  d3.json('./census/population/state:*', function(statesPopulation) {
    console.log('USCensusDataService::getStatesPopulation::loaded states population: count: ' + 
      statesPopulation.length);   
    // update map comp.
    //onDataReady(statesGeoData.features, map);
  });
}


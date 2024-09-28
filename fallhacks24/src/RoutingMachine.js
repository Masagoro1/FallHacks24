import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// creates and displays the route
const createRoutineMachineLayer = ({ waypoints }) => {
  const instance = L.Routing.control({
    waypoints: waypoints.map(({ latitude, longitude }) =>
      L.latLng(latitude, longitude)
    ),
    
    draggableWaypoints: false,
    
  }).on('routesfound', function(e) {
    var routes = e.routes;
    var summary = routes[0].summary; // Get the summary of the first route
    var totalTime = summary.totalTime; // Access the total time
    console.log('Total time: ' + totalTime + ' seconds');
});
  
  return instance;
};

const RoutingMachine = createControlComponent(createRoutineMachineLayer);

export default RoutingMachine;

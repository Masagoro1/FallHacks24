import './App.css';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faRoute, faHamburger } from '@fortawesome/free-solid-svg-icons';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet-defaulticon-compatibility';

import RoutingMachine from './RoutingMachine';

//Menu inputs
let isLightSpeed = false;
let isRunningReds = false;
let isSpeeding = false;
let isGoingThroughBuildings = false;

function LightSpeedButtonPressed(){
  isLightSpeed = !isLightSpeed;

}
function RunningRedsButtonPressed(){
  isRunningReds = !isRunningReds;
  
}
function SpeedingButtonPressed(){
  isSpeeding = !isSpeeding;

}
function isGoingThroughBuildingsButtonPressed(){
  isGoingThroughBuildings = !isGoingThroughBuildings;

}

// Add markers on the map by entering a location.
// Calculate and display a route between two locations via a toggleable form.

function App() {
  const [locationMarkers, setLocationMarkers] = useState([]);
  const [waypoints, setWaypoints] = useState();
  const [showRoutingForm, setFormView] = useState(false);
  const [showMenu, setMenu] = useState(false);
  useEffect(() => {}, [waypoints]);

  async function handleMarkerSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const inputLocation = formData.get('location');

    const res = await fetch(
      '/api/geocode?' +
        new URLSearchParams({ location: inputLocation }).toString()
    );
    if (!res.ok) {
      const err = await res.text();
      alert(`Something went wrong.\n${err}`);
    } else {
      const data = await res.json();
      let newLocation = {
        address: data.location,
        lat: data.coordinates.latitude,
        long: data.coordinates.longitude,
      };
      setLocationMarkers((locations) => [...locations, newLocation]);
    }
  }

  async function handleRouteSubmit(event) {
    event.preventDefault();
    // Reset previous waypoints
    if (waypoints) {
      setWaypoints();
    }
    // Hide the form
    setFormView(false);

    const formData = new FormData(event.target);
    const locations = formData.getAll('location');
    const res = await fetch('/api/route', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({ locations }),
    });
    if (!res.ok) {
      const err = await res.text();
      alert(`Something went wrong.\n${err}`);
    } else {
      const data = await res.json();
      setWaypoints(data.waypoints);
    }
  }

  return (
    <div className="App">
      <div id="titleLight">
        Maps: Faster than Light Edition
      </div>
      <form className="inputBlock" onSubmit={handleMarkerSubmit}>
        <input
          type="text"
          id="location"
          name="location"
          required
          placeholder="Enter location"
        />
        <button type="submit" className="addloc">
          <FontAwesomeIcon icon={faLocationDot} style={{ color: '#1EE2C7' }} />
        </button>
      </form>
      <div id="menuBlock">
        <div id="chooseOptions">
        {showMenu && (
            <div class="Menu">
              
                <button class="menuButt">Speed of Light</button>
                <input class="checkbox" type="checkbox"></input>
                <button class="menuButt">cuh</button>
                <input class="checkbox" type="checkbox"></input>
                <button class="menuButt">cuh</button>
                <input class="checkbox" type="checkbox"></input>
              
              
            </div>
          )}
          <FontAwesomeIcon
            icon={faHamburger}
            style={{ color: '#1EE2C7' }}
            onClick={() => {
              setMenu((showMenu) => !showMenu);
            }}
          />
        </div>
      </div>
      <div className="routeBlock">
        <div className="addRoutes">
          {showRoutingForm && (
            <form onSubmit={handleRouteSubmit}>
              <div className="posOne">
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="Staring Point"
                />
              </div>
              <div className="posTwo">
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="End Point"
                />
              </div>
              <button className="addloc">Find Path</button>
            </form>
          )}
          <FontAwesomeIcon
            icon={faRoute}
            style={{ color: '#1EE2C7' }}
            onClick={() => {
              setFormView((showRoutingForm) => !showRoutingForm);
            }}
          />
        </div>
      </div>
      <MapContainer center={[31.505, 70.09]} id="mapId" zoom={4}>
        {locationMarkers.map((loc, key) => {
          return (
            <Marker key={key} position={[loc.lat, loc.long]}>
              <Popup>{loc.address}</Popup>
            </Marker>
          );
        })}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {waypoints ? <RoutingMachine waypoints={waypoints} /> : ''}
      </MapContainer>
    </div>
  );
}

export default App;

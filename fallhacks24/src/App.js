import './App.css';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faRoute, faBars } from '@fortawesome/free-solid-svg-icons';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet-defaulticon-compatibility';

import RoutingMachine from './RoutingMachine';



//Menu inputs
let isLightSpeed = false;
let isRunningReds = false;
let isGoingThroughBuildings = false;


function modifyTime(inputString, percentage) {
  // Regular expressions to find the number followed by 'h' (hours) or 'min' (minutes)
  let hourRegex = /(\d+\.?\d*)\s*h/;
  let minRegex = /(\d+\.?\d*)\s*min/;
  
  // Check if the string contains hours
  if (hourRegex.test(inputString, percentage)) {
      let match = inputString.match(hourRegex);
      let originalHours = parseFloat(match[1]);
      let modifiedHours = originalHours * percentage;

      // Replace the original hours with the modified hours
      return inputString.replace(hourRegex, `${modifiedHours.toFixed(1)} h`);
  }
  // Check if the string contains minutes
  else if (minRegex.test(inputString)) {
      let match = inputString.match(minRegex);
      let originalMinutes = parseFloat(match[1]);
      let modifiedMinutes = originalMinutes * 0.8;

      // Replace the original minutes with the modified minutes
      return inputString.replace(minRegex, `${modifiedMinutes.toFixed(1)} min`);
  }

  // If no 'h' or 'min' is found, return the original string
  return inputString;
}

// Add markers on the map by entering a location.
// Calculate and display a route between two locations via a toggleable form.

function App() {
  async function SpeedingButtonPressed() {
    let output = document.getElementById("mapId").getElementsByClassName("leaflet-control-container")[0].getElementsByClassName("leaflet-top leaflet-right")[0].getElementsByClassName("leaflet-routing-container leaflet-bar leaflet-control")[0].getElementsByClassName("leaflet-routing-alternatives-container")[0].getElementsByClassName("leaflet-routing-alt ")[0].querySelector('h3').textContent;
    document.getElementById("mapId").getElementsByClassName("leaflet-control-container")[0].getElementsByClassName("leaflet-top leaflet-right")[0].getElementsByClassName("leaflet-routing-container leaflet-bar leaflet-control")[0].getElementsByClassName("leaflet-routing-alternatives-container")[0].getElementsByClassName("leaflet-routing-alt ")[0].querySelector('h3').textContent = modifyTime(output, 0.95);
  }
  async function RunRedsPressed() {
    
    if(isRunningReds){
      return;
    }
    const setRunRed = document.getElementById("rr");
    if(!setRunRed.checked) {
      setRunRed.checked = true;
    }
    let output = document.getElementById("mapId").getElementsByClassName("leaflet-control-container")[0].getElementsByClassName("leaflet-top leaflet-right")[0].getElementsByClassName("leaflet-routing-container leaflet-bar leaflet-control")[0].getElementsByClassName("leaflet-routing-alternatives-container")[0].getElementsByClassName("leaflet-routing-alt ")[0].querySelector('h3').textContent;
    document.getElementById("mapId").getElementsByClassName("leaflet-control-container")[0].getElementsByClassName("leaflet-top leaflet-right")[0].getElementsByClassName("leaflet-routing-container leaflet-bar leaflet-control")[0].getElementsByClassName("leaflet-routing-alternatives-container")[0].getElementsByClassName("leaflet-routing-alt ")[0].querySelector('h3').textContent = modifyTime(output, 0.85);
    isRunningReds = true;
  }
  async function GoThroughBuildingsPressed() {
    
    if(isGoingThroughBuildings){
      return;
    }
    const setRunWall = document.getElementById("rw");
    if(!setRunWall.checked) {
      setRunWall.checked = true;
    }
    let output = document.getElementById("mapId").getElementsByClassName("leaflet-control-container")[0].getElementsByClassName("leaflet-top leaflet-right")[0].getElementsByClassName("leaflet-routing-container leaflet-bar leaflet-control")[0].getElementsByClassName("leaflet-routing-alternatives-container")[0].getElementsByClassName("leaflet-routing-alt ")[0].querySelector('h3').textContent;
    document.getElementById("mapId").getElementsByClassName("leaflet-control-container")[0].getElementsByClassName("leaflet-top leaflet-right")[0].getElementsByClassName("leaflet-routing-container leaflet-bar leaflet-control")[0].getElementsByClassName("leaflet-routing-alternatives-container")[0].getElementsByClassName("leaflet-routing-alt ")[0].querySelector('h3').textContent = modifyTime(output, 0.85);
    isGoingThroughBuildings = true;
  }

  async function LightSpeed(){
    if(isLightSpeed){
      return;
    }
    const setLight = document.getElementById("bl");
    if(!setLight.checked) {
      setLight.checked = true;
    }
    let output = document.getElementById("mapId").getElementsByClassName("leaflet-control-container")[0].getElementsByClassName("leaflet-top leaflet-right")[0].getElementsByClassName("leaflet-routing-container leaflet-bar leaflet-control")[0].getElementsByClassName("leaflet-routing-alternatives-container")[0].getElementsByClassName("leaflet-routing-alt ")[0].querySelector('h3').textContent;
    document.getElementById("mapId").getElementsByClassName("leaflet-control-container")[0].getElementsByClassName("leaflet-top leaflet-right")[0].getElementsByClassName("leaflet-routing-container leaflet-bar leaflet-control")[0].getElementsByClassName("leaflet-routing-alternatives-container")[0].getElementsByClassName("leaflet-routing-alt ")[0].querySelector('h3').textContent = modifyTime(output, 0.01);
    isLightSpeed = true;
  }

  const [locationMarkers, setLocationMarkers] = useState([]);
  const [waypoints, setWaypoints] = useState();
  const [showRoutingForm, setFormView] = useState(false);
  const [showMenu, setMenu] = useState(false);
  const [boxLight, setLight] = useState(0);
  const [boxRunRed, setRunRed] = useState(0);
  const [boxRunWall, setRunWall] = useState(0);
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
              <button class="button-85" role="button" onClick={LightSpeed}>Go Light Speed</button>
              <input id ="bl" class="checkbox" type="checkbox"></input>
              <button class="button-49" role="button" onClick={RunRedsPressed}>Run red lights</button>
              <input id ="rr" class="checkbox" type="checkbox"></input>
              <button class="button-49" role="button" onClick={GoThroughBuildingsPressed}>Run through walls</button>
              <input id ="rw" class="checkbox" type="checkbox"></input>
              <button class="button-49" role="button" onClick={SpeedingButtonPressed}>Speed 10km/hr faster</button>

              
              
            </div>
          )}
          <FontAwesomeIcon
            icon={faBars}
            style={{ color: '#1EE2C7' }}
            onClick={() => {
              setMenu((showMenu) => !showMenu);
              isLightSpeed = false;
              isRunningReds = false;
              isGoingThroughBuildings = false;
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

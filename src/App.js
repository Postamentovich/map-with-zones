import React from "react";
import { MapWithZones, Cities } from "./map-with-zones";
import "./App.css";

function App() {
    return (
        <div className="App">
            <MapWithZones mapToken={process.env.REACT_APP_MAPBOX_TOKEN} cityCoor={Cities.Bengaluru} isAdmin />
        </div>
    );
}

export default App;

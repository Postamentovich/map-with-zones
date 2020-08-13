import React from "react";
import { MapWithZones } from "./map-with-zones";
import "./App.css";

function App() {
    return (
        <div className="App">
            <MapWithZones mapToken={process.env.REACT_APP_MAPBOX_TOKEN} />
        </div>
    );
}

export default App;

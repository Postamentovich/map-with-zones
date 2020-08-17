import React, { useState } from "react";
import { MapWithZones } from "./map-with-zones";
import "./App.scss";
import { ZonesList } from "./map-with-zones/componets/zones-list";

const App = () => {
    const [mode, setMode] = useState("user");
    const [selectedZones, setSelectedZones] = useState([]);

    return (
        <div className="App">
            <div className="test-panel">
                <button
                    onClick={() => setMode("admin")}
                    className={mode === "admin" ? "test-panel__button-active" : ""}
                >
                    ADMIN MODE
                </button>
                <button onClick={() => setMode("user")} className={mode === "user" ? "test-panel__button-active" : ""}>
                    USER MODE
                </button>
                <button
                    onClick={() => setMode("highlight")}
                    className={mode === "highlight" ? "test-panel__button-active" : ""}
                >
                    HIGHLIGHT ZONE
                </button>
            </div>
            {mode === "highlight" && <ZonesList selectedZones={selectedZones} setSelectedZones={setSelectedZones} />}
            <MapWithZones
                mapToken={process.env.REACT_APP_MAPBOX_TOKEN}
                isAdmin={mode === "admin"}
                selectedZones={selectedZones}
            />
        </div>
    );
};

export default App;

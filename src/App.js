import React, { useState } from "react";
import { MapWithZones, Cities } from "./map-with-zones";
import "./App.scss";

const App = () => {
    const [isAdmin, setIsAdmin] = useState(false);

    return (
        <div className="App">
            <div className="test-panel">
                <button onClick={() => setIsAdmin(true)} className={isAdmin ? "test-panel__button-active" : ""}>
                    ADMIN MODE
                </button>
                <button onClick={() => setIsAdmin(false)} className={!isAdmin ? "test-panel__button-active" : ""}>
                    USER MODE
                </button>
            </div>
            <MapWithZones mapToken={process.env.REACT_APP_MAPBOX_TOKEN} cityCoor={Cities.Bengaluru} isAdmin={isAdmin} />
        </div>
    );
};

export default App;

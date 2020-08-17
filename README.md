## Map with Zones

### Features:

#### Admin Mode

-   creating zone (free drawing like pencil)
-   choose color of zone
-   setting zone name
-   deleting zone
-   editing zone

#### User Mode

-   setting marker on the map
-   setting the radius of the circle and drawing it on the map
-   finding zones that fall within the radius

### Technologies and libraries used

-   React
-   Mapbox
-   Turf
-   Lodash

### Project structure

```
└── map-with-zones/                 # Main folder
    ├── api/                        # Services for API interactions
    ├── components/                 # React components
    ├── controls/                   # Mapbox controls
    ├── layers/                     # Mapbox layers
    └── utils/                      # Utils
    index.jsx                       # Main component
    index.scss                      # Styles css
```

### Integration in project

The main component in folder `src/map-with-zones`;

Example of usage: <br> 
To use you need a mapbox token (https://docs.mapbox.com/help/how-mapbox-works/access-tokens/)

```js
import { MapWithZones } from "./map-with-zones";

const App = () => {
    return (
        <div className="App">
            <MapWithZones mapToken={"YOUR MAPBOX TOKEN"} />
        </div>
    );
};
```

### MapWithZones API:

<table class="table table-bordered table-striped">
  <thead>
  <tr>
    <th style="width: 100px;">name</th>
    <th style="width: 50px;">type</th>
    <th style="width: 50px;">required</th>
    <th style="width: 100px;">default</th>
    <th>description</th>
  </tr>
  </thead>
  <tbody>
    <tr>
      <td>mapToken</td>
      <td>String</td>
      <td>true</td>
      <td></td>
      <td>Mapbox token (https://docs.mapbox.com/help/how-mapbox-works/access-tokens/)</td>
    </tr>
    <tr>
      <td>mapStyle</td>
      <td>String</td>
      <td>false</td>
      <td>mapbox://styles/mapbox/streets-v11</td>
      <td>Mapbox map style (https://docs.mapbox.com/vector-tiles/reference/) </td>
    </tr>
    <tr>
      <td>isAdmin</td>
      <td>String</td>
      <td>false</td>
      <td>false</td>
      <td>Selecting the use mode Admin or User</td>
    </tr>
    <tr>
      <td>cityCoor</td>
      <td>mapboxgl.LngLat</td>
      <td>false</td>
      <td>Bengaluru</td>
      <td>Сity coordinates</td>
    </tr>
  </tbody>
</table>

### Used models

Now the saving of zones is implemented not through API, but through local storage. After building the API for storing zones, it will be necessary to change the methods in the ZoneApi class `src/map-with-zones/api/zone-api.js`

Now no API for sending zones which user select. After building APi it will be necessary to change the methods in the UserApi class `src/map-with-zones/api/user-api.js`

```ts
type Zone = {
    /** Zone id */
    id: strins;
    /** Zone name */
    name: string;
    /** Zone layer color */
    color: string;
    /** Zone geometry coordinates */
    coordinates: Array<Array<number>>;
};

type UserZone = {
    /** Zone id */
    id: strins;
    /** Zone name */
    name: string;
};

type UserData = {
    /** selected point on map */
    lngLat: mapbox.LngLat;
    /** selected radius */
    radius: number;
    /** zones that fall within radius */
    zones: Array<UserZone>;
};
```

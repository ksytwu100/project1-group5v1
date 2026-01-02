# US Travel Map & Weather Dashboard - Copilot Instructions

## Project Overview
A two-page travel planning application that collects US address information on `index.html` and displays an interactive map with weather forecast on `map.html`. Built for UCB coding bootcamp Project 1.

## Architecture & Data Flow

### Page Flow
1. **Landing page (`index.html`)**: Form collects place name, street address, city, state, and zip code
2. **Results page (`map.html`)**: Displays Leaflet map with location marker and 5-day OpenWeather forecast
3. **Data transfer**: Form data passes via `localStorage` as JSON under key `"place"` (array of user data objects)

### Key Files & Responsibilities
- `assets/js/form.js`: Form validation, localStorage management, navigation to map page
- `assets/js/weather.js`: Fetches weather data from OpenWeatherMap APIs (current + forecast) AND address geocoding via Nominatim
- `assets/js/map.js`: Simple back button handler + displays city name from localStorage
- `index.html`: Landing page with US state dropdown (all 50 states as `<option>` elements)
- `map.html`: Results page with Leaflet map container and 5-day forecast cards (0-4)

## Critical APIs & External Dependencies

### OpenWeatherMap API (Hardcoded Key)
- **Key**: `a53da2335636723c4cc1f08dcc994683` (hardcoded in `weather.js`)
- **Endpoints used**:
  - Current weather: `https://api.openweathermap.org/data/2.5/weather?q={city}&units=imperial&appid={key}`
  - One Call API 3.0: `https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly&units=imperial&appid={key}`
- **Units**: Imperial (Fahrenheit, MPH)
- **Data flow**: City name → lat/lon → weather data

### Nominatim OSM Geocoding
- **Endpoint**: `https://nominatim.openstreetmap.org/search.php?q={street}+{city}%2C{state}+{zip}&format=jsonv2`
- **Purpose**: Convert full address to lat/lon for precise map marker placement
- **Returns**: `dataLocal[0]` contains `lat`, `lon`, and `type` (e.g., "building", "place")

### Leaflet Maps
- **Version**: 1.9.4 (CDN)
- **Tile layer**: OpenStreetMap tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`)
- **Map container**: `<div id="map"></div>` in `map.html` (styled to 75vh height)
- **Marker**: Implemented as permanent tooltip with location type, centered on address

## Project-Specific Conventions

### localStorage Schema
```javascript
// Key: "place" (note: form.js has bug - sets "userData" key but never uses it)
// Value: Array of user data objects
[{
  plname: "Golden Gate Bridge",
  staddress: "Golden Gate Bridge",
  city: "San Francisco",
  state: "CA",
  zipcode: "94129"
}]
```
Access pattern: Always use `JSON.parse(localStorage.getItem("place"))[0]` to get first (and typically only) entry.

### Weather Display Pattern
- **DOM structure**: 5 forecast cards with IDs following pattern: `#day-{0-4}`, `#img-{0-4}`, `#temp-{0-4}`, `#hum-{0-4}`, `#wind-{0-4}`
- **Date handling**: Unix timestamps converted via `new Date(dt * 1000).toLocaleDateString()`
- **Icons**: OpenWeather icon codes formatted as `http://openweathermap.org/img/wn/{icon}@2x.png`
- **City name**: Capitalized using `cityCaseClean()` helper function

### Styling Framework
- **CSS**: Bulma 1.0.2 for layout/components, custom CSS in `assets/css/style.css` and `map.css`
- **Color scheme**: Light blue background (`#D3f3fe`), black borders (2px solid)
- **Layout**: Flexbox-based, 50/50 split on landing page (map image | form)

### jQuery Usage
- **Version**: 3.4.1 (loaded via CDN)
- **Pattern**: Mix of jQuery selectors (`$("#id")`) and vanilla JS (`document.getElementById()`)
- **Note**: Weather forecast rendering uses jQuery exclusively; map.js uses vanilla JS

## Common Gotchas

1. **localStorage key mismatch**: `form.js` sets `"userData"` key (line 20) but never uses it; actual data stored under `"place"` key
2. **Modal validation**: W3.CSS modal (`#id01`) triggers when ANY field is empty, but zipCode check is buggy (checks object not value)
3. **API call sequence**: `weather.js` makes TWO separate fetch chains - one for weather (city-based), one for geocoding (full address)
4. **Coordinate storage**: Both `"coord"` (city center) and `"coordLocal"` (precise address) stored in localStorage but `coordLocal` is what's used for map
5. **Array index**: Always access `[0]` when reading from `localStorage.getItem("place")` - app assumes single location

## Development Workflow

- **No build process**: Pure HTML/CSS/JS served statically
- **Testing**: Open `index.html` in browser, submit form with complete US address
- **Deployment**: Static hosting (currently GitHub Pages at `ksytwu100.github.io/project1-group5/`)
- **No linting/formatting**: Code style is inconsistent (e.g., string quotes, indentation)

## Modification Guidelines

- When adding form fields, update BOTH the DOM elements in `index.html` AND the `userData` object construction in `form.js`
- Weather forecast cards are hardcoded 0-4; changing count requires modifying HTML structure in `map.html` AND loop in `getWeather()`
- All API keys are exposed in client-side code - this is existing pattern, not a security best practice
- The app only supports US addresses due to Nominatim query format and state dropdown limitation

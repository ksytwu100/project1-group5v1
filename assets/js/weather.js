function convertUnix(data, index) {
    const dateObject = new Date(data.daily[index + 1].dt * 1000);
    return (dateObject.toLocaleDateString());
}

function cityCaseClean(city) {
    var cleanedCity = city.toLowerCase().split(" ");
    var cleanedCityName = "";
    for (var i=0; i < cleanedCity.length; i++) {
        cleanedCity[i] = cleanedCity[i][0].toUpperCase() + cleanedCity[i].slice(1);
        cleanedCityName += " " + cleanedCity[i];
    }
    return cleanedCityName;
}

function getWeather(data) {
    for (var i = 0; i < 5; i++) {
        var weatherForecast = {
            date: convertUnix(data, i),
            icon: "http://openweathermap.org/img/wn/" + data.daily[i + 1].weather[0].icon + "@2x.png",
            temperature: data.daily[i + 1].temp.day.toFixed(1),
            wind: data.daily[i + 1].wind_speed.toFixed(1),
            humidity: data.daily[i + 1].humidity
        }

        var currentSelector = "#day-" + i;
        currentSelector = "#img-" + i;
        $(currentSelector)[0].src = weatherForecast.icon;
        currentSelector = "#temp-" + i;
        $(currentSelector)[0].textContent = "Temp: " + weatherForecast.temperature + " \u2109";
        currentSelector = "#wind-" + i;
        $(currentSelector)[0].textContent = "Wind: " + weatherForecast.wind+ " MPH";
        currentSelector = "#hum-" + i;
        $(currentSelector)[0].textContent = "Humidity: " + weatherForecast.humidity + "%";
    }
}

function getCurrentWeather(data) {
    $(".forecast-panel").addClass("visible");

    $("#currentIcon").src = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
    $("#temperature").textContent = "Temp: " + data.current.temp.toFixed(1) + " \u2109";
    $("#wind-speed").textContent = "Wind: " + data.current.wind_speed.toFixed(1) + " MPH";
    $("#humidity").textContent = "Humidity: " + data.current.humidity + "% ";
    
    getWeather(data);

}
function searchCity() {
    console.log(JSON.parse(localStorage.getItem("place"))[0].city);
    var city = cityCaseClean(JSON.parse(localStorage.getItem("place"))[0].city);
    var requestURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=a53da2335636723c4cc1f08dcc994683";

    fetch(requestURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {

                $("#city").textContent = city + " (" + dayjs().format('M/D/YYYY') + ")";

                const lat = data.coord.lat;
                const lon = data.coord.lon;

                var latLon = lat.toString() + " " + lon.toString();

                localStorage.setItem("coord", latLon);


                requestURL = "https://api.openweathermap.org/data/3.0/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=a53da2335636723c4cc1f08dcc994683";

                fetch(requestURL).then(function (newResponse) {
                    if (newResponse.ok) {
                        newResponse.json().then(function (newData) {
                            getCurrentWeather(newData);
                })
            }
        })
    })
}   else {
        alert("Error: cannot find city!");
}
    })
}

function searchAddress () {
    console.log(JSON.parse(localStorage.getItem("place"))[0].staddress);
    console.log((JSON.parse(localStorage.getItem("place"))[0].staddress).replace(/ /g,"+"));
    console.log(JSON.parse(localStorage.getItem("place"))[0].city);
    console.log(JSON.parse(localStorage.getItem("place"))[0].state);
    console.log(JSON.parse(localStorage.getItem("place"))[0].zipcode);
    var cityLocal = (cityCaseClean(JSON.parse(localStorage.getItem("place"))[0].city)).replace(/ /g,"+");
    var streetLocal = (JSON.parse(localStorage.getItem("place"))[0].staddress).replace(/ /g,"+");
    var stateLocal = JSON.parse(localStorage.getItem("place"))[0].state;
    var zipLocal = JSON.parse(localStorage.getItem("place"))[0].zipcode;
    var placeNameLocal = JSON.parse(localStorage.getItem("place"))[0].plname;

    var requestGeoURL = "https://nominatim.openstreetmap.org/search.php?q=" + streetLocal + "+" + cityLocal + "%2C" + stateLocal + "+" + zipLocal + "&format=jsonv2";

    fetch(requestGeoURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (dataLocal) {
                // Check if Nominatim returned results
                if (!dataLocal || dataLocal.length === 0) {
                    console.error("Nominatim returned no results. Trying city-only search...");
                    searchAddressFallback();
                    return;
                }

                const latLocal = dataLocal[0].lat;
                const lonLocal = dataLocal[0].lon;
                const typeLocal = dataLocal[0].type;

                var latLonLocal = latLocal.toString() + " " + lonLocal.toString();

                localStorage.setItem("coordLocal", latLonLocal);

                let mapOptions = {
                    center: [latLocal, lonLocal],
                    zoom: 16
                }
                
                let map = new L.map('map', mapOptions);
                
                let layer = new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
                map.addLayer(layer);

                var tooltip = L.tooltip({
                    direction: 'center',
                    permanent: true,
                    noWrap: true,
                    opacity: 0.9
                });

                tooltip.setContent(placeNameLocal);
                tooltip.setLatLng([latLocal, lonLocal]);
                tooltip.addTo(map);
            })
        } else {
            console.error("Nominatim API error: " + response.status);
            searchAddressFallback();
        }
    }).catch(function(error) {
        console.error("Fetch error: " + error);
        searchAddressFallback();
    })
}

function searchAddressFallback () {
    // Fallback: use city center from searchCity() results
    console.log("Using city center coordinates as fallback...");
    var coordStr = localStorage.getItem("coord");
    if (coordStr) {
        var coords = coordStr.split(" ");
        var latLocal = parseFloat(coords[0]);
        var lonLocal = parseFloat(coords[1]);

        let mapOptions = {
            center: [latLocal, lonLocal],
            zoom: 12
        }
        
        let map = new L.map('map', mapOptions);
        
        let layer = new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
        map.addLayer(layer);

        var tooltip = L.tooltip({
            direction: 'center',
            permanent: true,
            noWrap: true,
            opacity: 0.9
        });

        tooltip.setContent("City center location");
        tooltip.setLatLng([latLocal, lonLocal]);
        tooltip.addTo(map);
    }
}

searchCity();
searchAddress();
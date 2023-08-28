// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history
// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, and the the wind speed
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city

var searchHistoryEl = $('#search-history');
var button = $('#search-button');

var APIKey = "4e8bb01ab2e646a2ffac2849596d3379";

var cities = [];
var today = dayjs();    

showHistory()
getStorage();

function setStorage() {
    localStorage.setItem("history", JSON.stringify(cities))
}

function getStorage() {
    const history = localStorage.getItem('history');
    if (history) {
        return JSON.parse(history);
    } else {
        return [];
    }
}

function showHistory() {

    const stored = getStorage();
    searchHistoryEl.empty();
    var historyDiv = $('<div>').addClass('d-grid gap-2 pt-2');
    searchHistoryEl.append(historyDiv);

    for (let i = 0; i < stored.length; i++) {
        if (!historyDiv.find(`button:contains("${stored[i]}")`).length) {
            const btn = $('<button>').text(stored[i]).addClass('btn btn-secondary btn-lg direct');
            historyDiv.append(btn);
        }
    }
    historyDiv.on('click', '.direct', function() {
        searchCity($(this).text());
    });
}

function citySearch(city) {
    var cityInput = $('#city-input');
    var cityName= cityInput.val();
    searchCity(cityName);
}

function searchCity(city) {

    $('#city').text(city.charAt(0).toUpperCase() + city.slice(1));

    const queryURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + APIKey;
   
    fetch(queryURL)
        .then(function(result) {
            return result.json();
        })
        .then(function(data) {
            let lat = data[0].lat;
            let lon = data[0].lon;

            const baseURL = "https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;

            fetch(baseURL)
                .then(function(result) {
                    return result.json();
                })  
                .then(function(data) {
                    printCurrentWeather(data);
                }) 

            const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;

            fetch(forecastURL)
                .then(function(response) {
                    return response.json();
                })
                .then(function(dataForecast) {
                    printFroecast(dataForecast);
                })
                
        })
        function printCurrentWeather(data) {

            if (!cities.includes(city)) {
                cities.push(city.trim());
                localStorage.clear();
                setStorage();
                showHistory();
            }

            $('#today').text(today.format('MM/DD/YYYY'));
            $('#currTemp').text("Current Temperature: " + Math.floor(data.main.temp) + "F");
            $('#currHumid').text("Humidity: " + data.main.humidity + "%");
            $('#currWspeed').text("Wind Speed: " + data.wind.speed + "Mph");

            let iconUrl = "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
            $('#currIcon').attr('src', iconUrl);
        }
        function printFroecast(forecast) {
            let counter = 0;
            let arr = forecast.list;

            for (let i = 0; i < arr.length; i++){
                if(arr[i].dt_txt.includes("12:00:00")) {
                    $('#date' + counter).text(today.format('MM/DD/YYYY'));
                    $('#temp' + counter).text('Temperature: ' + Math.floor(arr[i].main.temp) + 'F');
                    $('#humid' + counter).text("Humidity: " + arr[i].main.humidity + "%");
                    $('#wspeed' + counter).text("Wind Speed: " + arr[i].wind.speed + "Mph");
                    
                    let iconSrc = "http://openweathermap.org/img/wn/" + arr[i].weather[0].icon + "@2x.png";
                    $('#icon' + counter).attr('src', iconSrc);
                    counter++;
                }   
            }
        }
}

button.on('click', function() {
    const city = $('#city-input').val();
    searchCity(city);
    $('#city-input').val('');
});

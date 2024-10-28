// DOM Elements
let cityInput = document.getElementById('city_input'),
  searchBtn = document.getElementById('searchBtn');

const apiKey = '23283e0813d6d0a757ecf65aa678f26b';
const apiUrl =
  'https://api.openweathermap.org/data/2.5/weather?&units=metric&q=';

let currentWeatherCard = document.querySelectorAll('.weather-left .card')[0];
let fiveDaysForecastCard = document.querySelector('.day-forecast');
let aqiCard = document.querySelectorAll('.highlights .card')[0];
let sunriseCard = document.querySelectorAll('.highlights .card')[1];

let humidityVal = document.getElementById('humidityVal'),
  pressureVal = document.getElementById('pressureVal'),
  visibilityVal = document.getElementById('visibilityVal'),
  windSpeedVal = document.getElementById('windSpeedVal'),
  feelsVal = document.getElementById('feelsVal'),
  hourlyForecastCard = document.querySelector('.hourly-forecast'); // Updated selector for hourly forecast card

let aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

// Fetch and Display Weather Details
function getWeatherDetails(name, lat, lon, country) {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  let date = new Date();

  let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  let AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  // Fetch Air Quality Data
  fetch(AIR_POLLUTION_API_URL)
    .then(res => res.json())
    .then(data => {
      let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
      aqiCard.innerHTML = `
                <div class="card-head">
                    <p>Air Quality Index</p>
                    <p class="air-index aqi-${data.list[0].main.aqi}">${
        aqiList[data.list[0].main.aqi - 1]
      }</p>
                </div>
                <div class="air-indices">
                    <i class="fa-regular fa-wind fa-3x"></i>
                    <div class="item"><p>PM2.5</p><h2>${pm2_5}</h2></div>
                    <div class="item"><p>PM10</p><h2>${pm10}</h2></div>
                    <div class="item"><p>SO2</p><h2>${so2}</h2></div>
                    <div class="item"><p>CO</p><h2>${co}</h2></div>
                    <div class="item"><p>NO</p><h2>${no}</h2></div>
                    <div class="item"><p>NO2</p><h2>${no2}</h2></div>
                    <div class="item"><p>NH3</p><h2>${nh3}</h2></div>
                    <div class="item"><p>O3</p><h2>${o3}</h2></div>
                </div>
            `;
    })
    .catch(() => alert('Failed to fetch current air pollution data'));

  // Fetch Current Weather Data
  fetch(`${apiUrl}${name}&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      currentWeatherCard.innerHTML = `
                <div class="current-weather">
                    <div class="details">
                        <p>Now</p>
                        <h2>${data.main.temp.toFixed(2)}&deg;C</h2>
                        <p>${data.weather[0].description}</p>
                    </div>
                    <div class="weather-icon">
                        <img src="https://openweathermap.org/img/wn/${
                          data.weather[0].icon
                        }@2x.png" alt="">
                    </div>
                </div>
                <hr>
                <div class="card-footer">
                    <p><i class="fa-light fa-calendar"></i> ${
                      days[date.getDay()]
                    }, ${date.getDate()} ${
        months[date.getMonth()]
      }, ${date.getFullYear()}</p>
                    <p><i class="fa-light fa-location-dot"></i>${name}, ${country}</p>
                </div>
            `;

      let { sunrise, sunset } = data.sys,
        { timezone, visibility } = data,
        { humidity, pressure, feels_like } = data.main,
        { speed } = data.wind;

      // Ensure moment is handling the timezone offset properly
      let sRiseTime = moment
          .utc(sunrise * 1000)
          .add(timezone, 'seconds')
          .format('hh:mm A'),
        sSetTime = moment
          .utc(sunset * 1000)
          .add(timezone, 'seconds')
          .format('hh:mm A');

      sunriseCard.innerHTML = `
    <div class="card">
        <div class="card-head">
            <p>Sunrise & Sunset</p>
        </div>
        <div class="sunrise-sunset">
            <div class="item">
                <div class="icon"><i class="fa-light fa-sunrise fa-4x"></i></div>
                <div><p>Sunrise</p><h2>${sRiseTime || 'N/A'}</h2></div>
            </div>
            <div class="item">
                <div class="icon"><i class="fa-light fa-sunset fa-4x"></i></div>
                <div><p>Sunset</p><h2>${sSetTime || 'N/A'}</h2></div>
            </div>
        </div>
    </div>
`;

      // Update UI with Additional Details and include error handling
      humidityVal.innerHTML = `${humidity || 'N/A'}%`;
      pressureVal.innerHTML = `${pressure || 'N/A'} hPa`;
      visibilityVal.innerHTML = `${(visibility / 1000).toFixed(1)} km`;
      windSpeedVal.innerHTML = `${speed || 'N/A'} m/s`;
      feelsVal.innerHTML = `${(feels_like || 'N/A').toFixed(2)}&deg;C`;
    })
    .catch(() => alert('Failed to fetch current weather'));

  // Fetch 5-Day and Hourly Forecast Data
  fetch(FORECAST_API_URL)
    .then(res => res.json())
    .then(data => {
      // Hourly Forecast - First 8 intervals (3-hour intervals for 24 hours)
      let uniqueForecastDays = [];
      let fiveDaysForecast = data.list.filter(forecast => {
        let forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });
      fiveDaysForecastCard.innerHTML = '';
      for (let i = 1; i < fiveDaysForecast.length; i++) {
        let forecast = fiveDaysForecast[i];
        let date = new Date(forecast.dt_txt);
        fiveDaysForecastCard.innerHTML += `
                    <div class="forecast-item">
                        <div class="icon-wrapper">
                            <img src="https://openweathermap.org/img/wn/${
                              forecast.weather[0].icon
                            }.png" alt="">
                            <span>${(forecast.main.temp -273.15).toFixed(2)}&deg;C</span>
                        </div>
                        <p>${date.getDate()} ${months[date.getMonth()]}</p>
                        <p>${days[date.getDay()]}</p>
                    </div>
                `;
      }
      hourlyForecastCard.innerHTML = ''; // Clear previous content
      for (let i = 0; i < 8; i++) {
        let forecast = data.list[i];
        let hrForecastDate = new Date(forecast.dt_txt);
        let hr = hrForecastDate.getHours();
        let period = hr < 12 ? 'AM' : 'PM';
        hr = hr % 12 || 12; // Convert to 12-hour format

        hourlyForecastCard.innerHTML += `
                    <div class="card">
                        <p>${hr} ${period}</p>
                        <img src="https://openweathermap.org/img/wn/${
                          forecast.weather[0].icon
                        }.png" alt="">
                        <p>${(forecast.main.temp -273.15).toFixed(2)}&deg;C</p>
                    </div>
                `;
      }

      // 5-Day Forecast - Get unique days
    })
    .catch(() => alert('Failed to fetch weather forecast'));
}

// Fetch City Coordinates and Call Weather Details
function getCityCoordinates() {
  let cityName = cityInput.value.trim();
  cityInput.value = '';
  if (!cityName) return;

  const GEOCODING_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

  fetch(GEOCODING_API_URL)
    .then(res => res.json())
    .then(data => {
      let {
        name,
        coord: { lat, lon },
        sys: { country },
      } = data;
      getWeatherDetails(name, lat, lon, country);
    })
    .catch(() => alert(`Failed to fetch coordinates for ${cityName}`));
}

// Event Listener for Search Button
searchBtn.addEventListener('click', getCityCoordinates);

let cityInput = document.getElementById('city_input'),
searchBtn = document.getElementById('searchBtn');
const apiKey = "23283e0813d6d0a757ecf65aa678f26b";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";
let currentWeatherCard = document.querySelectorAll('.weather-left .card')[0];
let fiveDaysForecastCard = document.querySelector('.day-forecast');
let aqiCard = document.querySelectorAll('.highlights .card')[0];
let sunriseCard = document.querySelectorAll('.highlights .card')[1];

function getWeatherDetails(name, lat, lon, country) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let date = new Date();
    let FORECAST_API_URL=`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    let AIR_POLLUTION_API_URL=`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    let aqiList =['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    fetch(AIR_POLLUTION_API_URL).then(res => res.json()).then(data => {
        let {co, no, no2, o3, so2, pm2_5, pm10, nh3} = data.list[0].components;
        aqiCard.innerHTML =`
         <div class="card-head">
                            <p>Air Quality Index</p>
                            <p class="air-index aqi-${data.list[0].main.aqi}">${aqiList[data.list[0].main.aqi - 1]}</p>
                        </div>
                        <div class="air-indices">
                            <i class="fa-regular fa-wind fa-3x"></i>
                            <div class="item">
                                <p>PM2.5</p>
                                <h2>${pm2_5}</h2>
                            </div>
                            <div class="item">
                                <p>PM10</p>
                                <h2>${pm10}</h2>
                            </div>
                            <div class="item">
                                <p>SO2</p>
                                <h2>${so2}</h2>
                            </div>
                            <div class="item">
                                <p>CO</p>
                                <h2>${co}</h2>
                            </div>
                            <div class="item">
                                <p>NO</p>
                                <h2>${no}</h2>
                            </div>
                            <div class="item">
                                <p>NO2</p>
                                <h2>${no2}</h2>
                            </div>
                            <div class="item">
                                <p>NH3</p>
                                <h2>${nh3}</h2>
                            </div>
                            <div class="item">
                                <p>O3</p>
                                <h2>${o3}</h2>
                            </div>
                        </div>
        `;
    })
    .catch(() => {
        alert('Failed to fetch current airpollution');
    });
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
                        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                    </div>
                </div>
                <hr>
                <div class="card-footer">
                    <p><i class="fa-light fa-calendar"></i> ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}</p>
                    <p><i class="fa-light fa-location-dot"></i>${name}, ${country}</p>
                </div>
            `;
        })
        .catch(() => {
            alert('Failed to fetch current weather');
        });
     fetch(FORECAST_API_URL).then(res => res.json()).then(data =>{
       let uniqueForecastDays=[];
       let fiveDaysForecast = data.list.filter(forecast =>{
         let forecastDate = new Date(forecast.dt_txt).getDate();
         if(!uniqueForecastDays.includes(forecastDate)){
           return uniqueForecastDays.push(forecastDate);
         }
       });
       fiveDaysForecastCard.innerHTML='';
       for(i=1; i< fiveDaysForecast.length;i++ ){
        let date = new Date(fiveDaysForecast[i].dt_txt);
         fiveDaysForecastCard.innerHTML+=`
         <div class="forecast-item">
                            <div class="icon-wrapper">
                                <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png" alt="">
                                <span>${(fiveDaysForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
                            </div>
                            <p>${date.getDate()} ${months[date.getMonth()]}</p>
                            <p>${days[date.getDay()]}</p>
                        </div>
         `;
       }
      })
      .catch(() => {
        alert('Failed to fetch weather forecast');
    });
}

function getCityCoordinates() {
    let cityName = cityInput.value.trim();
    cityInput.value = '';
    if (!cityName) return;

    const GEOCODING_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            let { name, coord: { lat, lon }, sys: { country } } = data;
            getWeatherDetails(name, lat, lon, country);
        })
        .catch(() => {
            alert(`Failed to fetch coordinates of ${cityName}`);
        });
}

searchBtn.addEventListener('click', getCityCoordinates);
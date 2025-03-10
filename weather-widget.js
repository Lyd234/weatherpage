document.addEventListener("DOMContentLoaded", function() {
    // Get references to the form elements and widget container
    const formButton = document.getElementById("get-weather");
    const cityInput = document.getElementById("city-input");
    const widget = document.getElementById("weather-widget");
    
    // Function to map weather codes to a human-readable condition
    function getWeatherCondition(code) {
      if (code === 0) return "Clear";
      else if ([1, 2, 3].includes(code)) return "Partly Cloudy";
      else if ([45, 48].includes(code)) return "Foggy";
      else if ([51, 53, 55].includes(code)) return "Drizzle";
      else if ([56, 57].includes(code)) return "Freezing Drizzle";
      else if ([61, 63, 65].includes(code)) return "Rainy";
      else if ([66, 67].includes(code)) return "Freezing Rain";
      else if ([71, 73, 75].includes(code)) return "Snowy";
      else if (code === 77) return "Snow Grains";
      else if ([80, 81, 82].includes(code)) return "Rain Showers";
      else if ([85, 86].includes(code)) return "Snow Showers";
      else if (code === 95) return "Thunderstorm";
      else if ([96, 99].includes(code)) return "Thunderstorm with Hail";
      else return "Unknown";
    }
  
    // Function to fetch weather data based on the provided city name
    function fetchWeatherByCity(city) {
      widget.innerHTML = "Loading weather data...";
      // Call the Open-Meteo Geocoding API to get latitude/longitude for the city
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
      fetch(geoUrl)
        .then(response => response.json())
        .then(geoData => {
          if (!geoData.results || geoData.results.length === 0) {
            widget.innerHTML = "City not found. Please try again.";
            return;
          }
          // Use the first search result from the geocoding API
          const location = geoData.results[0];
          const latitude = location.latitude;
          const longitude = location.longitude;
          // Use the provided timezone or fallback to a default
          const timezone = location.timezone || "Europe/Berlin"; 
  
          // Build the weather API URL using the obtained coordinates and request parameters
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=${timezone}`;

          fetch(weatherUrl)
            .then(response => response.json())
            .then(weatherData => {
              // Extract current weather details
              const current = weatherData.current_weather;
              const currentTemp = current.temperature;
              const currentCondition = getWeatherCondition(current.weathercode);
              const currentTime = new Date(current.time).toLocaleString();
  
              // Extract daily forecast details (assuming the first index is today's forecast)
              const daily = weatherData.daily;
              const dailyDate = daily.time[0];
              const tempMax = daily.temperature_2m_max[0];
              const tempMin = daily.temperature_2m_min[0];
              const dailyCondition = getWeatherCondition(daily.weathercode[0]);
  
              // Build and display the HTML content for the weather widget
              widget.innerHTML = `
                <h3>Weather in ${location.name}${location.country ? ", " + location.country : ""}</h3>
                <div class="section">
                  <h4>Current Weather</h4>
                  <p><strong>Temperature:</strong> ${currentTemp} °C</p>
                  <p><strong>Condition:</strong> ${currentCondition}</p>
                  <p><em>As of: ${currentTime}</em></p>
                </div>
                <div class="section">
                  <h4>Daily Forecast (${dailyDate})</h4>
                  <p><strong>Max Temperature:</strong> ${tempMax} °C</p>
                  <p><strong>Min Temperature:</strong> ${tempMin} °C</p>
                  <p><strong>Condition:</strong> ${dailyCondition}</p>
                </div>
                <p style="text-align: center;">
                  <small>Data from <a href="https://open-meteo.com" target="_blank">Open-Meteo</a></small>
                </p>
              `;
            })
            .catch(error => {
              widget.innerHTML = "Error loading weather data.";
              console.error("Error fetching weather data:", error);
            });
        })
        .catch(error => {
          widget.innerHTML = "Error fetching location data.";
          console.error("Error fetching location data:", error);
        });
    }
  
    // Add click event listener to the "Get Weather" button
    formButton.addEventListener("click", function() {
      const city = cityInput.value.trim();
      if (city !== "") {
        fetchWeatherByCity(city);
      } else {
        widget.innerHTML = "Please enter a city name.";
      }
    });
  });
  
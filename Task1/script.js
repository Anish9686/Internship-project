// ============================================
// WeatherVue - Weather & News App JavaScript
// ============================================

// API Configuration
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// GNews API - Free tier (100 requests/day)
// Get your free API key at https://gnews.io/
const GNEWS_API_KEY = 'YOUR_GNEWS_API_KEY'; // Replace with your API key
const GNEWS_API = 'https://gnews.io/api/v4/search';

// Weather code to icon/description mapping
const weatherCodes = {
    0: { icon: '☀️', description: 'Clear sky' },
    1: { icon: '🌤️', description: 'Mainly clear' },
    2: { icon: '⛅', description: 'Partly cloudy' },
    3: { icon: '☁️', description: 'Overcast' },
    45: { icon: '🌫️', description: 'Foggy' },
    48: { icon: '🌫️', description: 'Depositing rime fog' },
    51: { icon: '🌧️', description: 'Light drizzle' },
    53: { icon: '🌧️', description: 'Moderate drizzle' },
    55: { icon: '🌧️', description: 'Dense drizzle' },
    56: { icon: '🌨️', description: 'Light freezing drizzle' },
    57: { icon: '🌨️', description: 'Dense freezing drizzle' },
    61: { icon: '🌧️', description: 'Slight rain' },
    63: { icon: '🌧️', description: 'Moderate rain' },
    65: { icon: '🌧️', description: 'Heavy rain' },
    66: { icon: '🌨️', description: 'Light freezing rain' },
    67: { icon: '🌨️', description: 'Heavy freezing rain' },
    71: { icon: '❄️', description: 'Slight snow fall' },
    73: { icon: '❄️', description: 'Moderate snow fall' },
    75: { icon: '❄️', description: 'Heavy snow fall' },
    77: { icon: '🌨️', description: 'Snow grains' },
    80: { icon: '🌦️', description: 'Slight rain showers' },
    81: { icon: '🌦️', description: 'Moderate rain showers' },
    82: { icon: '🌧️', description: 'Violent rain showers' },
    85: { icon: '🌨️', description: 'Slight snow showers' },
    86: { icon: '🌨️', description: 'Heavy snow showers' },
    95: { icon: '⛈️', description: 'Thunderstorm' },
    96: { icon: '⛈️', description: 'Thunderstorm with slight hail' },
    99: { icon: '⛈️', description: 'Thunderstorm with heavy hail' }
};

// DOM Elements
const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    weatherDisplay: document.getElementById('weatherDisplay'),
    cityName: document.getElementById('cityName'),
    dateTime: document.getElementById('dateTime'),
    currentWeatherIcon: document.getElementById('currentWeatherIcon'),
    currentTemp: document.getElementById('currentTemp'),
    weatherDescription: document.getElementById('weatherDescription'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    feelsLike: document.getElementById('feelsLike'),
    uvIndex: document.getElementById('uvIndex'),
    hourlyGrid: document.getElementById('hourlyGrid'),
    forecastGrid: document.getElementById('forecastGrid'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    maxTemp: document.getElementById('maxTemp'),
    minTemp: document.getElementById('minTemp'),
    tempRangeFill: document.getElementById('tempRangeFill'),
    // News elements
    newsLocation: document.getElementById('newsLocation'),
    newsLoading: document.getElementById('newsLoading'),
    newsGrid: document.getElementById('newsGrid'),
    newsError: document.getElementById('newsError')
};

// State
let currentLocation = null;
let lastSearchQuery = '';

// Initialize the app
function init() {
    setupEventListeners();
    // Try to get user's location on load
    getUserLocation();
}

// Setup event listeners
function setupEventListeners() {
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    elements.locationBtn.addEventListener('click', getUserLocation);
    elements.retryBtn.addEventListener('click', handleRetry);
}

// Handle search
async function handleSearch() {
    const query = elements.cityInput.value.trim();
    if (!query) {
        showError('Please enter a city name');
        return;
    }

    lastSearchQuery = query;
    await searchCity(query);
}

// Search for a city
async function searchCity(query) {
    showLoading();

    try {
        // Get coordinates from city name
        const geoResponse = await fetch(
            `${GEOCODING_API}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error('Failed to search for city');
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${query}" not found. Please try another search.`);
        }

        const location = geoData.results[0];
        currentLocation = {
            name: location.name,
            country: location.country,
            countryCode: location.country_code,
            lat: location.latitude,
            lon: location.longitude,
            timezone: location.timezone
        };

        await fetchWeatherData(currentLocation);
    } catch (error) {
        showError(error.message);
    }
}

// Get user's location
function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;

                // Reverse geocode to get city name
                const geoResponse = await fetch(
                    `${GEOCODING_API}?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
                );

                // If reverse geocoding doesn't work, use coordinates directly
                currentLocation = {
                    name: 'Your Location',
                    country: '',
                    countryCode: '',
                    lat: latitude,
                    lon: longitude,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                };

                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    if (geoData.results && geoData.results.length > 0) {
                        currentLocation.name = geoData.results[0].name;
                        currentLocation.country = geoData.results[0].country;
                        currentLocation.countryCode = geoData.results[0].country_code || '';
                    }
                }

                await fetchWeatherData(currentLocation);
            } catch (error) {
                showError('Failed to get weather for your location');
            }
        },
        (error) => {
            let message = 'Unable to get your location. ';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Please allow location access or search for a city.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    message += 'Location request timed out.';
                    break;
                default:
                    message += 'Please search for a city instead.';
            }
            showError(message);
        },
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000 // Cache for 5 minutes
        }
    );
}

// Fetch weather data
async function fetchWeatherData(location) {
    try {
        const params = new URLSearchParams({
            latitude: location.lat,
            longitude: location.lon,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index',
            hourly: 'temperature_2m,weather_code,precipitation_probability',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
            timezone: location.timezone || 'auto',
            forecast_days: 7
        });

        const response = await fetch(`${WEATHER_API}?${params}`);

        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        displayWeatherData(data, location);

        // Fetch news for the location after weather is displayed
        fetchNewsData(location);
    } catch (error) {
        showError('Failed to fetch weather data. Please try again.');
    }
}

// Display weather data
function displayWeatherData(data, location) {
    hideLoading();
    hideError();

    const { current, daily } = data;

    // Update location info
    const locationText = location.country
        ? `${location.name}, ${location.country}`
        : location.name;
    elements.cityName.textContent = locationText;
    elements.dateTime.textContent = formatDateTime(new Date());

    // Update current weather
    const weatherInfo = getWeatherInfo(current.weather_code);
    elements.currentWeatherIcon.textContent = weatherInfo.icon;
    elements.currentTemp.textContent = Math.round(current.temperature_2m);
    elements.weatherDescription.textContent = weatherInfo.description;

    // Update weather details
    elements.humidity.textContent = `${current.relative_humidity_2m}%`;
    elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    elements.feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
    elements.uvIndex.textContent = current.uv_index !== undefined
        ? Math.round(current.uv_index)
        : '--';

    // Update sunrise/sunset
    if (daily.sunrise && daily.sunrise[0]) {
        elements.sunrise.textContent = formatTime(new Date(daily.sunrise[0]));
    }
    if (daily.sunset && daily.sunset[0]) {
        elements.sunset.textContent = formatTime(new Date(daily.sunset[0]));
    }

    // Update temperature range
    if (daily.temperature_2m_max && daily.temperature_2m_min) {
        const maxTemp = Math.round(daily.temperature_2m_max[0]);
        const minTemp = Math.round(daily.temperature_2m_min[0]);
        elements.maxTemp.textContent = `${maxTemp}°C`;
        elements.minTemp.textContent = `${minTemp}°C`;

        // Calculate fill percentage based on current temp
        const currentTemp = Math.round(current.temperature_2m);
        const range = maxTemp - minTemp;
        const percentage = range > 0
            ? Math.min(100, Math.max(0, ((currentTemp - minTemp) / range) * 100))
            : 50;
        elements.tempRangeFill.style.width = `${percentage}%`;
    }

    // Update hourly forecast
    if (data.hourly) {
        updateHourlyForecast(data.hourly);
    }

    // Update 7-day forecast
    updateForecast(daily);

    // Show weather display
    elements.weatherDisplay.classList.remove('hidden');
}

// Fetch news data for location
async function fetchNewsData(location) {
    // Update news location text
    const locationName = location.country
        ? `${location.name}, ${location.country}`
        : location.name;
    elements.newsLocation.textContent = locationName;

    // Show loading
    showNewsLoading();

    // Check if API key is set
    if (GNEWS_API_KEY === 'YOUR_GNEWS_API_KEY') {
        // Display sample news if no API key
        displaySampleNews(location);
        return;
    }

    try {
        // Search for news about the city/country
        const searchQuery = location.name;
        const params = new URLSearchParams({
            q: searchQuery,
            lang: 'en',
            country: location.countryCode?.toLowerCase() || 'us',
            max: 6,
            apikey: GNEWS_API_KEY
        });

        const response = await fetch(`${GNEWS_API}?${params}`);

        if (!response.ok) {
            throw new Error('Failed to fetch news');
        }

        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            // If no news about specific city, try country
            await fetchCountryNews(location);
        }
    } catch (error) {
        console.error('News fetch error:', error);
        // Display sample news on error
        displaySampleNews(location);
    }
}

// Fetch country-level news as fallback
async function fetchCountryNews(location) {
    try {
        const params = new URLSearchParams({
            q: location.country || 'world news',
            lang: 'en',
            max: 6,
            apikey: GNEWS_API_KEY
        });

        const response = await fetch(`${GNEWS_API}?${params}`);

        if (!response.ok) {
            throw new Error('Failed to fetch country news');
        }

        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            displaySampleNews(location);
        }
    } catch (error) {
        displaySampleNews(location);
    }
}

// Display news articles
function displayNews(articles) {
    hideNewsLoading();
    elements.newsError.classList.add('hidden');
    elements.newsGrid.innerHTML = '';

    articles.forEach((article, index) => {
        const card = createNewsCard(article, index);
        elements.newsGrid.appendChild(card);
    });
}

// Display sample news when API is not available
function displaySampleNews(location) {
    hideNewsLoading();
    elements.newsError.classList.add('hidden');

    const locationName = location.name || 'Local';
    const countryName = location.country || 'World';
    const searchQuery = encodeURIComponent(locationName);

    // Sample news articles with real links to news sources
    const sampleArticles = [
        {
            title: `Latest News from ${locationName}`,
            description: `Read the latest headlines and breaking news stories from ${locationName}. Stay informed with up-to-date coverage.`,
            source: { name: 'Google News' },
            publishedAt: new Date().toISOString(),
            url: `https://news.google.com/search?q=${searchQuery}&hl=en`,
            image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=200&fit=crop'
        },
        {
            title: `Weather & Climate News for ${locationName}`,
            description: `Check current weather conditions, forecasts, and climate news for ${locationName} region.`,
            source: { name: 'Weather.com' },
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            url: `https://weather.com/weather/today/l/${location.lat},${location.lon}`,
            image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=200&fit=crop'
        },
        {
            title: `Travel & Tourism: Visit ${countryName}`,
            description: `Discover top attractions, travel guides, and tourism information for ${countryName}.`,
            source: { name: 'Lonely Planet' },
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            url: `https://www.google.com/search?q=${encodeURIComponent(countryName + ' travel guide')}`,
            image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop'
        },
        {
            title: `${countryName} - BBC News Coverage`,
            description: `International news coverage and in-depth reports about ${countryName} from BBC World.`,
            source: { name: 'BBC News' },
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            url: `https://www.bbc.com/search?q=${searchQuery}`,
            image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'
        },
        {
            title: `${locationName} on Wikipedia`,
            description: `Learn about the history, culture, geography, and interesting facts about ${locationName}.`,
            source: { name: 'Wikipedia' },
            publishedAt: new Date(Date.now() - 21600000).toISOString(),
            url: `https://en.wikipedia.org/wiki/${searchQuery}`,
            image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=200&fit=crop'
        },
        {
            title: `Explore ${locationName} on Maps`,
            description: `View satellite imagery, street maps, and explore ${locationName} virtually.`,
            source: { name: 'Google Maps' },
            publishedAt: new Date(Date.now() - 28800000).toISOString(),
            url: `https://www.google.com/maps/search/${searchQuery}`,
            image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop'
        }
    ];

    displayNews(sampleArticles);
}

// Create a news card element
function createNewsCard(article, index) {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const imageHtml = article.image
        ? `<img class="news-card-image" src="${article.image}" alt="${escapeHtml(article.title)}" loading="lazy" onerror="this.outerHTML='<div class=\\'news-card-image placeholder\\'>📰</div>'">`
        : `<div class="news-card-image placeholder">📰</div>`;

    const publishedDate = formatNewsDate(article.publishedAt);

    card.innerHTML = `
        ${imageHtml}
        <div class="news-card-content">
            <span class="news-card-source">${escapeHtml(article.source?.name || 'News')}</span>
            <h4 class="news-card-title">${escapeHtml(article.title)}</h4>
            <p class="news-card-description">${escapeHtml(article.description || '')}</p>
            <div class="news-card-footer">
                <span class="news-card-date">${publishedDate}</span>
                <a href="${article.url}" target="_blank" rel="noopener" class="news-card-link">
                    Read More
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </a>
            </div>
        </div>
    `;

    return card;
}

// Format news date
function formatNewsDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
        return 'Just now';
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else {
        const diffDays = Math.floor(diffHours / 24);
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show news loading state
function showNewsLoading() {
    elements.newsLoading.classList.remove('hidden');
    elements.newsGrid.innerHTML = '';
    elements.newsError.classList.add('hidden');
}

// Hide news loading state
function hideNewsLoading() {
    elements.newsLoading.classList.add('hidden');
}

// Update hourly forecast cards
function updateHourlyForecast(hourly) {
    elements.hourlyGrid.innerHTML = '';

    const currentHour = new Date().getHours();
    const now = new Date();

    // Find the index of the current hour in the hourly data
    let startIndex = 0;
    for (let i = 0; i < hourly.time.length; i++) {
        const hourTime = new Date(hourly.time[i]);
        if (hourTime >= now) {
            startIndex = i;
            break;
        }
    }

    // Display next 24 hours
    const hoursToShow = 24;
    for (let i = 0; i < hoursToShow && (startIndex + i) < hourly.time.length; i++) {
        const index = startIndex + i;
        const time = new Date(hourly.time[index]);
        const hour = time.getHours();
        const weatherInfo = getWeatherInfo(hourly.weather_code[index]);
        const temp = Math.round(hourly.temperature_2m[index]);
        const precipitation = hourly.precipitation_probability ? hourly.precipitation_probability[index] : null;

        // Format time
        let timeLabel;
        if (i === 0) {
            timeLabel = 'Now';
        } else {
            timeLabel = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        }

        const card = document.createElement('div');
        card.className = `hourly-card${i === 0 ? ' current' : ''}`;

        let precipHtml = '';
        if (precipitation !== null && precipitation > 0) {
            precipHtml = `<div class="hourly-detail">💧 ${precipitation}%</div>`;
        }

        card.innerHTML = `
            <div class="hourly-time">${timeLabel}</div>
            <div class="hourly-icon">${weatherInfo.icon}</div>
            <div class="hourly-temp">${temp}°</div>
            ${precipHtml}
        `;

        elements.hourlyGrid.appendChild(card);
    }
}

// Update forecast cards
function updateForecast(daily) {
    elements.forecastGrid.innerHTML = '';

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : days[date.getDay()];
        const weatherInfo = getWeatherInfo(daily.weather_code[i]);
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.style.animationDelay = `${i * 0.1}s`;
        card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${weatherInfo.icon}</div>
            <div class="forecast-temps">
                <span class="forecast-high">${maxTemp}°</span>
                <span class="forecast-low">${minTemp}°</span>
            </div>
        `;

        elements.forecastGrid.appendChild(card);
    }
}

// Get weather info from code
function getWeatherInfo(code) {
    return weatherCodes[code] || { icon: '🌡️', description: 'Unknown' };
}

// Format date and time
function formatDateTime(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Format time only
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Show loading state
function showLoading() {
    elements.weatherDisplay.classList.add('hidden');
    elements.errorState.classList.add('hidden');
    elements.loadingState.classList.remove('hidden');
}

// Hide loading state
function hideLoading() {
    elements.loadingState.classList.add('hidden');
}

// Show error state
function showError(message) {
    hideLoading();
    elements.weatherDisplay.classList.add('hidden');
    elements.errorMessage.textContent = message;
    elements.errorState.classList.remove('hidden');
}

// Hide error state
function hideError() {
    elements.errorState.classList.add('hidden');
}

// Handle retry
function handleRetry() {
    if (lastSearchQuery) {
        searchCity(lastSearchQuery);
    } else {
        getUserLocation();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

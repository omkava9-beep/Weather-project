const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantLocationContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingContainer = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorContainer = document.querySelector(".error-container"); // Added for error handling

const grantAccessButton = document.querySelector("[data-grantAccess]");

const searchInput = document.querySelector("[data-searchInput]");

const cityName = document.querySelector('[data-cityName]');
const countryIcon = document.querySelector('[data-countyIcon]');
const desc = document.querySelector('[data-weatherDescription]');
const weatherIcon = document.querySelector('[data-weatherIcon]');
const temp = document.querySelector('[data-temprature]');
const windSpeed = document.querySelector('[data-windSpeed]');
const humidity = document.querySelector('[data-humidity]');
const clouds = document.querySelector('[data-cloudiness]');
const errorText = document.querySelector('[data-errorText]'); // Added for error handling


let oldtab = userTab;
const API_KEY = 'f48ef41d075a116bca503375a2251931';
oldtab.classList.add("current-tab");

getFromSesstionStorage(); // Check for coordinates on page load


userTab.addEventListener('click', () => {
    switchUserTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchUserTab(searchTab);
});

grantAccessButton.addEventListener("click", getLocation);

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let city = searchInput.value;

    if (city === "") return;
    
    fetchSearchWeatherInfo(city);
});



function switchUserTab(newtab) {
    if (oldtab != newtab) {
        oldtab.classList.remove("current-tab");
        oldtab = newtab;
        oldtab.classList.add("current-tab");

        // Hide all screens
        searchForm.classList.remove('active');
        userInfoContainer.classList.remove('active');
        grantLocationContainer.classList.remove('active');
        errorContainer.classList.remove('active'); 

        if (newtab === searchTab) {
            searchForm.classList.add('active');
        } else {
            getFromSesstionStorage(); 
        }
    }
}

function getFromSesstionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantLocationContainer.classList.add('active');
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        showErrorMessage("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

function showError(error) {
    // Handle different geolocation errors
    let message = "";
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = "You denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            message = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            message = "An unknown error occurred.";
            break;
    }
    showErrorMessage(message);
    grantLocationContainer.classList.add('active'); 
}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    
    // Hide grant screen, show loader
    grantLocationContainer.classList.remove('active');
    loadingContainer.classList.add('active');
    errorContainer.classList.remove('active');

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json(); // ***FIX: Parse JSON data***

        loadingContainer.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderUserInfo(data); // ***FIX: Pass 'data' instead of 'res'***
    } catch (e) {
        loadingContainer.classList.remove('active');
        showErrorMessage(`Error: ${e.message}. Could not fetch weather.`);
    }
}

async function fetchSearchWeatherInfo(city) {
    // Hide all other screens, show loader
    loadingContainer.classList.add('active');
    userInfoContainer.classList.remove('active');
    grantLocationContainer.classList.remove('active');
    errorContainer.classList.remove('active');

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await res.json();

        if (data.cod === "404") {
            throw new Error("City not found");
        }
        
        loadingContainer.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderUserInfo(data);

    } catch (e) {
        loadingContainer.classList.remove('active');
        showErrorMessage(e.message);
    }
}

function renderUserInfo(weatherinfo) {
    // Populate all the data fields
    cityName.innerText = weatherinfo?.name;
    // ***FIX: Correct flag URL***
    countryIcon.src = `https://flagcdn.com/144x108/${weatherinfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherinfo?.weather?.[0]?.description;
    // ***FIX: Correct weather icon URL***
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherinfo?.weather?.[0]?.icon}.png`;
    
    // ***COMPLETE: Add missing data***
    temp.innerText = `${weatherinfo?.main?.temp.toFixed(1)} °C`;
    windSpeed.innerText = `${weatherinfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherinfo?.main?.humidity} %`;
    clouds.innerText = `${weatherinfo?.clouds?.all} %`;
}

// Helper function to show errors
function showErrorMessage(message) {
    errorContainer.classList.add('active');
    errorText.innerText = message;
}
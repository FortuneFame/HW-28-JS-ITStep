// Класс приложения для погоды
class WeatherApp {
    constructor() {
        this.countryCodes = {}; // Объект для хранения кодов стран
        this.weatherAPIKey = '56de716cb7070fa6cc03b976fadc36c6'; // API ключ для OpenWeatherMap
        this.init(); // Инициализация приложения
    }

    // Метод инициализации приложения
    async init() {
        try {
            await this.fetchCountryCodes(); // Получение кодов стран
            this.bindEventListeners(); // Привязка обработчиков событий
        } catch (error) {
            alert('Произошла ошибка! ERROR'); // В случае ошибки выводим сообщение пользователю
        }
    }

    // Метод для получения кодов стран
    async fetchCountryCodes() {
        const response = await fetch('countryCodes.json'); // Запрос к файлу с кодами стран
        const data = await response.json(); // Получение данных в формате JSON
        for (let item of data) {
            this.countryCodes[item.value] = item.text; // Сохранение кодов стран в объекте
        }
    }

    // Метод для привязки обработчиков событий
    bindEventListeners() {
        // Обработчик события нажатия на кнопку "Получить погоду"
        document.getElementById('get-weather-btn').addEventListener('click', async () => {
            document.getElementById('current-weather').style.display = 'none'; // Скрытие текущей погоды
            document.getElementById('forecast').style.display = 'none'; // Скрытие прогноз погоды

            const cityInput = document.getElementById('city-input');
            const city = cityInput.value.trim();
            if (!city || !/^[\p{L} \-', ]+$/u.test(city)) {
                alert('Пожалуйста, введите правильное название города.');
                return;
            }

            document.getElementById('loader').style.display = 'block'; // Отображение загрузчика
            await this.getWeather(city); // Получение погоды
            document.getElementById('loader').style.display = 'none'; // Скрытие загрузчика
        });

        // Обработчик события нажатия на кнопку "Получить погоду по местоположению"
        document.getElementById('get-weather-by-location-btn').addEventListener('click', async () => {
            const successCallback = async (position) => {
                try {
                    const { latitude: lat, longitude: lon } = position.coords; // Получение координат местоположения
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.weatherAPIKey}&units=metric&lang=ru`
                    ); // Запрос к API для получения погоды по координатам
                    const data = await response.json(); // Получение данных в формате JSON
                    const cityName = `${data.name}, ${this.countryCodes[data.sys.country]}`; // Формирование строки с названием города и страны
                    document.getElementById('city-input').value = cityName; // Установка значения в поле ввода города
                    await this.getWeather(cityName); // Получение погоды
                    document.getElementById('loader').style.display = 'none'; // Скрытие загрузчика
                } catch (error) {
                    alert('Произошла ошибка при получении погоды по местоположению.'); // В случае ошибки выводим сообщение пользователю
                    document.getElementById('loader').style.display = 'none'; // Скрытие загрузчика
                }
            };

            const errorCallback = (error) => {
                alert('Не удалось получить местоположение. Пожалуйста, введите город вручную.'); // В случае ошибки выводим сообщение пользователю
                document.getElementById('loader').style.display = 'none'; // Скрытие загрузчика
            };

            if (navigator.geolocation) {
                document.getElementById('loader').style.display = 'block'; // Отображение загрузчика
                navigator.geolocation.getCurrentPosition(successCallback, errorCallback); // Получение текущего местоположения
            } else {
                alert('Геолокация не поддерживается этим браузером. Пожалуйста, введите город вручную.'); // В случае ошибки выводим сообщение пользователю
            }
        });

        // Обработчик события нажатия на клавишу "Enter" в поле ввода города
        document.getElementById('city-input').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                document.getElementById('get-weather-btn').click(); // Эмуляция клика по кнопке "Получить погоду"
            }
        });
    }

    // Метод для получения данных о погоде по API
    async fetchData(city) {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.weatherAPIKey}&units=metric&lang=ru`
        ); // Запрос к API для получения данных о погоде по названию города
        if (!response.ok) {
            throw new Error('Не удалось получить данные о погоде для этого города.'); // В случае ошибки выбрасываем исключение
        }
        const data = await response.json(); // Получение данных в формате JSON
        return data; // Возвращаем данные о погоде
    }

    // Метод для получения погоды и отображения на странице
    async getWeather(city) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.weatherAPIKey}&units=metric&lang=ru`
            ); // Запрос к API для получения погоды по названию города
            if (!response.ok) {
                throw new Error('Не удалось получить данные о погоде для этого города.'); // В случае ошибки выбрасываем исключение
            }
            const data = await this.fetchData(city); // Получение данных о погоде

            const countryName = this.countryCodes[data.sys.country] || data.sys.country; // Получение названия страны

            if (city.toLowerCase() === countryName.toLowerCase()) {
                alert('Название города и страны совпадают. Пожалуйста, введите действительное название города.'); // Выводим сообщение пользователю
                return;
            }

            let description = 'неизвестно';
            if (data.weather && data.weather[0]) {
                description = this.capitalizeFirstLetter(data.weather[0].description); // Форматирование описания погоды
            }

            const updateTime = new Date().toLocaleTimeString('ru-RU', {
                hour: '2-digit', minute: '2-digit'
            }); // Форматирование времени обновления
            const weatherUpdateTime = new Date(data.dt * 1000).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
            }); // Форматирование времени погоды

            document.getElementById('current-weather').innerHTML = `

                <h2>Текущая погода</h2>
                <p>Город: ${data.name}</p>
                <p>Страна: ${countryName}</p>
                <p>Время запроса: ${updateTime}</p>
                <p>
                <svg width='20' heidth='20' xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960" width="48">
                    <path d="M480 896q-133 0-226.5-93.5T160 576q0-133 93.5-226.5T480 256q85 0 149 34.5T740 385V256h60v254H546v-60h168q-38-60-97-97t-137-37q-109 0-184.5 75.5T220 576q0 109 75.5 184.5T480 836q83 0 152-47.5T728 663h62q-29 105-115 169t-195 64Z"/>
                </svg>
                Обновление:${weatherUpdateTime}
                </p>
                <p>Температура: ${Math.round(data.main.temp)} &#8451;</p>
                <img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png">
                <p>${this.capitalizeFirstLetter(data.weather[0].description)}</p>
                <p>Скорость ветра: ${(data.wind.speed * 3.6).toFixed(2)} км/ч</p>
                <p>Осадки: ${data.rain ? data.rain['1h'] : 0} мм</p>
                <p>Давление: ${data.main.pressure} мбар</p>
            `;

            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.weatherAPIKey}&units=metric&lang=ru`
            ); // Запрос к API для получения прогноза погоды по названию города
            if (!forecastResponse.ok) {
                throw new Error('Не удалось получить прогноз погоды для этого города.'); // В случае ошибки выбрасываем исключение
            }
            const forecastData = await forecastResponse.json(); // Получение данных в формате JSON
            let forecastHTML = '';

            for (let i = 0; i < 5 * 8; i += 8) {
                const forecast = forecastData.list[i]; // Получение данных прогноза на определенное время
                const date = new Date(forecast.dt * 1000); // Конвертация времени в объект Date
                const dayOfWeek = date.toLocaleDateString('ru-RU', { weekday: 'long' }); // Получение названия дня недели
                const dateString = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Получение даты в формате дд.мм.гггг
                const dailyForecast = forecastData.list.slice(i, i + 8); // Получение прогноза на один день
                const minTemp = Math.round(Math.min(...dailyForecast.map((item) => item.main.temp_min))); // Минимальная температура
                const maxTemp = Math.round(Math.max(...dailyForecast.map((item) => item.main.temp_max))); // Максимальная температура
                const icon = forecast.weather[0].icon; // Иконка погоды
                const description = this.capitalizeFirstLetter(forecast.weather[0].description); // Описание погоды

                let dayTitle = '';
                if (i === 0) {
                    dayTitle = 'Сегодня'; // Если это первый прогноз, то выводим "Сегодня"
                } else {
                    dayTitle = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1); // Иначе выводим название дня недели
                }

                forecastHTML += `
                    <div class="item">
                        <p>${dayTitle}</p>
                        <p>${dateString}</p>
                        <img class="weather-icon" src="http://openweathermap.org/img/w/${icon}.png" alt="${description}">
                        <p>${description}</p>
                        <p>от ${minTemp} °C до ${maxTemp} °C</p>
                    </div>
                    `;
            }

            document.getElementById('current-weather').style.display = 'block'; // Отображение текущей погоды
            document.getElementById('forecast').style.display = 'flex'; // Отображение прогноза погоды
            document.getElementById('forecast').innerHTML = forecastHTML; // Вывод прогноза погоды на страницу
        } catch (error) {
            alert(error.message); // Вывод ошибки пользователю
            document.getElementById('loader').style.display = 'none'; // Скрытие загрузчика
        }
    }

    // Метод для преобразования первой буквы строки в заглавную
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Создание экземпляра приложения
const weatherApp = new WeatherApp();

<template>
  <div id="app">
    <div class="weather-wrap">
      <div v-show="showedSection === 'start'">
        <div class="start_title">Weather forecast</div>
          <AddCity :city-names="cityNames"
                   v-on:added-city="addStartCity"
          >
          </AddCity>
      </div>
      <div v-show="showedSection === 'weather'">
        <div class="weather_header">
          <div>Weather forecast</div>
          <img alt="settings"
               src="./assets/settings.png"
               class="settings"
               @click="goToSection('settings')">
        </div>
        <div v-for="item in citiesInfo"
             :key="item.cityId"
             class="weather">
          <div class="weather_name">{{ item.cityName }}, {{ item.cityCountry }}</div>
          <div class="weather_main">
            <img alt="weather-icon"
                 :src="item.weatherIconSrc"
                 class="weather_icon"
            >
            <div class="weather_temperature">{{ item.temperatureValue }}{{ item.temperatureUnit }}</div>
          </div>
          <div class="weather_description">
            Feels like {{ item.feelsLikeValue }}{{ item.temperatureUnit }}.
            {{ item.cloudsName }} {{ item.windSpeedName }}
          </div>
          <div class="weather_wind_pressure">
            <div class="weather_wind">
              <img alt="direction-wind"
                   src="./assets/direction-wind.png"
                   class="direction_img"
              >
              <div>{{ item.windSpeedValue }}{{ item.windSpeedUnit }} {{ item.directionCode }}</div>
            </div>
            <div class="weather_pressure">
              <img alt="barometer"
                   src="./assets/barometer.png"
                   class="barometer_img">
              <div>{{ item.pressureValue }}{{ item.pressureUnit }}</div>
            </div>
          </div>
          <div class="weather_humidity">
            <div>Humidity: {{ item.humidityValue }}{{ item.humidityUnit }}</div>
            <div>Dew Point: {{ item.dewPoint }}{{ item.temperatureUnit }}</div>
          </div>
          <div class="weather_visibility">Visibility: {{ item.visibilityValue }}km</div>
        </div>
      </div>
      <div v-show="showedSection === 'settings'"
           class="settings">
        <div class="settings__header">
          <div>Settings</div>
          <img alt="settings"
               src="./assets/close.png"
               class="settings__close"
               @click="goToSection()"
          >
        </div>
        <draggable v-model="cityNames"
                   group="cities"
                   @end="updateCityNamesOrder"
                   handle=".settings__hamburger">
          <div v-for="(item) in cityNames"
               :key="item.id"
               class="settings__city">
            <div class="settings__cityName">
              <img alt="hamburger"
                   src="./assets/hamburger.png"
                   class="settings__hamburger">
              <div>{{ item.name }}</div>
            </div>
            <img alt="delete"
                 src="./assets/delete.png"
                 class="settings__delete"
                 @click="deleteCity(item.id)"
            >
          </div>
        </draggable>
          <AddCity :city-names="cityNames"
                   v-on:added-city="addSettingsCity"
          >
          </AddCity>
      </div>
      <p v-if="errors.length"
         v-for="error in errors"
         class="app__error">{{ error }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios, { AxiosResponse } from 'axios';
import draggable from 'vuedraggable';
import AddCity from '@/components/AddCity.vue'
import { citiesInfo, cityNames } from './types';
import { calculateDewPoint, capitalizeFirstLetter, dotToEnd } from '@/functions'

const { XMLParser } = require("fast-xml-parser");
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ''
});

const weatherDataHandle = (xmlData: string): citiesInfo => {
  let {
    current: {
      city: {
        country: cityCountry,
        id: cityId,
        name: cityName
      },
      temperature: {
        value: temperatureValue,
        unit: temperatureUnit,
      },
      feels_like: {
        value: feelsLikeValue,
        unit: feelsLikeUnit,
      },
      humidity: {
        value: humidityValue,
        unit: humidityUnit,
      },
      pressure: {
        value: pressureValue,
        unit: pressureUnit,
      },
      wind: {
        speed: {
          value: windSpeedValue,
          unit: windSpeedUnit,
          name: windSpeedName,
        },
        direction: {
          code: directionCode,
        }
      },
      clouds: {
        name: cloudsName,
      },
      visibility: {
        value: visibilityValue,
      },
      weather: {
        value: weatherValue,
        icon: weatherIcon,
      },
    }
  } = parser.parse(xmlData);

  cityId = Number(cityId)
  temperatureValue = Math.round(temperatureValue);
  temperatureUnit =
      temperatureUnit === 'celsius'
          ? '°C'
          : temperatureUnit === 'fahrenheit'
              ? '°F'
              : '°K';

  visibilityValue = visibilityValue/1000;

  cloudsName = cloudsName && capitalizeFirstLetter(dotToEnd(cloudsName));
  windSpeedName = windSpeedName && capitalizeFirstLetter(dotToEnd(windSpeedName));

  const weatherIconSrc = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
  const dewPoint = calculateDewPoint(parseInt(temperatureValue), parseInt(humidityValue)).toFixed();

  return { cityId, cityName, cityCountry, temperatureValue, temperatureUnit, feelsLikeValue, feelsLikeUnit, cloudsName, weatherValue, windSpeedName,
    windSpeedValue, windSpeedUnit, directionCode, pressureValue, pressureUnit, humidityValue, humidityUnit, dewPoint, visibilityValue, weatherIconSrc }
}

const getCitiesInfo = async (names: string[]): Promise<citiesInfo[]> => {
  try {
    if (!names.length) return [];
    const urls: string[] = names.map((item) => {
      return `https://api.openweathermap.org/data/2.5/weather?q=${item}&appid=${process.env.VUE_APP_API_KEY}&units=metric&mode=xml`;
    });
    const requests:  Promise<AxiosResponse<any, any>>[]  = urls.map(((url) => axios.get(url)));
    const responseObj:  AxiosResponse<any, any>[] = await Promise.all(requests);
    const xmlsArr: string[] = responseObj.map((response) => response.data);
    return xmlsArr.map((item: string)=> weatherDataHandle(item))
  } catch(e) {
    return [];
  }
}

export default Vue.extend({
  name: 'App',
  data: () => ({
    addedCity: '' as string,
    cityNames: [] as cityNames[],
    errors: [] as string[],
    citiesInfo: [] as citiesInfo[],
    addingCitiesInfo : [] as citiesInfo[],
    showedSection: '' as String,
    interval: 0 as number,
  }),
  mounted: async function(): Promise<void> {
    if (localStorage.getItem('cityNames')) {
      const cities: string | null = localStorage.getItem('cityNames');
      this.cityNames = cities ? JSON.parse(cities) : [];
    }

    if (this.cityNames.length ) {
      await this.updateCitiesInfo();
      this.goToSection('weather');
    } else {
      this.goToSection('start');
    }
    this.interval = setInterval(() => { this.updateCitiesInfo() }, 60000)
  },
  updated() {
    this.cityNames.length
        ? localStorage.setItem('cityNames', JSON.stringify(this.cityNames))
        : localStorage.removeItem('cityNames');
  },
  methods: {
    async addStartCity(data: string) {
      this.addedCity = data;
      await this.getWeather();
    },
    async addSettingsCity(data: string) {
      this.addedCity = data;
      await this.addCity();
    },
    async getWeather(event?: Event): Promise<void> {
      event && event.preventDefault();
      const route = (): void => { this.goToSection('weather'); }
      await this.addCity(route);
    },
    async addCity(cb?: () => void): Promise<void> {
      if (!this.addedCity) return;

      this.addingCitiesInfo = await getCitiesInfo([this.addedCity])

      this.errors.length = 0;
      if (!this.addingCitiesInfo.length) {
        this.errors.push('Error getting data');
        return;
      }

      this.cityNames.push({
        id: Number(this.addingCitiesInfo[0].cityId),
        name: this.addedCity
      });
      this.addedCity = '';
      this.addingCitiesInfo = [];

      await this.updateCitiesInfo();

      if (typeof cb  == 'function') cb();
    },
    goToSection(name: string | null): void {
      this.showedSection = name ? name
                                : this.cityNames.length
                                  ? 'weather'
                                  : 'start';
    },
    updateCityNamesOrder(): void {
      this.cityNames = [...this.cityNames];

      let clone = [...this.citiesInfo];
      this.citiesInfo.length = 0;
      for (let i in this.cityNames) {
        let record: citiesInfo | undefined = clone.find((item) => item.cityId === this.cityNames[i].id);
        record && this.citiesInfo.push(record);
      }
    },
    async updateCitiesInfo(): Promise<void> {
      this.addingCitiesInfo.length
        ? this.citiesInfo.push(this.addingCitiesInfo[0])
        : this.citiesInfo = await getCitiesInfo(this.cityNames.map((i => i.name)));
    },
    async deleteCity(id: number): Promise<void> {
      this.cityNames = this.cityNames.filter((item)=> item.id != id);
      await this.updateCitiesInfo();
    },
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  components: {
    AddCity,
    draggable,
  },
});
</script>

<style lang="scss">
#app {
  max-width: 280px;
  display: inline-block;
}

.app__error {
  color: red;
}

.weather-wrap {
  border: lightgrey solid 1px;
  width: 280px;
  max-height: 670px;
  overflow: auto;
  padding: 16px;
  box-sizing: border-box;
}

.city-input {
  &__input {
    margin-top: 15px;
    display: inline-block;
    outline: none;
    height: 20px;
    padding: 5px 10px;
    font-family: inherit;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    background-color: #e8e8e8;
    background-clip: padding-box;
    border: 1px solid #bdbdbd;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  &__input::placeholder {
    color: grey;
  }

  &__button {
    padding: 10px;
    margin-top: 15px;
  }
}

.weather {
  & > div {
    margin-bottom: 16px;
  }

  & > div.weather_name {
    margin-bottom: 0;
  }

  &_header {
    display: flex;
    justify-content:space-between;
    font-weight: 600;
    margin-bottom: 15px;

    .settings {
      width: 25px;
      height: 20px
    }
  }

  &_main {
    display: flex;
    justify-content:space-around;
    align-items: center;
  }

  &_icon {
    width: 100px;
    height: 100px
  }

  &_temperature {
    font-size: 32px;
  }

  &_wind_pressure {
    display: flex;
    justify-content:space-around;
    align-items: center;

    .weather_wind, .weather_pressure {
      display: flex;
      align-items: center;
    }

    .direction_img {
      width: 15px;
      height: 20px;
      transform: rotate(320deg);
      margin-right: 12px;
    }

    .barometer_img {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
  }

  &_humidity {
    display: flex;
    justify-content:space-around;
  }

  &_visibility {
    text-align: center;
  }
}

.settings {
  &__header {
    display: flex;
    justify-content:space-between;
    font-weight: 600;
  }

  &__close {
    width: 20px;
    height: 20px;
  }

  &__cityName {
    display: flex;
    align-content: space-between;
    align-items: center;
  }

  &__hamburger {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  &__delete {
    width: 20px;
    height: 20px;
  }

  &__city {
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    outline: none;
    height: 20px;
    padding: 5px 10px;
    font-family: inherit;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    background-color: #e8e8e8;
    background-clip: padding-box;
    border: 1px solid #bdbdbd;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
}

.start_title {
  font-weight: 600;
}
</style>

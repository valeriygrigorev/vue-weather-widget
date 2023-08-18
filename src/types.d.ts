
interface citiesInfo {
    cityCountry: string,
    cityId: number,
    cityName: string,
    cloudsName: string,
    dewPoint: string,
    directionCode: string,
    feelsLikeUnit: string
    feelsLikeValue: string,
    humidityUnit: string,
    humidityValue: string,
    pressureUnit: string,
    pressureValue: string,
    temperatureUnit: string,
    temperatureValue: string,
    visibilityValue: string,
    weatherIconSrc: string
    weatherValue: string,
    windSpeedName: string,
    windSpeedUnit: string,
    windSpeedValue: string,
}

interface cityNames {
    id: number,
    name: string
}

export { citiesInfo, cityNames }

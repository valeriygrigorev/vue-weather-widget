# vue-weather-widget

## О виджете
 Веб-компонент для добавления виджета погоды на любую страницу. Выполнен в качестве тестового задания, текст которого находится в репозитории, в файле "Test task for Frontend developer Vue.docx". 

## Как использовать
Создать на https://openweathermap.org/ apiKey. Переименовать файл .env_example в .env и вписать для ключа VUE_APP_API_KEY полученный apiKey.

Собрать скрипт командой
``` 
vue-cli-service build --target wc --name weather-widget "./src/App.vue" --inline-vue
```
если на странице, на которую будет добавляться виджет, отсутствует пакет Vue как глобальная переменная,
либо
``` 
vue-cli-service build --target wc --name weather-widget "./src/App.vue"
```
если на странице Vue имеется. Работает с Vue 2.

Из созданной после сборки папки dist скрипт виджета перенести в папку publiс ресурса на сервере, с которого в последующем скрипт будет загружаться сторонними страницами.

 На сторонней странице добавляем в html следующие строки
```
<weather-widget />
<script type="text/javascript" src="{URL to the app}"></script>
```
, где URL to the app - ссылка на скрипт виджета.

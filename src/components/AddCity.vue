<template>
  <div class="location">
    <div>Add location:</div>
    <div class="location__edit">
      <input class="location__input"
             v-model="addedCity"
             name="addedCity"
             autocomplete="off"
             placeholder="City, CC"
      >
      <button class="location__button">
        <img src="../assets/enter.png"
             alt="Add city"
             class="location__add"
             @click="addName"
        >
      </button>
    </div>
    <p v-if="errors.length"
       v-for="error in errors"
       class="location__error">{{ error }}
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'AddCityInput',
    props: {
      cityNames: {
        type: Array,
        required: true,
      },
    },

  data: () => ({
    addedCity: '' as string,
    errors: [] as string[],
  }),
  methods: {
    addName(): void {
      this.errors.length = 0;
      if (!this.addedCity) {
        this.errors.push('Enter the name of the city');
        return
      }

      if (!/^[A-Z].*/.test(this.addedCity)) {
        this.errors.push('City name must start with a capital letter');
        return
      }

      if (!/^[a-zA-Z\-]+, [A-Z]{2}$/.test(this.addedCity)) {
        this.errors.push('Required format: City name, Country code');
        return
      }

      const double = this.cityNames.length
            ? this.cityNames.find((item: any) => item.name.toLowerCase() === this.addedCity.toLowerCase())
            : null

      if (double) {
        this.errors.push('Names added earlier');
        return;
      }
      this.$emit('added-city', this.addedCity)
      this.addedCity = '';
    },
  }
});
</script>

<style lang="scss">
.location {
  margin-top: 16px;

  &__label {
    margin-top: 16px;
    font-weight: 600;
  }

  &__edit {
    margin-top: 8px;
    display: flex;
    align-items: center;

  }

  &__error {
    color: red;
  }

  &__input {
    width: 100%;
    display: inline-block;
    height: 20px;
    border: aqua solid 1px;
    border-radius: 4px;
    outline: none;
    padding: 5px;
  }

  &__button {
    background-color: #fff;
    border: none;
    padding: 0;
    margin: 0;
  }

  &__add {
    width: 30px;
    height: 30px;
    background-color: #fff;
    border-width: 0;
  }
}
</style>
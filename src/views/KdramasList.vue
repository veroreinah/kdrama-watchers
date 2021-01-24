<template>
  <div>List {{ list }}</div>
</template>

<script>
export default {
  name: 'KdramasList',
  props: [
    'list',
  ],
  watch: {
    list(value) {
      console.log('KdramasList', value);
    },
  },
  created() {
    console.log('KdramasList', this.list);
  }
}
</script>

<style>

</style>
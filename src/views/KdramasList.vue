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
      console.log(value);
    },
  },
  created() {
    console.log(this.list);
  }
}
</script>

<style>

</style>
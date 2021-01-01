import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#6A76AB", // Blue yonder
        secondary: "#B17EB9", // African violet
        accent: "#F186AC", // Tickle me pink
        error: '#EE6352', // Fire opal
        info: '#08B2E3', // Cyan process
        success: '#57A773', // Forest green Crayola
        warning: '#FA824C', // Mandarin
      },
    },
  },
});

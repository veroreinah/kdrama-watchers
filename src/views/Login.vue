<template>
  <div class="pt-2">
    <form @submit.prevent="doLogin">
      <v-card>
        <v-toolbar color="secondary" dark>Login</v-toolbar>
        <v-card-text>
          <v-alert v-if="error" dense type="error">
            {{ error }}
          </v-alert>

          <v-text-field
            v-model="loginForm.email"
            label="E-mail"
            type="email"
            required
          ></v-text-field>

          <v-text-field
            v-model="loginForm.password"
            label="Contraseña"
            type="password"
            required
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            depressed
            tile
            color="secondary"
            :loading="loading"
            type="submit"
            >Acceder</v-btn
          >
        </v-card-actions>
      </v-card>
    </form>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "Login",
  data: () => ({
    loading: false,
    loginForm: {
      email: "",
      password: "",
    },
    error: "",
  }),
  computed: {
    ...mapState(["user"]),
  },
  watch: {
    $route() {
      this.checkLogin();
    },
  },
  methods: {
    ...mapActions(["login"]),
    doLogin() {
      if (this.loginForm.email && this.loginForm.password) {
        this.loading = true;
        this.error = "";

        this.login(this.loginForm)
          .then(() => {
            this.reset();

            if (localStorage.getItem("redirectAfterLogin")) {
              const toRedirect = localStorage.getItem("redirectAfterLogin");
              localStorage.removeItem("redirectAfterLogin");
              this.$router.push(toRedirect);
            } else {
              this.$router.push({ name: "Home" });
            }
          })
          .catch((error) => {
            this.error = error.message;

            console.error(error);
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    reset() {
      this.loginForm = {
        email: "",
        password: "",
      };
      this.error = "";
    },
  },
};
</script>

import mobileBg from "@/assets/img/header-bg-mobile.jpg";
import desktopBg from "@/assets/img/header-bg-desktop.jpg";

export const tools = {
  data: () => ({
    mobileBg,
    desktopBg,
    availableLists: [
      {
        route: "/lists/wishlist",
        icon: "mdi-heart-plus",
        label: "Lista de deseos",
        action: "wishlist",
        sortField: "dateAdd",
        year: "Añadidos en los años...",
      },
      {
        route: "/lists/currently-watching",
        icon: "mdi-eye-plus",
        label: "Viendo",
        action: "currently-watching",
        sortField: "dateStart",
        color: "info",
        emoji: "🤓",
        value: 1,
        actionInLists: ["wishlist"],
        year: "Empezados en los años...",
      },
      {
        route: "/lists/already-watched",
        icon: "mdi-eye-check",
        label: "Vistos",
        action: "already-watched",
        sortField: "dateEnd",
        color: "secondary",
        emoji: "🥰",
        value: 2,
        actionInLists: ["wishlist", "currently-watching"],
        year: "Vistos en los años...",
      },
      {
        route: "/lists/abandoned",
        icon: "mdi-heart-off",
        label: "Abandonados",
        action: "abandoned",
        sortField: "dateEnd",
        color: "error",
        emoji: "🤮",
        value: 3,
        actionInLists: ["wishlist", "currently-watching"],
        year: "Abandonados en los años...",
      },
      {
        route: false,
        icon: "mdi-eye-refresh",
        label: "Viendo otra vez",
        action: "re-watching",
        sortField: "dateStart",
        color: "info",
        emoji: "🤓",
        value: 4,
        actionInLists: ["already-watched", "abandoned"],
      },
    ],
  }),
  methods: {
    formatDate(date) {
      if (typeof date === "string") {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
      } else if (typeof date === "object") {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day < 10 ? `0${day}` : day}/${
          month < 10 ? `0${month}` : month
        }/${year}`;
      }
    },
    parseDate(date) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${year}-${month < 10 ? `0${month}` : month}-${
        day < 10 ? `0${day}` : day
      }`;
    },
    getDateTime(date) {
      const kdramaDate = new Date(date);
      return `${this.formatDate(kdramaDate)}
        ${kdramaDate.toLocaleTimeString()}`;
    },
    getFormattedText(text) {
      return text.replaceAll("[[", "<strong>").replaceAll("]]", "</strong>");
    },
    getListProp(action, field) {
      const list = this.availableLists.find((a) => a.action === action);
      if (list) {
        return list[field];
      }
    },
  },
};

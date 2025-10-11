import "./assets/main.css";

import { createApp, reactive } from "vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import router from "./router/index";
import "./assets/css/theme.css";
// ✅ Tạo app trước
const app = createApp(App);

// ✅ Sử dụng router và mount
app.use(router).mount("#app");

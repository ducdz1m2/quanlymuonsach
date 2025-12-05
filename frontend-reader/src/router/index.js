import { createWebHistory, createRouter } from "vue-router";

// Import các view
import Home from "../views/Home.vue";
import Books from "../views/Book.vue";
import Login from "../views/Login.vue";
import NotFound from "../views/NotFound.vue";
import Register from "@/views/Register.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  {
    path: "/books",
    name: "books",
    component: Books,
    meta: { requiresAuth: true },
  },

  {
    path: "/login",
    name: "reader-login",
    component: Login,
  },
  {
    path: "/register",
    name: "reader-register",
    component: Register,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("readerToken");
  const readerInfo = JSON.parse(localStorage.getItem("readerInfo") || "{}");
  const role = readerInfo.chucVu;
  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: "reader-login" });
  }

  if (to.name === "reader-login" && isAuthenticated) {
    return next({ name: "home" });
  }

  if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(role)) {
    alert("🚫 Bạn không có quyền truy cập trang này!");
    return next({ name: "home" });
  }

  next();
});

export default router;

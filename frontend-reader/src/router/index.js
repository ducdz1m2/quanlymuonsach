import { createWebHistory, createRouter } from "vue-router";

// Import các view
import Home from "../views/Home.vue";
import Books from "../views/Book.vue";
import Notifications from "../views/Notification.vue";
import Login from "../views/Login.vue";
import NotFound from "../views/NotFound.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  {
    path: "/books",
    name: "books",
    component: Books,
    meta: { requiresAuth: true }, // chỉ cho người đăng nhập xem
  },
  {
    path: "/notifications",
    name: "notifications",
    component: Notifications,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "reader-login",
    component: Login,
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

// ✅ Middleware kiểm tra đăng nhập & phân quyền (giữ nguyên logic bạn có)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("readerToken");
  const readerInfo = JSON.parse(localStorage.getItem("readerInfo") || "{}");
  const role = readerInfo.chucVu; // nếu có phân quyền
  const isAuthenticated = !!token;

  // Chưa đăng nhập mà vào trang yêu cầu login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: "reader-login" });
  }

  // Đã đăng nhập mà vào login lại
  if (to.name === "reader-login" && isAuthenticated) {
    return next({ name: "home" });
  }

  // Không đủ quyền
  if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(role)) {
    alert("🚫 Bạn không có quyền truy cập trang này!");
    return next({ name: "home" });
  }

  next();
});

export default router;

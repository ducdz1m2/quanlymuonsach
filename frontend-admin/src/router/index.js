import { createWebHistory, createRouter } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import NotFound from "@/views/NotFound.vue";
import Book from "@/views/Book.vue";
import Staff from "@/views/Staff.vue";
import Publisher from "@/views/Publisher.vue";
import Reader from "@/views/Reader.vue";
import Borrow from "@/views/Borrow.vue";
import StaffLogin from "@/views/StaffLogin.vue";

const routes = [
  {
    path: "/staff/login",
    name: "staff-login",
    component: StaffLogin,
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    name: "dashboard",
    component: Dashboard,
    meta: {
      requiresAuth: true,
      allowedRoles: ["Admin", "Thủ thư"],
    },
  },
  {
    path: "/books",
    name: "books",
    component: Book,
    meta: {
      requiresAuth: true,
      allowedRoles: ["Admin", "Thủ thư"],
    },
  },
  {
    path: "/staffs",
    name: "staffs",
    component: Staff,
    meta: {
      requiresAuth: true,
      allowedRoles: ["Admin", "Quản lý nhân sự"],
    },
  },
  {
    path: "/publishers",
    name: "publishers",
    component: Publisher,
    meta: {
      requiresAuth: true,
      allowedRoles: ["Admin", "Thủ thư"],
    },
  },
  {
    path: "/readers",
    name: "readers",
    component: Reader,
    meta: {
      requiresAuth: true,
      allowedRoles: ["Admin", "Thủ thư"],
    },
  },
  {
    path: "/borrows",
    name: "borrows",
    component: Borrow,
    meta: {
      requiresAuth: true,
      allowedRoles: ["Admin", "Thủ thư", "Nhân viên kiểm duyệt"],
    },
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
  const token = localStorage.getItem("staffToken");
  const staffInfo = JSON.parse(localStorage.getItem("staffInfo") || "{}");
  const role = staffInfo.chucVu;
  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: "staff-login" });
  }

  if (to.name === "staff-login" && isAuthenticated) {
    return next({ name: "dashboard" });
  }

  if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(role)) {
    alert("🚫 Bạn không có quyền truy cập trang này!");
    return next({ name: "dashboard" });
  }

  next();
});

export default router;

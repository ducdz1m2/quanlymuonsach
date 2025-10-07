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
    meta: { requiresAuth: true },
  },
  {
    path: "/books",
    children: [
      {
        path: "",
        name: "books",
        component: Book,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/staffs",
    children: [
      {
        path: "",
        name: "staffs",
        component: Staff,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/publishers",
    children: [
      {
        path: "",
        name: "publishers",
        component: Publisher,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/readers",
    children: [
      {
        path: "",
        name: "readers",
        component: Reader,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/borrows",
    children: [
      {
        path: "",
        name: "borrows",
        component: Borrow,
        meta: { requiresAuth: true },
      },
    ],
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

// ✅ Kiểm tra đăng nhập trước khi truy cập
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("staffToken");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "staff-login" });
  } else if (to.name === "staff-login" && isAuthenticated) {
    next({ name: "dashboard" });
  } else {
    next();
  }
});

export default router;

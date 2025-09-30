import { createWebHistory, createRouter } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import NotFound from "@/views/NotFound.vue";
import Book from "@/views/Book.vue";
import Staff from "@/views/Staff.vue";
import Publisher from "@/views/Publisher.vue";
import Reader from "@/views/Reader.vue";
const routes = [
  {
    path: "/",
    name: "dashboard",
    component: Dashboard,
  },
  {
    path: "/books",
    children: [
      {
        path: "",
        name: "books",
        component: Book,
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

export default router;

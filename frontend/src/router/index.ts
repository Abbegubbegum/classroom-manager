import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/:roomCode/teacher",
      name: "RoomAdmin",
      meta: {
        requiresAuth: true,
        teacher: true,
      },
      component: () => import("../views/RoomAdminView.vue"),
    },
    {
      path: "/:roomCode/student",
      name: "RoomMember",
      meta: {
        requiresAuth: true,
        student: true,
      },
      component: () => import("../views/RoomMemberView.vue"),
    },
  ],
});

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem("auth_token");

    console.log("TOKEN: " + token);

    if (!token) {
      router.push("/");
      return;
    }

    const params = new URLSearchParams();
    params.set("code", to.params.roomCode as string);

    const headers = new Headers();
    headers.set("Authorization", "Bearer " + token);

    const res = await fetch("http://localhost:8080/rooms/status/?" + params, {
      headers,
    });

    if (!res.ok) {
      router.push("/");
      return;
    }

    const data = await res.json();

    if (data.level === "teacher") {
      if (!to.meta.teacher) {
        router.push(`${to.params.roomCode}/teacher`);
      }
    } else if (data.level === "student") {
      if (!to.meta.student) {
        router.push(`${to.params.roomCode}/student`);
      }
    }
  }
});

export default router;

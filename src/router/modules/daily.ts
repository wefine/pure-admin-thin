import { $t } from "@/plugins/i18n";

export default {
  path: "/daily-management",
  redirect: "/daily-management/task-list",
  meta: {
    icon: "ep:calendar",
    title: $t("menus.dailyManagement"),
    rank: 10
  },
  children: [
    {
      path: "/daily-management/task-list",
      name: "DailyManagementList",
      component: () => import("@/views/daily/task/tasklist/index.vue"),
      meta: {
        icon: "ri:list-check",
        title: $t("menus.dailyTaskList")
      }
    },
    {
      path: "/daily-management/task-edit",
      name: "DailyManagementEdit",
      component: () => import("@/views/daily/task/taskedit/index.vue"),
      meta: {
        icon: "ep:edit",
        title: $t("menus.dailyTaskEdit")
      }
    }
  ]
} satisfies RouteConfigsTable;

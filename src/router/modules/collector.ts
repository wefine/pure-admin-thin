import { $t } from "@/plugins/i18n";
import AntDesignBugTwotone from "~icons/ant-design/bug-twotone";

export default {
  path: "/collector-management",
  meta: {
    icon: AntDesignBugTwotone,
    title: $t("menus.collectorManagement"),
    rank: 10
  },
  children: [
    {
      path: "/collector-management/parser-list",
      name: "CollectorParserList",
      component: () => import("@/views/collector/parserlist/index.vue"),
      meta: {
        icon: "ri:list-check",
        title: $t("menus.collectorParserList"),
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;

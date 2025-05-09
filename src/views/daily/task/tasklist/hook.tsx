import { message } from "@/utils/message";
import dailyApi from "@/api/daily";
import { ref, reactive, onMounted, toRaw } from "vue";
import { createDefaultPagination, executePageQuery } from "@/utils/pagination";

export function useRole() {
  const form = reactive({
    task_name: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  // 使用分页工具函数创建默认分页配置
  const pagination = createDefaultPagination();
  const columns: TableColumnList = [
    {
      label: "任务名称",
      prop: "task_name",
      minWidth: 100
    },
    {
      label: "任务编码",
      prop: "task_code",
      minWidth: 100
    },
    {
      label: "采集时间",
      prop: "collect_cron",
      minWidth: 100
    },
    {
      label: "推送时间",
      prop: "push_cron",
      minWidth: 100
    },
    {
      label: "操作",
      fixed: "right",
      slot: "operation"
    }
  ];

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  // 处理删除任务
  function handleDelete(row) {
    dailyApi
      .deleteTask(row.id)
      .then(() => {
        message(`已删除任务：${row.task_name}`, {
          type: "success"
        });
        onSearch();
      })
      .catch(error => {
        console.error("删除任务失败:", error);
        message("删除任务失败，请重试", { type: "error" });
      });
  }

  // 跳转到编辑页面
  function handleEdit(row) {
    window.location.href = `/daily-management/task-edit?id=${row.id}`;
  }

  // 触发任务采集
  function handleTriggerCollect(row) {
    dailyApi
      .triggerCollect(row.id)
      .then(() => {
        message(`已触发任务采集：${row.task_name}`, {
          type: "success"
        });
      })
      .catch(error => {
        console.error("触发采集失败:", error);
        message("触发采集失败，请重试", { type: "error" });
      });
  }

  async function onSearch() {
    // 使用通用分页查询方法
    dataList.value = await executePageQuery(
      dailyApi.getTaskList,
      toRaw(form),
      dataList,
      pagination,
      loading,
      "获取任务列表失败"
    );
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    onSearch,
    resetForm,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleDelete,
    handleEdit,
    handleTriggerCollect
  };
}

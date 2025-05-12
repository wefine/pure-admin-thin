import { message } from "@/utils/message";
import dailyApi from "@/api/daily";
import { ref, reactive, onMounted, toRaw } from "vue";
import { formatDate } from "@/utils/format";
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
      label: "执行类型",
      prop: "task_type",
      minWidth: 100,
      cellRenderer: ({ row }) => (
        <el-tag type={row.task_type === "push" ? "warning" : "info"}>
          {row.task_type === "push" ? "推送" : "采集"}
        </el-tag>
      )
    },
    {
      label: "执行状态",
      prop: "task_status",
      minWidth: 100,
      cellRenderer: ({ row }) => {
        const statusMap = {
          "0": { type: "primary", label: "进行中" },
          "1": { type: "success", label: "成功" },
          "2": { type: "danger", label: "失败" }
        };
        const status = statusMap[row.task_status] || {
          type: "info",
          label: "未知"
        };
        return <el-tag type={status.type}>{status.label}</el-tag>;
      }
    },
    {
      label: "所属领域",
      prop: "task_domain",
      minWidth: 100
    },
    {
      label: "任务开始时间",
      prop: "created_date",
      minWidth: 160,
      formatter: row => formatDate(row.created_date)
    },
    {
      label: "最近更新时间",
      prop: "last_updated_date",
      minWidth: 160,
      formatter: row => formatDate(row.last_updated_date)
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

  async function onSearch() {
    // 使用通用分页查询方法
    dataList.value = await executePageQuery(
      dailyApi.getTaskRecordList,
      toRaw(form),
      dataList,
      pagination,
      loading,
      "获取任务记录列表失败"
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
    handleEdit
  };
}

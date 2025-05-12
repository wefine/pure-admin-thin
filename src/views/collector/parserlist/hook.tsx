import { message } from "@/utils/message";
import dailyParserApi from "@/api/dailyParser";
import { ref, reactive, onMounted, toRaw } from "vue";
import { createDefaultPagination, executePageQuery } from "@/utils/pagination";

export function useParser() {
  const form = reactive({
    parser_code: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  // 使用分页工具函数创建默认分页配置
  const pagination = createDefaultPagination();
  const columns: TableColumnList = [
    {
      label: "序号",
      prop: "id",
      minWidth: 100
    },
    {
      label: "解析器编码",
      prop: "parser_code",
      minWidth: 120
    },
    {
      label: "解析器网站",
      prop: "parser_website",
      minWidth: 200
    },
    {
      label: "解析器描述",
      prop: "parser_description",
      minWidth: 250
    },
    {
      label: "状态",
      prop: "enabled_flag",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={row.enabled_flag === "Y" ? "success" : "danger"}>
          {row.enabled_flag === "Y" ? "启用" : "禁用"}
        </el-tag>
      )
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

  // 处理删除解析器
  function handleDelete(row) {
    dailyParserApi
      .deleteParser(row.id)
      .then(() => {
        message(`已删除解析器：${row.parser_code}`, {
          type: "success"
        });
        onSearch();
      })
      .catch(error => {
        console.error("删除解析器失败:", error);
        message("删除解析器失败，请重试", { type: "error" });
      });
  }

  // 跳转到编辑页面
  function handleEdit(row) {
    window.location.href = `/daily-management/parser-edit?id=${row.id}`;
  }

  // 启用/禁用解析器
  function handleToggleStatus(row) {
    const newStatus = row.enabled_flag === "Y" ? "N" : "Y";
    const statusText = newStatus === "Y" ? "启用" : "禁用";

    dailyParserApi
      .updateParserStatus(row.id, { enabled_flag: newStatus })
      .then(() => {
        message(`已${statusText}解析器：${row.parser_code}`, {
          type: "success"
        });
        onSearch();
      })
      .catch(error => {
        console.error(`${statusText}解析器失败:`, error);
        message(`${statusText}解析器失败，请重试`, { type: "error" });
      });
  }

  // 触发解析器
  function handleTriggerParser(row) {
    dailyParserApi
      .triggerParser(row.id)
      .then(() => {
        message(`已触发解析器：${row.parser_code}`, {
          type: "success"
        });
      })
      .catch(error => {
        console.error("触发解析器失败:", error);
        message("触发解析器失败，请重试", { type: "error" });
      });
  }

  async function onSearch() {
    // 使用通用分页查询方法
    dataList.value = await executePageQuery(
      dailyParserApi.getParserList,
      toRaw(form),
      dataList,
      pagination,
      loading,
      "获取解析器列表失败"
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
    handleToggleStatus,
    handleTriggerParser
  };
}

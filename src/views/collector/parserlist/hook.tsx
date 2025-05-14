import { message } from "@/utils/message";
import dailyParserApi from "@/api/dailyParser";
import { ref, reactive, onMounted, toRaw } from "vue";
import { createDefaultPagination, executePageQuery } from "@/utils/pagination";
import { formatDate } from "@/utils/format";
import { ElMessageBox } from "element-plus";
import { Delete } from "@element-plus/icons-vue";

export function useParser() {
  const form = reactive({
    parser_name: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  // 使用分页工具函数创建默认分页配置
  const pagination = createDefaultPagination();
  const columns: TableColumnList = [
    {
      label: "解析器名称",
      prop: "parser_name",
      align: "left",
      minWidth: 120
    },
    {
      label: "解析器网站",
      prop: "parser_website",
      align: "left",
      minWidth: 200
    },
    {
      label: "解析器描述",
      prop: "parser_description",
      align: "left",
      minWidth: 400
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
    },
    {
      label: "首次上线时间",
      prop: "created_date",
      minWidth: 100,
      formatter: row => formatDate(row.created_date)
    },
    {
      label: "最近更新时间",
      prop: "last_updated_date",
      minWidth: 100,
      formatter: row => formatDate(row.last_updated_date)
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation",
      cellRenderer: ({ row }) => (
        <div class="flex items-center justify-center gap-2">
          <el-button
            circle
            size="small"
            type="danger"
            title="删除解析器"
            icon={Delete}
            onClick={event => {
              event.stopPropagation();
              confirmDeleteParser(row);
            }}
          />
        </div>
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

  // 确认删除解析器
  function confirmDeleteParser(row) {
    ElMessageBox.confirm(
      `确定要删除解析器 "${row.parser_code}" 吗？删除后不可恢复！`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )
      .then(() => {
        handleDelete(row);
      })
      .catch(() => {
        // 用户取消删除操作
      });
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

<script setup lang="ts">
import { ref } from "vue";
import { useParser } from "./hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Refresh from "~icons/ep/refresh";

defineOptions({
  name: "ParserList"
});

const formRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleEdit,
  handleDelete,
  handleToggleStatus,
  handleTriggerParser,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange
} = useParser();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <div class="flex w-full justify-between items-center">
        <div class="flex items-center gap-4">
          <el-form-item label="解析器编码" prop="parser_code">
            <el-input
              v-model="form.parser_code"
              placeholder="请输入解析器编码"
              clearable
              class="w-[180px]!"
            />
          </el-form-item>
          <el-form-item class="mb-0">
            <el-button
              type="primary"
              :icon="useRenderIcon('ri:search-line')"
              :loading="loading"
              @click="onSearch"
            >
              搜索
            </el-button>
            <el-button
              :icon="useRenderIcon(Refresh)"
              @click="resetForm(formRef)"
            >
              重置
            </el-button>
          </el-form-item>
        </div>
        <div style="display: none; margin-top: -10px; margin-right: 10px">
          <el-button
            type="success"
            @click="$router.push('/daily-management/parser-edit')"
          >
            新建解析器
          </el-button>
        </div>
      </div>
    </el-form>

    <PureTableBar title="解析器列表" :columns="columns" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="{ ...pagination, size }"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <!-- 自定义网站链接列 -->
          <template #parser_website="{ row }">
            <a
              :href="row.parser_website"
              target="_blank"
              class="text-blue-500 hover:underline"
            >
              {{ row.parser_website }}
            </a>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.main-content {
  margin: 24px 24px 0 !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>

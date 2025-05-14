<script setup lang="ts">
import { reactive, ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { CodeFilled } from "@element-plus/icons-vue";
import dailyParserApi from "@/api/dailyParser";
import { useDark } from "@pureadmin/utils";

// 使用集中导入的CodeMirror组件和类型
import { Codemirror, Editor, EditorConfiguration } from "@/utils/codemirror";

// 表单数据模型
const formData = reactive({
  name: "", // 解析器名称
  website: "", // 解析网站地址
  description: "", // 解析器描述
  code: "", // 解析器编码 - 自动生成
  content: "", // Python代码内容
  enabled_flag: "Y" // 默认启用
});

// 暗黑模式设置
const { isDark } = useDark();

// CodeMirror 编辑器实例
const cminstance = ref<Editor | null>(null);

// CodeMirror 配置选项
const cmOptions: EditorConfiguration = reactive({
  mode: "python",
  theme: isDark.value ? "material-darker" : "default",
  tabSize: 4,
  readOnly: false,
  autofocus: true,
  autoRefresh: true,
  lineNumbers: true,
  lineWiseCopyCut: true,
  gutters: ["CodeMirror-lint-markers"],
  lint: true,
  extraKeys: {
    Ctrl: "autocomplete",
    Tab: "autocomplete"
  },
  hintOptions: {
    completeSingle: false
  }
});

// CodeMirror 编辑器准备就绪回调
const onReady = (cm: Editor) => {
  cminstance.value = cm;
  cm.on("keypress", () => cm.showHint());
};

// 监听暗黑模式变化，切换主题
watch(
  () => isDark.value,
  async newVal => {
    await nextTick();
    if (cminstance.value) {
      newVal
        ? cminstance.value.setOption("theme", "material-darker")
        : cminstance.value.setOption("theme", "default");
    }
  }
);

const uploading = ref(false);

// 获取路由实例
const router = useRouter();

// 提交表单
const submitForm = async () => {
  if (!formData.name || !formData.website || !formData.description) {
    ElMessage.warning("请填写完整的解析器信息");
    return;
  }

  if (!formData.content || formData.content.trim() === "") {
    ElMessage.warning("请输入Python解析器代码");
    return;
  }

  try {
    // 校验表单必填项
    if (!formData.code) {
      ElMessage.warning("请输入解析器编码");
      return;
    }

    // 校验解析器编码格式
    const codePattern = /^[a-zA-Z0-9_]+$/;
    if (!codePattern.test(formData.code)) {
      ElMessage.warning("解析器编码只能包含英文、数字和下划线");
      return;
    }

    uploading.value = true;

    // 创建表单数据
    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("website", formData.website);
    formDataObj.append("description", formData.description);
    formDataObj.append("code", formData.code);
    formDataObj.append("enabled_flag", formData.enabled_flag);
    formDataObj.append("content", formData.content);

    // 调用API上传解析器
    const response = await dailyParserApi.uploadParser(formDataObj);

    // 检查响应状态
    if (
      response.error == null ||
      response.error == "" ||
      response.error == undefined
    ) {
      ElMessage.success("解析器上传成功");

      // 导航到解析器列表
      router.push("/collector-management/parser-list");
    }
  } catch (error) {
    console.error("上传解析器失败:", error);
    ElMessage.error(
      error instanceof Error ? error.message : "上传解析器失败，请重试"
    );
  } finally {
    uploading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  // 重置表单数据
  formData.name = "";
  formData.website = "";
  formData.description = "";
  formData.code = "";
  formData.content = "";
  formData.enabled_flag = "Y";
};
</script>

<template>
  <div class="main">
    <el-card class="mb-5 mx-auto">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="font-medium text-lg">网站解析器上传注册</div>
        </div>
      </template>

      <el-form
        :model="formData"
        label-position="right"
        label-width="120px"
        class="p-4"
      >
        <!-- 解析网站地址 -->
        <el-form-item label="可解析网址" prop="website" required>
          <el-input
            v-model="formData.website"
            placeholder="请输入解析网站地址，例如: https://example.com 或 http://example.org"
          />
        </el-form-item>
        <!-- 解析器名称 -->
        <el-form-item label="解析器名称" prop="name" required>
          <el-input v-model="formData.name" placeholder="请输入解析器名称" />
        </el-form-item>

        <!-- 解析器编码 -->
        <el-form-item label="解析器编码" prop="code" required>
          <el-input
            v-model="formData.code"
            placeholder="请输入解析器编码，可由英文、数字、下划线组成"
          />
        </el-form-item>

        <!-- 解析器描述 -->
        <el-form-item label="解析器描述" prop="description" required>
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入解析器的简要描述"
          />
        </el-form-item>

        <!-- Python代码编辑区域 -->
        <el-form-item label="解析器代码" prop="content" required>
          <Codemirror
            v-model:value="formData.content"
            width="100%"
            height="400px"
            :options="cmOptions"
            :border="true"
            @ready="onReady"
          />
          <div class="el-form-item__tip text-xs text-gray-500">
            请输入符合Python语法的解析器代码
          </div>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <div class="flex gap-4">
            <el-button type="primary" :loading="uploading" @click="submitForm">
              上传解析器
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.main {
  position: relative;
  padding: 1rem;
}

:deep(.el-collapse-item__content) {
  padding: 20px;
}

/* 确保CodeMirror样式能正确应用 */
:deep(.CodeMirror) {
  /* 这里不需要具体样式，仅用于激活深度选择器 */
}
</style>

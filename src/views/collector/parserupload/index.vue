<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import type { UploadProps, UploadUserFile } from "element-plus";
import dailyParserApi from "@/api/dailyParser";

// 表单数据模型
const formData = reactive({
  name: "", // 解析器名称
  website: "", // 解析网站地址
  description: "", // 解析器描述
  parser_code: "", // 解析器编码 - 自动生成
  enabled_flag: "Y" // 默认启用
});

// 上传的文件
const fileList = ref<UploadUserFile[]>([]);
const uploading = ref(false);
const uploadRef = ref();

// 获取路由实例
const router = useRouter();

// 文件上传配置
const uploadConfig: UploadProps = {
  accept: ".py", // 仅接受Python文件
  limit: 1, // 限制上传数量
  autoUpload: false, // 禁用自动上传
  showFileList: true, // 显示已上传文件列表
  multiple: false, // 不允许多选
  drag: true, // 允许拖拽上传
  onExceed: () => {
    ElMessage.warning("只能上传一个解析器文件");
  }
};

// 文件大小限制（1MB）
const MAX_FILE_SIZE = 1 * 1024 * 1024;

// 校验文件是否符合要求
const validateFile = (file: File): boolean => {
  // 校验文件类型
  if (!file.name.endsWith(".py")) {
    ElMessage.error("只支持Python（.py）格式的解析器文件");
    return false;
  }

  // 校验文件大小
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.error(
      `文件大小不能超过1MB，当前文件大小为${(file.size / 1024 / 1024).toFixed(2)}MB`
    );
    return false;
  }

  // 校验文件名是否包含特殊字符
  const validNamePattern = /^[\w\d\-_.]+\.py$/;
  if (!validNamePattern.test(file.name)) {
    ElMessage.error("文件名只能包含英文、数字、下划线、短横线和点");
    return false;
  }

  return true;
};

// 文件变更处理
const handleFileChange: UploadProps["onChange"] = uploadFile => {
  const file = uploadFile.raw as File;

  // 如果文件校验通过，则添加到文件列表
  if (validateFile(file)) {
    fileList.value = [uploadFile.raw as UploadUserFile];
  } else {
    // 校验失败时清空文件列表和上传组件
    fileList.value = [];
    if (uploadRef.value) {
      uploadRef.value.clearFiles();
    }
  }
};

// 提交表单
const submitForm = async () => {
  if (!formData.name || !formData.website || !formData.description) {
    ElMessage.warning("请填写完整的解析器信息");
    return;
  }

  if (fileList.value.length === 0) {
    ElMessage.warning("请上传解析器文件");
    return;
  }

  try {
    // 校验表单必填项
    if (!formData.parser_code) {
      ElMessage.warning("请输入解析器编码");
      return;
    }

    // 校验解析器编码格式
    const codePattern = /^[a-zA-Z0-9_]+$/;
    if (!codePattern.test(formData.parser_code)) {
      ElMessage.warning("解析器编码只能包含英文、数字和下划线");
      return;
    }

    uploading.value = true;

    // 创建表单数据
    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("website", formData.website);
    formDataObj.append("description", formData.description);
    formDataObj.append("parser_code", formData.parser_code);
    formDataObj.append("enabled_flag", formData.enabled_flag);
    formDataObj.append("file", fileList.value[0].raw as File);

    // 调用API上传解析器
    const response = await dailyParserApi.uploadParser(formDataObj);

    // 检查响应状态
    if (response.code !== 200) {
      throw new Error(response.message || "上传解析器失败");
    }

    ElMessage.success("解析器上传成功");
    // 重置表单
    resetForm();
    // 导航到解析器列表
    router.push("/collector-management/parser-list");
  } catch (error) {
    console.error("上传解析器失败:", error);
    ElMessage.error(
      error instanceof Error ? error.message : "上传解析器失败，请重试"
    );
  } finally {
    uploading.value = false;
  }
};

// 预览解析器代码
const previewCode = () => {
  // 实际项目中可以在此实现解析器代码预览功能
  ElMessage.info("预览功能待实现");
};

// 重置表单
const resetForm = () => {
  // 重置表单数据
  formData.name = "";
  formData.website = "";
  formData.description = "";
  formData.parser_code = "";
  formData.enabled_flag = "Y";

  // 清空文件列表
  fileList.value = [];

  // 重置上传组件
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
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
        <el-form-item label="解析器编码" prop="parser_code" required>
          <el-input
            v-model="formData.parser_code"
            placeholder="请输入解析器编码，可由英文、数字、下划线组成"
          />
        </el-form-item>

        <!-- 解析器描述 -->
        <el-form-item label="解析器描述" prop="description" required>
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入解析器描述，包括功能、用途等信息"
          />
        </el-form-item>

        <!-- 文件上传 -->
        <el-form-item label="解析器文件" required>
          <el-upload
            ref="uploadRef"
            v-model:file-list="fileList"
            class="upload-container w-full"
            v-bind="uploadConfig"
            @change="handleFileChange"
          >
            <el-button type="primary" :loading="uploading">
              <el-icon><UploadFilled /></el-icon>
              <span class="ml-1">选择文件</span>
            </el-button>
            <template #tip>
              <div class="text-gray-500 mt-2 text-sm">
                当前仅支持 .py
                格式，单个文件不超过1MB，可拖拽或点击选择文件上传一个文件，上传即校验。
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <div class="flex gap-4 justify-center">
            <el-button type="primary" :loading="uploading" @click="submitForm"
              >上传解析器</el-button
            >
            <el-button @click="resetForm">重置</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.main {
  padding: 20px;
  font-weight: 500;
}

:deep(.el-collapse-item__content) {
  padding: 20px;
}
</style>

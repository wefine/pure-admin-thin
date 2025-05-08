<template>
  <div class="key-value-editor">
    <!-- 只在编辑模式下显示新增功能 -->
    <div v-if="editable" class="mb-4 flex items-center gap-2">
      <el-input
        v-model="newKey"
        :placeholder="keyPlaceholder"
        style="width: 320px"
      />
      <el-input
        v-model="newValue"
        :placeholder="valuePlaceholder"
        style="width: 320px"
      />
      <el-button
        type="primary"
        circle
        :disabled="!newKey.trim()"
        @click="handleAdd"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <!-- 条目列表 -->
    <div class="flex flex-col">
      <div
        v-for="(value, key) in modelValue"
        :key="key"
        class="mb-2 flex items-center gap-2"
      >
        <el-input
          v-model="keyMap[key]"
          :placeholder="keyPlaceholder"
          style="width: 320px"
          :disabled="!editable"
          @change="handleKeyChange(key, keyMap[key])"
        />
        <el-input
          :model-value="modelValue[key]"
          :placeholder="valuePlaceholder"
          :disabled="!editable"
          style="width: 320px"
          @update:model-value="updateItemValue(key, $event)"
        />
        <el-button
          v-if="editable"
          type="danger"
          circle
          @click="handleDelete(key)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { Delete, Plus } from "@element-plus/icons-vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  keyPlaceholder: {
    type: String,
    default: "键名"
  },
  valuePlaceholder: {
    type: String,
    default: "值"
  },
  editable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["update:modelValue"]);

// 新增项的临时存储
const newKey = ref("");
const newValue = ref("");

// 用于存储和跟踪键名变化
const keyMap = reactive({});

// 初始化keyMap，用于跟踪键名
onMounted(() => {
  for (const key in props.modelValue) {
    keyMap[key] = key;
  }
});

// 添加新条目
const handleAdd = () => {
  if (newKey.value.trim()) {
    const updatedValue = { ...props.modelValue };
    updatedValue[newKey.value] = newValue.value || "";
    keyMap[newKey.value] = newKey.value;
    emit("update:modelValue", updatedValue);
    newKey.value = "";
    newValue.value = "";
  }
};

// 删除条目
const handleDelete = key => {
  const updatedValue = { ...props.modelValue };
  delete updatedValue[key];
  delete keyMap[key];
  emit("update:modelValue", updatedValue);
};

// 处理键名变更
const handleKeyChange = (oldKey, newKey) => {
  if (oldKey !== newKey && newKey.trim()) {
    const updatedValue = { ...props.modelValue };
    const value = updatedValue[oldKey];
    delete updatedValue[oldKey];
    delete keyMap[oldKey];
    updatedValue[newKey] = value;
    keyMap[newKey] = newKey;
    emit("update:modelValue", updatedValue);
  }
};

// 更新条目值
const updateItemValue = (key, value) => {
  const updatedValue = { ...props.modelValue };
  updatedValue[key] = value;
  emit("update:modelValue", updatedValue);
};

// 监听外部数据变化，更新keyMap
watch(
  () => props.modelValue,
  newVal => {
    for (const key in newVal) {
      if (!keyMap[key]) {
        keyMap[key] = key;
      }
    }
    // 清理不再存在的key
    for (const key in keyMap) {
      if (!newVal[key]) {
        delete keyMap[key];
      }
    }
  },
  { deep: true }
);
</script>

<style scoped>
.key-value-editor {
  width: 100%;
}
</style>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import dailyApi from "@/api/daily";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import KeyValueEditor from "@/components/form/KeyValueEditor.vue";
import { useParserStoreHook } from "@/store/modules/parser";
import { useDark } from "@pureadmin/utils";
import Codemirror from "codemirror-editor-vue3";
import type { Editor, EditorConfiguration } from "codemirror";

// 引入 CodeMirror 主题和扩展
import "codemirror/theme/material-darker.css";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint";
import "codemirror/mode/markdown/markdown.js";
import "codemirror/mode/gfm/gfm.js";

// 获取路由参数
const route = useRoute();

// 编辑状态 - 从路由参数获取，默认为true
const isEditing = computed(() => {
  // 如果路由参数中有editable且值为'false'，则返回false，否则默认为true
  return route.query.editable !== "false";
});

// 表单数据模型
const formData = reactive({
  task_config: {
    task_name: "",
    task_code: "",
    domain: "CEO", // 默认领域
    collect_cron: "0 20 * * *", // 默认每天20点采集
    push_cron: "0 7 * * *", // 默认每天7点推送
    collect: {
      web_parse: [],
      wechat: {}
    },
    pre_process: {
      restrictions:
        "新闻应属于电信、通讯、电子、能源、AI、财务等领域，与这些领域相关的关键词包括：战略、行业、资本、政策、合规、风险等。",
      classify_criterion:
        "1. 融资并购\n划分标准：该类新闻聚焦大模型领域资金动态与市场整合趋势，涵盖企业大额融资事件、战略投资方向及并购案例，展现资本对行业的推动作用与市场格局重塑。\n2. 政策合规\n划分标准：梳理国内外大模型相关政策法规的核心要求与实施细则，分析企业在数据安全、算法透明、伦理审查等方面的合规举措与应对策略。\n3. 财务风控\n划分标准：关注大模型企业在研发投入、成本控制、收益预测等环节的财务管理实践，以及针对市场波动、政策变动等风险的防范与应对机制。\n4. 其他要闻\n划分标准：包含不属于上述类别的行业相关重要新闻。"
    },
    post_process: {
      space: {
        space_id: "1b5da6406fc24edeb652f0168e4af5fc",
        parent_catalog_id: "00d7b8cf199e11f0950dcd1bf82273a8",
        label: "CEO早报"
      },
      igpt: {
        scene_id: "36",
        scene_code: "CEOAINews"
      },
      knowledge: {
        kbase_id: "dd3f8865fcf143b59177b04dc01693be"
      }
    }
  },
  template_mapping: {
    行业趋势: "industry_items",
    竞对动态: "competitor_items",
    政策导向: "policy_items",
    生态布局: "ecology_items"
  },
  report_template:
    '# 【{{ domain }}早报】{{ date }}-{{ title }}\n\n<h2>一、行业趋势</h2>\n{% for item in industry_items %}<h3> 1.{{ loop.index }} {{ item.article_title }} </h3>\n<p>链接：<a href="{{ item.article_link }}">{{ item.article_link }}</a><p>\n摘要： {{ item.article_summary }}<br>\n<span>{% for picture in item.article_display_img %}<img width="620" inline="true" src="{{ picture }}"/> {% endfor %}</span><br><br>\n{% endfor %}\n\n<h2>二、竞对动态</h2>\n{% for item in competitor_items %}<h3> 2.{{ loop.index }} {{ item.article_title }} </h3>\n<p>链接：<a href="{{ item.article_link }}">{{ item.article_link }}</a><p>\n摘要： {{ item.article_summary }}<br>\n<span>{% for picture in item.article_display_img %}<img width="620" inline="true" src="{{ picture }}"/> {% endfor %}</span><br><br>\n{% endfor %}\n\n<h2>三、政策导向</h2>\n{% for item in policy_items %}<h3> 3.{{ loop.index }} {{ item.article_title }} </h3>\n<p>链接：<a href="{{ item.article_link }}">{{ item.article_link }}</a><p>\n摘要： {{ item.article_summary }}<br>\n<span>{% for picture in item.article_display_img %}<img width="620" inline="true" src="{{ picture }}"/> {% endfor %}</span><br><br>\n{% endfor %}\n\n<h2>四、生态布局</h2>\n{% for item in ecology_items %}<h3> 4.{{ loop.index }} {{ item.article_title }} </h3>\n<p>链接：<a href="{{ item.article_link }}">{{ item.article_link }}</a><p>\n摘要： {{ item.article_summary }}<br>\n<span>{% for picture in item.article_display_img %}<img width="620" inline="true" src="{{ picture }}"/> {% endfor %}</span><br><br>\n{% endfor %}\n\n<h2>五、其它要闻</h2>\n{% for item in other_items %}<h3> 5.{{ loop.index }} {{ item.article_title }} </h3>\n<p>链接：<a href="{{ item.article_link }}">{{ item.article_link }}</a><p>\n摘要： {{ item.article_summary }}<br>\n<span>{% for picture in item.article_display_img %}<img width="620" inline="true" src="{{ picture }}"/> {% endfor %}</span><br><br>\n{% endfor %}'
});

// 领域选项
const domainOptions = [
  { label: "CEO领域", value: "CEO" },
  { label: "营销领域", value: "营销" },
  { label: "采购领域", value: "采购" }
];

// 暗黑模式设置
const { isDark } = useDark();

// CodeMirror 编辑器实例
const cminstance = ref<Editor | null>(null);

// CodeMirror 配置选项
const cmOptions: EditorConfiguration = reactive({
  mode: "gfm",
  theme: isDark.value ? "material-darker" : "default",
  tabSize: 2,
  readOnly: false,
  autofocus: false,
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

// 从状态管理中获取网站解析选项
const parserStore = useParserStoreHook();
const webParseOptions = computed(() => {
  // 从解析器列表中提取parser_code和parser_description
  return parserStore.getAllParsers.map(parser => ({
    parser_code: parser.parser_code,
    parser_description: parser.parser_description
  }));
});

// 确保解析器数据已加载
onMounted(async () => {
  // 只有在store中parsers为空时才触发后台查询，否则直接使用现有数据
  if (parserStore.getAllParsers.length === 0) {
    await parserStore.loadAllParsers();
  }
});

// 获取路由实例
const router = useRouter();

// 提交表单
const submitForm = async () => {
  // 创建完整的数据对象 - 使用JSON序列化完全解构Vue的Proxy对象
  const completeData = JSON.parse(
    JSON.stringify({
      task_config: formData.task_config,
      template_mapping: formData.template_mapping,
      report_template: formData.report_template
    })
  );

  // 输出完整数据对象
  console.log("提交的完整数据对象:", completeData);

  // TODO: 这里添加API调用 - 使用完整数据对象
  const response = await dailyApi.createTask(completeData);
  if (response.code == 200) {
    ElMessage.success("创建任务成功");
    router.push("/daily-management/task-list");
  } else {
    ElMessage.error("创建任务失败");
  }
};

// 生成任务代码（基于任务名称生成英文代码）
const generateTaskCode = () => {
  if (!formData.task_config.task_name) return;
  // 简单实现：取任务名拼音首字母或直接返回默认值
  formData.task_config.task_code =
    formData.task_config.task_name.replace(/[^\w\d]/g, "").toLowerCase() ||
    "task_" + Date.now().toString(36);
};

// 监听任务名称变化，自动生成任务代码
const updateTaskCode = () => {
  generateTaskCode();
};

// 卡片折叠状态管理
const cardVisible = reactive({
  card1: true,
  card2: true,
  card3: true,
  card4: true,
  card5: true
});

// 切换卡片内容显示/隐藏
const toggleCard = cardId => {
  cardVisible[cardId] = !cardVisible[cardId];
};
</script>

<template>
  <div class="main">
    <el-form
      :model="formData.task_config"
      label-position="right"
      label-width="100px"
      class="mr-12"
    >
      <div class="space-y-5">
        <!-- 1. 基础信息 -->
        <el-card class="mb-5">
          <template #header>
            <div
              class="flex justify-between items-center cursor-pointer"
              @click="toggleCard('card1')"
            >
              <div class="font-medium">一、基础信息</div>
              <el-button
                circle
                :icon="cardVisible.card1 ? ArrowUp : ArrowDown"
              />
            </div>
          </template>
          <div v-show="cardVisible.card1">
            <div class="flex flex-wrap gap-4">
              <el-form-item
                label="任务名称"
                prop="task_name"
                class="flex-1 min-w-[80px]"
              >
                <el-input
                  v-model="formData.task_config.task_name"
                  placeholder="请输入任务名称"
                  @change="updateTaskCode"
                />
              </el-form-item>
              <el-form-item
                label="任务编码"
                prop="task_code"
                class="flex-1 min-w-[80px]"
              >
                <el-input
                  v-model="formData.task_config.task_code"
                  placeholder="请输入任务编码"
                />
              </el-form-item>
              <el-form-item
                label="所属领域"
                prop="domain"
                class="flex-1 min-w-[80px]"
              >
                <el-input
                  v-model="formData.task_config.domain"
                  placeholder="请输入所属领域"
                  class="w-full"
                />
              </el-form-item>
            </div>
          </div>
        </el-card>

        <!-- 2. 采集配置 -->
        <el-card class="mb-5">
          <template #header>
            <div
              class="flex justify-between items-center cursor-pointer"
              @click="toggleCard('card2')"
            >
              <div class="font-medium">二、采集配置</div>
              <el-button
                circle
                :icon="cardVisible.card2 ? ArrowUp : ArrowDown"
              />
            </div>
          </template>
          <div v-show="cardVisible.card2">
            <el-form-item label="采集时间" prop="collect_cron">
              <el-input
                v-model="formData.task_config.collect_cron"
                placeholder="cron表达式，如: 0 20 * * *"
              />
            </el-form-item>
            <el-form-item label="网站解析器" prop="collect.web_parse">
              <el-select
                v-model="formData.task_config.collect.web_parse"
                multiple
                placeholder="请选择网站解析器"
              >
                <el-option
                  v-for="item in webParseOptions"
                  :key="item.parser_code"
                  :label="item.parser_code"
                  :value="item.parser_code"
                >
                  <span style="float: left">{{ item.parser_code }}</span>
                  <span
                    style="
                      float: right;
                      font-size: 13px;
                      color: var(--el-text-color-secondary);
                    "
                  >
                    {{ item.parser_description }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="微信公众号">
              <KeyValueEditor
                v-model="formData.task_config.collect.wechat"
                key-placeholder="公众号名称，如: 财经新商业"
                value-placeholder="公众号标识，如: MzkzNDY4OTQ4MA"
                :editable="isEditing"
              />
            </el-form-item>
          </div>
        </el-card>

        <!-- 3. 预处理配置 -->
        <el-card class="mb-5">
          <template #header>
            <div
              class="flex justify-between items-center cursor-pointer"
              @click="toggleCard('card3')"
            >
              <div class="font-medium">三、预处理配置</div>
              <el-button
                circle
                :icon="cardVisible.card3 ? ArrowUp : ArrowDown"
              />
            </div>
          </template>
          <div v-show="cardVisible.card3">
            <el-form-item label="过滤提示词" prop="pre_process.restrictions">
              <el-input
                v-model="formData.task_config.pre_process.restrictions"
                type="textarea"
                :rows="6"
                placeholder="设置新闻内容的过滤提示词，示例如：新闻应属于电信、通讯、电子、能源、AI、财务等领域，与这些领域相关的关键词包括：战略、行业、资本、政策、合规、风险等。"
              />
            </el-form-item>
            <el-form-item
              label="分类提示词"
              prop="pre_process.classify_criterion"
            >
              <el-input
                v-model="formData.task_config.pre_process.classify_criterion"
                type="textarea"
                :rows="6"
                placeholder="设置新闻内容的分类提示词，示例如：1. 融资并购 划分标准：该类新闻聚焦大模型领域资金动态与市场整合趋势，涵盖企业大额融资事件、战略投资方向及并购案例，展现资本对行业的推动作用与市场格局重塑。2. 政策合规 划分标准：梳理国内外大模型相关政策法规的核心要求与实施细则，分析企业在数据安全、算法透明、伦理审查等方面的合规举措与应对策略。"
              />
            </el-form-item>
          </div>
        </el-card>

        <!-- 4. 后处理配置 -->
        <el-card class="mb-5">
          <template #header>
            <div
              class="flex justify-between items-center cursor-pointer"
              @click="toggleCard('card4')"
            >
              <div class="font-medium">四、后处理配置</div>
              <el-button
                circle
                :icon="cardVisible.card4 ? ArrowUp : ArrowDown"
              />
            </div>
          </template>
          <div v-show="cardVisible.card4">
            <el-form-item label="日报模板" prop="report_template">
              <Codemirror
                v-model:value="formData.report_template"
                width="100%"
                height="350px"
                :options="cmOptions"
                :border="true"
                @ready="onReady"
              />
              <div class="text-xs text-gray-500 mt-1">
                支持Markdown语法和Jinja2模板变量
              </div>
            </el-form-item>
            <el-form-item label="模板变量映射" prop="template_mapping">
              <KeyValueEditor
                v-model="formData.template_mapping"
                key-placeholder="分类名称"
                value-placeholder="映射变量名称"
                :editable="isEditing"
              />
            </el-form-item>
            <div class="hidden">
              <!-- 保留原先的模板变量映射实现，使用display:none隐藏 -->
              <div
                v-for="(value, key) in formData.template_mapping"
                :key="key"
                class="mb-2 flex items-center"
              >
                <div
                  class="el-input mr-2 w-1/3 flex items-center px-3 bg-gray-100 border rounded"
                >
                  {{ key }}
                </div>
                <el-input
                  v-model="formData.template_mapping[key]"
                  placeholder="映射变量名"
                />
              </div>
            </div>
          </div>
        </el-card>

        <!-- 5. 推送配置 -->
        <el-card class="mb-5">
          <template #header>
            <div
              class="flex justify-between items-center cursor-pointer"
              @click="toggleCard('card5')"
            >
              <div class="font-medium">五、推送配置</div>
              <el-button
                circle
                :icon="cardVisible.card5 ? ArrowUp : ArrowDown"
              />
            </div>
          </template>
          <div v-show="cardVisible.card5">
            <h4 class="font-medium mb-3 mt-5">时间配置</h4>
            <div class="flex flex-wrap gap-4">
              <el-form-item
                label="推送时间"
                prop="push_cron"
                class="flex-1 min-w-[300px]"
              >
                <el-input
                  v-model="formData.task_config.push_cron"
                  placeholder="cron表达式，如: 0 7 * * *"
                />
                <div class="text-gray-400 text-sm mt-1">
                  默认为每天7点，格式：分 时 日 月 周
                </div>
              </el-form-item>
            </div>
            <h4 class="font-medium mb-3">空间配置</h4>
            <div class="flex flex-wrap gap-4">
              <el-form-item
                label="空间ID"
                prop="post_process.space.space_id"
                class="flex-1 min-w-[200px]"
              >
                <el-input
                  v-model="formData.task_config.post_process.space.space_id"
                  placeholder="空间ID"
                />
              </el-form-item>
              <el-form-item
                label="存放目录ID"
                prop="post_process.space.parent_catalog_id"
                class="flex-1 min-w-[200px]"
              >
                <el-input
                  v-model="
                    formData.task_config.post_process.space.parent_catalog_id
                  "
                  placeholder="存放目录ID"
                />
              </el-form-item>
              <el-form-item
                label="空间标签"
                prop="post_process.space.label"
                class="flex-1 min-w-[200px]"
              >
                <el-input
                  v-model="formData.task_config.post_process.space.label"
                  placeholder="空间标签"
                />
              </el-form-item>
            </div>

            <h4 class="font-medium mb-3 mt-5">IGPT订阅配置</h4>
            <div class="flex flex-wrap gap-4">
              <el-form-item
                label="事项ID"
                prop="post_process.igpt.scene_id"
                class="flex-1 min-w-[200px]"
              >
                <el-input
                  v-model="formData.task_config.post_process.igpt.scene_id"
                  placeholder="事项ID"
                />
              </el-form-item>
              <el-form-item
                label="事项编码"
                prop="post_process.igpt.scene_code"
                class="flex-1 min-w-[200px]"
              >
                <el-input
                  v-model="formData.task_config.post_process.igpt.scene_code"
                  placeholder="事项编码"
                />
              </el-form-item>
            </div>
          </div>
        </el-card>
        <el-card class="mb-5">
          <div class="flex justify-center">
            <el-button type="primary" @click="submitForm">提交</el-button>
          </div>
        </el-card>
      </div>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.main {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: var(--el-bg-color-page);

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  :deep(.el-collapse-item__header) {
    font-size: 16px;
    font-weight: 500;
  }

  :deep(.el-collapse-item__content) {
    padding: 20px;
  }
}

/* CodeMirror 相关样式 */
.codemirror-container.bordered {
  border: 1px solid var(--pure-border-color);
}
</style>

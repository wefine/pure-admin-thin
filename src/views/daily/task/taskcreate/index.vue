<script setup lang="ts">
import { reactive, ref } from "vue";
import { ArrowDown, ArrowUp, Delete, Plus } from "@element-plus/icons-vue";

// 表单数据模型
const formData = reactive({
  task_config: {
    task_name: "",
    task_code: "",
    domain: "CEO", // 默认领域
    collect_cron: "0 20 * * *", // 默认每天20点采集
    push_cron: "0 7 * * *", // 默认每天7点推送
    collect: {
      web_parse: ["CNGovWebParse", "HUXIUWebParse"],
      wechat: {
        财经新商业: "MzkzNDY4OTQ4MA"
      }
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

// 网站解析选项
const webParseOptions = [
  { label: "CNGovWebParse", value: "CNGovWebParse" },
  { label: "HUXIUWebParse", value: "HUXIUWebParse" },
  { label: "36KrWebParse", value: "36KrWebParse" },
  { label: "TechWebParse", value: "TechWebParse" }
];

// 提交表单
const submitForm = () => {
  console.log("提交数据:", formData);
  // 更新标签和场景代码
  formData.task_config.post_process.space.label = `${formData.task_config.domain}早报`;
  formData.task_config.post_process.igpt.scene_code = `${formData.task_config.domain}AINews`;

  // TODO: 这里添加API调用
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

// 微信公众号管理
const wechatKeyTemp = reactive({});
const newWechatName = ref("");
const newWechatBiz = ref("");

// 添加微信公众号
const addWechatAccount = () => {
  if (newWechatName.value.trim()) {
    formData.task_config.collect.wechat[newWechatName.value] =
      newWechatBiz.value || "";
    wechatKeyTemp[newWechatName.value] = newWechatName.value;
    newWechatName.value = "";
    newWechatBiz.value = "";
  }
};

// 删除微信公众号
const deleteWechatAccount = key => {
  delete formData.task_config.collect.wechat[key];
  delete wechatKeyTemp[key];
};

// 更新微信公众号名称
const updateWechatKey = (oldKey, newKey) => {
  if (oldKey !== newKey && newKey.trim()) {
    const value = formData.task_config.collect.wechat[oldKey];
    deleteWechatAccount(oldKey);
    formData.task_config.collect.wechat[newKey] = value;
    wechatKeyTemp[newKey] = newKey;
  }
};

// 初始化微信公众号临时名称
// 对所有已存在的公众号初始化名称
for (const key in formData.task_config.collect.wechat) {
  wechatKeyTemp[key] = key;
}

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
                type="text"
                :icon="cardVisible.card1 ? ArrowUp : ArrowDown"
                @click.stop
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
                label="任务代码"
                prop="task_code"
                class="flex-1 min-w-[80px]"
              >
                <el-input
                  v-model="formData.task_config.task_code"
                  placeholder="自动生成的任务代码"
                />
              </el-form-item>
              <el-form-item
                label="所属领域"
                prop="domain"
                class="flex-1 min-w-[80px]"
              >
                <el-select
                  v-model="formData.task_config.domain"
                  placeholder="请选择领域"
                  class="w-full"
                >
                  <el-option
                    v-for="item in domainOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
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
                type="text"
                :icon="cardVisible.card2 ? ArrowUp : ArrowDown"
                @click.stop
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
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="微信公众号">
              <!-- 新增公众号区域 -->
              <div class="mb-4 flex flex-col">
                <div class="flex items-center gap-2 mb-4">
                  <el-input
                    v-model="newWechatName"
                    placeholder="公众号名称"
                    style="width: 180px"
                  />
                  <el-input
                    v-model="newWechatBiz"
                    placeholder="公众号标识"
                    style="width: 320px"
                  />
                  <el-button
                    type="primary"
                    circle
                    :disabled="!newWechatName.trim()"
                    @click="addWechatAccount"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </div>
                <!-- 公众号列表 -->
                <div
                  v-for="(value, key) in formData.task_config.collect.wechat"
                  :key="key"
                  class="mb-2 flex items-center gap-2"
                >
                  <el-input
                    v-model="wechatKeyTemp[key]"
                    style="width: 180px"
                    placeholder="公众号名称"
                    @change="updateWechatKey(key, wechatKeyTemp[key])"
                  />
                  <el-input
                    v-model="formData.task_config.collect.wechat[key]"
                    style="width: 320px"
                    placeholder="公众号标识"
                  />
                  <el-button
                    type="danger"
                    circle
                    @click="deleteWechatAccount(key)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
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
                type="text"
                :icon="cardVisible.card3 ? ArrowUp : ArrowDown"
                @click.stop
              />
            </div>
          </template>
          <div v-show="cardVisible.card3">
            <el-form-item label="内容限制" prop="pre_process.restrictions">
              <el-input
                v-model="formData.task_config.pre_process.restrictions"
                type="textarea"
                :rows="4"
                placeholder="设置新闻内容的筛选条件"
              />
            </el-form-item>
            <el-form-item label="关键词筛选" prop="pre_process.keywords_filter">
              <el-select
                v-model="formData.task_config.pre_process.keywords_filter"
                multiple
                filterable
                allow-create
                placeholder="请输入关键词"
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
                type="text"
                :icon="cardVisible.card4 ? ArrowUp : ArrowDown"
                @click.stop
              />
            </div>
          </template>
          <div v-show="cardVisible.card4">
            <h4 class="font-medium mb-3">空间配置</h4>
            <el-form-item label="空间ID" prop="post_process.space.space_id">
              <el-input
                v-model="formData.task_config.post_process.space.space_id"
                placeholder="空间ID"
              />
            </el-form-item>
            <el-form-item
              label="目录ID"
              prop="post_process.space.parent_catalog_id"
            >
              <el-input
                v-model="
                  formData.task_config.post_process.space.parent_catalog_id
                "
                placeholder="目录ID"
              />
            </el-form-item>
            <el-form-item label="标签" prop="post_process.space.label">
              <el-input
                v-model="formData.task_config.post_process.space.label"
                placeholder="空间标签"
                disabled
              />
              <div class="text-gray-400 text-sm mt-1">根据所选领域自动生成</div>
            </el-form-item>

            <h4 class="font-medium mb-3 mt-5">IGPT配置</h4>
            <el-form-item label="场景ID" prop="post_process.igpt.scene_id">
              <el-input
                v-model="formData.task_config.post_process.igpt.scene_id"
                placeholder="场景ID"
              />
            </el-form-item>
            <el-form-item label="场景代码" prop="post_process.igpt.scene_code">
              <el-input
                v-model="formData.task_config.post_process.igpt.scene_code"
                placeholder="场景代码"
                disabled
              />
              <div class="text-gray-400 text-sm mt-1">根据所选领域自动生成</div>
            </el-form-item>

            <h4 class="font-medium mb-3 mt-5">知识库配置</h4>
            <el-form-item
              label="知识库ID"
              prop="post_process.knowledge.kbase_id"
            >
              <el-input
                v-model="formData.task_config.post_process.knowledge.kbase_id"
                placeholder="知识库ID"
              />
            </el-form-item>
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
                type="text"
                :icon="cardVisible.card5 ? ArrowUp : ArrowDown"
                @click.stop
              />
            </div>
          </template>
          <div v-show="cardVisible.card5">
            <el-form-item label="推送时间(cron表达式)" prop="push_cron">
              <el-input
                v-model="formData.task_config.push_cron"
                placeholder="cron表达式，如: 0 7 * * *"
              />
              <div class="text-gray-400 text-sm mt-1">
                默认为每天7点，格式：分 时 日 月 周
              </div>
            </el-form-item>
            <el-divider content-position="center">模板映射</el-divider>
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
        </el-card>
      </div>
    </el-form>
    <el-button type="primary" @click="submitForm">提交</el-button>
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
</style>

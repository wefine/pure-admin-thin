import { defineStore } from "pinia";
import dailyParserApi from "@/api/dailyParser";
import { store } from "../utils";

// 定义WebParser类型
export interface WebParser {
  id: string;
  parser_code: string;
  last_updated_date: string;
  last_updated_by: string;
  tenant_id: string;
  parser_website: string;
  parser_description: string;
  created_date: string;
  created_by: string;
  enabled_flag: string;
}

// Parser状态类型
interface ParserState {
  parsers: WebParser[];
  loading: boolean;
  initialized: boolean;
}

export const useParserStore = defineStore("parser", {
  state: (): ParserState => ({
    parsers: [],
    loading: false,
    initialized: false
  }),
  getters: {
    // 获取所有解析器
    getAllParsers(state): WebParser[] {
      return state.parsers;
    },

    // 获取启用中的解析器
    getEnabledParsers(state): WebParser[] {
      return state.parsers.filter(parser => parser.enabled_flag === "Y");
    },

    // 根据ID获取特定解析器
    getParserById:
      state =>
      (id: string): WebParser | undefined => {
        return state.parsers.find(parser => parser.id === id);
      },

    // 根据编码获取特定解析器
    getParserByCode:
      state =>
      (code: string): WebParser | undefined => {
        return state.parsers.find(parser => parser.parser_code === code);
      },

    // 是否已初始化
    isInitialized(state): boolean {
      return state.initialized;
    }
  },
  actions: {
    // 加载所有解析器
    async loadAllParsers() {
      // 如果正在加载或已初始化且有数据，则不再重复加载
      if (this.loading || this.parsers.length > 0) {
        return;
      }

      this.loading = true;
      try {
        // 调用API获取所有解析器
        const response = await dailyParserApi.getAllParsers();
        // 处理API返回的实际数据格式
        // 格式: {success: true, message: "查询成功", data: [...], total: n}
        if (
          response &&
          response.success === true &&
          Array.isArray(response.data)
        ) {
          console.log("解析器数据加载成功，共", response.data.length, "条");
          this.parsers = response.data;
          this.initialized = true;
        } else if (response && response.data && Array.isArray(response.data)) {
          // 兼容没有success字段的情况
          console.log("解析器数据加载成功，共", response.data.length, "条");
          this.parsers = response.data;
          this.initialized = true;
        } else if (response && Array.isArray(response)) {
          // 兼容直接返回数组的情况
          console.log("解析器数据加载成功，共", response.length, "条");
          this.parsers = response;
          this.initialized = true;
        } else {
          // 未知的响应格式
          console.warn("解析器数据格式不符合预期", response);
          this.parsers = [];
          this.initialized = true; // 仍然标记为已初始化，避免重复请求
        }
      } catch (error) {
        // 处理错误情况
        console.error("加载解析器失败:", error);
        this.parsers = [];
        this.initialized = true; // 即便错误也标记为初始化，避免重复请求导致错误堆叠
      } finally {
        this.loading = false;
      }
    },

    // 更新解析器列表
    updateParsers(parsers: WebParser[]) {
      this.parsers = parsers;
    },

    // 添加一个新的解析器到列表
    addParser(parser: WebParser) {
      const index = this.parsers.findIndex(p => p.id === parser.id);
      if (index === -1) {
        this.parsers.push(parser);
      } else {
        this.parsers[index] = parser;
      }
    },

    // 从列表中移除一个解析器
    removeParser(id: string) {
      const index = this.parsers.findIndex(p => p.id === id);
      if (index !== -1) {
        this.parsers.splice(index, 1);
      }
    },

    // 更新解析器状态
    updateParserStatus(id: string, enabled: boolean) {
      const parser = this.parsers.find(p => p.id === id);
      if (parser) {
        parser.enabled_flag = enabled ? "Y" : "N";
      }
    }
  }
});

// 导出Store钩子函数
export function useParserStoreHook() {
  return useParserStore(store);
}

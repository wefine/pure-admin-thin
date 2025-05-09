import { useParserStoreHook } from "@/store/modules/parser";

/**
 * 应用初始化钩子
 * 用于应用启动时自动加载必要的数据
 */
export function useAppInit() {
  const loadAppData = async () => {
    // 加载所有解析器数据到状态管理中
    const parserStore = useParserStoreHook();
    await parserStore.loadAllParsers();
    console.log(
      "解析器数据加载完成, 共加载了",
      parserStore.getAllParsers.length,
      "个解析器"
    );
  };

  return {
    loadAppData
  };
}

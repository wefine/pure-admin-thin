/**
 * 分页查询相关工具函数
 */

import { reactive } from "vue";
import type { Ref } from "vue";
import { message } from "./message";
import type { PaginationProps } from "@pureadmin/table";

/**
 * 标准分页参数类型
 */
export interface PageParams {
  page_num: number;
  page_size: number;
  [key: string]: any;
}

/**
 * 标准分页响应数据结构
 */
export interface PageResponse<T> {
  rows?: T[];
  list?: T[];
  total: number;
  currentPage?: number;
  pageSize?: number;
}

/**
 * 创建默认分页参数
 * @returns 分页参数对象
 */
export function createDefaultPagination(): PaginationProps {
  return reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
}

/**
 * 构建分页请求参数
 * @param formData 表单数据
 * @param pagination 分页配置
 * @returns 用于请求的参数对象
 */
export function buildPageParams(
  formData: Record<string, any>,
  pagination: PaginationProps
): PageParams {
  return {
    ...formData,
    page_num: pagination.currentPage,
    page_size: pagination.pageSize
  };
}

/**
 * 处理分页响应数据
 * @param response API响应对象
 * @param dataList 要更新的数据列表
 * @param pagination 要更新的分页配置
 * @returns 处理后的数据列表
 */
export function handlePageResponse<T>(
  response: any,
  dataList: T[],
  pagination: PaginationProps
): T[] {
  if (!response) return [];

  const data = response.data || {};
  // 适配两种可能的数据结构: rows或list
  const items = data.rows || data.list || [];
  // 更新分页信息
  pagination.total = data.total || 0;
  pagination.currentPage = data.currentPage || pagination.currentPage;
  pagination.pageSize = data.pageSize || pagination.pageSize;

  return items;
}

/**
 * 执行分页查询的通用方法
 * @param apiFn 要执行的API函数
 * @param formData 查询表单数据
 * @param dataList 数据列表Ref
 * @param pagination 分页配置
 * @param loadingRef 加载状态Ref
 * @param errorMessage 错误提示信息
 * @returns 查询得到的数据列表
 */
export async function executePageQuery<T>(
  apiFn: (params: any) => Promise<any>,
  formData: Record<string, any>,
  dataList: Ref<T[]>,
  pagination: PaginationProps,
  loadingRef: Ref<boolean>,
  errorMessage = "获取数据列表失败"
): Promise<T[]> {
  loadingRef.value = true;
  try {
    // 使用工具函数构建分页请求参数
    const params = buildPageParams(formData, pagination);
    console.log("请求参数:", params);

    const response = await apiFn(params);
    // 使用工具函数处理分页响应数据
    const result = handlePageResponse<T>(response, dataList.value, pagination);
    return result;
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    message(`${errorMessage}，请重试`, { type: "error" });
    dataList.value = [];
    return [];
  } finally {
    setTimeout(() => {
      loadingRef.value = false;
    }, 300);
  }
}

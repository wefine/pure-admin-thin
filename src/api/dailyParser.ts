import { get, post, put, del } from "./request";

/**
 * 解析器API的基础URL前缀
 */
const BASE_URL = "/daily/webParser";

/**
 * 解析器相关的API接口
 */
const dailyParserApi = {
  /**
   * 获取解析器列表
   * @param params 查询参数
   * @returns 解析器列表
   */
  getParserList(params: any) {
    return post(`${BASE_URL}/list`, params);
  },

  /**
   * 获取所有解析器（无分页）
   * @returns 所有解析器列表
   */
  getAllParsers() {
    return get(`${BASE_URL}/all`);
  },

  /**
   * 获取解析器详情
   * @param id 解析器ID
   * @returns 解析器详情
   */
  getParserDetail(id: string) {
    return get(`${BASE_URL}/${id}`);
  },

  /**
   * 创建解析器
   * @param data 解析器数据
   * @returns 创建结果
   */
  createParser(data: any) {
    return post(`${BASE_URL}/create`, data);
  },

  /**
   * 更新解析器
   * @param id 解析器ID
   * @param data 解析器数据
   * @returns 更新结果
   */
  updateParser(id: string, data: any) {
    return put(`${BASE_URL}/${id}`, data);
  },

  /**
   * 删除解析器
   * @param id 解析器ID
   * @returns 删除结果
   */
  deleteParser(id: string) {
    return del(`${BASE_URL}/${id}`);
  },

  /**
   * 更新解析器状态
   * @param id 解析器ID
   * @param data 包含enabled_flag的对象
   * @returns 更新结果
   */
  updateParserStatus(id: string, data: { enabled_flag: string }) {
    return put(`${BASE_URL}/${id}/status`, data);
  },

  /**
   * 手动触发解析器
   * @param id 解析器ID
   * @returns 触发结果
   */
  triggerParser(id: string) {
    return post(`${BASE_URL}/${id}/trigger`);
  },

  /**
   * 上传解析器
   * @param formData 解析器信息与文件的FormData对象
   * @returns 上传结果
   */
  uploadParser(formData: FormData) {
    return post(`${BASE_URL}/upload`, formData);
  }
};

export default dailyParserApi;

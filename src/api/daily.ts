import { get, post, put, del } from "./request";

/**
 * 日报任务相关的API接口
 */
const dailyApi = {
  /**
   * 获取任务列表
   * @param params 查询参数
   * @returns 任务列表
   */
  getTaskList(params: any) {
    return get("/daily/task/list", params);
  },

  /**
   * 获取任务详情
   * @param id 任务ID
   * @returns 任务详情
   */
  getTaskDetail(id: string) {
    return get(`/daily/task/${id}`);
  },

  /**
   * 创建任务
   * @param data 任务数据
   * @returns 创建结果
   */
  createTask(data: any) {
    return post("/daily/task/create", data);
  },

  /**
   * 更新任务
   * @param id 任务ID
   * @param data 任务数据
   * @returns 更新结果
   */
  updateTask(id: string, data: any) {
    return put(`/daily/task/${id}`, data);
  },

  /**
   * 删除任务
   * @param id 任务ID
   * @returns 删除结果
   */
  deleteTask(id: string) {
    return del(`/daily/task/${id}`);
  },

  /**
   * 手动触发任务采集
   * @param id 任务ID
   * @returns 触发结果
   */
  triggerCollect(id: string) {
    return post(`/daily/task/${id}/collect`);
  },

  /**
   * 手动触发任务推送
   * @param id 任务ID
   * @returns 触发结果
   */
  triggerPush(id: string) {
    return post(`/daily/task/${id}/push`);
  }
};

export default dailyApi;

import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ElMessage } from "element-plus";

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api", // 从环境变量获取API基础URL
  timeout: 60000, // 请求超时时间，增加到60秒以允许更长的请求处理时间
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  }
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token并添加到请求头
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 添加X-Emp-No头信息
    // const empNo = localStorage.getItem("empNo") || "";
    config.headers["X-Emp-No"] = "0668001185";

    return config;
  },
  error => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;

    if (data.code == 200) {
      return data;
    }

    // 适配两种可能的返回格式
    // 格式1: {code: 0, message: "成功", ...}
    // 格式2: {success: true, message: "查询成功", data: [...], ...}
    // 如果有success字段且为false，表示请求失败
    if (data.success === false) {
      ElMessage.error(data.message || "请求失败");
      return Promise.reject(new Error(data.message || "请求失败"));
    }

    // 如果有code字段且不为0，表示请求失败
    if (data.code !== undefined && data.code !== 0) {
      ElMessage.error(data.message || "请求失败");

      // 如果状态码为401或403，可能是未登录或token过期
      if (data.code === 401 || data.code === 403) {
        // 清除用户信息并跳转到登录页
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      return Promise.reject(new Error(data.message || "请求失败"));
    }

    return data;
  },
  error => {
    console.error("响应错误:", error);

    // 处理网络错误
    let message = "网络错误，请稍后重试";
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = "未授权，请重新登录";
          // 清除用户信息并跳转到登录页
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          message = "拒绝访问";
          break;
        case 404:
          message = "请求的资源不存在";
          break;
        case 500:
          message = "服务器内部错误";
          break;
        default:
          message = `请求失败: ${error.response.status}`;
      }
    } else if (error.request) {
      message = "服务器未响应";
    }

    ElMessage.error(message);
    return Promise.reject(error);
  }
);

// 封装GET请求
export function get(url: string, params?: any, config?: AxiosRequestConfig) {
  return service.get(url, { params, ...config });
}

// 封装POST请求
export function post(url: string, data?: any, config?: AxiosRequestConfig) {
  return service.post(url, data, config);
}

// 封装PUT请求
export function put(url: string, data?: any, config?: AxiosRequestConfig) {
  return service.put(url, data, config);
}

// 封装DELETE请求
export function del(url: string, params?: any, config?: AxiosRequestConfig) {
  return service.delete(url, { params, ...config });
}

export default service;

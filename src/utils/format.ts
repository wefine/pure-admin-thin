/**
 * 日期格式化工具函数
 */

/**
 * 格式化日期时间字符串
 * @param dateStr 日期时间字符串，如: "2025-05-12T15:42:03"
 * @param format 格式化模板，默认为 "YYYY-MM-DD HH:mm:ss"
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  dateStr?: string,
  format: string = "YYYY-MM-DD HH:mm:ss"
): string {
  if (!dateStr) return "-";

  try {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return dateStr;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return format
      .replace("YYYY", String(year))
      .replace("MM", month)
      .replace("DD", day)
      .replace("HH", hours)
      .replace("mm", minutes)
      .replace("ss", seconds);
  } catch (error) {
    console.error("日期格式化错误:", error);
    return dateStr || "-";
  }
}

/**
 * 格式化数字为千分位分隔的字符串
 * @param num 需要格式化的数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num?: number): string {
  if (num === undefined || num === null) return "-";
  return num.toLocaleString();
}

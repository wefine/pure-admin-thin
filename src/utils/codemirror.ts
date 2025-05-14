/**
 * CodeMirror公共导入文件
 * 集中管理CodeMirror相关的样式和扩展
 */

// 基础样式
import "codemirror/theme/material-darker.css";
import "codemirror/addon/hint/show-hint.css";

// 功能扩展
import "codemirror/addon/hint/show-hint";

// 语言模式
import "codemirror/mode/python/python.js"; // Python语法支持
import "codemirror/mode/markdown/markdown.js"; // Markdown语法支持
import "codemirror/mode/gfm/gfm.js"; // GitHub Flavored Markdown支持
import "codemirror/mode/htmlmixed/htmlmixed.js"; // HTML混合语法支持
import "codemirror/mode/xml/xml.js"; // XML语法支持
import "codemirror/mode/javascript/javascript.js"; // JavaScript语法支持
import "codemirror/mode/css/css.js"; // CSS语法支持

// 自定义样式
import "@/style/codemirror.scss";

// 导出CodeMirror组件和类型（方便组件中使用）
export { default as Codemirror } from "codemirror-editor-vue3";
export type { Editor, EditorConfiguration } from "codemirror";

# Kaiwu-View

开物 3D 模型查看器，使用 Vue 3、TypeScript、Vite 2 与 Three.js 0.136。仓库同时保留 Capacitor 配置和 Android 工程，用于 Web 内容的移动端集成。

## 功能

- 从模型链接、远程 JSON 或本地 JSON 加载展示内容。
- 提供 3D 场景展示、播放/暂停和模型重置交互。
- 包含灯光、材质、相机和后处理辅助模块。
- 保留参数导出逻辑与模型操作文档。

## Web 开发与构建

需要 Node.js、npm 和支持 WebGL 的浏览器，在仓库根目录执行：

```sh
npm ci
npm run dev
```

打开终端显示的地址。路由使用 hash 模式，首页为 `/#/`，查看器为 `/#/viewer`；`/#/jump` 对应仓库中的跳转占位页面。

```sh
npm run build
npm run serve
```

`build` 先执行 TypeScript 检查再输出 `dist/`，`serve` 用于本地预览构建结果。

## 目录

| 路径 | 用途 |
| --- | --- |
| `src/pages/` | 模型导入与跳转页面 |
| `src/viewer/` | Three.js 查看器及交互模块 |
| `src/router/index.ts` | 页面路由 |
| `public/` | 模型、环境贴图、图片与操作文档 |
| `capacitor.config.ts` | 原生应用配置，Web 产物目录为 `dist` |
| `android/` | Android 工程 |

## 移动端集成

仓库依赖中包含 Capacitor 3 的 Android/iOS 包，但 `package.json` 未声明 `@capacitor/cli`，且没有提交 iOS 工程。原生构建前需补齐匹配的工具链，并核对应用 ID、Android SDK 和签名配置；不能仅凭现有 npm 脚本完成原生打包。

## 资源与配置

模型、纹理、JSON 和部分按钮图片依赖外部资源地址。请确认资源可访问，并为跨域模型和配置允许 CORS。使用 glTF 时，其引用的二进制文件与纹理应一起部署。

本仓库使用历史依赖版本，工具链兼容性与实际构建结果需在目标环境验证。

## 仓库信息

- 当前默认分支：`master`。
- 仓库地址：[Pannic17/Kaiwu-View](https://github.com/Pannic17/Kaiwu-View)。

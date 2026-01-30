# @luka-cat-mimi/n8n-nodes-feishu-project

在 n8n 中轻松操作飞书项目 —— 无需写代码，拖拽即可实现工作项管理自动化。

## 为什么选择这个节点？

| 痛点 | 解决方案 |
|------|----------|
| 飞书项目 API 调用复杂 | **动态表单**：空间、工作项类型自动加载，下拉选择即可 |
| 分页数据获取麻烦 | **一键获取全部**：自动处理分页，返回完整数据 |
| API 限流导致失败 | **批次处理**：自动控制请求频率，避免触发限流 |
| 请求卡死无响应 | **超时保护**：设置超时时间，请求异常及时中断 |

## 安装

```
npm install @luka-cat-mimi/n8n-nodes-feishu-project
```

或在 n8n 社区节点中搜索安装，参考：[社区节点安装指南](https://docs.n8n.io/integrations/community-nodes/installation/)

## 支持的功能（68 个操作）

<details>
<summary><b>工作项管理（16 个）</b>- 创建、更新、删除、批量操作...</summary>

- 创建工作项 / 查询工作项详情 / 更新工作项 / 删除工作项
- 批量更新工作项 / 终止工作项 / 获取工作项元数据 / 获取工作项操作记录
- 获取工作项任务结果 / 批量查询评审信息 / 查询评审结论 / 更新评审
- 创建工时记录 / 获取工时记录列表 / 更新工时记录 / 删除工时记录
</details>

<details>
<summary><b>工作项搜索（4 个）</b>- 单空间搜索、复杂条件、全局搜索...</summary>

- 单空间工作项搜索 / 复杂条件搜索 / 全局搜索 / 关联工作项搜索
</details>

<details>
<summary><b>工作项配置（9 个）</b>- 字段管理、关联配置...</summary>

- 获取/更新工作项基础信息
- 创建/获取/更新工作项字段
- 创建/获取/更新/删除工作项关联配置
</details>

<details>
<summary><b>空间管理（6 个）</b>- 空间列表、详情、成员...</summary>

- 获取空间列表 / 获取空间列表详情 / 获取空间详情
- 获取空间业务线 / 获取空间团队成员 / 获取空间工作项类型列表
</details>

<details>
<summary><b>空间关联（4 个）</b>- 工作项关联绑定...</summary>

- 获取关联规则列表 / 绑定工作项关联 / 解绑工作项关联 / 获取关联工作项列表
</details>

<details>
<summary><b>流程与节点（5 个）</b>- 流程节点操作、状态变更...</summary>

- 查询流程节点 / 更新流程节点 / 操作流程节点 / 变更工作项状态 / 获取WBS视图
</details>

<details>
<summary><b>子任务（5 个）</b>- 子任务 CRUD...</summary>

- 创建子任务 / 获取子任务详情 / 更新子任务 / 操作子任务 / 删除子任务
</details>

<details>
<summary><b>视图管理（8 个）</b>- 视图创建、更新...</summary>

- 获取视图列表 / 创建条件视图 / 更新条件视图 / 创建固定视图
- 更新固定视图 / 删除视图 / 获取全景视图 / 获取视图工作项列表
</details>

<details>
<summary><b>评论管理（4 个）</b>- 评论 CRUD...</summary>

- 创建评论 / 查询评论 / 更新评论 / 删除评论
</details>

<details>
<summary><b>附件管理（4 个）</b>- 文件上传下载...</summary>

- 文件上传（通用） / 工作项附件上传 / 附件下载 / 附件删除
</details>

<details>
<summary><b>用户管理（4 个）</b>- 用户信息、用户组...</summary>

- 获取用户信息 / 搜索租户内的用户列表 / 创建用户组 / 更新用户组成员
</details>

<details>
<summary><b>其他（3 个）</b>- 流程模板、角色、群组、度量...</summary>

- 创建流程模板 / 获取流程角色列表 / 机器人加入聊天 / 获取图表详情
</details>

## 快速开始

### 1. 获取凭证

| 凭证 | 获取方式 |
|------|----------|
| **插件 ID / 密钥** | 飞书项目管理后台 → 插件管理 → 创建或查看插件 |
| **用户 ID** | 飞书项目空间左下角 → 双击个人头像 |
| **Host** | 通常为 `project.feishu.cn` |

### 2. 配置凭证

在 n8n 中创建 **飞书项目 API** 凭据：

| 字段 | 示例 |
|------|------|
| 飞书项目 Host | `project.feishu.cn` |
| 插件 ID | `MII_0000000000000000` |
| 插件密钥 | `AB92E56666CT8D60704743BF69C92C16` |
| 用户 ID | `7568516887894324252` |

### 3. 开始使用

拖入节点 → 选择资源和操作 → 填写参数 → 执行！

## 注意事项

- 确保插件具有所需 API 的访问权限
- [错误码查询](https://project.feishu.cn/b/helpcenter/1p8d7djs/4bsmoql6)

## 支持

- 邮箱：luka.cat.mimi@gmail.com
- [问题反馈](https://github.com/luka-n8n-nodes/n8n-nodes-feishu-project/issues)

## 许可证

MIT License

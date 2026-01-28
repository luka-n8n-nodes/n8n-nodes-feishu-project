# @luka-cat-mimi/n8n-nodes-feishu-project

Feishu Project n8n community node, providing integration support for Feishu Project Open Platform API.

## Installation

Reference: https://docs.n8n.io/integrations/community-nodes/installation/

Node name: `@luka-cat-mimi/n8n-nodes-feishu-project`

## Feature List

> **Feature Legend:**
> - 🔄 **Return All**: Supports automatic pagination to fetch all data
> - 📋 **Dynamic Form**: Supports dynamic loading of space/work item type/field dropdown options
>
> **📊 Feature Stats:** 🔄 Return All: 10 operations | 📋 Dynamic Form: 42 operations

### User Management (4)

| Feature | Traits |
|---------|--------|
| Get user information | - |
| Search users in tenant | - |
| Create user group | - |
| Update user group members | - |

### Space Management (6)

| Feature | Traits |
|---------|--------|
| Get space list | - |
| Get space list details | - |
| Get space details | - |
| Get space business lines | - |
| Get space team members | - |
| Get space work item types list | - |

### Space Relations (4)

| Feature | Traits |
|---------|--------|
| Get relation rules list | - |
| Bind work item relation | 📋 |
| Unbind work item relation | 📋 |
| Get related work items list | 📋 |

### Work Item Instance (16)

| Feature | Traits |
|---------|--------|
| Create work item | 📋 |
| Query work item details | 📋 |
| Update work item | 📋 |
| Delete work item | 📋 |
| Batch update work items | 📋 |
| Abort work item | 📋 |
| Get work item metadata | 📋 |
| Get work item operation records | 🔄 |
| Get work item task result | - |
| Batch query review information | - |
| Query review conclusion | - |
| Update review | - |
| Create work hour record | 📋 |
| Get work hour records list | 🔄 📋 |
| Update work hour record | 📋 |
| Delete work hour record | 📋 |

### Work Item Search (4)

| Feature | Traits |
|---------|--------|
| Single space work item search | 🔄 📋 |
| Complex condition search | 🔄 📋 |
| Global search | 🔄 |
| Related work item search | 🔄 📋 |

### Work Item Configuration (9)

| Feature | Traits |
|---------|--------|
| Get work item basic info | 📋 |
| Update work item basic info | 📋 |
| Create work item field | 📋 |
| Get work item field | 📋 |
| Update work item field | 📋 |
| Create work item relation config | 📋 |
| Get work item relation config | - |
| Update work item relation config | 📋 |
| Delete work item relation config | - |

### Workflow & Nodes (5)

| Feature | Traits |
|---------|--------|
| Query workflow node | 📋 |
| Update workflow node | 📋 |
| Operate workflow node | 📋 |
| Change work item state | 📋 |
| Get WBS view | 📋 |

### Workflow Configuration (1)

| Feature | Traits |
|---------|--------|
| Create workflow template | 📋 |

### Role & Personnel Configuration (1)

| Feature | Traits |
|---------|--------|
| Get workflow roles list | 📋 |

### Subtasks (5)

| Feature | Traits |
|---------|--------|
| Create subtask | 📋 |
| Get subtask details | 📋 |
| Update subtask | 📋 |
| Operate subtask | 📋 |
| Delete subtask | 📋 |

### View Management (8)

| Feature | Traits |
|---------|--------|
| Get view list | 🔄 📋 |
| Create condition view | 📋 |
| Update condition view | 📋 |
| Create fixed view | 📋 |
| Update fixed view | 📋 |
| Delete view | - |
| Get panoramic view | 🔄 |
| Get view work items list | 🔄 |

### Comment Management (4)

| Feature | Traits |
|---------|--------|
| Create comment | 📋 |
| Query comments | 🔄 📋 |
| Update comment | 📋 |
| Delete comment | 📋 |

### Attachment Management (4)

| Feature | Traits |
|---------|--------|
| File upload (general) | - |
| Work item attachment upload | 📋 |
| Attachment download | 📋 |
| Attachment delete | 📋 |

### Groups (1)

| Feature | Traits |
|---------|--------|
| Bot join chat | 📋 |

### Metrics (1)

| Feature | Traits |
|---------|--------|
| Get chart details | - |

## ✨ Special Features

### ⏱️ Timeout & Batch Management

Most interfaces support the following advanced options:

- **Timeout**: Set request timeout (milliseconds) to prevent requests from hanging indefinitely
- **Batching**:
  - **Items per Batch**: Number of items per batch to control request frequency
  - **Batch Interval (ms)**: Wait time between batches to avoid API rate limiting

These features can be configured in the `Options` section of interfaces, effectively handling Feishu Project API rate limits.

### 🔍 Dynamic Space & Work Item Type Loading

The node supports dynamic loading of space lists and work item types. When configuring parameters, you can select directly from dropdown lists without manual input.

### 📂 File Upload Support

Supports file upload via binary data, can be used with "Read Binary File" or other nodes to implement complete file processing workflows.

## Credential Configuration

Create "Feishu Project API" credentials in N8N with the following information:

| Field | Description | Example |
|-------|-------------|---------|
| **Feishu Project Host** | Base host address of Feishu Project | `project.feishu.cn` |
| **Plugin ID** | Feishu Project plugin ID | `MII_0000000000000000` |
| **Plugin Secret** | Feishu Project plugin secret | `AB92E56666CT8D60704743BF69C92C16` |
| **User ID** | User's unique ID for X-USER-KEY header | `7568516887894324252` |

### Obtaining Credential Information

#### Plugin ID and Plugin Secret

1. Log in to Feishu Project management backend
2. Go to plugin management page
3. View or create a plugin to get plugin ID and secret

#### User ID

1. Open browser developer tools
2. Log in to Feishu Project
3. Check the `X-USER-KEY` header information in network requests

## Notes

1. When using plugin credentials to access API, ensure the plugin has the required permissions
2. Error code reference: https://project.feishu.cn/b/helpcenter/1p8d7djs/4bsmoql6

## 📝 License

MIT License

## 🆘 Support

- 📧 Email: luka.cat.mimi@gmail.com
- 🐛 [Issue Feedback](https://github.com/luka-n8n-nodes/n8n-nodes-feishu-project/issues)

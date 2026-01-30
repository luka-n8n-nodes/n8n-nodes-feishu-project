# @luka-cat-mimi/n8n-nodes-feishu-project

Easily manage Feishu Project in n8n — automate work item management with drag-and-drop, no coding required.

## Why Choose This Node?

| Pain Point | Solution |
|------------|----------|
| Complex Feishu Project API calls | **Dynamic Forms**: Auto-load spaces & work item types, just select from dropdown |
| Tedious pagination handling | **Fetch All with One Click**: Auto-handle pagination, return complete data |
| API rate limiting failures | **Batch Processing**: Auto-control request frequency, avoid rate limits |
| Requests hanging indefinitely | **Timeout Protection**: Set timeout, abort abnormal requests promptly |

## Installation

```
npm install @luka-cat-mimi/n8n-nodes-feishu-project
```

Or search and install from n8n community nodes. Reference: [Community Nodes Installation Guide](https://docs.n8n.io/integrations/community-nodes/installation/)

## Supported Features (68 Operations)

<details>
<summary><b>Work Item Management (16)</b> - Create, update, delete, batch operations...</summary>

- Create work item / Query work item details / Update work item / Delete work item
- Batch update work items / Abort work item / Get work item metadata / Get work item operation records
- Get work item task result / Batch query review information / Query review conclusion / Update review
- Create work hour record / Get work hour records list / Update work hour record / Delete work hour record
</details>

<details>
<summary><b>Work Item Search (4)</b> - Single space, complex conditions, global search...</summary>

- Single space work item search / Complex condition search / Global search / Related work item search
</details>

<details>
<summary><b>Work Item Configuration (9)</b> - Field management, relation config...</summary>

- Get/Update work item basic info
- Create/Get/Update work item field
- Create/Get/Update/Delete work item relation config
</details>

<details>
<summary><b>Space Management (6)</b> - Space list, details, members...</summary>

- Get space list / Get space list details / Get space details
- Get space business lines / Get space team members / Get space work item types list
</details>

<details>
<summary><b>Space Relations (4)</b> - Work item relation binding...</summary>

- Get relation rules list / Bind work item relation / Unbind work item relation / Get related work items list
</details>

<details>
<summary><b>Workflow & Nodes (5)</b> - Workflow node operations, state changes...</summary>

- Query workflow node / Update workflow node / Operate workflow node / Change work item state / Get WBS view
</details>

<details>
<summary><b>Subtasks (5)</b> - Subtask CRUD...</summary>

- Create subtask / Get subtask details / Update subtask / Operate subtask / Delete subtask
</details>

<details>
<summary><b>View Management (8)</b> - View creation, updates...</summary>

- Get view list / Create condition view / Update condition view / Create fixed view
- Update fixed view / Delete view / Get panoramic view / Get view work items list
</details>

<details>
<summary><b>Comment Management (4)</b> - Comment CRUD...</summary>

- Create comment / Query comments / Update comment / Delete comment
</details>

<details>
<summary><b>Attachment Management (4)</b> - File upload/download...</summary>

- File upload (general) / Work item attachment upload / Attachment download / Attachment delete
</details>

<details>
<summary><b>User Management (4)</b> - User info, user groups...</summary>

- Get user information / Search users in tenant / Create user group / Update user group members
</details>

<details>
<summary><b>Others (3)</b> - Workflow template, roles, groups, metrics...</summary>

- Create workflow template / Get workflow roles list / Bot join chat / Get chart details
</details>

## Quick Start

### 1. Get Credentials

| Credential | How to Get |
|------------|------------|
| **Plugin ID / Secret** | Feishu Project Admin → Plugin Management → Create or view plugin |
| **User ID** | Bottom-left of Feishu Project space → Double-click your avatar |
| **Host** | Usually `project.feishu.cn` |

### 2. Configure Credentials

Create **Feishu Project API** credentials in n8n:

| Field | Example |
|-------|---------|
| Feishu Project Host | `project.feishu.cn` |
| Plugin ID | `MII_0000000000000000` |
| Plugin Secret | `AB92E56666CT8D60704743BF69C92C16` |
| User ID | `7568516887894324252` |

### 3. Start Using

Drag in the node → Select resource and operation → Fill in parameters → Execute!

## Notes

- Ensure the plugin has the required API access permissions
- [Error Code Reference](https://project.feishu.cn/b/helpcenter/1p8d7djs/4bsmoql6)

## Support

- Email: luka.cat.mimi@gmail.com
- [Issue Feedback](https://github.com/luka-n8n-nodes/n8n-nodes-feishu-project/issues)

## License

MIT License

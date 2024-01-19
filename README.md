# Datawich 🍰
Datawich 是一个数据协作管理系统，可用于[从典型需求中解脱](https://fqk.io/datawich-escape-from-requirements-support/)

* 无需编写代码即可创建数据应用，随时可调整字段结构
* 数据应用间可以进行数据关联，添加自定义动作
* 导入导出 Excel 和批处理，继续熟悉的工作流
* 字段结构可随时备份随时还原
* 细粒度的权限控制，保障数据安全
* 个性化的数据展示和分析，精准满足需要
* 技术人员可以通过 API 进行数据操作

### 典型应用
* 股票数据: <https://stock.datawich.com/>

![](https://image.fangqk.com/2024-01-19/ipo-hk.png)

---

### 准备
* MySQL 数据库、[数据表](https://github.com/fangqk1991/datawich/blob/master/config/schemas.sql)
* 对接单点登录服务。若无现成的 SSO，可以参考 [fangqk1991/sso-app](https://github.com/fangqk1991/sso-app)
* Redis 服务启动 [可选] 用于异步任务，未准备将影响大文件导出
* 阿里云 OSS [可选] 用于文件上传下载，未准备将影响附件和导入导出功能

### 数据表初始化
通过 Docker 使用 `prepare` 命令可以创建 Datawich 服务依赖的[数据表](https://github.com/fangqk1991/datawich/blob/master/config/schemas.sql)

```
docker run --rm \
  -e DB_Host=${DB_Host} \
  -e DB_Port=${DB_Port} \
  -e DB_Name=${DB_Name} \
  -e DB_User=${DB_User} \
  -e DB_Password=${DB_Password} \
  fangqk1991/datawich prepare
```

### 使用 Docker 启动
```
docker pull fangqk1991/datawich

docker run -d --restart=unless-stopped \
  --name datawich \
  -e ENV=production \
  -e adminBaseURL=${adminBaseURL} \
  -e adminJwtSecret=${adminJwtSecret} \
  -e DB_Host=${DB_Host} \
  -e DB_Port=${DB_Port} \
  -e DB_Name=${DB_Name} \
  -e DB_User=${DB_User} \
  -e DB_Password=${DB_Password} \
  -e Redis_Host=${Redis_Host} \
  -e Redis_Port=${Redis_Port} \
  -e useResque=${useResque} \
  -e adminSSO_baseURL=${adminSSO_baseURL} \
  -e adminSSO_clientId=${adminSSO_clientId} \
  -e adminSSO_clientSecret=${adminSSO_clientSecret} \
  -e adminSSO_authorizePath=${adminSSO_authorizePath} \
  -e adminSSO_tokenPath=${adminSSO_tokenPath} \
  -e adminSSO_logoutPath=${adminSSO_logoutPath} \
  -e adminSSO_scope=${adminSSO_scope} \
  -e adminSSO_callbackUri=${adminSSO_callbackUri} \
  -e adminSSO_userInfoURL=${adminSSO_userInfoURL} \
  -e AliOSS_region=${AliOSS_region} \
  -e AliOSS_accessKeyId=${AliOSS_accessKeyId} \
  -e AliOSS_accessKeySecret=${AliOSS_accessKeySecret} \
  -e AliOSS_bucket=${AliOSS_bucket} \
  -e AliOSS_bucketURL=${AliOSS_bucketURL} \
  -e oss_remoteRootDir=${oss_remoteRootDir} \
  -p 3299:3299 \
  fangqk1991/datawich
```


### 登录鉴权
* 传递 adminSSO_xxx 环境变量，对接已有的单点登录系统

### 环境变量说明
| 环境变量 | 缺省值                     | 说明 |
|:-------|:------------------------|:---|
| `adminBaseURL` | `http://localhost:3299` | 网站 baseURL |
| `adminJwtSecret` | `<Datawich Random 32>`  | JWT Secret |
| `DB_Host` | `127.0.0.1` | MySQL Host |
| `DB_Port` | `3306` | MySQL 端口 |
| `DB_Name` | `datawich` | MySQL 数据库名 |
| `DB_User` | `root` | MySQL 用户名 |
| `DB_Password` |  | MySQL 用户密码 |
| `Redis_Host` | `127.0.0.1` | Redis Host |
| `Redis_Port` | `30200` | Redis 端口 |
| `useResque` | `false` | 使用异步任务 |
| `adminSSO_baseURL` |  | SSO baseURL |
| `adminSSO_clientId` | `<clientId>` | SSO clientId |
| `adminSSO_clientSecret` | `<clientSecret>` | SSO clientSecret |
| `adminSSO_authorizePath` | `/api/v1/oauth/authorize` | SSO authorizePath |
| `adminSSO_tokenPath` | `/api/v1/oauth/token` | SSO tokenPath |
| `adminSSO_logoutPath` | `/api/v1/logout` | SSO logoutPath |
| `adminSSO_scope` | `basic` | SSO scope |
| `adminSSO_callbackUri` | `http://localhost:3299/api/v1/handleSSO` | SSO callbackUri |
| `adminSSO_userInfoURL` |  | SSO userInfoURL |
| `AliOSS_region` | `oss-cn-shanghai` | 阿里云 OSS Region |
| `AliOSS_accessKeyId` | `__accessKeyId__` | 阿里云 OSS accessKeyId |
| `AliOSS_accessKeySecret` | `<OSS accessKeySecret>` | 阿里云 OSS accessKeySecret |
| `AliOSS_bucket` | `__bucket__` | 阿里云 OSS bucket |
| `AliOSS_bucketURL` | `<bucketURL>` | 阿里云 OSS bucketURL |
| `oss_remoteRootDir` | `datawich-staging` | 阿里云 OSS 目录前缀 |

## 说明
* `docker.deps` 目录用于存放本项目在 Docker 构建时依赖的文件
* 同目录下 `deps` 语义不明，后续将被废弃
* 敏感信息不能在版本控制中体现，`cdn.oss.js` 等配置文件中相关信息应脱敏
* 实际构建中（本地或 Jenkins）会将上述配置文件进行覆盖，达到正常运行的目的
* （如需在本地验证 Docker 构建，请在 `deploy/docker.deps.local/` 目录中建立同名配置文件）

# CREATE DATABASE `datawich` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
# USE datawich;

CREATE TABLE IF NOT EXISTS common_group
(
    _rid        BIGINT UNSIGNED               NOT NULL AUTO_INCREMENT PRIMARY KEY,
    group_id    CHAR(32) COLLATE ascii_bin    NOT NULL COMMENT '组 ID，具备唯一性',
    app         VARCHAR(31) COLLATE ascii_bin NOT NULL DEFAULT '' COMMENT '应用标识符',
    name        VARCHAR(127)                  NOT NULL DEFAULT '' COMMENT '组名',
    space       VARCHAR(127)                  NOT NULL DEFAULT '' COMMENT '组所处的空间',
    obj_key     VARCHAR(63)                   NOT NULL DEFAULT '' COMMENT '标识键',
    group_level VARCHAR(127)                  NOT NULL COMMENT '字段类型: 枚举值见 GroupLevel 定义',
    remarks     VARCHAR(255)                  NOT NULL DEFAULT '' COMMENT '备注',
    version     INT                           NOT NULL DEFAULT 0 COMMENT '版本号',
    create_time TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (group_id),
    INDEX (space, obj_key),
    INDEX (app),
    INDEX (space)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS group_member
(
    _rid        BIGINT UNSIGNED                NOT NULL AUTO_INCREMENT PRIMARY KEY,
    group_id    CHAR(32) COLLATE ascii_bin     NOT NULL COMMENT '组 ID，SQL 外键 -> common_group.group_id',
    FOREIGN KEY (group_id) REFERENCES common_group (group_id) ON DELETE RESTRICT,
    member      VARCHAR(127) COLLATE ascii_bin NOT NULL COMMENT '用户唯一标识；(group_id, member) 具备唯一性',
    is_admin    TINYINT                        NOT NULL DEFAULT 0 COMMENT '是否为管理员',
    extras_info MEDIUMTEXT COMMENT '附加信息，空 | JSON 字符串',
    create_time TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (group_id, member),
    INDEX (member)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS group_permission
(
    _rid        BIGINT UNSIGNED                NOT NULL AUTO_INCREMENT PRIMARY KEY,
    group_id    CHAR(32) COLLATE ascii_bin     NOT NULL COMMENT '组 ID，SQL 外键 -> common_group.group_id',
    FOREIGN KEY (group_id) REFERENCES common_group (group_id) ON DELETE RESTRICT,
    scope       VARCHAR(63) COLLATE ascii_bin  NOT NULL COMMENT '范围描述项 | *',
    permission  VARCHAR(127) COLLATE ascii_bin NOT NULL DEFAULT '' COMMENT '权限描述项 GeneralPermission | *',
    create_time TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (group_id, scope, permission),
    INDEX (scope),
    INDEX (permission)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;

#####################

CREATE TABLE IF NOT EXISTS oss_resource
(
    _rid        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    resource_id CHAR(32)        NOT NULL COLLATE ascii_bin COMMENT '资源唯一 ID',
    provider    ENUM ('Aliyun') COMMENT '服务商',
    bucket_name VARCHAR(127)    NOT NULL DEFAULT '' COLLATE ascii_bin COMMENT 'Bucket Name',
    oss_key     TEXT COMMENT 'OSS Key',
    mime_type   VARCHAR(127)    NOT NULL DEFAULT '' COLLATE ascii_bin COMMENT 'MIME Type',
    size        BIGINT          NOT NULL DEFAULT 0 COMMENT '文件大小(B)',
    oss_status  ENUM ('Pending', 'Uploading', 'Success', 'Fail', 'Deleted') COMMENT '文件状态',
    uploader    VARCHAR(127)    NOT NULL DEFAULT '' COLLATE ascii_bin COMMENT '上传者',
    create_time TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间: ISO8601 字符串',
    update_time TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间: ISO8601 字符串',
    UNIQUE (resource_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS resource_task
(
    _rid           BIGINT UNSIGNED                                   NOT NULL AUTO_INCREMENT PRIMARY KEY,
    task_key       CHAR(32)                                          NOT NULL COLLATE ascii_bin COMMENT '任务 Key',
    resource_id    CHAR(32)                                          NOT NULL DEFAULT '' COLLATE ascii_bin COMMENT '资源唯一 ID',
    provider       ENUM ('Aliyun')                                   NOT NULL DEFAULT 'Aliyun' COMMENT '服务商',
    bucket_name    VARCHAR(127)                                      NOT NULL DEFAULT '' COLLATE ascii_bin COMMENT 'Bucket Name',
    oss_key        TEXT COMMENT 'OSS Key',
    mime_type      VARCHAR(127)                                      NOT NULL DEFAULT '' COLLATE ascii_bin COMMENT 'MIME Type',
    size           BIGINT                                            NOT NULL DEFAULT 0 COMMENT '文件大小(B)',
    task_type      VARCHAR(127)                                      NOT NULL DEFAULT '' COMMENT '任务类型',
    file_name      VARCHAR(127)                                      NOT NULL DEFAULT '' COMMENT '文件名',
    current        BIGINT                                            NOT NULL DEFAULT 0 COMMENT '当前已完成',
    total          BIGINT                                            NOT NULL DEFAULT 0 COMMENT '总数',
    task_status    ENUM ('Pending', 'Processing', 'Success', 'Fail') NOT NULL DEFAULT 'Pending' COMMENT '任务状态，ResourceTaskStatus',
    error_message  TEXT COMMENT '错误信息',
    raw_params_str TEXT COMMENT '任务原始参数',
    create_time    TIMESTAMP                                         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time    TIMESTAMP                                         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (task_key)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS user_resource_task
(
    _rid        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    task_key    CHAR(32)        NOT NULL COLLATE ascii_bin COMMENT '任务 Key',
    FOREIGN KEY (task_key) REFERENCES resource_task (task_key) ON DELETE RESTRICT,
    user_email  VARCHAR(127)    NOT NULL COLLATE ascii_bin COMMENT '用户邮箱',
    create_time TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (task_key, user_email),
    INDEX (user_email)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;

#####################

CREATE TABLE IF NOT EXISTS common_job
(
    _rid            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    job_id          CHAR(32)        NOT NULL COLLATE ascii_bin COMMENT '任务 ID，具备唯一性',
    app             VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '应用',
    queue           VARCHAR(63)     NOT NULL DEFAULT '' COMMENT '所处队列',
    task_name       VARCHAR(63)     NOT NULL DEFAULT '' COMMENT '任务名',
    object_id       VARCHAR(63)     NOT NULL DEFAULT '' COMMENT '对象主键 ID',
    params_str      TEXT COMMENT '相关参数',
    task_state      VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '任务状态',
    pending_elapsed BIGINT          NOT NULL DEFAULT 0 COMMENT '任务等待耗时，单位：毫秒',
    perform_elapsed BIGINT          NOT NULL DEFAULT 0 COMMENT '任务执行耗时，单位：毫秒',
    error_message   TEXT COMMENT '错误信息',
    create_time     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (job_id),
    INDEX (app),
    INDEX (queue),
    INDEX (task_name),
    INDEX (object_id),
    INDEX (task_state),
    INDEX (pending_elapsed),
    INDEX (perform_elapsed),
    INDEX (create_time),
    INDEX (update_time)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

#####################

CREATE TABLE IF NOT EXISTS data_model
(
    _rid               BIGINT UNSIGNED               NOT NULL AUTO_INCREMENT PRIMARY KEY,
    model_key          varchar(63) COLLATE ascii_bin NOT NULL COMMENT '模型键值，由用户自行指定，具备唯一性',
    model_type         varchar(127)                  NOT NULL DEFAULT 'NormalModel' COMMENT '模型类型: 枚举值见 ModelType 定义',
    short_key          varchar(4)                             DEFAULT NULL COMMENT '模型 short_key 值，由用户自行指定，具备唯一性',
    name               varchar(127)                  NOT NULL DEFAULT '' COMMENT '模型名称',
    description        text COMMENT '模型描述',
    remarks            varchar(255)                  NOT NULL DEFAULT '' COMMENT '备注',
    version            int                           NOT NULL DEFAULT '0' COMMENT '版本号',
    access_level       varchar(32)                   NOT NULL DEFAULT 'Protected' COMMENT '可访问的级别: 枚举值见 AccessLevel 定义',
    is_retained        tinyint                       NOT NULL DEFAULT '0' COMMENT '是否为系统预留模型（不可删除）',
    is_data_insertable tinyint                       NOT NULL DEFAULT '1' COMMENT '数据是否可插入',
    is_data_modifiable tinyint                       NOT NULL DEFAULT '1' COMMENT '数据是否可修改',
    is_data_deletable  tinyint                       NOT NULL DEFAULT '1' COMMENT '数据是否可删除',
    is_online          tinyint                       NOT NULL DEFAULT '0' COMMENT '是否已上线',
    is_custom          tinyint                       NOT NULL DEFAULT '0' COMMENT '是否自定义',
    is_library         tinyint                       NOT NULL DEFAULT '0' COMMENT '是否可以作为子模型被其他模型引用',
    is_locked          tinyint                       NOT NULL DEFAULT '0' COMMENT '是否锁定，被锁定的模型不可修改',
    is_deleted         tinyint                       NOT NULL DEFAULT '0' COMMENT '是否已被删除',
    author             varchar(255)                  NOT NULL DEFAULT '' COMMENT '创建者邮箱',
    sample_date        date                          NOT NULL DEFAULT '1970-01-01' COMMENT '采样日期，目前主要用于数据源模型',
    tags               text COMMENT '模型标签，如 GoodsBilling, GoodsPower',
    extras_info        mediumtext COMMENT '附加信息，空 | JSON 字符串',
    create_time        TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time        TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (model_key),
    UNIQUE (short_key)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS model_field
(
    _rid          BIGINT UNSIGNED               NOT NULL AUTO_INCREMENT PRIMARY KEY,
    model_key     varchar(63) COLLATE ascii_bin NOT NULL COMMENT '模型键值，SQL 外键 -> data_model.model_key',
    FOREIGN KEY (model_key) REFERENCES data_model (model_key) ON DELETE RESTRICT,
    field_key     varchar(63) COLLATE ascii_bin NOT NULL COMMENT '字段键值，由用户自行指定；(model_key, field_key) 具备唯一性',
    name          varchar(255)                  NOT NULL DEFAULT '' COMMENT '字段名称',
    required      tinyint                       NOT NULL DEFAULT '0' COMMENT '是否为必填项',
    use_default   tinyint                       NOT NULL DEFAULT '0' COMMENT '是否自动填充默认值',
    default_value varchar(255)                  NOT NULL DEFAULT '' COMMENT '默认值',
    field_type    varchar(255)                  NOT NULL DEFAULT '' COMMENT '字段类型: 枚举值见 FieldType 定义',
    extras_info   mediumtext COMMENT '附加信息，空 | JSON 字符串',
    remarks       varchar(255)                  NOT NULL DEFAULT '' COMMENT '备注',
    weight        int                           NOT NULL DEFAULT '0' COMMENT '权重，用于排序',
    is_system     tinyint                       NOT NULL DEFAULT '0' COMMENT '是否为系统保留字段',
    is_hidden     tinyint                       NOT NULL DEFAULT '0' COMMENT '是否隐藏',
    is_deleted    tinyint                       NOT NULL DEFAULT '0' COMMENT '是否已被删除',
    create_time   TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (model_key, field_key)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS field_index
(
    _rid        BIGINT UNSIGNED               NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `model_key` varchar(63) COLLATE ascii_bin NOT NULL COMMENT '模型键值，SQL 外键 -> model_field.model_key',
    `field_key` varchar(63) COLLATE ascii_bin NOT NULL COMMENT '字段键值，SQL 外键 -> model_field.field_key',
    FOREIGN KEY (model_key, field_key) REFERENCES model_field (model_key, field_key) ON DELETE CASCADE,
    `is_unique` tinyint                       NOT NULL DEFAULT '0' COMMENT '是否具备 UNIQUE 属性',
    create_time TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (`model_key`, `field_key`),
    INDEX (`is_unique`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS field_link
(
    _rid               BIGINT UNSIGNED               NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `link_id`          varchar(63)                   NOT NULL COMMENT '链接 UID',
    `model_key`        varchar(63) COLLATE ascii_bin NOT NULL COMMENT '模型键值，SQL 外键 -> model_field.model_key',
    `field_key`        varchar(63) COLLATE ascii_bin NOT NULL COMMENT '字段键值，SQL 外键 -> model_field.field_key',
    FOREIGN KEY (model_key, field_key) REFERENCES model_field (model_key, field_key) ON DELETE CASCADE,
    `ref_model`        varchar(63) COLLATE ascii_bin NOT NULL COMMENT '模型键值，SQL 外键 -> model_field.model_key',
    `ref_field`        varchar(63) COLLATE ascii_bin NOT NULL COMMENT '字段键值，SQL 外键 -> model_field.field_key',
    FOREIGN KEY (ref_model, ref_field) REFERENCES model_field (model_key, field_key) ON DELETE CASCADE,
    `is_foreign_key`   tinyint                       NOT NULL DEFAULT '0' COMMENT '是否具备外键约束',
    `is_inline`        tinyint                       NOT NULL DEFAULT '0' COMMENT '是否采用内联的方式',
    `fk_name`          varchar(127)                  NOT NULL DEFAULT '' COMMENT '外键名称',
    `on_update_action` varchar(127)                  NOT NULL DEFAULT '' COMMENT '字段类型: 枚举值见 TriggerAction 定义',
    `on_delete_action` varchar(127)                  NOT NULL DEFAULT '' COMMENT '字段类型: 枚举值见 TriggerAction 定义',
    `extras_info`      mediumtext COMMENT '附加信息，空 | JSON 字符串',
    create_time        TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time        TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (`model_key`, `field_key`, `ref_model`, `ref_field`),
    UNIQUE (`link_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS app_client
(
    _rid         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `appid`      varchar(63)     NOT NULL COMMENT '应用 ID，用户自定义（最好具备语义），具备唯一性',
    `app_secret` char(32)        NOT NULL COMMENT '应用密钥',
    `name`       varchar(127)    NOT NULL DEFAULT '' COMMENT '应用名称',
    create_time  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (`appid`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS model_authorization
(
    _rid        BIGINT UNSIGNED               NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `model_key` varchar(63) COLLATE ascii_bin NOT NULL COMMENT '模型键值，SQL 外键 -> data_model.model_key',
    FOREIGN KEY (model_key) REFERENCES data_model (model_key) ON DELETE CASCADE,
    `appid`     varchar(63)                   NOT NULL COMMENT '模型键值，SQL 外键 -> app_client.appid',
    FOREIGN KEY (appid) REFERENCES app_client (appid) ON DELETE CASCADE,
    create_time TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (`model_key`, `appid`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS model_group
(
    _rid        BIGINT UNSIGNED               NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `model_key` varchar(63) COLLATE ascii_bin NOT NULL COMMENT '模型键值，SQL 外键 -> data_model.model_key',
    FOREIGN KEY (model_key) REFERENCES data_model (model_key) ON DELETE RESTRICT,
    `group_id`  char(63)                      NOT NULL COMMENT '组 ID，SQL 外键 -> common_group.group_id',
    create_time TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (`model_key`, `group_id`),
    INDEX (`group_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS common_profile
(
    _rid          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user`        varchar(127)    NOT NULL COMMENT '用户邮箱；(group_id, member) 具备唯一性',
    `event`       varchar(63)     NOT NULL COMMENT '事件描述项',
    `target`      varchar(127)    NOT NULL DEFAULT '目标 ID',
    `description` text COMMENT '描述信息，空 | JSON 字符串',
    create_time   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY `user` (`user`, `event`, `target`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS model_milestone
(
    _rid           BIGINT UNSIGNED               NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `uid`          char(32) COLLATE ascii_bin    NOT NULL COMMENT 'UID，具备唯一性',
    `model_key`    varchar(63) COLLATE ascii_bin NOT NULL COMMENT '模型键值，SQL 外键 -> data_model.model_key',
    FOREIGN KEY (model_key) REFERENCES data_model (model_key) ON DELETE CASCADE,
    `tag_name`     varchar(63) COLLATE ascii_bin NOT NULL COMMENT '自定义标签',
    `description`  text COMMENT '里程碑描述',
    `metadata_str` mediumtext COMMENT '模型 Metadata 信息，JSON 字符串',
    create_time    TIMESTAMP                     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE (`uid`),
    UNIQUE (`model_key`, `tag_name`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `datahub_engine`
(
    _rid          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `engine_key`  varchar(63)     NOT NULL COMMENT '引擎 ID，具备唯一性',
    `name`        varchar(127)    NOT NULL DEFAULT '' COMMENT '名称',
    `db_name`     varchar(127)    NOT NULL DEFAULT '' COMMENT '名称',
    `extras_info` text COMMENT '附加信息，空 | JSON 字符串',
    `invalid`     tinyint         NOT NULL DEFAULT '0' COMMENT '是否已失效',
    create_time   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (`engine_key`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `datahub_table`
(
    _rid         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `engine_key` varchar(63)     NOT NULL COMMENT '引擎 ID，具备唯一性',
    FOREIGN KEY (engine_key) REFERENCES datahub_engine (engine_key) ON DELETE CASCADE,
    `table_key`  varchar(63)     NOT NULL COMMENT '表名',
    `sort_key`   varchar(255)    NOT NULL DEFAULT '' COMMENT '唯一索引用于排序',
    `version`    int             NOT NULL DEFAULT '0' COMMENT '版本号',
    `invalid`    tinyint         NOT NULL DEFAULT '0' COMMENT '是否已失效',
    create_time  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (`engine_key`, `table_key`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `datahub_column`
(
    _rid          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `engine_key`  varchar(63)     NOT NULL COMMENT '引擎 ID，具备唯一性',
    `table_key`   varchar(63)     NOT NULL COMMENT '表名',
    FOREIGN KEY (engine_key, table_key) REFERENCES datahub_table (engine_key, table_key) ON DELETE CASCADE,
    `column_key`  varchar(63)     NOT NULL COMMENT '列名',
    `column_type` varchar(63)     NOT NULL COMMENT '列类型',
    `name`        varchar(255)    NOT NULL DEFAULT '' COMMENT '列描述',
    `nullable`    tinyint         NOT NULL DEFAULT '0' COMMENT '是否可以为空',
    `special_key` varchar(63)     NOT NULL COMMENT '特殊属性',
    `extras_info` text COMMENT '附加信息',
    `invalid`     tinyint         NOT NULL DEFAULT '0' COMMENT '是否已失效',
    create_time   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (`engine_key`, `table_key`, `column_key`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `datahub_sync_progress`
(
    _rid          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `engine_key`  varchar(63)     NOT NULL COMMENT '引擎 ID，具备唯一性',
    `table_key`   varchar(63)     NOT NULL COMMENT '表名',
    FOREIGN KEY (engine_key, table_key) REFERENCES datahub_table (engine_key, table_key) ON DELETE CASCADE,
    `sample_date` date            NOT NULL COMMENT '日期',
    `current`     bigint          NOT NULL DEFAULT '0' COMMENT '当前已完成',
    `total`       bigint          NOT NULL DEFAULT '0' COMMENT '总数',
    `available`   tinyint         NOT NULL DEFAULT '0' COMMENT '是否可用',
    `badge`       tinyint         NOT NULL DEFAULT '0' COMMENT '发生更新，需要发布',
    `error_msg`   text COMMENT '错误信息',
    create_time   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (`engine_key`, `table_key`, `sample_date`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `datahub_table_link`
(
    _rid          BIGINT UNSIGNED                                   NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `child_model` varchar(63) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '模型键值，SQL 外键 -> data_model.model_key',
    FOREIGN KEY (child_model) REFERENCES data_model (model_key) ON DELETE CASCADE,
    `engine_key`  varchar(63)                                       NOT NULL COMMENT '引擎 ID，具备唯一性',
    `table_key`   varchar(63)                                       NOT NULL COMMENT '表名',
    FOREIGN KEY (engine_key, table_key) REFERENCES datahub_table (engine_key, table_key) ON DELETE CASCADE,
    `sample_date` date                                              NOT NULL DEFAULT '1970-01-01' COMMENT '采样日期',
    create_time   TIMESTAMP                                         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   TIMESTAMP                                         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (`child_model`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `datahub_column_link`
(
    _rid          BIGINT UNSIGNED                                   NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `child_model` varchar(63) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '模型键值，SQL 外键 -> model_field.model_key',
    `child_field` varchar(63) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '字段键值，SQL 外键 -> model_field.field_key',
    FOREIGN KEY (child_model, child_field) REFERENCES model_field (model_key, field_key) ON DELETE CASCADE,
    `engine_key`  varchar(63)                                       NOT NULL COMMENT '引擎 ID，具备唯一性',
    `table_key`   varchar(63)                                       NOT NULL COMMENT '表名',
    `column_key`  varchar(63)                                       NOT NULL COMMENT '列名',
    FOREIGN KEY (engine_key, table_key, column_key) REFERENCES datahub_column (engine_key, table_key, column_key) ON DELETE CASCADE,
    create_time   TIMESTAMP                                         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   TIMESTAMP                                         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS model_panel
(
    _rid            BIGINT UNSIGNED                NOT NULL AUTO_INCREMENT PRIMARY KEY,
    panel_id        CHAR(32) COLLATE ascii_bin     NOT NULL COMMENT 'Panel ID，具备唯一性',
    model_key       varchar(63) COLLATE ascii_bin  NOT NULL COMMENT '模型键值，SQL 外键 -> data_model.model_key',
    FOREIGN KEY (model_key) REFERENCES data_model (model_key) ON DELETE CASCADE,
    author          VARCHAR(255) COLLATE ascii_bin NOT NULL DEFAULT '' COMMENT '创建者邮箱',
    name            VARCHAR(127)                   NOT NULL DEFAULT '' COMMENT '名称',
    config_data_str TEXT COMMENT '描述信息，空 | JSON 字符串',
    create_time     TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time     TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (panel_id),
    INDEX (model_key),
    index (author)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS db_connection
(
    _rid       BIGINT UNSIGNED                NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uid        CHAR(32) COLLATE ascii_bin     NOT NULL COMMENT 'UUID',
    db_host    VARCHAR(255) COLLATE ascii_bin NOT NULL DEFAULT '127.0.0.1' COMMENT 'DB Host',
    db_port    INT                            NOT NULL DEFAULT 3306 COMMENT 'DB Port',
    db_name    VARCHAR(255)                   NOT NULL COMMENT 'DB Name',
    username   VARCHAR(255)                   NOT NULL COMMENT 'username',
    password   TEXT                           NOT NULL COMMENT 'password',
    created_at TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (uid)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS db_table_extras
(
    _rid              BIGINT UNSIGNED                NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uid               CHAR(32) COLLATE ascii_bin     NOT NULL COMMENT 'Table UID',
    connection_id     CHAR(32) COLLATE ascii_bin     NOT NULL COMMENT 'Connection ID',
    table_id          VARCHAR(255) COLLATE ascii_bin NOT NULL COMMENT 'Table ID',
    name              VARCHAR(255)                   NOT NULL DEFAULT '' COMMENT 'Table Name',
    fields_extras_str MEDIUMTEXT COMMENT '附加信息，空 | JSON 字符串',
    created_at        TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at        TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (uid),
    UNIQUE (connection_id, table_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;


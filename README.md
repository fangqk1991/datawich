# Datawich ð°
Datawich æ¯ä¸ä¸ªæ°æ®åä½ç®¡çç³»ç»ï¼å¯ç¨äº[ä»å¸åéæ±ä¸­è§£è±](https://fqk.io/datawich-escape-from-requirements-support/)

* æ éç¼åä»£ç å³å¯åå»ºæ°æ®åºç¨ï¼éæ¶å¯è°æ´å­æ®µç»æ
* æ°æ®åºç¨é´å¯ä»¥è¿è¡æ°æ®å³èï¼æ·»å èªå®ä¹å¨ä½
* å¯¼å¥å¯¼åº Excel åæ¹å¤çï¼ç»§ç»­çæçå·¥ä½æµ
* å­æ®µç»æå¯éæ¶å¤ä»½éæ¶è¿å
* ç»ç²åº¦çæéæ§å¶ï¼ä¿éæ°æ®å®å¨
* ä¸ªæ§åçæ°æ®å±ç¤ºååæï¼ç²¾åæ»¡è¶³éè¦
* ææ¯äººåå¯ä»¥éè¿ API è¿è¡æ°æ®æä½

### Demo
* <https://demo.datawich.com/>

![](https://image.fangqk.com/2022-11-22/datawich-admin-1.png)
![](https://image.fangqk.com/2022-11-22/datawich-admin-2.png)
![](https://image.fangqk.com/2022-11-22/datawich-admin-3.png)

---

### åå¤
* MySQL æ°æ®åºã[æ°æ®è¡¨](https://github.com/fangqk1991/datawich/blob/master/config/schemas.sql)
* å¯¹æ¥åç¹ç»å½æå¡ãè¥æ ç°æç SSOï¼å¯ä»¥åè [fangqk1991/sso-app](https://github.com/fangqk1991/sso-app)
* Redis æå¡å¯å¨ [å¯é] ç¨äºå¼æ­¥ä»»å¡ï¼æªåå¤å°å½±åå¤§æä»¶å¯¼åº
* é¿éäº OSS [å¯é] ç¨äºæä»¶ä¸ä¼ ä¸è½½ï¼æªåå¤å°å½±åéä»¶åå¯¼å¥å¯¼åºåè½

### æ°æ®è¡¨åå§å
éè¿ Docker ä½¿ç¨ `prepare` å½ä»¤å¯ä»¥åå»º Datawich æå¡ä¾èµç[æ°æ®è¡¨](https://github.com/fangqk1991/datawich/blob/master/config/schemas.sql)

```
docker run --rm \
  -e DB_Host=${DB_Host} \
  -e DB_Port=${DB_Port} \
  -e DB_Name=${DB_Name} \
  -e DB_User=${DB_User} \
  -e DB_Password=${DB_Password} \
  fangqk1991/datawich prepare
```

### ä½¿ç¨ Docker å¯å¨
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


### ç»å½é´æ
* ä¼ é adminSSO_xxx ç¯å¢åéï¼å¯¹æ¥å·²æçåç¹ç»å½ç³»ç»

### ç¯å¢åéè¯´æ
| ç¯å¢åé | ç¼ºçå¼                     | è¯´æ |
|:-------|:------------------------|:---|
| `adminBaseURL` | `http://localhost:3299` | ç½ç« baseURL |
| `adminJwtSecret` | `<Datawich Random 32>`  | JWT Secret |
| `DB_Host` | `127.0.0.1` | MySQL Host |
| `DB_Port` | `3306` | MySQL ç«¯å£ |
| `DB_Name` | `datawich` | MySQL æ°æ®åºå |
| `DB_User` | `root` | MySQL ç¨æ·å |
| `DB_Password` |  | MySQL ç¨æ·å¯ç  |
| `Redis_Host` | `127.0.0.1` | Redis Host |
| `Redis_Port` | `30200` | Redis ç«¯å£ |
| `useResque` | `false` | ä½¿ç¨å¼æ­¥ä»»å¡ |
| `adminSSO_baseURL` |  | SSO baseURL |
| `adminSSO_clientId` | `<clientId>` | SSO clientId |
| `adminSSO_clientSecret` | `<clientSecret>` | SSO clientSecret |
| `adminSSO_authorizePath` | `/api/v1/oauth/authorize` | SSO authorizePath |
| `adminSSO_tokenPath` | `/api/v1/oauth/token` | SSO tokenPath |
| `adminSSO_logoutPath` | `/api/v1/logout` | SSO logoutPath |
| `adminSSO_scope` | `basic` | SSO scope |
| `adminSSO_callbackUri` | `http://localhost:3299/api/v1/handleSSO` | SSO callbackUri |
| `adminSSO_userInfoURL` |  | SSO userInfoURL |
| `AliOSS_region` | `oss-cn-shanghai` | é¿éäº OSS Region |
| `AliOSS_accessKeyId` | `__accessKeyId__` | é¿éäº OSS accessKeyId |
| `AliOSS_accessKeySecret` | `<OSS accessKeySecret>` | é¿éäº OSS accessKeySecret |
| `AliOSS_bucket` | `__bucket__` | é¿éäº OSS bucket |
| `AliOSS_bucketURL` | `<bucketURL>` | é¿éäº OSS bucketURL |
| `oss_remoteRootDir` | `datawich-staging` | é¿éäº OSS ç®å½åç¼ |

export interface ModelClientParams {
  appid: string
  name: string
}

export interface ModelClientModel extends ModelClientParams {
  appid: string
  name: string
  appSecret: string
  createTime: string
  updateTime: string
}

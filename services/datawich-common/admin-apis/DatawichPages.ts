import * as assert from 'assert'

export class DatawichPages {
  public static ModelListRoute = '/v1/data-model'
  public static ModelDetailRoute = '/v1/data-model/:modelKey'

  public static AllDataAppsRoute = '/v1/all-data-app'
  public static DataAppListRoute = '/v1/data-app'
  public static DataAppDetailRoute = '/v1/data-app/:modelKey'

  public static ClientListRoute = '/v1/model-client'

  public static JobListRoute = '/v1/job'
  public static ResourceTaskListRoute = '/oss-sdk/v1/resource-task'

  public static buildRoute(route: string, params: { [p: string]: string | number } | (string | number)[]) {
    if (Array.isArray(params)) {
      let index = 0
      const url = route.replace(/:([_a-zA-Z][\w-]*)/g, () => {
        return `${params[index++]}`
      })
      assert.ok(index === params.length)
      return url
    }
    return route.replace(/:([_a-zA-Z][\w-]*)/g, (_, matchStr1) => {
      return `${params[matchStr1]}`
    })
  }
}

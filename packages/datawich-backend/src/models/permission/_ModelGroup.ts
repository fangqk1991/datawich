import __ModelGroup from '../auto-build/__ModelGroup'

export class _ModelGroup extends __ModelGroup {
  public constructor() {
    super()
  }

  public static async itemsForModelKey(modelKey: string) {
    const searcher = new _ModelGroup().fc_searcher()
    searcher.processor().addConditionKV('model_key', modelKey)
    return searcher.queryFeeds()
  }
}

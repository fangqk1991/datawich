export interface TagsCheckedMap {
  includingAnyOf: {
    [key: string]: boolean
  }
  includingAllOf: {
    [key: string]: boolean
  }
  excludingAllOf: {
    [key: string]: boolean
  }
}

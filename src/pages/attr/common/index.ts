export type AttrDataRow<T extends string | boolean> = {
  id?: string

  siteId: String

  code: string

  val: string | boolean

  desc?: string

  isBoolean: T extends boolean ? true : false

  isDeleted: boolean

  createTime: string
}

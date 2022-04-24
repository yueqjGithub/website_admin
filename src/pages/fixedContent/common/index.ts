export type ContentEnum = 'text' | 'images' | 'video' | 'richText' | 'link'

export type ContentGroup<T extends ContentEnum> = {
  type: T,
  content: ContentItemType[]
}

export type ContentItemType = {
  data: string
  link?: string
}

export class FixedContentType {
  id!: string

  // @ApiModelProperty(value = "对应站点关系")
  siteId!: string

  // @ApiModelProperty(value = "分配给前端的固定内容标识")
  fixedId!: string

  // @ApiModelProperty(value = "固定内容点名称")
  name!: string

  // @ApiModelProperty(value = "链接")
  link?: ContentGroup<'link'> | string = { type: 'link', content: [] }

  // @ApiModelProperty(value = "图片集合")
  images?: ContentGroup<'images'> | string = { type: 'images', content: [] }

  // @ApiModelProperty(value = "文字内容")
  text?: ContentGroup<'text'> | string = { type: 'text', content: [] }

  // @ApiModelProperty(value = "视频集合")
  video?: ContentGroup<'video'> | string = { type: 'video', content: [] }

  // @ApiModelProperty(value = "富文本")
  richText?: ContentGroup<'richText'> | string = { type: 'richText', content: [] }

  constructor (props?: FixedContentType) {
    if (props) {
      for (const k in props) {
        this[k] = props[k]
      }
    }
  }
}

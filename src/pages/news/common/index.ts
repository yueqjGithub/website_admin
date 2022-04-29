export class NewsDataRow {
    id!:string

    // @ApiModelProperty(value = "属于哪个站点")
    siteId!:string

    // @ApiModelProperty(value = "文章语言")
    language!:string

    // @ApiModelProperty(value = "标题")
    title!:string

    // @ApiModelProperty(value = "副标题")
    subTitle?:string

    // @ApiModelProperty(value = "作者")
    author!:string

    // @ApiModelProperty(value = "内容")
    content?:string

    // @ApiModelProperty(value = "最后编辑人")
    lastEditor!:string

    // @ApiModelProperty(value = "是否启用")
    enable: boolean = true

    createTime?: string

    updateTime?: string

    titleImage?:string
}

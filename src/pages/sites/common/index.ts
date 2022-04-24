export class Site {
    id!: string

    siteName!: string

    siteId!: string

    language: string[] | string = ['zh-Hans']

    proPath!: string

    publicIng: boolean = false;

    url!: string

    createTime?: string
}

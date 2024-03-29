import { Apis } from 'avalon-iam-util-client'
import { getApiUrl, getLimit } from '../utils/utils'

// const getApiUrl = ({ state }): string => {
//     return 'http://10.172.188.22:8082'
// }

/** 通用apiId */
export type ApiIdForSDK =
| 'getsites'
| 'getlang'
| 'freshlang'
| 'news'
| 'upload'
| 'getfixedcontent'
| 'getbanners'
| 'addbanner'
| 'updatebanner'
| 'delbanner'
| 'publicsite'
| 'siteattr'
/** 通用api */
export const apisForSDK: Apis<ApiIdForSDK> = [
  {
    id: 'getlang',
    url: '/cat_website/admin/lang',
    name: '语言列表',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}`
    }
  },
  {
    id: 'freshlang',
    url: '/cat_website/admin/lang/refresh',
    name: '刷新语言',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}`
    }
  },
  {
    id: 'getsites',
    url: '/cat_website/admin/sites',
    name: '站点列表',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const limits = getLimit({ moduleName: '站点管理', state, name: '站点列表', limitName: 'appLimit', route: '/cat_website/admin/sites' })
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}?appLimit=${limits ? limits === '*' ? limits : limits.join(',') : '*'}`
    }
  },
  {
    id: 'news',
    url: '/cat_website/admin/news',
    name: '新闻列表',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}`
    }
  },
  {
    id: 'upload',
    url: '/cat_website/admin/upload',
    name: '上传图片',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}`
    }
  },
  {
    id: 'getfixedcontent',
    url: '/cat_website/admin/fixedContent',
    name: '固定内容列表',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}`
    }
  },
  {
    id: 'getbanners',
    url: '/cat_website/admin/banners',
    name: 'banner列表',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}`
    }
  },
  {
    id: 'addbanner',
    url: '/cat_website/admin/banners/add',
    name: '新增',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}`
    }
  },
  {
    id: 'updatebanner',
    url: '/cat_website/admin/banners/update',
    name: '更新',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}`
    }
  },
  {
    id: 'delbanner',
    url: '/cat_website/admin/banners',
    name: '删除',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}`
    }
  },
  {
    id: 'publicsite',
    url: '/cat_website/admin/sites/public',
    name: '发布站点',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}`
    }
  },
  {
    id: 'siteattr',
    url: '/cat_website/admin/siteAttr',
    name: '属性列表',
    allowEmpty: true,
    urlTranform: ({ url, state }) => {
      const apiUrl = getApiUrl({ state })
      return `${apiUrl}${url}`
    }
  }
]

/** 服务器存储的多语言单行格式 */
// export interface MultiLanguageServerValueRow extends Pick<MultiLanguageValue[0], 'code'> {
//     value: string
// }

/** 服务器存储的多语言格式 */
// export type MultiLanguageServerValue = Array<MultiLanguageServerValueRow>

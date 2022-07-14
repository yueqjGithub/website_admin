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
  }
]

/** 服务器存储的多语言单行格式 */
// export interface MultiLanguageServerValueRow extends Pick<MultiLanguageValue[0], 'code'> {
//     value: string
// }

/** 服务器存储的多语言格式 */
// export type MultiLanguageServerValue = Array<MultiLanguageServerValueRow>

import React, { lazy } from 'react'
import { Result } from 'antd'
import { BuildOutlined, FormatPainterOutlined } from '@ant-design/icons'
import WaitRoute from '../components/waitRoute'
export const routeConfig:RouteSingle[] = [
  {
    path: '/',
    auth: false,
    component: WaitRoute
  },
  {
    path: '/common',
    menuName: '公共配置',
    auth: true,
    isMenu: true,
    icon: <BuildOutlined />,
    isCommon: true,
    childrens: [
      {
        path: '/setGame',
        auth: false,
        isMenu: false,
        menuName: '站点管理',
        icon: <i className='iconfont icon-WEByingyong'></i>,
        component: lazy(() => import('../pages/sites')),
        parent: '/common'
      },
      {
        path: '/language',
        auth: true,
        isMenu: true,
        menuName: '语言管理',
        icon: <i className='iconfont icon-language'></i>,
        component: lazy(() => import('../pages/langSetting')),
        parent: '/common'
      }
    ]
  },
  {
    path: '/content',
    menuName: '内容管理',
    auth: true,
    isMenu: true,
    icon: <FormatPainterOutlined />,
    childrens: [
      {
        path: '/banners',
        menuName: 'BANNER',
        isMenu: true,
        auth: false,
        component: lazy(() => import('../pages/banners')),
        parent: '/content',
        dependGame: true
      },
      {
        path: '/news',
        menuName: '文章管理',
        isMenu: true,
        auth: true,
        component: lazy(() => import('../pages/news')),
        parent: '/content',
        dependGame: true
      },
      {
        path: '/fixed',
        menuName: '固定内容管理',
        isMenu: true,
        auth: true,
        component: lazy(() => import('../pages/fixedContent')),
        parent: '/content',
        dependGame: true
      },
      {
        path: '/attr',
        menuName: '站点属性',
        isMenu: true,
        auth: true,
        component: lazy(() => import('../pages/attr')),
        parent: '/content',
        dependGame: true
      }
      // {
      //   path: '/packhistory',
      //   menuName: '打包历史',
      //   isMenu: true,
      //   auth: false,
      //   parent: '/tools',
      //   dependGame: true,
      //   component: lazy(() => import('../pages/packHistory'))
      // }
    ]
  },
  {
    path: '/404',
    component: () => {
      return (
        <Result
          status="404"
          title="404"
          subTitle="您无法访问到该页面"
        />
      )
    }
  }
]

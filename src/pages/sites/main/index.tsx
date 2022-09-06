import { Button, message, Modal, Popconfirm, Table } from 'antd'
import { getApiDataState } from 'avalon-iam-util-client'
import React, { useEffect, useState } from 'react'
import InnerStatusPage from '../../../components/innerStatusPage'
import { CancelPayload, httpApi, httpWithStore } from '../../../service/axios'
import { ApiIdForSDK } from '../../../service/urls'
import { State } from '../../../store/state'
import { Site } from '../common'
import dayjs from 'dayjs'
import { didShowThisMenu, hasPermission } from '../../../utils/utils'
import { PermissionHoc } from '../../../components/permissionHOC'
import EditModal from '../modal'
import { useHistory } from 'react-router-dom'

type Props = {
  state: State
  dispatch: any
}

const apiId: ApiIdForSDK = 'getsites'

const Main = ({ state, dispatch }: Props) => {
  const { routeList } = state
  const history = useHistory()
  const [loadStatus, setStatus] = useState<'empty' | 'resolve' | 'reject'>('empty')
  const [loading, setLoading] = useState<boolean>(false)
  const { data = [] } = getApiDataState<Site[]>({ apiId, state })
  const [target, setTarget] = useState<Site>()
  const [showModal, setShowModal] = useState<boolean>(false)
  const permissionList = {
    a: hasPermission({ state, moduleName: '站点管理', action: '新增' }),
    u: hasPermission({ state, moduleName: '站点管理', action: '更新' }),
    d: hasPermission({ state, moduleName: '站点管理', action: '删除' })
  }
  const requestHandler = async (cancel?: CancelPayload) => {
    setLoading(true)
    try {
      const isSuc = await httpWithStore({
        apiId,
        state,
        dispatch,
        cancelPayload: cancel
      })
      if (isSuc) {
        setStatus('resolve')
      } else {
        setStatus('reject')
      }
    } catch (e) {
      setStatus('reject')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    const cancel: CancelPayload = {}
    requestHandler(cancel)
    return () => {
      if (cancel[apiId]) {
        cancel[apiId]!.cancel()
      }
    }
  }, [])
  const editSuccess = async () => {
    await httpWithStore({
      apiId,
      state,
      dispatch,
      force: true
    })
    setShowModal(false)
  }
  const deleteHandler = async (record: Site) => {
    try {
      setLoading(true)
      const { data: res } = await httpApi({
        targetId: record.id,
        apiId,
        state,
        method: 'DELETE',
        httpCustomConfig: {
          headers: {
            actionName: encodeURIComponent('删除')
          }
        }
      }).request
      if (res.status === 0) {
        message.success('删除成功')
        requestHandler()
      } else {
        message.error(res.message)
      }
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }
  const to = React.useMemo(() => {
    return routeList.find(item => item.parent !== '/common' && didShowThisMenu({ state, moduleName: item.menuName! }))?.path
  }, [])
  const chooseEffect = (target: Site) => {
    window.localStorage.setItem('currentGame', target.id!)
    dispatch({
      type: 'SET_DATA',
      id: 'currentGame',
      value: target.id
    })
    const { beforeRouter } = state
    if (beforeRouter) {
      const copy = beforeRouter
      dispatch({
        type: 'SET_DATA',
        id: 'beforeRouter',
        value: undefined
      })
      history.push(copy)
    } else {
      history.push(to || '/404')
    }
  }
  // 发布站点
  const publicSite = async (record: Site) => {
    try {
      setLoading(true)
      const { data: res } = await httpApi({
        targetId: record.id,
        apiId: 'publicsite',
        state,
        method: 'GET',
        httpCustomConfig: {
          timeout: 180000,
          headers: {
            actionName: encodeURIComponent('发布')
          }
        }
      }).request
      if (res.status === 0) {
        message.success('正在发布，请稍后')
        requestHandler()
      } else {
        message.error(res.message)
      }
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='full-width'>
      <div className='full-width flex-row flex-jst-start flex-ali-center pa-col-sm'>
        <PermissionHoc
          permission={permissionList.a}
          component={
            <Button type='primary' onClick={() => {
              setTarget(undefined)
              setShowModal(true)
            }}>新增</Button>
          }
        ></PermissionHoc>
      </div>
      <InnerStatusPage
        loadFunc={requestHandler}
        loading={loading}
        loadStatus={loadStatus}
      >
        <Table<Site>
          dataSource={data}
          rowKey='id'
          loading={loading}
          columns={[
            { title: '站点标识', dataIndex: 'siteId', key: 'id' },
            { title: '名称', dataIndex: 'siteName' },
            { title: '语言', dataIndex: 'language' },
            { title: '创建时间', dataIndex: 'createTime', render: val => <span>{dayjs(val).format('YYYY-MM-DD HH:mm:ss')}</span> },
            { title: '站点发布模式', dataIndex: 'needExcute', render: val => <span>{val ? '静态发布' : '动态更新'}</span> },
            {
              title: '操作',
              render: record => {
                return (
                  <div className='flex-row flex-jst-start flex-ali-center'>
                    <PermissionHoc
                      permission={permissionList.u}
                      component={
                        <Button size='small' type='primary' onClick={() => {
                          setTarget(record)
                          setShowModal(true)
                        }}>修改</Button>
                      }
                    ></PermissionHoc>
                    <PermissionHoc
                      permission={permissionList.d}
                      component={
                        <Popconfirm
                          title='确定删除吗？'
                          onConfirm={() => deleteHandler(record)}
                        >
                          <Button danger size='small' className='ma-lf-05'>删除</Button>
                        </Popconfirm>
                      }
                    ></PermissionHoc>
                  </div>
                )
              }
            },
            {
              title: '',
              render: record => {
                return (
                  <div className='flex-row full-width flex-jst-start flex-ali-center'>
                    <Button type='text' onClick={() => chooseEffect(record)}>
                      <span className='text-primary'>进入应用 &gt;&gt;</span>
                    </Button>
                    <PermissionHoc
                      permission={permissionList.u && record.needExcute}
                      component={
                        <Button type='primary' className='ma-lf-05' size='small' disabled={record.publicIng} onClick={() => publicSite(record)}>发布</Button>
                      }
                    ></PermissionHoc>
                  </div>
                )
              }
            }
          ]}
        ></Table>
      </InnerStatusPage>
      <Modal title="站点设置" visible={showModal} footer={false} onCancel={() => setShowModal(false)} destroyOnClose maskClosable={false} width='70vw'>
        <EditModal state={state} target={target} editSuccess={() => editSuccess()}/>
      </Modal>
    </div>
  )
}

export default Main

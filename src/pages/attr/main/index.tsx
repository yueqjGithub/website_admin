import { Button, message, Modal, Popconfirm, Switch, Table } from 'antd'
import { getApiDataState } from 'avalon-iam-util-client'
import React, { useEffect, useState } from 'react'
import InnerStatusPage from '../../../components/innerStatusPage'
import { PermissionHoc } from '../../../components/permissionHOC'
import { CancelPayload, httpApi, httpWithStore } from '../../../service/axios'
import { ApiIdForSDK } from '../../../service/urls'
import { State } from '../../../store/state'
import { hasPermission } from '../../../utils/utils'
import { AttrDataRow } from '../common'
import dayjs from 'dayjs'
import EditModal from '../modal'
type Props = {
  state: State
  dispatch: any
}
const apiId: ApiIdForSDK = 'siteattr'
const Main = ({ state, dispatch }: Props) => {
  const { currentGame } = state
  const [loadStatus, setStatus] = useState<'empty' | 'resolve' | 'reject'>('empty')
  const [loading, setLoading] = useState(false)
  const [target, setTarget] = useState<AttrDataRow<boolean | string>>()
  const { data = [] } = getApiDataState<AttrDataRow<boolean | string>[]>({ apiId, state })
  const [showModal, setShowModal] = useState(false)
  const permissionList = {
    a: hasPermission({ state, moduleName: '站点属性', action: '新增' }),
    u: hasPermission({ state, moduleName: '站点属性', action: '更新' }),
    d: hasPermission({ state, moduleName: '站点属性', action: '删除' })
  }
  const requestHandler = async (cancel?: CancelPayload, force?: boolean) => {
    const requestData = {
      siteId: currentGame
    }
    try {
      setLoading(true)
      await httpWithStore({
        apiId,
        state,
        targetId: currentGame,
        dispatch,
        force,
        data: requestData
      })
      setStatus('resolve')
    } catch (e) {
      console.log(e)
      setStatus('reject')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    const cancel: CancelPayload = {}
    if (currentGame) {
      requestHandler(cancel, true)
    }
    return () => {
      if (cancel[apiId]) {
        cancel[apiId]!.cancel()
      }
    }
  }, [currentGame])
  const eidtSuccess = async () => {
    await requestHandler(undefined, true)
    setShowModal(false)
  }
  const deleteHandler = async (record: AttrDataRow<boolean | string>) => {
    try {
      const { data: res } = await httpApi({
        apiId,
        state,
        targetId: record.id,
        method: 'DELETE',
        httpCustomConfig: {
          headers: {
            actionName: encodeURIComponent('删除')
          }
        }
      }).request
      if (res.status === 0) {
        message.success('删除成功')
        requestHandler(undefined, true)
      } else {
        message.error(res.message)
      }
    } catch (e) {
      message.error(`删除失败:${(e as Error).message}`)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='full-width'>
      <div className='full-width flex-row flex-jst-start flex-ali-center pa-col-sm'>
        <PermissionHoc
          permission={permissionList.a}
          component={<Button type='primary' onClick={() => {
            setTarget(undefined)
            setShowModal(true)
          }}>添加</Button>}
        ></PermissionHoc>
      </div>
      <InnerStatusPage
        loadStatus={loadStatus}
        loading={loading}
        loadFunc={() => requestHandler(undefined, true)}
      >
        <Table<AttrDataRow<string | boolean>>
          dataSource={data}
          pagination={{
            pageSize: 6
          }}
          rowKey='id'
          columns={[
            { title: 'CODE', dataIndex: 'code' },
            { title: '描述', dataIndex: 'desc' },
            { title: '是否为开关', dataIndex: 'isBoolean', render: val => val ? '是' : '否' },
            {
              title: '值',
              dataIndex: 'val',
              render: (val, record) => {
                if (record.isBoolean) {
                  return <Switch checked={val === 'true'} disabled></Switch>
                } else {
                  return <span>{val}</span>
                }
              }
            },
            {
              title: '创建时间',
              dataIndex: 'createTime',
              render: val => <span>{dayjs(val).format('YYYY-MM-DD HH:mm:ss')}</span>
            },
            {
              title: '操作',
              render: record => {
                return (
                  <div className='full-width flex-row flex-jst-start flex-ali-center'>
                    <PermissionHoc
                      permission={permissionList.u}
                      component={
                        <Button type='primary' size='small' onClick={() => {
                          setTarget(record)
                          setShowModal(true)
                        }}>修改</Button>
                      }
                    ></PermissionHoc>
                    <PermissionHoc
                      permission={permissionList.d}
                      component={
                        <Popconfirm
                          title='确定要删除该内容吗'
                          onConfirm={() => deleteHandler(record)}
                        >
                          <Button className='ma-lf-05' danger size='small'>删除</Button>
                        </Popconfirm>
                      }
                    ></PermissionHoc>
                  </div>
                )
              }
            }
          ]}
        ></Table>
      </InnerStatusPage>
      <Modal title="编辑" visible={showModal} footer={false} onCancel={() => setShowModal(false)} destroyOnClose maskClosable={false} width='90vw'>
        <EditModal target={target} state={state} editSuccess={eidtSuccess}/>
      </Modal>
    </div>
  )
}

export default Main

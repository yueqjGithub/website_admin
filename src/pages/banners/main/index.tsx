import { Button, Divider, message, Popconfirm, Table } from 'antd'
import { getApiDataState } from 'avalon-iam-util-client'
import React, { useContext, useEffect, useState } from 'react'
import InnerStatusPage from '../../../components/innerStatusPage'
import { PermissionHoc } from '../../../components/permissionHOC'
import { CancelPayload, httpApi, httpWithStore } from '../../../service/axios'
import { ApiIdForSDK } from '../../../service/urls'
import { Context } from '../../../store/context'
import { hasPermission } from '../../../utils/utils'
import { BannerItem } from '../common'
import styles from '../common/style.module.scss'
import EditModal from '../components/EditModal'
import EditContainer from '../components/editContainer'
import dayjs from 'dayjs'
const apiId: ApiIdForSDK = 'getbanners'
const Main = () => {
  const { state, dispatch } = useContext(Context)
  const { currentGame } = state
  // 权限
  const permissionList = {
    a: hasPermission({ state, moduleName: 'BANNER', action: '新增' }),
    // a: true,
    u: hasPermission({ state, moduleName: 'BANNER', action: '更新' }),
    // u: true
    d: hasPermission({ state, moduleName: 'BANNER', action: '删除' })
  }
  const [loading, setLoading] = useState<boolean>(false)
  const [loadStatus, setLoadStatus] = useState<'resolve' | 'reject' | 'empty'>('empty')
  const { data } = getApiDataState<BannerItem[]>({ apiId, state })
  const requestHandler = async (cancel?: CancelPayload, force?: boolean) => {
    try {
      setLoading(true)
      await httpWithStore({
        apiId,
        state,
        dispatch,
        cancelPayload: cancel,
        method: 'GET',
        force,
        targetId: currentGame
      })
      setLoadStatus('resolve')
    } catch {
      setLoadStatus('reject')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    const cancel: CancelPayload = {}
    requestHandler(cancel)
    return () => {
      if (cancel[apiId]) {
        cancel[apiId].cancel()
      }
    }
  }, [currentGame])
  // 编辑
  const [target, setTarget] = useState<BannerItem>()
  const [showEdit, setEdit] = useState<boolean>(false)
  // 编辑结束
  const editFinish = async () => {
    await requestHandler({}, true)
    setEdit(false)
  }
  // 删除
  const deleteHandler = async (id: string) => {
    try {
      setLoading(true)
      const { data: res } = await httpApi({
        state,
        apiId: 'delbanner',
        method: 'DELETE',
        targetId: id
      }).request
      if (res.status === 0) {
        message.success('已删除')
        requestHandler({}, true)
      } else {
        message.error(res.message)
      }
    } catch {
      message.error('程序出错')
    }
  }
  return (
    <div className="full-width">
      <InnerStatusPage
        loadStatus={loadStatus}
        loading={loading}
        loadFunc={requestHandler}
      >
        <>
          <div className="full-width flex-row flex-jst-start flex-ali-start">
            <PermissionHoc
              permission={permissionList.a}
              component={
                <Button type="primary" onClick={() => {
                  setTarget(undefined)
                  setEdit(true)
                }}>添加</Button>
              }
            ></PermissionHoc>
          </div>
          <Divider></Divider>
          <Table
            rowKey='id'
            dataSource={data}
            loading={loading}
            columns={[
              {
                dataIndex: 'imgUrl',
                title: '背景图片',
                width: 270,
                render: val => {
                  return (
                    <div style={{ maxHeight: 180, overflow: 'hidden' }}>
                      <img style={{ width: 230 }} src={val} alt={val} />
                    </div>
                  )
                }
              },
              {
                dataIndex: 'createTime',
                title: '创建时间',
                align: 'center',
                render: val => dayjs(val).format('YYYY-MM-DD HH:mm:ss')
              },
              {
                dataIndex: 'status',
                title: '启用状态',
                align: 'center',
                render: val => {
                  return (
                    <div className='flex-row flex-jst-center flex-ali-center'>
                      <div className={`${styles.statusDotted} ${val ? 'bg-success' : 'bg-danger'}`}></div>
                      <span>{val ? '已启用' : '已停用'}</span>
                    </div>
                  )
                }
              },
              {
                title: '操作',
                align: 'center',
                render: (record: BannerItem) => {
                  return (
                    <div className="full-width flex-row flex-jst-center flex-ali-center">
                      <PermissionHoc
                        permission={permissionList.u}
                        component={
                          <Button size='small' type='primary' className='ma-lf-05' onClick={() => {
                            setTarget(record)
                            setEdit(true)
                          }}>编辑</Button>
                        }
                      ></PermissionHoc>
                      <PermissionHoc
                        permission={permissionList.d}
                        component={
                          <Popconfirm
                            title="确定要删除该条数据吗"
                            onConfirm={() => deleteHandler(record.id!)}
                          >
                            <Button className="ma-lf-05" size="small" type="primary" danger>删除</Button>
                          </Popconfirm>
                        }
                      ></PermissionHoc>
                    </div>
                  )
                }
              }
            ]}
          ></Table>
        </>
      </InnerStatusPage>
      <EditModal visible={showEdit} destoryOnClose>
        <EditContainer editSuc={editFinish} target={target} onClose={() => setEdit(false)}></EditContainer>
      </EditModal>
      {/* <Modal visible={showEdit} onCancel={() => setEdit(false)} destroyOnClose title="设置BANNER" ></Modal> */}
    </div>
  )
}

export default Main

import { Button, Divider, Table } from 'antd'
import { getApiDataState } from 'avalon-iam-util-client'
import React, { useContext, useEffect, useState } from 'react'
import InnerStatusPage from '../../../components/innerStatusPage'
import { PermissionHoc } from '../../../components/permissionHOC'
import { CancelPayload, httpWithStore } from '../../../service/axios'
import { ApiIdForSDK } from '../../../service/urls'
import { Context } from '../../../store/context'
import { hasPermission } from '../../../utils/utils'
import { BannerItem } from '../common'
import styles from '../common/style.module.scss'
import EditModal from '../components/EditModal'
import EditContainer from '../components/editContainer'
const apiId: ApiIdForSDK = 'getbanners'
const Main = () => {
  const { state, dispatch } = useContext(Context)
  const { currentGame } = state
  // 权限
  const permissionList = {
    // a: hasPermission({ state, moduleName: 'BANNER', action: '新增' }),
    a: true,
    u: hasPermission({ state, moduleName: 'BANNER', action: '更新' })
  }
  const [loading, setLoading] = useState<boolean>(false)
  const [loadStatus, setLoadStatus] = useState<'resolve' | 'reject' | 'empty'>('empty')
  const { data } = getApiDataState<BannerItem[]>({ apiId, state })
  const requestHandler = async (cancel?: CancelPayload) => {
    try {
      setLoading(true)
      await httpWithStore({
        apiId,
        state,
        dispatch,
        cancelPayload: cancel,
        method: 'GET',
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
                width: 350,
                render: val => {
                  return (
                    <img src={val} alt={val} />
                  )
                }
              },
              {
                dataIndex: 'createTime',
                title: '创建时间'
              },
              {
                dataIndex: 'status',
                title: '启用状态',
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
                render: (record: BannerItem) => {
                  return (
                    <div className="full-width flex-row flex-jst-center flex-ali-center">
                      <PermissionHoc
                        permission={permissionList.u}
                        component={
                          <Button>{record.status ? '禁用' : '启用'}</Button>
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
        <EditContainer target={target} onClose={() => setEdit(false)}></EditContainer>
      </EditModal>
      {/* <Modal visible={showEdit} onCancel={() => setEdit(false)} destroyOnClose title="设置BANNER" ></Modal> */}
    </div>
  )
}

export default Main

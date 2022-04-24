import { Button, message, Table } from 'antd'
import { getApiDataState } from 'avalon-iam-util-client'
import React, { useEffect, useState } from 'react'
import InnerStatusPage from '../../../components/innerStatusPage'
import { PermissionHoc } from '../../../components/permissionHOC'
import { CancelPayload, httpApi, httpWithStore } from '../../../service/axios'
import { ApiIdForSDK } from '../../../service/urls'
import { State } from '../../../store/state'
import { hasPermission } from '../../../utils/utils'
import { LangItem } from '../common'

type Props = {
  state: State
  dispatch: any
}
const apiId: ApiIdForSDK = 'getlang'
const Main = ({ state, dispatch }: Props) => {
  const [loadStatus, setStatus] = useState<'empty' | 'resolve' | 'reject'>('empty')
  const [loading, setLoading] = useState<boolean>(false)
  const { data = [] } = getApiDataState<LangItem[]>({ apiId, state })
  const permissionList = {
    f: hasPermission({ state, moduleName: '语言管理', action: '刷新语言' })
  }
  const requestHandler = async (cancel?: CancelPayload, force?: boolean) => {
    setLoading(true)
    try {
      const isSuc = await httpWithStore({
        apiId,
        state,
        dispatch,
        force,
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
  const freshLanguage = async () => {
    setLoading(true)
    try {
      const { data: res } = await httpApi({
        apiId: 'freshlang',
        state
      }).request
      if (res.status === 0) {
        message.success('刷新成功')
        requestHandler(undefined, true)
      } else {
        message.error(res.message)
      }
    } catch (e) {
      message.error('程序出错')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <div className='full-width flex-row flex-jst-start flex-ali-center pa-col-sm'>
        <PermissionHoc
          permission={permissionList.f}
          component={<Button type='primary' onClick={() => freshLanguage()}>刷新语言</Button>}
        ></PermissionHoc>
      </div>
      <InnerStatusPage
        loadFunc={requestHandler}
        loading={loading}
        loadStatus={loadStatus}
      >
        <Table
          dataSource={data}
          rowKey='id'
          columns={[
            { title: 'id', dataIndex: 'id', key: 'id' },
            { title: '语言', dataIndex: 'name', key: 'name' },
            { title: 'CODE', dataIndex: 'code', key: 'code' }
          ]}
        ></Table>
      </InnerStatusPage>
    </>
  )
}

export default Main

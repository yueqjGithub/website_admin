import { Button, message, Modal, Popconfirm, Table } from 'antd'
import { getApiDataState } from 'avalon-iam-util-client'
import React, { useEffect, useState } from 'react'
import InnerStatusPage from '../../../components/innerStatusPage'
import { PermissionHoc } from '../../../components/permissionHOC'
import { CancelPayload, httpApi, httpWithStore } from '../../../service/axios'
import { ApiIdForSDK } from '../../../service/urls'
import { State } from '../../../store/state'
import { hasPermission } from '../../../utils/utils'
import { LangItem } from '../../langSetting/common'
import { NewsDataRow } from '../common'
import dayjs from 'dayjs'
import EditModal from '../modal'
type Props = {
  state: State
  dispatch: any
}

const apiId: ApiIdForSDK = 'news'

const Main = ({ state, dispatch }: Props) => {
  const { currentGame } = state
  const [loadStatus, setStatus] = useState<'empty' | 'resolve' | 'reject'>('empty')
  const [loading, setLoading] = useState<boolean>(false)
  const { data = [] } = getApiDataState<NewsDataRow[]>({ apiId, state })
  const { data: langList = [] } = getApiDataState<LangItem[]>({ apiId: 'getlang', state })
  const [target, setTarget] = useState<NewsDataRow>()
  const [showModal, setShowModal] = useState<boolean>(false)
  const permissionList = {
    a: hasPermission({ state, moduleName: '文章管理', action: '新增' }),
    u: hasPermission({ state, moduleName: '文章管理', action: '更新' }),
    d: hasPermission({ state, moduleName: '文章管理', action: '删除' })
  }
  const requestHandler = async (cancel?: CancelPayload, force?: boolean) => {
    setLoading(true)
    try {
      const isSuc = await httpWithStore({
        apiId,
        state,
        dispatch,
        force,
        data: { siteId: currentGame },
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
    if (currentGame) {
      requestHandler(cancel, true)
    }
    return () => {
      if (cancel[apiId]) {
        cancel[apiId]!.cancel()
      }
    }
  }, [currentGame])
  const deleteHandler = async (record: NewsDataRow) => {
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
        requestHandler(undefined, true)
      } else {
        message.error(res.message)
      }
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }
  const editSuccess = async () => {
    await requestHandler(undefined, true)
    setShowModal(false)
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
        <Table<NewsDataRow>
          pagination={{
            pageSize: 6
          }}
          scroll={{ x: 1300 }}
          dataSource={data}
          rowKey='id'
          loading={loading}
          columns={[
            { title: '标题', dataIndex: 'title', key: 'title' },
            {
              title: '封面图',
              width: 200,
              dataIndex: 'titleImage',
              render: val => {
                return val ? <img src={val} alt='封面图' style={{ width: '100%' }} /> : '无'
              }
            },
            {
              title: '语言',
              dataIndex: 'language',
              sorter: (a: NewsDataRow, b: NewsDataRow) => a.language.localeCompare(b.language),
              render: val => {
                return <span>{langList.find(item => item.code === val)?.name || ''}</span>
              }
            },
            { title: '副标题', dataIndex: 'subTitle', key: 'subTitle' },
            { title: '作者', dataIndex: 'author', sorter: (a: NewsDataRow, b: NewsDataRow) => a.author.localeCompare(b.author), key: 'author' },
            {
              title: '创建时间',
              dataIndex: 'createTime',
              render: val => <span>{dayjs(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
              sorter: (a: NewsDataRow, b: NewsDataRow) => a.createTime!.localeCompare(b.createTime!)
            },
            {
              title: '上次修改',
              dataIndex: 'updateTime',
              render: val => <span>{dayjs(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
              sorter: (a: NewsDataRow, b: NewsDataRow) => a.updateTime!.localeCompare(b.updateTime!)
            },
            {
              title: '是否启用',
              dataIndex: 'enable',
              render: val => <span>{val ? '是' : '否'}</span>
            },
            {
              title: '操作',
              fixed: 'right',
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
            }
          ]}
        ></Table>
      </InnerStatusPage>
      <Modal title="编辑文章" visible={showModal} footer={false} onCancel={() => setShowModal(false)} destroyOnClose maskClosable={false} width='90vw'>
        <EditModal state={state} target={target} editSuccess={() => editSuccess()}/>
      </Modal>
    </div>
  )
}

export default Main

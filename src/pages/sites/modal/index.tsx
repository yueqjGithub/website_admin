import { Button, Form, Input, message, Select } from 'antd'
import { getApiDataState } from 'avalon-iam-util-client'
import React, { useEffect, useState } from 'react'
import { httpApi } from '../../../service/axios'
import { ApiIdForSDK } from '../../../service/urls'
import { State } from '../../../store/state'
import { LangItem } from '../../langSetting/common'
import { Site } from '../common'

type Props = {
  target?: Site
  state: State
  editSuccess: Function
}
const apiId:ApiIdForSDK = 'getsites'
const EditModal = ({ target, state, editSuccess }: Props) => {
  const [form] = Form.useForm<Site>()
  const { data: langList = [] } = getApiDataState<LangItem[]>({ apiId: 'getlang', state })
  const [loading, setLoading] = useState<boolean>(false)
  useEffect(() => {
    if (target) {
      const obj = { ...target }
      obj.language = target.language ? (target.language as string).split(',') : []
      form.setFieldsValue(obj)
    } else {
      form.setFieldsValue(new Site())
    }
  }, [target])
  const onFinish = async (values: Site) => {
    const requestData = { ...values }
    if (target) {
      requestData.id = target.id
    }
    requestData.language = (requestData.language as string[]).join(',')
    try {
      setLoading(true)
      const { data: res } = await httpApi({
        apiId,
        state,
        data: requestData,
        method: 'POST',
        httpCustomConfig: {
          headers: {
            actionName: encodeURIComponent(target ? '更新' : '新增')
          }
        }
      }).request
      if (res.status === 0) {
        message.success('提交成功')
        editSuccess()
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
    <>
      <div className='full-width'>
        <Form<Site> colon={true} labelAlign='right' labelCol={{ span: 2 }} wrapperCol={{ span: 21 }} form={form} onFinish={onFinish}>
          <Form.Item label='站点标识' name='siteId' rules={[{ required: true, message: '请设置站点标识' }]}>
            <Input></Input>
          </Form.Item>
          <Form.Item label='站点名称' name='siteName' rules={[{ required: true, message: '请设置站点名称' }]}>
            <Input></Input>
          </Form.Item>
          <Form.Item label='语言' name='language' rules={[{ required: true, message: '请设置站点语言' }]}
          >
            <Select
              mode="multiple"
            >
              {
                langList.map(item => <Select.Option key={item.code} value={item.code}>{item.name}</Select.Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item label='工程路径' name='proPath' rules={[{ required: true, message: '请设置工程路径' }]} help={'前端工程构建静态页面的工程路径'}>
            <Input></Input>
          </Form.Item>
          <Form.Item label='站点地址' name='url' help={'站点网址'}>
            <Input></Input>
          </Form.Item>
          <Form.Item wrapperCol={{ span: 23 }}>
            <div className='flex-row flex-jst-end flex-ali-center'>
              <Button type="primary" htmlType="submit" loading={loading}>提交</Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </>
  )
}

export default EditModal

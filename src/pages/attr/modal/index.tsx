import { Button, Form, Input, message, Radio, Switch } from 'antd'
import React, { useEffect, useState } from 'react'
import { httpApi } from '../../../service/axios'
import { ApiIdForSDK } from '../../../service/urls'
import { State } from '../../../store/state'
import { AttrDataRow } from '../common'

type Props = {
  target?: AttrDataRow<boolean | string>
  state: State
  editSuccess: Function
}
const apiId:ApiIdForSDK = 'siteattr'
const EditModal = ({ target, state, editSuccess }: Props) => {
  const { currentGame } = state
  const [form] = Form.useForm<AttrDataRow<boolean | string>>()
  const [loading, setLoading] = useState<boolean>(false)
  const [isBoolean, setIsBoolean] = useState<boolean>(false)

  useEffect(() => {
    if (target) {
      const copy = { ...target }
      if (target.isBoolean) {
        setIsBoolean(target.isBoolean)
      }
      copy.val = target.val !== 'false'
      form.setFieldsValue(copy)
    }
  }, [target])
  const onFinish = async (values: AttrDataRow<boolean | string>) => {
    const requestData = { ...values, siteId: currentGame }
    if (target) {
      requestData.id = target.id
    }
    if (values.isBoolean) {
      requestData.val = String(values.val) === 'false' ? 'false' : 'true'
    }
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
        <p>{isBoolean}</p>
        <Form<AttrDataRow<boolean | string>> colon={true} labelAlign='right' labelCol={{ span: 2 }} wrapperCol={{ span: 21 }} form={form} onFinish={onFinish}>
          <Form.Item label='CODE' name='code' rules={[{ required: true, message: '请设置CODE' }]}>
            <Input></Input>
          </Form.Item>
          <Form.Item label='是否为开关' name='isBoolean' initialValue={target?.isBoolean || false}>
            <Radio.Group onChange={val => setIsBoolean(val.target.value)}>
              <Radio value={true}>开关</Radio>
              <Radio value={false}>字符属性</Radio>
            </Radio.Group>
          </Form.Item>
          {
            isBoolean
              ? (
              <Form.Item label='属性值' name='val' rules={[{ required: true, message: '请设置属性值' }]} valuePropName='checked'>
                <Switch defaultChecked={target?.val === 'true'}></Switch>
              </Form.Item>
                )
              : (
              <Form.Item label='属性值' name='val' rules={[{ required: true, message: '请设置属性值' }]}>
                <Input></Input>
              </Form.Item>
                )
          }
          <Form.Item label='属性描述' name='desc'>
            <Input maxLength={20} showCount></Input>
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

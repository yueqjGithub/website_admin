import { Button, Form, Input, message, Spin, Tabs } from 'antd'
import React, { useEffect, useState } from 'react'
import { httpApi } from '../../../service/axios'
import { ApiIdForSDK } from '../../../service/urls'
import { State } from '../../../store/state'
import { isJsonString } from '../../../utils/utils'
import { ContentEnum, ContentGroup, FixedContentType } from '../common'
import BaseEdit from '../common/component/baseEdit'

type Props = {
  target?: FixedContentType
  state: State
  eidtSuccess: Function
}

const apiId: ApiIdForSDK = 'getfixedcontent'
const EditModal = ({ target, state, eidtSuccess }: Props) => {
  const { currentGame } = state
  const [form] = Form.useForm()
  const [cur, setCur] = useState<FixedContentType>()
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (target) {
      const obj = { ...target }
      if (isJsonString((target.images as string))) {
        obj.images = JSON.parse(target.images as string)
      }
      if (isJsonString((target.text as string))) {
        obj.text = JSON.parse(target.text as string)
      }
      if (isJsonString((target.richText as string))) {
        obj.richText = JSON.parse(target.richText as string)
      }
      if (isJsonString((target.video as string))) {
        obj.video = JSON.parse(target.video as string)
      }
      setCur(obj)
      form.setFieldsValue(new FixedContentType(obj))
    } else {
      const obj = new FixedContentType()
      form.setFieldsValue(obj)
      setCur(obj)
      console.log(form.getFieldsValue())
    }
  }, [target])
  const setVal = ({ val, key }: { val: any, key: ContentEnum }) => {
    const obj = new FixedContentType(cur)
    obj[key] = val
    setCur(obj)
    // setCur(obj)
  }
  const doSubmitHandler = async () => {
    const valid = await form.validateFields()
    if (valid) {
      const obj = form.getFieldsValue()
      const { images, text, richText, video } = cur!
      if (images) {
        obj.images = JSON.stringify(images)
      }
      if (text) {
        obj.text = JSON.stringify(text)
      }
      if (richText) {
        obj.richText = JSON.stringify(richText)
      }
      if (video) {
        obj.video = JSON.stringify(video)
      }
      obj.siteId = currentGame
      if (target) {
        obj.id = target.id
      }
      try {
        setLoading(true)
        const { data: res } = await httpApi({
          apiId,
          state,
          data: obj,
          method: target ? 'PUT' : 'POST',
          httpCustomConfig: {
            headers: {
              actionName: encodeURIComponent(target ? '更新' : '新增')
            }
          }
        }).request
        if (res.status === 0) {
          message.success('提交成功')
          eidtSuccess()
        } else {
          message.error(res.message)
        }
      } catch (e) {
        message.error(`提交失败${(e as Error).message}`)
      } finally {
        setLoading(false)
      }
    } else {
      console.warn(valid)
    }
  }
  return (
    <div className='full-width'>
      <Spin spinning={loading}>
      <div className='full-width scroll-bar' style={{ height: '75vh', paddingRight: 10 }}>
        <Form form={form} layout='vertical' colon labelAlign='right'>
          <Form.Item label='内容标识' name='fixedId' rules={[{ required: true, message: '标识不能为空' }]}>
            <Input disabled={!!target}></Input>
          </Form.Item>
          <Form.Item label='名称' name='name' rules={[{ required: true, message: '名称不能为空' }]}>
            <Input disabled={!!target}></Input>
          </Form.Item>
        </Form>
        <Tabs defaultActiveKey='images' type='card'>
          <Tabs.TabPane tab='图片' key='images'>
            <BaseEdit<'images'> data={cur?.images as ContentGroup<'images'>} onChange={val => setVal({ val, key: 'images' })}></BaseEdit>
          </Tabs.TabPane>
          <Tabs.TabPane tab='文字' key='text'>
            <BaseEdit<'text'> data={cur?.text as ContentGroup<'text'>} onChange={val => setVal({ val, key: 'text' })}></BaseEdit>
          </Tabs.TabPane>
          <Tabs.TabPane tab='视频' key='video'>
            <BaseEdit<'video'> data={cur?.video as ContentGroup<'video'>} onChange={val => setVal({ val, key: 'video' })}></BaseEdit>
          </Tabs.TabPane>
          <Tabs.TabPane tab='段落' key='richText'>
            <BaseEdit<'richText'> data={cur?.richText as ContentGroup<'richText'>} onChange={val => setVal({ val, key: 'richText' })}></BaseEdit>
          </Tabs.TabPane>
        </Tabs>
      </div>
      <div className='full-width flex-row flex-jst-end flex-ali-center pa-col-sm'>
        <Button type='primary' onClick={doSubmitHandler}>提交</Button>
      </div>
      </Spin>
    </div>
  )
}

export default EditModal

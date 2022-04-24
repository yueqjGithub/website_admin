import { MinusCircleOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input } from 'antd'
import React, { Fragment, useEffect } from 'react'
import { ContentGroup, ContentItemType } from '..'

type Props = ContentGroup<'richText'> & {
  onChange?: (val: ContentItemType[]) => any
}

const RichEdit = (props: Props) => {
  const { content } = props
  const [form] = Form.useForm()

  useEffect(() => {
    const obj = {
      content: content
    }
    form.setFieldsValue(obj)
  }, [])

  return (
    <div className='full-width flex-row flex-jst-btw flex-ali-center'>
      <Form form={form} layout='vertical' onValuesChange={(val, all) => {
        if (props.onChange) {
          props.onChange(all.content)
        }
      }} className='full-width'>
        <Form.List name='content'>
          {(fields, { add, remove }) => {
            return (
              <>
                {
                  fields.map(({
                    key,
                    name,
                    ...restField
                  }) => {
                    return (
                      <Fragment key={key}>
                        <div className='flex-row flex-jst-start flex-ali-base'>
                          <div className='flex-1'>
                            <Form.Item
                              {...restField}
                              label='文字内容'
                              name={[name, 'data']}
                            >
                              <Input.TextArea rows={5} placeholder="填写文字内容" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              label='附加链接'
                              name={[name, 'link']}
                              help={'没有链接可忽略该项'}
                            >
                              <Input placeholder="填写附加链接" />
                            </Form.Item>
                          </div>
                          <MinusCircleOutlined onClick={() => remove(name)} style={{ marginLeft: 5 }} />
                        </div>
                        <Divider></Divider>
                      </Fragment>
                    )
                  })
                }
                <Form.Item wrapperCol={{ span: 24 }}>
                  <div className='full-width flex-row flex-jst-center'>
                  <Button type="primary" ghost onClick={() => add()} block style={{ maxWidth: '300px' }}>
                    增加段落
                  </Button>
                  </div>
                </Form.Item>
              </>
            )
          }}
        </Form.List>
      </Form>
    </div>
  )
}

export default RichEdit

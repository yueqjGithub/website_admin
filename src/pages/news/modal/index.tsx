import { Button, Form, Input, message, Modal, Select, Spin, Switch } from 'antd'
import { getApiDataState } from 'avalon-iam-util-client'
import React, { ChangeEvent, MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { httpApi } from '../../../service/axios'
import { ApiIdForSDK } from '../../../service/urls'
import { State } from '../../../store/state'
import { LangItem } from '../../langSetting/common'
import { Site } from '../../sites/common'
import { NewsDataRow } from '../common'
import { Editor } from '@tinymce/tinymce-react'
import styles from '../styles/upload.module.scss'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
type Props = {
  state: State
  target?: NewsDataRow
  editSuccess: Function
}

const apiId: ApiIdForSDK = 'news'
const EditModal = ({ state, target, editSuccess }: Props) => {
  const editorRef = useRef<any>()
  const ref: MutableRefObject<any> = useRef(null)
  const { currentGame } = state
  const { data: siteList = [] } = getApiDataState<Site[]>({ apiId: 'getsites', state })
  const { data: langList = [] } = getApiDataState<LangItem[]>({ apiId: 'getlang', state })
  const [detail, setDetail] = useState<NewsDataRow>()
  const [filePath, setPath] = useState<string>('')
  useEffect(() => {
    if (target?.titleImage) {
      setPath(target.titleImage)
    }
  }, [target])
  // 可选语言
  const langs = useMemo(() => {
    const curLang = siteList.find(site => site.id === currentGame)?.language
    const curLangList = (curLang as string).split(',')
    return langList.filter(item => curLangList.includes(item.code))
  }, [siteList, langList])
  // 内部state
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  // 请求详情
  const queryDetail = async () => {
    try {
      setLoading(true)
      const { data: res } = await httpApi({
        apiId,
        state,
        targetId: target?.id,
        httpCustomConfig: {
          headers: {
            actionName: encodeURIComponent('详情')
          }
        }
      }).request
      if (res.status === 0) {
        const obj = { ...res.data }
        setDetail(obj)
        form.setFieldsValue(obj)
      } else {
        message.error(res.message)
      }
    } catch {
      message.error('获取详情出错')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    console.log('当前是否为build：' + import.meta.env.PROD)
    if (target) {
      queryDetail()
    } else {
      form.setFieldsValue(new NewsDataRow())
    }
  }, [target])
  // 提交编辑
  const finishEdit = async (val: NewsDataRow) => {
    const requestData = { ...val }
    if (target) {
      requestData.id = target.id
    } else {
      requestData.author = state.user.username
    }
    requestData.lastEditor = state.user.username
    requestData.siteId = currentGame
    requestData.titleImage = filePath
    requestData.content = editorRef.current.getContent()
    // console.log(requestData)
    try {
      setLoading(true)
      const { data: res } = await httpApi({
        apiId,
        state,
        method: target ? 'PUT' : 'POST',
        data: requestData,
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
  // 封面图片上传
  const uploadHandler = async (e:ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : ''
    if (!file) {
      message.error('获取上传信息失败')
      return false
    }
    const fileType = file.name.split('.').pop()
    if (fileType !== 'png' && fileType !== 'jpg') {
      message.error('仅支持png、jpg格式的图片上传')
      return false
    }
    const size = file.size / 1024 / 1024
    if (size > 5) {
      message.error('大小不能超过5M')
      return false
    }

    const fm = new FormData()
    fm.append('file', file)
    fm.append('siteId', currentGame)
    setLoading(true)
    try {
      const { data: res } = await httpApi({
        apiId: 'upload',
        state,
        method: 'POST',
        data: fm,
        httpCustomConfig: {
          headers: {
            actionName: encodeURIComponent('文章图片上传')
          }
        }
      }).request
      if (res.status === 0) {
        message.success('上传成功')
        setPath(res.data)
      } else {
        message.error(res.error_msg || res.message)
      }
    } catch (e) {
      message.error('上传出错')
    } finally {
      ref.current.value = ''
      setLoading(false)
    }
  }
  const delIcon = () => {
    Modal.confirm({
      title: '确定要删除当前ICON吗',
      onOk: () => {
        setPath('')
      }
    })
  }
  return (
    <div className='full-width'>
      <input type="file" accept="image/png;image/jpeg" ref={ref} style={{ display: 'none' }} onChange={e => uploadHandler(e)}/>
      <Spin spinning={loading}>
      <Form form={form} layout='vertical' colon labelAlign='right' onFinish={val => finishEdit(val)}>
        <div className='full-width scroll-bar' style={{ maxHeight: '70vh', paddingRight: 10 }}>
          <Form.Item label='标题' name='title' rules={[{ required: true, message: '文章标题不能为空' }]}>
            <Input showCount maxLength={100}></Input>
          </Form.Item>
          <Form.Item label='副标题' name='subTitle'>
            <Input showCount maxLength={60}></Input>
          </Form.Item>
          <Form.Item label='封面图片'>
            {
              filePath
                ? (
                <div className={`${styles.uploadOut} ${styles.showImg} flex-col flex-jst-center flex-ali-center`}>
                  <img src={filePath} alt="" className={`${styles.imgResult}`}/>
                  <div className={`${styles.delBtn}`}>
                    <Button type='primary' size='small' danger shape='circle' icon={<CloseOutlined />} onClick={delIcon}></Button>
                  </div>
                </div>
                  )
                : (
                <div className={`${styles.uploadOut} ${styles.ctrl} flex-col flex-jst-center flex-ali-center`}>
                  <Button type='primary' shape='circle' icon={<PlusOutlined />} size='large' onClick={() => ref.current!.click()}></Button>
                  <div className='text-grey font-12'>上传格式：png、jpg</div>
                  <div className='text-grey font-12'>建议大小：560 * 300</div>
                  <div className='text-grey font-12'>文件大小：小于5M</div>
                </div>
                  )
            }
          </Form.Item>
          <Form.Item label='语言' name='language' rules={[{ required: true, message: '请设置文章语言' }]}>
            <Select>
              {
                langs.map(item => <Select.Option key={item.code} value={item.code}>{item.name}</Select.Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item label='是否启用' name='enable' valuePropName='checked'>
            <Switch></Switch>
          </Form.Item>
          <Form.Item label='文章内容'>
          <Editor
              onInit={(evt, editor) => {
                editorRef.current = editor
              }}
              tinymceScriptSrc={'./tinymce/tinymce/js/tinymce/tinymce.min.js'}
              apiKey='sol86u4tcba6ch9iskfd77wwhr8a0xakxncfts9w6qsoddcw'
              initialValue={detail ? detail.content : ''}
              init={{
                language_url: '/tinymce/tinymce/langs/zh_CN.js',
                language: 'zh_CN',
                height: 500,
                menubar: false,
                fontsize_formats: '11px 12px 14px 16px 18px 24px 36px 48px',
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'image',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code wordcount'
                ],
                toolbar: 'undo redo | formatselect | fontsizeselect | ' +
                'bold italic forecolor backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | image | ' +
                'link | removeformat',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                images_upload_handler: (blobInfo, success, failure) => {
                  const fm = new FormData()
                  fm.append('file', blobInfo.blob())
                  fm.append('siteId', currentGame)
                  httpApi({
                    apiId: 'upload',
                    state,
                    method: 'POST',
                    data: fm,
                    httpCustomConfig: {
                      headers: {
                        actionName: encodeURIComponent('文章图片上传')
                      }
                    }
                  }).request.then(res => {
                    if (res.data.status === 0) {
                      success(res.data.data)
                    } else {
                      message.error(res.data.message)
                      failure(res.data.message)
                    }
                  }, err => {
                    failure(err.message)
                  })
                }
              }}
            />
          </Form.Item>
        </div>
        <Form.Item wrapperCol={{ span: 23 }}>
          <div className='flex-row flex-jst-end flex-ali-center'>
            <Button type="primary" htmlType="submit" loading={loading}>提交</Button>
          </div>
          </Form.Item>
      </Form>
      </Spin>
    </div>
  )
}

export default EditModal

import { Button, Form, Input, InputNumber, message, Radio, Switch } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { BannerElement } from '../common'
import { SketchPicker } from 'react-color'
import styles from '../common/style.module.scss'
type Props = {
  target: BannerElement<'image' | 'text'>
  viewHeight?: number
  viewWidth?: number
  idx: number
  onDelete: Function
  submitData: (val: BannerElement<'image' | 'text'>, idx: number) => any
  isPre: boolean
  editType: 1 | 2
}

type Positions = {
  x: number
  y: number
}

const Element = ({ target, viewHeight, viewWidth, idx, onDelete, submitData, isPre, editType }: Props) => {
  const [cur, setCur] = useState<BannerElement<'image' | 'text'>>()
  const [form] = Form.useForm<BannerElement<'image' | 'text'>>()
  const ref = useRef<any>()
  const [savePosition, setSavePosition] = useState<Positions>({ x: 0, y: 0 })
  useEffect(() => {
    setCur(target)
    form.setFieldsValue(target)
  }, [target])
  const deleteHandler = (curIdx: number) => {
    onDelete(curIdx)
  }
  // 编辑区域
  const [showEdit, setEdit] = useState<boolean>(false)
  const setOptions = (key: keyof BannerElement<'image' | 'text'>, val: any) => {
    const copy = { ...cur }
    copy[key] = val
    // setCur(copy as BannerElement<'image' | 'text'>)
    submitData(copy as BannerElement<'image' | 'text'>, idx)
  }
  // 数据上交
  // useEffect(() => {
  //   if (changeSymbol !== undefined) {
  //     submitData(cur!, idx)
  //   }
  // }, [changeSymbol])
  const dragstart = (e:React.DragEvent<HTMLDivElement>):any => {
    setEdit(false)
    const start = {
      x: e.clientX,
      y: e.clientY
    }
    setSavePosition(start)
  }
  const dragend = (e:any):any => {
    // e.target.parentNode
    const x = e.clientX
    const y = e.clientY
    const xd = x - savePosition.x // distance
    const yd = y - savePosition.y // distance
    if (xd < 0 && xd < (e.target.parentNode.offsetLeft) * -1) {
      message.warning('超出边界')
      return false
    }
    // 右移超框
    if (xd > 0 && xd > (viewWidth! - e.target.parentNode.offsetLeft - e.target.parentNode.offsetWidth)) {
      message.warning('超出边界')
      return false
    }
    // 上移超框
    if (yd < 0 && yd < (e.target.parentNode.offsetTop) * -1) {
      message.warning('超出边界')
      return false
    }
    // 下移超框
    if (yd > 0 && yd > (viewHeight! - e.target.parentNode.offsetTop - e.target.parentNode.offsetHeight)) {
      message.warning('超出边界')
      return false
    }
    const xp = xd / viewWidth! // percent
    const yp = yd / viewHeight! // percent
    const copy = { ...cur }
    copy.left = parseFloat((cur!.left + (xp * 100)).toFixed(2))
    copy.top = parseFloat((cur!.top + (yp * 100)).toFixed(2))
    // form.setFieldsValue(copy)
    submitData(copy as BannerElement<'image' | 'text'>, idx)
  }
  return (
    <div
    className={styles.eleContainer}
    style={{
      left: `${cur?.left}%`,
      top: `${cur?.top}%`
    }}
    >
      {
        cur?.type === 'image'
          ? (
          <img
          src={cur.src}
          alt={cur.src}
          ref={ref}
          style={{
            width: `${cur.width}rem`,
            height: `${cur.height}rem`,
            cursor: 'move'
          }}
          draggable={true}
          onDragStart={dragstart}
          onDragEnd={dragend}
          onDragOver={e => e.preventDefault()}
          />
            )
          : (
          <span
          ref={ref}
          style={{
            cursor: 'move',
            fontSize: `${cur?.fontSize}rem`,
            color: cur?.color,
            fontWeight: cur?.fontWight ? 'bold' : 'normal'
          }}
          draggable={true}
          onDragStart={dragstart}
          onDragEnd={dragend}
          onDragOver={e => e.preventDefault()}
          >
            {cur?.text}
          </span>
            )
      }
      {
        showEdit && !isPre && <div className={styles.editForm} draggable={false}>
          <Form form={form} colon={true} layout="vertical" size='small'>
            <div className="scroll-bar" style={{ maxHeight: 300 }}>
              {
                editType === 2 && (
                  <Form.Item label="设备" name="device" initialValue={cur?.device || 'all'}>
                    <Radio.Group onChange={e => setOptions('device', e.target.value)}>
                      <Radio value='android'>Android</Radio>
                      <Radio value='ios'>IOS</Radio>
                      <Radio value='all'>全部</Radio>
                    </Radio.Group>
                  </Form.Item>
                )
              }
              {
                cur?.type === 'image' && (
                  <>
                    <Form.Item label="宽度" name="width" initialValue={cur?.width}
                      help="此处单位为页面单位rem，x100后为实际像素"
                    >
                      <InputNumber min={0} step={0.01} onChange={val => setOptions('width', val)}></InputNumber>
                    </Form.Item>
                    <Form.Item label="高度" name="height" initialValue={cur?.height}
                    help="此处单位为页面单位rem，x100后为实际像素">
                      <InputNumber min={0} step={0.01} onChange={val => setOptions('height', val)}></InputNumber>
                    </Form.Item>
                  </>
                )
              }
              {
                cur?.type === 'text' && (
                  <>
                    <Form.Item label="文字" name="text" initialValue={cur.text}>
                      <Input onChange={e => setOptions('text', e.target.value)}></Input>
                    </Form.Item>
                    <Form.Item label="字体加粗" name="fontWeight" initialValue={cur.fontWight} valuePropName="checked">
                      <Switch onChange={val => setOptions('fontWight', val)}></Switch>
                    </Form.Item>
                    <Form.Item label="字号" name="fontSize" initialValue={cur.fontSize}
                    help="此处单位为页面单位rem，x100后为实际像素">
                      <InputNumber min={0} step={0.01} onChange={val => setOptions('fontSize', val)}></InputNumber>
                    </Form.Item>
                    <Form.Item label="颜色">
                      <SketchPicker
                        color={cur.color}
                        disableAlpha
                        onChangeComplete={color => {
                          setOptions('color', color.hex)
                        }}
                      />
                    </Form.Item>
                  </>
                )
              }
              <div className='full-width flex-row flex-jst-start flex-ali-center'>
                <Form.Item label="横坐标" name="left" initialValue={cur?.left}>
                  <InputNumber min={0} max={100} step={1} onChange={val => setOptions('left', val)}></InputNumber>
                </Form.Item>
                <Button className="ma-lf-05" style={{ marginTop: 6 }} type="primary" size="small" onClick={() => {
                  let w = 0
                  if (cur?.type === 'image') {
                    w = cur.width! * 100
                  } else {
                    w = ref.current.offsetWidth
                  }
                  const val = (50 - (w / 2 / viewWidth!) * 100).toFixed(2)
                  setOptions('left', parseFloat(val))
                }}>横向居中</Button>
              </div>
              <div className="full-width flex-row flex-jst-start flex-ali-center">
                <Form.Item label="纵坐标" name="top" initialValue={cur?.left}>
                  <InputNumber min={0} max={100} step={1} onChange={val => setOptions('top', val)}></InputNumber>
                </Form.Item>
                <Button className="ma-lf-05" style={{ marginTop: 6 }} size="small" type="primary" onClick={() => {
                  let h = 0
                  if (cur?.type === 'image') {
                    h = cur.height! * 100
                  } else {
                    h = ref.current.offsetHeight
                  }
                  const val = (50 - (h / 2 / viewHeight!) * 100).toFixed(2)
                  setOptions('top', parseFloat(val))
                }}>纵向居中</Button>
              </div>
              <Form.Item label="可点击" name="clickAble" initialValue={cur?.clickAble} valuePropName="checked">
                <Switch onChange={val => setOptions('clickAble', val)}></Switch>
              </Form.Item>
              <Form.Item label="点击后跳转" name="href" initialValue={cur?.href}>
                <Input onChange={e => setOptions('href', e.target.value)}></Input>
              </Form.Item>
              <Form.Item label="移入放大" name="hoverScale" initialValue={cur?.hoverScale} valuePropName="checked">
                <Switch onChange={val => setOptions('hoverScale', val)}></Switch>
              </Form.Item>
            </div>
          </Form>
        </div>
      }
      {
        !isPre && (
          <div className={`${styles.ctrlContainer} flex-row flex-jst-end flex-ali-center`}>
            <div className={`${styles.ctrlItem} bg-success`} onClick={() => setEdit(!showEdit)}>
              <i className="iconfont icon-setting-filling text-white font-14"></i>
            </div>
            <div className={`${styles.ctrlItem} bg-danger ma-lf-05`} onClick={() => deleteHandler(idx)}>
              <i className="iconfont icon-close text-white font-14"></i>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default Element

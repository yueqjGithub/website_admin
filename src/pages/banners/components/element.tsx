import { Form, Input, InputNumber, Switch } from 'antd'
import React, { useEffect, useState } from 'react'
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
}

type Positions = {
  x: number
  y: number
}

const Element = ({ target, viewHeight, viewWidth, idx, onDelete, submitData, isPre }: Props) => {
  const [cur, setCur] = useState<BannerElement<'image' | 'text'>>()
  const [form] = Form.useForm<BannerElement<'image' | 'text'>>()
  const [savePosition, setSavePosition] = useState<Positions>({ x: 0, y: 0 })
  useEffect(() => {
    setCur(target)
  }, [target])
  const deleteHandler = (curIdx: number) => {
    onDelete(curIdx)
  }
  // 编辑区域
  const [showEdit, setEdit] = useState<boolean>(false)
  const setOptions = (key: string, val: any) => {
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

  return (
    <div
    className={styles.eleContainer}
    style={{
      left: `${cur?.left}%`,
      top: `${cur?.top}%`
    }}
    draggable
    onDragStart={e => {
      const start = {
        x: e.clientX,
        y: e.clientY
      }
      setSavePosition(start)
    }}
    onDragEnd={e => {
      const x = e.clientX
      const y = e.clientY
      const xd = x - savePosition.x // distance
      const yd = y - savePosition.y // distance
      if (xd < 0 && xd < (e.currentTarget.offsetLeft + e.currentTarget.offsetWidth) * -1) {
        console.log('左移超框')
        return false
      }
      // 右移超框
      if (xd > 0 && xd > (viewWidth! - e.currentTarget.offsetLeft)) {
        console.log('右移超框')
        return false
      }
      // 上移超框
      if (yd < 0 && yd < (e.currentTarget.offsetTop + e.currentTarget.offsetHeight) * -1) {
        console.log('上移超框')
        return false
      }
      // 下移超框
      if (yd > 0 && yd > (viewHeight! - e.currentTarget.offsetTop)) {
        console.log('下移超框')
        return false
      }
      const xp = xd / viewWidth! // percent
      const yp = yd / viewHeight! // percent
      const copy = { ...cur }
      copy.left = parseFloat((cur!.left + (xp * 100)).toFixed(2))
      copy.top = parseFloat((cur!.top + (yp * 100)).toFixed(2))
      form.setFieldsValue(copy)
      submitData(copy as BannerElement<'image' | 'text'>, idx)
    }}
    >
      {
        cur?.type === 'image'
          ? (
          <img
          draggable
          src={cur.src}
          alt={cur.src}
          style={{
            width: `${cur.width}rem`,
            height: `${cur.height}rem`,
            cursor: 'move'
          }}
          />
            )
          : (
          <span
          style={{
            cursor: 'move',
            fontSize: `${cur?.fontSize}rem`,
            color: cur?.color,
            fontWeight: cur?.fontWight ? 'bold' : 'normal'
          }}
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
              <Form.Item label="横坐标" name="left" initialValue={cur?.left}>
                <InputNumber min={0} max={100} step={1} onChange={val => setOptions('left', val)}></InputNumber>
              </Form.Item>
              <Form.Item label="纵坐标" name="top" initialValue={cur?.left}>
                <InputNumber min={0} max={100} step={1} onChange={val => setOptions('top', val)}></InputNumber>
              </Form.Item>
              <Form.Item label="可点击" name="clickAble" initialValue={cur?.clickAble} valuePropName="checked">
                <Switch onChange={val => setOptions('clickAble', val)}></Switch>
              </Form.Item>
              <Form.Item label="点击后跳转" name="href" initialValue={cur?.href}>
                <Input></Input>
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

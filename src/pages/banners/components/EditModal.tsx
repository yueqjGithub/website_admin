import React, { ReactElement } from 'react'
import styles from '../common/style.module.scss'
type Props = {
  visible: boolean
  destoryOnClose: boolean
  onCancel?: Function
  children: ReactElement
}

const EditModal = ({ visible, destoryOnClose, children }: Props) => {
  return (
    <div className={styles.modalContainer} style={{ display: visible ? 'block' : 'none' }}>
      {
        destoryOnClose
          ? (
              <>
                {
                  visible ? <>{children}</> : ''
                }
              </>
            )
          : (
              <>
                {children}
              </>
            )
      }
    </div>
  )
}

export default EditModal

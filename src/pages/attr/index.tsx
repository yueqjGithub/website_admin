import React from 'react'
import PageContainer from '../../components/pageContainer'
import { State } from '../../store/state'
import Main from './main'
type Props = {
  state: State
  dispatch: any
}

const AttrContent = ({ state, dispatch }: Props) => {
  return (
    <PageContainer
      state={state}
      dispatch={dispatch}
      data={[]}
    >
      <Main state={state} dispatch={dispatch}></Main>
    </PageContainer>
  )
}

export default AttrContent

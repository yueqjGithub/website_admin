import React from 'react'
import PageContainer from '../../components/pageContainer'
import { State } from '../../store/state'
import Main from './main'

type Props = {
  state: State
  dispatch: any
}

const News = ({ state, dispatch }: Props) => {
  return (
    <PageContainer
      state={state}
      dispatch={dispatch}
      data={[{ id: 'getlang' }]}
    >
      <Main state={state} dispatch={dispatch}></Main>
    </PageContainer>
  )
}

export default News

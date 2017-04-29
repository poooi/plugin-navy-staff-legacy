import React from 'react'
import { connect } from 'react-redux'
import { Panel } from 'react-bootstrap'

import { fleetInfoSelectorFactory } from '../selectors'

const FleetInfo = connect(
  (state, { fleetId }) => ({
    ...fleetInfoSelectorFactory(fleetId)(state),
  })
)(({ TP }) =>
  <Panel>
    <span>
      {`TP: ${TP}`}
    </span>
  </Panel>
)

export default FleetInfo

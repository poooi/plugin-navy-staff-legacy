import React from 'react'
import { connect } from 'react-redux'
import { Panel, OverlayTrigger, Tooltip } from 'react-bootstrap'

import { fleetInfoSelectorFactory } from '../selectors'

const FleetInfo = connect(
  (state, { fleetId }) => ({
    ...fleetInfoSelectorFactory(fleetId)(state),
  })
)(({ TP }) => {
  const tooltip = (
    <Tooltip id="staff-TP-indicator">
      <span>
        {`A rank: ${Math.floor(TP * 0.7)}`}
      </span>
    </Tooltip>
  )
  return (
    <Panel>
      <OverlayTrigger
        overlay={tooltip}
        placement="bottom"
      >
        <span>{`TP: ${TP}`}</span>
      </OverlayTrigger>
    </Panel>
  )
})

export default FleetInfo

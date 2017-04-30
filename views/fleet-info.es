import React from 'react'
import { connect } from 'react-redux'
import { Panel, OverlayTrigger, Tooltip } from 'react-bootstrap'

import { fleetInfoSelectorFactory } from '../selectors'
import { AACITable } from '../aaci'

const FleetInfo = connect(
  (state, { fleetId }) => ({
    ...fleetInfoSelectorFactory(fleetId)(state),
  })
)(({ TP, AACIs }) => {
  const TPTooltip = (
    <Tooltip id="staff-TP-tooltip">
      <span>
        {`A rank: ${Math.floor(TP * 0.7)}`}
      </span>
    </Tooltip>
  )
  const AACITooltip = (
    <Tooltip id="staff-TP-tooptip">
      {
        AACIs.map(id =>
          <span key={id}>
            {`type: ${id}`}
          </span>
        )
      }
    </Tooltip>
  )
  return (
    <Panel>
      <OverlayTrigger
        overlay={TPTooltip}
        placement="bottom"
      >
        <span>{`TP: ${TP}`}</span>
      </OverlayTrigger>
      {
        AACIs.length > 0
        ?
          <OverlayTrigger
            overlay={AACITooltip}
            placement="bottom"
          >
            <span>AACI on</span>
          </OverlayTrigger>
        :
          <span>AACI off</span>
      }
    </Panel>
  )
})

export default FleetInfo

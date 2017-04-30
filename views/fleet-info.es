import React from 'react'
import { connect } from 'react-redux'
import { Panel, OverlayTrigger, Tooltip, Label, Badge } from 'react-bootstrap'
import { get } from 'lodash'

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
    <Tooltip id="staff-TP-tooptip" className="info-tooltip">
      <div className="info-tooltip-entry">
        <span className="info-tooltip-item">
          AACI Type
        </span>
        <span>
          Shotdown
        </span>
      </div>
      {
        AACIs.map(id =>
          <div key={id} className="info-tooltip-entry">
            <span className="info-tooltip-item">
              <Label bsStyle="success">
                {`${id}${get(AACITable, `${id}.name.length`, 0) > 0 ? ` - ${AACITable[id].name}` : ''}`}
              </Label>
            </span>
            <span>
              {(AACITable[id] || {}).fixed}
            </span>
          </div>
        )
      }
    </Tooltip>
  )
  return (
    <Panel className="fleet-info">
      <div>
        <OverlayTrigger
          overlay={TPTooltip}
          placement="bottom"
        >
          <span>{`TP: ${TP}`}</span>
        </OverlayTrigger>
      </div>
      <div>
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
      </div>
    </Panel>
  )
})

export default FleetInfo

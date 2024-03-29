import React from 'react'
import { connect } from 'react-redux'
import { Panel, OverlayTrigger, Tooltip, Label, Badge } from 'react-bootstrap'
import { get } from 'lodash'
import { resolve } from 'path'

import { fleetInfoSelectorFactory, combinedFleetInfoSelector } from '../selectors'
import { AACITable } from '../aaci'

const __ = window.i18n['poi-plugin-navy-staff'].__.bind(window.i18n['poi-plugin-navy-staff'])

const FleetInfo = connect(
  (state, { fleetId, combined }) => {

    if (combined) {
      return {
        ...combinedFleetInfoSelector(state),
      }
    }

    return {
      ...fleetInfoSelectorFactory(fleetId)(state),
    }
  }
)(({ TP, AACIs }) => {
  const TPTooltip = (
    <Tooltip id="staff-TP-tooltip">
      <span>
        {`${__('A rank: ')}${Math.floor(TP * 0.7)}`}
      </span>
    </Tooltip>
  )
  const AACITooltip = (
    <Tooltip id="staff-TP-tooptip" className="info-tooltip">
      <div className="info-tooltip-entry">
        <span className="info-tooltip-item">
          {__('AACI Type')}
        </span>
        <span>
          {__('Shotdown')}
        </span>
      </div>
      {
        AACIs.map(id =>
          <div key={id} className="info-tooltip-entry">
            <span className="info-tooltip-item">
              <Label bsStyle="success">
                {`${id}${get(AACITable, `${id}.name.length`, 0) > 0 ? ` - ${__(AACITable[id].name)}` : ''}`}
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
          <span>{`${__('TP: ')}${TP}`}</span>
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
              <Label bsStyle="success">{__('AACI on')}</Label>
            </OverlayTrigger>
          :
            <Label bsStyle="default">{__('AACI off')}</Label>
        }
      </div>
    </Panel>
  )
})

export default FleetInfo

import React from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip, Label} from 'react-bootstrap'
import FA from 'react-fontawesome'
import { get } from 'lodash'

import { shipInfoSelectorFactory } from '../selectors'
import { AACITable } from '../aaci'

const AACITooltip = ({ AACI: { AACIs, allAACIs, availableAACIs } }) =>
  <div>
    <div className="info-tooltip-entry">
      <span className="info-tooltip-item">
        AACI Type
      </span>
      <span>
        Shotdown
      </span>
    </div>
    {
      allAACIs.map(id =>
        <div className="info-tooltip-entry" key={id}>
          <span className="info-tooltip-item">
            <Label bsStyle={availableAACIs.includes(id) ? 'success' : 'default'}>
              {`${id}${get(AACITable, `${id}.name.length`, 0) > 0 ? ` - ${AACITable[id].name}` : ''}`}
              {
                AACIs.includes(id) && <FA name="check" />
              }
            </Label>
          </span>
          <span>
            { (AACITable[id] || {}).fixed }
          </span>
        </div>
      )
    }
  </div>

const ShipView = connect(
  (state, { shipId }) => ({
    ...shipInfoSelectorFactory(shipId)(state),
  })
)(({ ship, equips, onslots, AACI, isOASW }) => {

  return (
    <div className="ship-view">
      <div className="ship-name">
        {ship.api_name}
      </div>
      <div className="ship-info">
        <div className="aaci">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip className="info-tooltip"><AACITooltip AACI={AACI} /></Tooltip>}
          >
            {
              AACI.AACIs.length
              ?
                <Label bsStyle="success">AACI on</Label>
              :
                <Label>AACI off</Label>
            }
          </OverlayTrigger>
        </div>
        <div className="oasw">
          {
            isOASW
            ?
              <Label bsStyle="success">OASW on</Label>
            :
              <Label>OASW off</Label>
          }
        </div>
      </div>
    </div>
  )
})

export default ShipView

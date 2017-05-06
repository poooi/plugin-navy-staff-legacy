import React from 'react'
import { connect } from 'react-redux'
import { shipDataSelectorFactory, fleetShipsIdSelectorFactory } from 'views/utils/selectors'
import { resolve } from 'path'

import FleetInfo from './fleet-info'
import ShipView from './ship-view'

const __ = window.i18n['poi-plugin-navy-staff'].__.bind(window.i18n['poi-plugin-navy-staff'])

const FleetView = connect(
  (state, props) => {
    const { fleetId = 0 } = props
    return ({
      shipIds: fleetShipsIdSelectorFactory(fleetId)(state),
      fleetId,
    })
  }
)(({ fleetId, shipIds = [] }) => (
  <div>
    <FleetInfo fleetId={fleetId} />
    <div className="ship-list">
      <div className="main-fleet">
        {
          shipIds.map(id =>
            <ShipView
              shipId={id}
              key={id}
            />
          )
        }
      </div>
    </div>
  </div>
  )
)

export default FleetView

import React from 'react'
import { connect } from 'react-redux'
import { shipDataSelectorFactory, fleetShipsIdSelectorFactory } from 'views/utils/selectors'
import { resolve } from 'path'

import FleetInfo from './fleet-info'
import ShipView from './ship-view'

const __ = window.i18n['poi-plugin-navy-staff'].__.bind(window.i18n['poi-plugin-navy-staff'])

const CombinedFleetView = connect(
  (state) => {
    return ({
      shipIds1: fleetShipsIdSelectorFactory(0)(state),
      shipIds2: fleetShipsIdSelectorFactory(1)(state),
    })
  }
)(({ shipIds1 = [], shipIds2 = [] }) => (
  <div>
    <FleetInfo combined />
    <div className="ship-list">
      <div className="main-fleet">
        {
          shipIds1.map(id =>
            <ShipView
              shipId={id}
              key={id}
            />
          )
        }
      </div>
      <div className="escort-fleet">
        {
          shipIds2.map(id =>
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

export default CombinedFleetView

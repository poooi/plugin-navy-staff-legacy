import React from 'react'
import { connect } from 'react-redux'
import { shipDataSelectorFactory, fleetShipsIdSelectorFactory } from 'views/utils/selectors'

import FleetInfo from './fleet-info'
import ShipView from './ship-view'

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
    {
      shipIds.map(id =>
        <ShipView
          shipId={id}
          key={id}
        />
      )
    }
  </div>
  )
)

export default FleetView

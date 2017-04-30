import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { memoize, get } from 'lodash'
import { Button, ButtonGroup } from 'react-bootstrap'
import { join } from 'path'

import {
  fleetNameSelectorFactory,
  fleetStateSelectorFactory,
} from 'views/utils/selectors'

import FleetView from './views/fleet-view'

const defaultFleetNames = ['I', 'II', 'III', 'IV']

function getStyle(state, disabled) {
  if (state >= 0 && state <= 5 && !disabled) {
    // 0: Cond >= 40, Supplied, Repaired, In port
    // 1: 20 <= Cond < 40, or not supplied, or medium damage
    // 2: Cond < 20, or heavy damage
    // 3: Repairing
    // 4: In mission
    // 5: In map
    return ['success', 'warning', 'danger', 'info', 'primary', 'default'][state]
  }
  return 'default'
}

const shipViewSwitchButtonDataSelectorFactory = memoize(fleetId =>
  createSelector([
    fleetNameSelectorFactory(fleetId),
    fleetStateSelectorFactory(fleetId),
  ], (fleetName, fleetState) => ({
    fleetState,
    fleetName,
  }))
)

const ShipViewSwitchButton = connect(
  (state, { fleetId }) =>
    shipViewSwitchButtonDataSelectorFactory(fleetId)(state)
)(({ fleetId, activeId, fleetName, fleetState, onClick, disabled }) =>
  <Button
    bsSize="small"
    bsStyle={getStyle(fleetState, disabled)}
    onClick={onClick}
    disabled={disabled}
    className={fleetId === activeId ? 'active' : ''}
  >
    {fleetName || defaultFleetNames[fleetId]}
  </Button>
)

const NavyStaff = connect(
  state => ({
    fleetCount: get(state, 'info.fleets.length', 4),
  })
)(class NavyStaff extends Component {
  static propTypes = {
    fleetCount: PropTypes.number.isRequired,
  }

  defaultProps = {
    fleetCount: 0,
  }

  constructor(props) {
    super(props)

    this.state = {
      activeId: 0,
    }
  }

  handleClick = activeId => () => {
    this.setState({
      activeId,
    })
  }

  render() {
    const { fleetCount } = this.props
    const { activeId } = this.state
    return (
      <div id="navy-staff">
        <link rel="stylesheet" href={join(__dirname, 'assets', 'style.css')} />
        <ButtonGroup className="fleet-name-button">
          {
            [0, 1, 2, 3].map(i =>
              <ShipViewSwitchButton
                key={i}
                fleetId={i}
                onClick={this.handleClick(i)}
                disabled={i + 1 > fleetCount}
                activeId={activeId}
              />
            )
          }
          <Button
            bsSize="small"
            onClick={this.handleClick(4)}
            className={activeId === 4 ? 'active' : ''}
          >
            Land Base
          </Button>
        </ButtonGroup>
        {
          activeId < 4 &&
          <FleetView
            fleetId={activeId}
          />
        }
      </div>
    )
  }
}
)

export const reactClass = NavyStaff

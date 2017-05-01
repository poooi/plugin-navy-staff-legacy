import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { memoize, get } from 'lodash'
import { Button, ButtonGroup } from 'react-bootstrap'
import { join } from 'path'

import {
  fleetNameSelectorFactory,
  fleetStateSelectorFactory,
  combinedFleetStateSelector,
} from 'views/utils/selectors'

import FleetView from './views/fleet-view'
import CombinedFleetView from './views/combined-fleet-view'
import AirbaseView from './views/airbase-view'
import { CombinedFleetType } from './utils'

// const { i18n } = window
// const __ = i18n['poi-plugin-navy-staff'].__.bind(i18n['poi-plugin-navy-staff'])

window.i18n['poi-plugin-navy-staff'] = new (require('i18n-2'))({
  locales: ['zh-CN', 'zh-TW', 'ja-JP', 'en-US', 'ko-KR'],
  defaultLocale: 'en-US',
  directory: join(__dirname, 'i18n'),
  updateFiles: true,
  indent: "\t",
  extension: '.json',
  devMode: true,
})
window.i18n['poi-plugin-navy-staff'].setLocale(window.language)

const __ = window.i18n['poi-plugin-navy-staff'].__.bind(window.i18n['poi-plugin-navy-staff'])

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

const CombinedFleetViewSwitchButton = connect(
  state => ({
    fleetState: combinedFleetStateSelector(state),
  })
)(({ fleetId, activeId, fleetName, fleetState, onClick, disabled }) =>
  <Button
    bsSize="small"
    bsStyle={getStyle(fleetState, disabled)}
    onClick={onClick}
    disabled={disabled}
    className={fleetId === activeId ? 'active' : ''}
  >
    {fleetName}
  </Button>
)

const NavyStaff = connect(
  state => ({
    fleetCount: get(state, 'info.fleets.length', 4),
    combinedFlag: get(state, 'sortie.combinedFlag'),
  })
)(class NavyStaff extends Component {
  static propTypes = {
    fleetCount: PropTypes.number.isRequired,
    combinedFlag: PropTypes.number.isRequired,
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
    const { fleetCount, combinedFlag } = this.props
    const { activeId } = this.state

    let View
    switch (activeId) {
      case 12:
        View = <CombinedFleetView />
        break
      case 4:
        View = <AirbaseView />
        break
      default:
        View = <FleetView fleetId={activeId} />
    }

    return (
      <div id="navy-staff">
        <link rel="stylesheet" href={join(__dirname, 'assets', 'style.css')} />
        <ButtonGroup className="fleet-name-button">
          {
            combinedFlag > 0
            ?
              <CombinedFleetViewSwitchButton
                fleetId={12}
                onClick={this.handleClick(12)}
                activeId={activeId}
                fleetName={__(CombinedFleetType[combinedFlag])}
              />
            :
              [0, 1].map(i =>
                <ShipViewSwitchButton
                  key={i}
                  fleetId={i}
                  onClick={this.handleClick(i)}
                  disabled={i + 1 > fleetCount}
                  activeId={activeId}
                />
              )
          }
          {
            [2, 3].map(i =>
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
            {__('Land Base')}
          </Button>
        </ButtonGroup>
        {View}
      </div>
    )
  }
}
)

export const reactClass = NavyStaff

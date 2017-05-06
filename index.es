import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { memoize, get } from 'lodash'
import { Button, ButtonGroup } from 'react-bootstrap'
import { join } from 'path'
import { promisify } from 'bluebird'
import { readJSON } from 'fs-extra'
import classnames from 'classnames'
import { observe } from 'redux-observers'

import {
  fleetNameSelectorFactory,
  fleetStateSelectorFactory,
} from 'views/utils/selectors'
import { store } from 'views/create-store'

import { combinedFleetStateSelector } from './selectors'
import { reducer as _reducer } from './redux'

import FleetView from './views/fleet-view'
import CombinedFleetView from './views/combined-fleet-view'
import AirbaseView from './views/airbase-view'
import DeckPlannerView from './views/deck-planner-view'
import { combinedFleetType, DATA_PATH } from './utils'
import { onLoadData, dataObserver } from './redux'

const { dispatch } = window

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
    className={classnames({
      active: fleetId === activeId,
      combined: true,
    })}
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

  componentDidMount = async () => {
    try {
      const data = await promisify(readJSON)(DATA_PATH)
      dispatch(onLoadData({
        data,
      }))
    } catch (e) {
      console.warn(e.stack)
    }

    this.unsubscribeObserver = observe(store, [dataObserver])
  }

  componentWillUnmount = () => {
    if (this.unsubscribeObserver) {
      this.unsubscribeObserver()
    }
  }

  componentWillReciveProps = (nextProps) => {
    const { combinedFlag } = this.props
    if (combinedFlag === 0 && nextProps.combinedFlag > 0) {
      this.setState({
        activeId: -1,
      })
    }
  }

  defaultProps = {
    fleetCount: 0,
  }

  constructor(props) {
    super(props)

    this.state = {
      activeId: props.combinedFlag > 0 ? -1 : 0,
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
      case -1:
        View = <CombinedFleetView />
        break
      case 4:
        View = <AirbaseView />
        break
      case 5:
        View = <DeckPlannerView />
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
                onClick={this.handleClick(-1)}
                activeId={activeId}
                fleetName={__(combinedFleetType[combinedFlag])}
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
          <Button
            bsSize="small"
            onClick={this.handleClick(5)}
            className={activeId === 5 ? 'active' : ''}
          >
            {__('Deck Planner')}
          </Button>
        </ButtonGroup>
        {View}
      </div>
    )
  }
}
)

export const reactClass = NavyStaff

export const reducer = _reducer

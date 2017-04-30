import memoize from 'fast-memoize'
import { createSelector } from 'reselect'
import { stateSelector, equipDataSelectorFactory, fleetShipsDataSelectorFactory, fleetShipsEquipDataSelectorFactory } from 'views/utils/selectors'

import { getTransportPoint } from './utils'
import { getFleetAvailableAACIs } from './aaci'

// airbase: Array of all squadrons of all maps
// squadron index is never guaranteed
// the index should be Number

const airbaseSelector = state => state.info.airbase

const squadronBaseDataSelectorFactory = memoize(index =>
  createSelector([
    airbaseSelector,
  ], airbase => ((airbase && typeof index === 'number') ? airbase[index] : undefined)
  )
)

const squadronBasePlaneSelector = memoize(index =>
  createSelector([
    squadronBaseDataSelectorFactory(index),
  ], squad => (typeof squad !== 'undefined' ? squad.api_plane_info : undefined))
)

// get squadron plane's equip info
// Returns [_equip, $equip]
// Returns undefined if uninitialized, or if equip not found in _equip
const squadronPlaneDataSelector = memoize(index =>
  createSelector([
    stateSelector,
    squadronBasePlaneSelector(index),
  ], (state, info) =>
    (typeof info === 'undefined' ? equipDataSelectorFactory(info.api_slotid)(state) : undefined)
  )
)

export const squadronDataSelectorFactory = memoize(index =>
  createSelector([
    squadronBaseDataSelectorFactory(index),
    squadronPlaneDataSelector(index),
  ], (squad, [_equip, $equip]) => [squad, _equip, $equip])
)

const normalizedFleetShipsDataSelectorFactory = memoize(fleetId =>
  createSelector([
    fleetShipsDataSelectorFactory(fleetId),
  ], shipsData =>
    shipsData.filter(([_ship, $ship]) => !!_ship && !!$ship)
    .map(([_ship, $ship]) => ({ ...$ship, ..._ship }))
  )
)

const normalizedFleetShipsEquipDataSelectorFactory = memoize(fleetId =>
  createSelector([
    fleetShipsEquipDataSelectorFactory(fleetId),
  ], equipsData =>
    equipsData.map(equipData =>
      equipData.filter(([_equip, $equip, onslot] = []) => !!_equip && !!$equip)
      .map(([_equip, $equip, onslot]) => ([{ ...$equip, ..._equip }, onslot]))
    )
  )
)

export const fleetInfoSelectorFactory = memoize(fleetId =>
  createSelector([
    normalizedFleetShipsDataSelectorFactory(fleetId),
    normalizedFleetShipsEquipDataSelectorFactory(fleetId),
  ], (shipsData, equipsData) => ({
    TP: getTransportPoint(shipsData, equipsData),
    AACIs: getFleetAvailableAACIs(shipsData, equipsData),
  }))
)

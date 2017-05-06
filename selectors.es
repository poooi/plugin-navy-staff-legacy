import memoize from 'fast-memoize'
import { createSelector } from 'reselect'
import { stateSelector, shipsSelector, equipDataSelectorFactory,
  shipDataSelectorFactory, shipEquipDataSelectorFactory,
  fleetShipsDataSelectorFactory, fleetShipsEquipDataSelectorFactory,
  fleetStateSelectorFactory,
  extensionSelectorFactory } from 'views/utils/selectors'
import fp from 'lodash/fp'
import { flatten } from 'lodash'

import { PLUGIN_KEY, getTransportPoint } from './utils'
import { getFleetAvailableAACIs, getShipAvaliableAACIs, getShipAllAACIs, getShipAACIs } from './aaci'
import { isOASW } from './oasw'

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
  ], (shipsData = []) =>
    shipsData.filter(([_ship, $ship]) => !!_ship && !!$ship)
    .map(([_ship, $ship]) => ({ ...$ship, ..._ship }))
  )
)

const normalizedFleetShipsEquipDataSelectorFactory = memoize(fleetId =>
  createSelector([
    fleetShipsEquipDataSelectorFactory(fleetId),
  ], (equipsData = []) =>
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


export const shipInfoSelectorFactory = memoize(shipId =>
  createSelector([
    shipDataSelectorFactory(shipId),
    shipEquipDataSelectorFactory(shipId),
  ], ([_ship, $ship], _equips) => {
    const ship = { ...$ship, ..._ship }
    const equips = _equips.filter(([_equip, $equip, onslot] = []) => !!_equip && !!$equip)
                          .map(([_equip, $equip, onslot]) => ({ ...$equip, ..._equip }))

    const onslots = _equips.filter(([_equip, $equip, onslot] = []) => !!_equip && !!$equip)
                           .map(([_equip, $equip, onslot]) => onslot)
    return ({
      AACI: {
        availableAACIs: getShipAvaliableAACIs(ship, equips),
        allAACIs: getShipAllAACIs(ship),
        AACIs: getShipAACIs(ship, equips),
      },
      isOASW: isOASW(ship, equips),
      ship,
      equips,
      onslots,
    })
  })
)

export const combinedFleetStateSelector = createSelector([
  fleetStateSelectorFactory(0),
  fleetStateSelectorFactory(1),
], (state0, state1) => Math.max(state0, state1))

export const combinedFleetInfoSelector = createSelector([
  normalizedFleetShipsDataSelectorFactory(0),
  normalizedFleetShipsEquipDataSelectorFactory(0),
  normalizedFleetShipsDataSelectorFactory(1),
  normalizedFleetShipsEquipDataSelectorFactory(1),
], (ships0, equips0, ships1, equips1) => ({
  TP: getTransportPoint([...ships0, ...ships1], [...equips0, ...equips1]),
  AACIs: getFleetAvailableAACIs([...ships0, ...ships1], [...equips0, ...equips1]),
}))


export const ShipItemSelectorFactory = memoize(shipId =>
  createSelector([
    shipDataSelectorFactory(shipId),
  ], ([ship, $ship] = []) =>
    !!ship && !!$ship
    ? ({
      id: ship.api_id,
      typeId: $ship.api_stype,
      name: $ship.api_name,
      lv: ship.api_lv,
      area: ship.api_sally_area,
    })
    : undefined
  )
)

export const shipMenuDataSelector = createSelector(
  [
    shipsSelector,
    state => state,
  ], (_ships, state) =>
    fp.flow(
      fp.map(ship => ship.api_id),
      fp.map(shipId => ShipItemSelectorFactory(shipId)(state)),
    )(_ships)
)

export const deckPlannerCurrentSelector = createSelector(
  [
    extensionSelectorFactory(PLUGIN_KEY),
  ], state => state.dpCurrent
)

export const deckPlannerAreaSelectorFactory = memoize(areaIndex =>
  createSelector(
    [
      deckPlannerCurrentSelector,
    ], current => current[areaIndex] || []
  )
)

export const deckPlannerAllShipIdsSelector = createSelector(
  [
    deckPlannerCurrentSelector,
  ], current => flatten(current)
)

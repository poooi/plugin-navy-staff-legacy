import { memoize } from 'fast-memoize'
import { createSelector } from 'reselect'
import { stateSelector, equipDataSelectorFactory } from 'views/utils/selectors'

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

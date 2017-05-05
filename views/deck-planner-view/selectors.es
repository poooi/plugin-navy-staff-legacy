import { createSelector } from 'reselect'
import { memoize } from 'lodash'
import fp from 'lodash/fp'

import { shipsSelector, shipDataSelectorFactory } from 'views/utils/selectors'

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

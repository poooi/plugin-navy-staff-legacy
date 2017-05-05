import { observer } from 'redux-observers'
import { isEqual } from 'lodash'

import { extensionSelectorFactory } from 'views/utils/selectors'

import { PLUGIN_KEY, HISTORY_PATH } from './utils'
import FileWriter from './file-writer'

export const onDPInit = ({ color, mapname }) =>
  ({
    type: `@@${PLUGIN_KEY}@dp-init`,
    color,
    name,
  })

export const onAddShip = ({ shipId, areaIndex }) =>
  ({
    type: `@@${PLUGIN_KEY}@dp-addShip`,
    shipId,
    areaIndex,
  })


export const onRemoveShip = ({ shipId, areaIndex }) =>
  ({
    type: `@@${PLUGIN_KEY}@dp-removeship`,
    shipId,
    areaIndex,
  })


export const onDisplaceShip = ({ shipId, fromAreaIndex, toAreaIndex }) =>
  ({
    type: `@@${PLUGIN_KEY}@dp-displaceShip`,
    shipId,
    fromAreaIndex,
    toAreaIndex,
  })

// dpCurrent: [[ship ids in the area ] for area in fcd ] current deck planner's profile, it depends on the fcd name
// so only ship ids are stored
// TODO dpBookmarks: historical data, we must make sure it is independent of fcd
// {
//   name: 'example',
//   areas: [
//     {
//       name: 'E1',
//       color: '#0099ff',
//       ships: [1, 2, 3]
//     }
//   ]
// }
const initState = {
  dpCurrent: [],
  dpBookmarks: {},
}

export const reducer = (state = initState, action) => {
  const { type, mapname, color, shipId, areaIndex, fromAreaIndex, toAreaIndex } = action
  const current = state.dpCurrent
  switch (type) {
    case `@@${PLUGIN_KEY}@dp-init`: {
      if (current.length < mapname.length) {
        const len = mapname.length - current.length
        return {
          ...state,
          dpCurrent: [...current, ...new Array(len).fill([])],
        }
      }
      break
    }
    case `@@${PLUGIN_KEY}@dp-addShip`: {
      const newCurrent = current.slice()
      newCurrent[areaIndex] = [...new Set([...newCurrent[areaIndex], shipId])]
      return {
        ...state,
        dpCurrent: newCurrent,
      }
    }
    case `@@${PLUGIN_KEY}@dp-removeShip`: {
      const newCurrent = current.slice()
      const index = newCurrent[areaIndex].indexOf(shipId)
      if (index > -1) {
        newCurrent[areaIndex] = newCurrent[areaIndex].splice(index, 1)
        return {
          ...state,
          dpCurrent: newCurrent,
        }
      }
      break
    }
    case `@@${PLUGIN_KEY}@dp-displaceShip`: {
      const newCurrent = current.slice()
      const index = newCurrent[fromAreaIndex].indexOf(shipId)
      if (index > -1) {
        newCurrent[fromAreaIndex] = newCurrent[fromAreaIndex].splice(index, 1)
        newCurrent[toAreaIndex] = [...toAreaIndex, shipId]
        return {
          ...state,
          dpCurrent: newCurrent,
        }
      }
      break
    }
    default:
      return state
  }
  return state
}

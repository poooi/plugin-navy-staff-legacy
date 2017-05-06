import { observer } from 'redux-observers'
import { isEqual } from 'lodash'

import { extensionSelectorFactory } from 'views/utils/selectors'

import { PLUGIN_KEY, DATA_PATH } from './utils'
import FileWriter from './file-writer'

export const onDPInit = ({ color, mapname }) =>
  ({
    type: `@@${PLUGIN_KEY}@dp-init`,
    color,
    mapname,
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

export const onLoadData = ({ data }) =>
  ({
    type: `@@${PLUGIN_KEY}@loadData`,
    data,
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
  const { type, mapname, shipId, areaIndex, fromAreaIndex, toAreaIndex, data } = action
  const current = state.dpCurrent
  switch (type) {
    case `@@${PLUGIN_KEY}@loadData`: {
      return {
        ...state,
        ...data,
      }
    }
    case `@@${PLUGIN_KEY}@dp-init`: {
      if (current.length < mapname.length) {
        const len = mapname.length - current.length
        return {
          ...state,
          dpCurrent: [...current, ...new Array(len).fill([])],
        }
      } else if (current.length > mapname.length) {
        const newCurrent = current.slice(0, mapname.length)
        return {
          ...state,
          dpCurrent: newCurrent,
        }
      }
      break
    }
    case `@@${PLUGIN_KEY}@dp-addShip`: {
      const newCurrent = current.slice()
      if (!newCurrent[areaIndex].includes(shipId)) {
        newCurrent[areaIndex] = [...newCurrent[areaIndex], shipId]
        return {
          ...state,
          dpCurrent: newCurrent,
        }
      }
      break
    }
    case `@@${PLUGIN_KEY}@dp-removeship`: {
      const newCurrent = current.slice()
      if (newCurrent[areaIndex].includes(shipId)) {
        newCurrent[areaIndex] = newCurrent[areaIndex].filter(id => id !== shipId)
        return {
          ...state,
          dpCurrent: newCurrent,
        }
      }
      break
    }
    case `@@${PLUGIN_KEY}@dp-displaceShip`: {
      const newCurrent = current.slice()
      if (newCurrent[fromAreaIndex].includes(shipId)) {
        newCurrent[fromAreaIndex] = newCurrent[fromAreaIndex].filter(id => id !== shipId)
        newCurrent[toAreaIndex] = [...newCurrent[toAreaIndex], shipId]
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


const fileWriter = new FileWriter()

export const dataObserver = observer(
  extensionSelectorFactory(PLUGIN_KEY),
  (dispatch, current = {}, previous) => {
    // avoid initial state overwrites file
    if (!isEqual(current, previous) && Object.keys(current).length > 0) {
      fileWriter.write(DATA_PATH, current)
    }
  }
)

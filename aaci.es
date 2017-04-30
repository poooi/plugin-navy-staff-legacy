// ported from KC3kai's AACI module
// url: https://github.com/KC3Kai/KC3Kai/blob/master/src/library/modules/AntiAir.js
// commit a9edbe5
// in thankful acknowledgment of their hard work
// some variable and function naming are modified

import { maxBy } from 'lodash'

// check for $slotitemtypes
const itemTypeIs = n => equip => equip.api_type[2] === n

// type for slot item
const iconIs = n => equip => equip.api_type[3] === n

// 12: 小型電探
// 13: 大型電探
const isRadar = equip => itemTypeIs(12)(equip) || itemTypeIs(13)(equip)

// ValidAny(f,g...)(x) = f(x) || g(x) || ...
const ValidAny = (...func) => x => func.some(f => f(x))

// ValidAll(f,g...)(x) = f(x) && g(x) && ...
const validAll = (...func) => x => func.every(f => f(x))

// AA Radar
// Surface Radar are excluded by checking whether
// the equipment gives AA stat (api_tyku)
const isAARadar = equip => isRadar(equip) && equip.api_tyku > 0

// 36: 高射装置 Anti-aircraft Fire Director
const isAAFD = itemTypeIs(36)

// icon=16: 高角砲
const isHighAngleMount = iconIs(16)

// 18: 対空強化弾
const isType3Shell = itemTypeIs(18)

// 21: 対空機銃
const isAAGun = itemTypeIs(21)

// icon=1: 小口径主砲
// icon=2: 中口径主砲
// icon=3: 大口径主砲
const isRedGun = iconIs(1) || iconIs(2) || iconIs(3)

// icon=4: 副砲
const isYellowGun = iconIs(4)

// 6: 艦上戦闘機
const isFighter = itemTypeIs(6)

// 7: 艦上爆撃機
const isDiveBomber = itemTypeIs(7)

// 10: 水上偵察機
const isSeaplaneRecon = itemTypeIs(10)

// 3: 大口径主砲
const isLargeCaliberMainGun = itemTypeIs(3)

// 122: 10cm連装高角砲+高射装置
// 130: 12.7cm高角砲+高射装置
// 135: 90mm単装高角砲
// 172: 5inch連装砲 Mk.28 mod.2
const isBuiltinHighAngleMount = equip => [122, 130, 135, 172].includes(equip.api_slotitem_id)

// 131: 25mm三連装機銃 集中配備
// 173: Bofors 40mm四連装機関砲
// 191: QF 2ポンド8連装ポンポン砲
const isCDMG = equip => [131, 173, 191].includes(equip.api_slotitem_id)

// for equipments the coefficient is different for
// calculating adjusted ship AA stat and fleet AA stat,
// so let's use the following naming convention:
//
// - "getShipXXX" is for calculating adjusted AA stat for individual ships
// - "getFleetXXX" for fleet AA
//
// verbs might change but the same convention should follow.

// TODO: abyssal equipments into consideration?

// it is possible for conditions to have overlap:
// Akizuki-gun for example is both high angle mount and short caliber main gun.
// to resolve this:
// - the conditions are re-ordered so the highest applicable
//   modifier is always checked first.
// - the wiki says main gun (red), so maybe an icon-based checker "isRedGun"
//   might be more appropriate.

const getShipEquipmentModifier = (equip) => {
  if (isAAGun(equip)) {
    return 6
  }
  if (isHighAngleMount(equip) || isAAFD(equip)) {
    return 4
  }
  if (isAARadar(equip)) {
    return 3
  }
  return 0
}

const getFleetEquipmentModifier = (equip) => {
  if (isType3Shell(equip)) {
    return 0.6
  }
  if (isAARadar(equip)) {
    return 0.4
  }
  if (isHighAngleMount(equip) || isAAFD(equip)) {
    return 0.35
  }
  if (ValidAny(isRedGun,
    isYellowGun,
    isAAGun,
    isFighter,
    isDiveBomber,
    isSeaplaneRecon)(equip)) {
    return 0.2
  }

  return 0
}

const getShipImprovementModifier = (equip) => {
  if (isAAGun(equip)) {
    return 4
  }
  if (isHighAngleMount(equip)) {
    return 3
  }
  if (isAARadar(equip)) {
    return 0
  }

  return 0
}

const getFleetImprovementModifier = (equip) => {
  if (isHighAngleMount(equip)) {
    return 3
  }
  if (isAAFD(equip)) {
    return 2
  }
  if (isAARadar(equip)) {
    return 1.5
  }
  if (isAAGun(equip)) {
    return 0
  }

  return 0
}

const getEquipmentAADefense = (equip, forFleet) => {
  const eTypMod = forFleet
      ? getFleetEquipmentModifier(equip)
      : getShipEquipmentModifier(equip)
  const eImproveMod = forFleet
      ? getFleetImprovementModifier(equip)
      : getShipImprovementModifier(equip)
  const aaStat = equip.api_tyku
  return (eTypMod * aaStat) + (eImproveMod * Math.sqrt(equip.api_level))
}

// returns a special floor function f(x) = q * floor( x / q )
// - q = 1 if ship equips nothing
// - q = 2 otherwise
const specialFloor = (ship) => {
  const q = (ship.api_slot || []).some(id => id !== -1) ? 2 : 1
  return x => q * Math.floor(x / q)
}

const shipEquipmentAntiAir = (equips, forFleet) =>
  equips.reduce((curAA, equip) => curAA + getEquipmentAADefense(equip, forFleet), 0)

// A_base
const shipBaseAntiAir = ship =>
  ((ship.api_tyku || [])[0] || 0) + (ship.api_kyouka[2] || 0)

// ^A
export const shipAdjustedAntiAir = ship =>
  shipBaseAntiAir(ship) + shipEquipmentAntiAir(ship, false)

// S_proportial
export const shipProportionalShotdownRate = (ship) => {
  const floor = specialFloor(ship)
  const adjustedAA = shipAdjustedAntiAir(ship)
  return floor(adjustedAA) / 400
}

export const shipProportionalShotdown = (ship, num) =>
  Math.floor(shipProportionalShotdownRate(ship) * num)

// 1=単縦陣, 2=複縦陣, 3=輪形陣, 4=梯形陣, 5=単横陣, 11-14=第n警戒航行序列
const formationMidifiers = {
  1: 1.0,
  2: 1.2,
  3: 1.6,
  4: 1.0,
  5: 1.0,
  11: 1.1,
  12: 1.0,
  13: 1.5,
  14: 1.0,
  21: 1.1,
  22: 1.0,
  23: 1.5,
  24: 1.0,
}

export const getFormationModifiers = id => formationMidifiers[id] || NaN

// ^F
export const fleetAdjustedAntiAir = (ships, formationModifier) => {
  const allShipEquipmentAA = ships.reduce((curAA, ship) =>
    curAA + shipEquipmentAntiAir(ship, true), 0)
  return (2 / 1.3) * Math.floor(formationModifier * allShipEquipmentAA)
}

// ^F for combined fleet
export const combinedFleetAdjustedAntiAir = (mainShips, escortShips, formationModifier) => {
  const mainAllShipEquipmentAA = mainShips.reduce((curAA, ship) =>
    curAA + shipEquipmentAntiAir(ship, true), 0)
  const escortAllShipEquipmentAA = escortShips.reduce((curAA, ship) =>
    curAA + shipEquipmentAntiAir(ship, true), 0)
  return (2 / 1.3) *
    Math.floor(formationModifier * (mainAllShipEquipmentAA + escortAllShipEquipmentAA))
}

// S_fixed
// K: AACI modifier, default to 1
// C: Combined Fleet modifier, default to 1, main fleet = 0.72, escort fleet = 0.48
const shipFixedShotdown = (ship, fleetShips, formationModifier, K = 1, C = 1) => {
  const floor = specialFloor(ship)
  const adjustedAA = shipAdjustedAntiAir(ship)
  return Math.floor(((floor(adjustedAA) +
    Math.floor(fleetAdjustedAntiAir(fleetShips, formationModifier))) * K * C) / 10)
}

// avoid modifying this structure directly, use "declareAACI" instead.
export const AACITable = {}

// typeIcons is a array including [ship icon, equip icon, ...]
// predicateShipMst is a function f: f(mst)
// predicateShipObj is a function f: f(shipObj)
// returns a boolean to indicate whether the ship in question (with equipments)
// is capable of performing such type of AACI
const declareAACI = ({ id, fixed, modifier, shipValid, equipsValid }) => {
  AACITable[id] = {
    id,
    fixed,
    modifier,
    shipValid,
    equipsValid,
  }
}

const isNotSubmarine = ship => ![13, 14].includes(ship.api_stype)

const isBattleship = ship => [8, 9, 10].includes(ship.api_stype)

// 421,330: 秋月
// 422, 346: 照月
// 423, 357: 初月
const isAkizukiClass = ship => [421, 330, 422, 346, 423, 357].includes(ship.api_ship_id)

const shipIdEq = n => ship => ship.api_ship_id === n

const isMayaK2 = shipIdEq(428)
const isIsuzuK2 = shipIdEq(141)
const isKasumiK2B = shipIdEq(470)
const isSatsukiK2 = shipIdEq(418)
const isKinuK2 = shipIdEq(487)

// "hasAtLeast(pred)(n)(xs)" is the same as:
// xs.filter(pred).length >= n
const hasAtLeast = (pred, n) => xs => xs.filter(pred).length >= n

// "hasSome(pred)(xs)" is the same as:
// xs.some(pred)
const hasSome = pred => xs => xs.some(pred)

// check if slot num of ship (excluding ex slot) equals or greater
const slotNumAtLeast = n => ship => ship.api_slot_num >= n


// *** all non-submarine ships
declareAACI({
  id: 5,
  fixed: 3,
  modifier: 1.5,
  shipValid: validAll(isNotSubmarine, slotNumAtLeast(3)),
  equipsValid: validAll(hasAtLeast(
    isBuiltinHighAngleMount, 2),
    hasSome(isAARadar)
  ),
})

declareAACI({
  id: 7,
  fixed: 3,
  modifier: 1.35,
  shipValid: validAll(isNotSubmarine, slotNumAtLeast(3)),
  equipsValid: validAll(
    hasSome(isBuiltinHighAngleMount),
    hasSome(isAAFD),
    hasSome(isAARadar)
  ),
})

declareAACI({
  id: 8,
  fixed: 4,
  modifier: 1.4,
  shipValid: validAll(isNotSubmarine, slotNumAtLeast(2)),
  equipsValid: validAll(
    hasSome(isBuiltinHighAngleMount),
    hasSome(isAARadar)
  ),
})

declareAACI({
  id: 9,
  fixed: 2,
  modifier: 1.3,
  shipValid: validAll(isNotSubmarine, slotNumAtLeast(2)),
  equipsValid: validAll(
    hasSome(isHighAngleMount),
    hasSome(isAAFD)
  ),
})

// CDMG is considered AAGun
declareAACI({
  id: 12,
  fixed: 3,
  modifier: 1.25,
  shipValid: validAll(isNotSubmarine, slotNumAtLeast(3)),
  equipsValid: validAll(
    hasSome(isCDMG),
    hasSome(isAAGun, 2),
    hasSome(isAAFD)
  ),
})

// *** BattleShip
declareAACI({
  id: 4,
  fixed: 6,
  modifier: 1.4,
  shipValid: validAll(isBattleship, slotNumAtLeast(4)),
  equipsValid: validAll(
    hasSome(isLargeCaliberMainGun),
    hasSome(isType3Shell),
    hasSome(isAAFD),
    hasSome(isAARadar)
  ),
})

declareAACI({
  id: 6,
  fixed: 4,
  modifier: 1.45,
  shipValid: validAll(isBattleship, slotNumAtLeast(3)),
  equipsValid: validAll(
    hasSome(isLargeCaliberMainGun),
    hasSome(isType3Shell),
    hasSome(isAAFD),
  ),
})


// *** Akizuki-class AACIs
declareAACI({
  id: 1,
  fixed: 7,
  modifier: 1.7,
  shipValid: isAkizukiClass,
  equipsValid: validAll(
    hasAtLeast(isHighAngleMount, 2),
    hasSome(isRadar)
  ),
})

declareAACI({
  id: 2,
  fixed: 6,
  modifier: 1.7,
  shipValid: isAkizukiClass,
  equipsValid: validAll(
    hasSome(isHighAngleMount),
    hasSome(isRadar)
  ),
})

declareAACI({
  id: 3,
  fixed: 4,
  modifier: 1.6,
  shipValid: isAkizukiClass,
  equipsValid: validAll(
    hasAtLeast(isHighAngleMount, 2),
  ),
})

// *** Maya K2
declareAACI({
  id: 10,
  fixed: 8,
  modifier: 1.65,
  shipValid: isMayaK2,
  equipsValid: validAll(
    hasSome(isHighAngleMount),
    hasSome(isCDMG),
    hasSome(isAARadar)
  ),
})

declareAACI({
  id: 11,
  fixed: 6,
  modifier: 1.5,
  shipValid: isMayaK2,
  equipsValid: validAll(
    hasSome(isHighAngleMount),
    hasSome(isCDMG)
  ),
})

// *** Isuzu K2
declareAACI({
  id: 14,
  fixed: 4,
  modifier: 1.45,
  shipValid: isIsuzuK2,
  equipsValid: validAll(
    hasSome(isHighAngleMount),
    hasSome(isAAGun),
    hasSome(isAARadar)
  ),
})

declareAACI({
  id: 15,
  fixed: 3,
  modifier: 1.3,
  shipValid: isIsuzuK2,
  equipsValid: validAll(
    hasSome(isHighAngleMount),
    hasSome(isAAGun)
  ),
})

// *** Kasumi K2B
declareAACI({
  id: 16,
  fixed: 4,
  modifier: 1.4,
  shipValid: isKasumiK2B,
  equipsValid: validAll(
    hasSome(isHighAngleMount),
    hasSome(isAAGun),
    hasSome(isAARadar)
  ),
})

declareAACI({
  id: 17,
  fixed: 2,
  modifier: 1.25,
  shipValid: isKasumiK2B,
  equipsValid: validAll(
    hasSome(isHighAngleMount),
    hasSome(isAAGun)
  ),
})

// *** Satsuki K2
declareAACI({
  id: 18,
  fixed: 2,
  modifier: 1.2,
  shipValid: isSatsukiK2,
  equipsValid: validAll(
    hasSome(isCDMG)
  ),
})

// *** Kinu K2
// any HA with builtin AAFD will not work
declareAACI({
  id: 19,
  fixed: 5,
  modifier: 1.45,
  shipValid: isKinuK2,
  equipsValid: validAll(
    !hasSome(isBuiltinHighAngleMount),
    hasSome(isHighAngleMount),
    hasSome(isCDMG)
  ),
})

declareAACI({
  id: 20,
  fixed: 3,
  modifier: 1.25,
  shipValid: isKinuK2,
  equipsValid: validAll(
    hasSome(isCDMG)
  ),
})

// return: a list of sorted AACI objects order by effect desc,
//   as most effective AACI gets priority to be triggered.
// param: AACI IDs from possibleAACIs functions
// param: a optional sorting callback to customize ordering
const sortAaciIds = (aaciIds,
  sortCallback = (a, b) => b.fixed - a.fixed || b.modifier - a.modifier) => {
  let aaciList = []
  if (!!aaciIds && Array.isArray(aaciIds)) {
    aaciIds.forEach((id) => {
      if (AACITable[id]) {
        aaciList.push(AACITable[id])
      }
    })
    aaciList = aaciList.sort(sortCallback)
  }
  return aaciList
}

// Order by AACI id desc
export const sortFleetPossibleAaciList = triggeredShipAaciIds =>
   sortAaciIds(triggeredShipAaciIds, (a, b) => b.id - a.id)

// return a list of AACIs that meet the requirement of ship and equipmenmt
// ship: ship
// equips: [[equip, onslot] for equip on ship]
export const getShipAvaliableAACIs = (ship, equips) =>
  Object.keys(AACITable)
  .filter((key) => {
    const type = AACITable[key]
    return type.shipValid(ship) && type.equipsValid(equips)
  })
  .map(key => Number(key))

// return a list of all possible AACIs for the ship herself
export const getShipAllAACIs = ship =>
  Object.keys(AACITable)
  .filter((key) => {
    const type = AACITable[key]
    return type.shipValid(ship)
  })
  .map(key => Number(key))

// return the AACIs to trigger for a ship, it will be array due to exceptions
const getShipAACIs = (ship, equips) => {
  const AACIs = getShipAvaliableAACIs(ship, equips)
  // Kinu kai 2 exception
  if (AACIs.includes(20)) {
    return [20]
  }
  const maxFixed = maxBy(AACIs, id => (AACITable[id] || {}).fixed || 0) || 0
  if (maxFixed === 8 && AACIs.includes(7)) {
    return [7, 8]
  }
  return [maxFixed]
}


// return a list of unduplicated available AACIs based on all ships in fleet
// ships: [ ship for ship in fleet]
// equips: [[[equip, onslot] for equip on ship] for ship in fleet]
export const getFleetPossibleAACIs = (ships, equips) => {
  const aaciSet = {}
  ships.forEach((ship, index) => {
    getShipAvaliableAACIs(ship, equips[index].map(([equip, onslot]) => equip)).forEach((id) => {
      aaciSet[id] = true
    })
  })
  return Object.keys(aaciSet).map(key => Number(key))
}

// collections of AACIs to trigger of each ship
export const getFleetAvailableAACIs = (ships, equips) => {
  const aaciSet = {}
  ships.forEach((ship, index) => {
    getShipAACIs(ship, equips[index].map(([equip, onslot]) => equip)).forEach((id) => {
      if (id > 0) {
        aaciSet[id] = true
      }
    })
  })
  return Object.keys(aaciSet).map(key => Number(key))
}

export const shipFixedShotdownRange = (ship, ships, equips, formationModifier) => {
  const possibleAACIModifiers = getFleetAvailableAACIs(ships, equips)
    .map(apiId => AACITable[apiId].modifier)
  // default value 1 is always available, making call to Math.max always non-empty
  possibleAACIModifiers.push(1)
  const mod = Math.max(...possibleAACIModifiers)
  return ([
    shipFixedShotdown(ship, ships, formationModifier, 1),
    shipFixedShotdown(ship, ships, formationModifier, mod),
    mod,
  ])
}

export const shipFixedShotdownRangeWithAACI = (ship, ships, equips, formationModifier) => {
  const possibleAaciList = sortAaciIds(getFleetAvailableAACIs(ships, equips),
    (a, b) => // Order by modifier desc, fixed desc, icons[0] desc
      b.modifier - a.modifier
      || b.fixed - a.fixed || b.icons[0] - a.icons[0])
  const aaciId = possibleAaciList.length > 0 ? possibleAaciList[0].id : 0
  const mod = possibleAaciList.length > 0 ? possibleAaciList[0].modifier : 1
  return ([
    shipFixedShotdown(ship, ships, formationModifier, 1),
    shipFixedShotdown(ship, ships, formationModifier, mod),
    aaciId,
  ])
}

export const shipMaxShotdownFixed = (ship) => {
  const possibleBonuses = getShipAvaliableAACIs(ship).map(apiId => AACITable[apiId].fixed)
  // default value 0 is always available, making call to Math.max always non-empty
  possibleBonuses.push(0)
  return Math.max.apply(null, possibleBonuses)
}

export const shipMaxShotdownAllBonuses = (ship) => {
  const possibleAaciList = sortAaciIds(getShipAvaliableAACIs(ship))
  return possibleAaciList.length > 0 ?
    [possibleAaciList[0].id, possibleAaciList[0].fixed, possibleAaciList[0].modifier]
    : [0, 0, 1]
}

/*

AntiAir: anti-air related calculations

- variable naming convention:
  - fleetObj: instance of KC3Fleet
  - shipObj: instance of KC3Ship
    - mst: master data of either ship or gear
    - pred: predicates, a function that accepts a single parameter and returns a boolean value
    - predXXX: predicate combinators. "predXXX(pred1, pred2, ...)" combines pred1, pred2, ...
          in some specific way to produce a new prediate.

- module contents:
  - shipProportionalShotdownRate(shipObj)
    returns a value (supposed to be 0 <= v <= 1) indicating the rate of planes
    being shot down. note that it might be possible for this value to exceed 1.0.
  - shipProportionalShotdown(shipObj, num)
    same as "shipProportionalShotdownRate", except that this one calculates
    the number of planes being shotdown with slot capacity is given by "num".
  - shipFixedShotdown(shipObj, fleetObj, formationModifier, [K])
    returns an integer indicating how many planes will be shotdown.
    "formationModifier" takes one of: 1/1.2/1.6 depending on formation
    (see "getFormationModifiers" for detail).
    K (defaults to 1) is optional, depending on whether AACI is triggered and
    which kind of AACI is triggered.
  - shipFixedShotdownRange(shipObj, fleetObj, formationModifier)
    like "shipFixedShotdown" but this one returns a range by considering
    all possible AACIs "shipObj" can perform and use the largest modifier as upper bound.
  - shipFixedShotdownRangeWithAACI(shipObj, fleetObj, formationModifier)
    the same as "shipFixedShotdownRange" except returning the AACI ID of largest modifier.
  - shipMaxShotdownAllBonuses(shipObj)
    return the largest fixed and with modifier bonuses of all possible AACIs "shipObj" can perform.
  - getShipAvaliableAACIs(shipObj) / fleetPossibleAACIs(fleetObj)
    returns a list of possible AACI API Ids that ship / fleet could perform.
  - getShipAllPossibleAACIs(mst)
    returns a list of possible AACI API Ids that type of ship could perform ignored equipments.
  - sortedPossibleAaciList(aaciIdList)
    return a list of AACI object sorted by shot down bonus descended.
  - AACITable[<AACI API>] returns a record of AACI info:
    - id: AACI API Id
    - fixed: fixed shotdown bonus
    - modifier: the "K" value to "shipFixedShotdown" when this AACI is triggered
    - icon: IDs of icons representing this kind of AACI
    - predicateShipMst: test whether "mst" can perform this kind of AACI ingoring equipments
    - predicateShipObj: test whether "shipObj" can perform this particular kind of AACI
  - other not explicitly listed contents are for debugging or internal use only.

 */

const categoryIs = n => equip => equip.api_type[2] === n

const iconIs = n => equip => equip.api_type[3] === n

// all types of Radar (12 for small, 13 for large)
const isRadar = equip => categoryIs(12)(equip) || categoryIs(13)(equip)

// ValidAny(f,g...)(x) = f(x) || g(x) || ...
const ValidAny = (...func) => x => func.some(f => f(x))

const validAll = (...func) => x => func.every(f => f(x))

const predNot = f => x => !f(x)

// AA Radar
// Surface Radar are excluded by checking whether
// the equipment gives AA stat (api_tyku)
const isAARadar = equip => isRadar(equip) && equip.api_tyku > 0

// AAFD: check by category (36)
const isAAFD = categoryIs(36)

// High-angle mounts: check by icon (16)
const isHighAngleMount = iconIs(16)

// Type 3 Shell
const isType3Shell = categoryIs(18)

// Anti-air gun includes machine guns and rocket launchers
const isAAGun = categoryIs(21)

const isRedGun = iconIs(1) || iconIs(2) || iconIs(3)

const isYellowGun = iconIs(4)
const isFighter = categoryIs(6)
const isDiveBomber = categoryIs(7)
const isSeaplaneRecon = categoryIs(10)

const isLargeCaliberMainGun = categoryIs(3)

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

const calcEquipmentAADefense = (equip, forFleet) => {
  const eTypMod = forFleet
      ? getFleetEquipmentModifier(equip)
      : getShipEquipmentModifier(equip)
  const eImproveMod = forFleet
      ? getFleetImprovementModifier(equip)
      : getShipImprovementModifier(equip)
  const aaStat = equip.api_tyku
  return (eTypMod * aaStat) + (eImproveMod * Math.sqrt(equip.api_level))
}

// Maybe we don't need
// returns a special floor function f(x) = q * floor( x / q )
// - q = 1 if shipObj equips nothing
// - q = 2 otherwise
const specialFloor = (ship) => {
  const q = (ship.api_slot || []).some(id => id !== -1) ? 2 : 1
  return x => q * Math.floor(x / q)
}

const shipEquipmentAntiAir = (equips, forFleet) =>
  equips.reduce((curAA, equip) => curAA + calcEquipmentAADefense(equip, forFleet), 0)


const shipBaseAntiAir = ship =>
  ((ship.api_tyku || [])[0] || 0) + (ship.api_kyouka[2] || 0)

const shipAdjustedAntiAir = ship =>
  shipBaseAntiAir(ship) + shipEquipmentAntiAir(ship, false)

const shipProportionalShotdownRate = (ship) => {
  const floor = specialFloor(ship)
  const adjustedAA = shipAdjustedAntiAir(ship)
  return floor(adjustedAA) / 400
}

export const shipProportionalShotdown = (ship, num) =>
  Math.floor(shipProportionalShotdownRate(ship) * num)

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

// function getFormationModifiers(id) {
//   return (id === 1 || id === 4 || id === 5) ? 1.0  // line ahead / echelon / line abreast
//     : (id === 2) ? 1.2 // double line
//       : (id === 3) ? 1.6 // diamond
//         : (id === 11 || id === 21) ? 1.1 // Combined anti-sub
//           : (id === 12 || id === 14 || id === 22 || id === 24) ? 1.0 // Combined forward / battle
//             : (id === 13 || id === 23) ? 1.5 // Combined diamond
//               : NaN // NaN for indicating an invalid id
// }

const fleetAdjustedAntiAir = (ships, formationModifier) => {
  const allShipEquipmentAA = ships.reduce((curAA, ship) =>
    curAA + shipEquipmentAntiAir(ship, true), 0)
  return (2 / 1.3) * Math.floor(formationModifier * allShipEquipmentAA)
}

export const fleetCombinedAdjustedAntiAir = (mainShips, escortShips, formationModifier) => {
  const mainAllShipEquipmentAA = mainShips.reduce((curAA, ship) =>
    curAA + shipEquipmentAntiAir(ship, true), 0)
  const escortAllShipEquipmentAA = escortShips.reduce((curAA, ship) =>
    curAA + shipEquipmentAntiAir(ship, true), 0)
  return (2 / 1.3) *
    Math.floor(formationModifier * (mainAllShipEquipmentAA + escortAllShipEquipmentAA))
}

// K: AACI modifier, default to 1
const shipFixedShotdown = (ship, fleetShips, formationModifier, K = 1) => {
  const floor = specialFloor(ship)
  const adjustedAA = shipAdjustedAntiAir(ship)
  return Math.floor(((floor(adjustedAA) +
    Math.floor(fleetAdjustedAntiAir(fleetShips, formationModifier))) * K) / 10)
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
    hasSome(isAARadar),
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
    predNot(hasSome(isBuiltinHighAngleMount)),
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


// return a list of possible AACI APIs based on ship and her equipments
// - returns a list of **strings**, not numbers
//   (since object keys has to be strings, and AACITable[key] accepts keys
//   of both number and string anyway)
// - because of the game mechanism, some AACI API Ids returned might be overlapped
//   and never triggered, "possibleAACIs" is **not** responsible for removing never-triggered
//   AACI from resulting list.
export const getShipAvaliableAACIs = (ship, equips) =>
  Object.keys(AACITable).filter((key) => {
    const type = AACITable[key]
    return type.shipValid(ship) && type.equipsValid(equips)
  })

// return a list of all possible AACI based on master ship only, equipments ignored
export const getShipAllAACIs = ship =>
  Object.keys(AACITable).filter((key) => {
    const type = AACITable[key]
    return type.shipValid(ship)
  })

// return a list of unduplicated possible AACI APIs based on all ships in fleet
export const fleetPossibleAACIs = (ships, equips) => {
  const aaciSet = {}
  ships.forEach((ship, index) => {
    getShipAvaliableAACIs(ship, equips[index]).forEach((id) => {
      aaciSet[id] = true
    })
  })
  return Object.keys(aaciSet)
}

// return: a list of sorted AACI objects order by effect desc,
//   as most effective AACI gets priority to be triggered.
// param: AACI IDs from possibleAACIs functions
// param: a optional callback function to customize ordering
const sortedPossibleAaciList = (aaciIds,
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

// Order by (API) id desc
export const sortedFleetPossibleAaciList = triggeredShipAaciIds =>
   sortedPossibleAaciList(triggeredShipAaciIds, (a, b) => b.id - a.id)

export const shipFixedShotdownRange = (ship, ships, equips, formationModifier) => {
  const possibleAACIModifiers = fleetPossibleAACIs(ships, equips)
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
  const possibleAaciList = sortedPossibleAaciList(fleetPossibleAACIs(ships, equips),
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

export const shipMaxShotdownFixedBonus = (ship) => {
  const possibleBonuses = getShipAvaliableAACIs(ship).map(apiId => AACITable[apiId].fixed)
  // default value 0 is always available, making call to Math.max always non-empty
  possibleBonuses.push(0)
  return Math.max.apply(null, possibleBonuses)
}

export const shipMaxShotdownAllBonuses = (ship) => {
  const possibleAaciList = sortedPossibleAaciList(getShipAvaliableAACIs(ship))
  return possibleAaciList.length > 0 ?
    [possibleAaciList[0].id, possibleAaciList[0].fixed, possibleAaciList[0].modifier]
    : [0, 0, 1]
}

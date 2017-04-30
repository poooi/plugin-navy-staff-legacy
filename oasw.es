// type for slot item
const iconIs = n => equip => equip.api_type[3] === n
const shipIdIs = n => ship => ship.api_ship_id === n
const hasSome = pred => xs => xs.some(pred)

const isSonar = iconIs(18)
const isIsuzuK2 = shipIdIs(141)
const isTaisenOK = ship => ship.api_taisen[0] >= 100

export const isOASW = (ship, equips) =>
  isIsuzuK2(ship) || (isTaisenOK(ship) && hasSome(isSonar)(equips))

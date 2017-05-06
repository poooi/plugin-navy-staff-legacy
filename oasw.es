// type for slot item
const iconIs = n => equip => equip.api_type[3] === n
const shipIdIs = n => ship => ship.api_ship_id === n
const hasSome = pred => xs => xs.some(pred)

const isSonar = iconIs(18)
const isIsuzuK2 = shipIdIs(141)
const taisenAbove = value => ship => ship.api_taisen[0] >= value
const isDE = ship => ship.api_stype === 1

export const isOASW = (ship, equips) =>
  isIsuzuK2(ship) ||
  // experimental for DE, not know if we should equip sonars
  (isDE(ship) && taisenAbove(60)(ship)) ||
  (taisenAbove(100)(ship) && hasSome(isSonar)(equips))

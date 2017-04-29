
// squadrons is array of [squad, _equip, $equip]
export const getAirbaseSortieFP = (squadrons = []) => {
  let fp = 0
  squadrons.forEach(([squad, _equip, $equip]) => {

  })
}

const TPByItem = {
  75: 5, // ドラム缶(輸送用)
  68: 8, // 大発動艇
  166: 8, // 大発動艇(八九式中戦車&陸戦隊)
  193: 8, // 特大発動艇
  167: 2, // 特二式内火艇
  145: 1, // 戦闘糧食
  150: 1, // 秋刀魚の缶詰
}

// note that as light cruiser she inherits 2 pts, making a total of 10 pts
const TPByShip = {
  487: 8, // 鬼怒改二
}

const TPByShipType = {
  2: 5, // 駆逐艦
  3: 2, // 軽巡洋艦
  21: 6, // 練習巡洋艦
  6: 4, // 航空巡洋艦
  10: 7, // 航空戦艦
  16: 9, // 水上機母艦
  14: 1, // 潜水空母
  17: 12, // 揚陸艦
  15: 15, // 補給艦
  22: 15, // 補給艦
  20: 7, // 潜水母艦
}

// shipsData: fleetShipsDataSelectorFactory
// equipsData: fleetShipsEquipDataSelectorFactory
export const getTransportPoint = (shipsData, equipsData) => {
  let TP = 0
  shipsData.forEach(([_ship = {}, $ship = {}]) => {
    TP += TPByShipType[$ship.api_stype] || 0
    TP += TPByShip[$ship.api_id] || 0
  })

  equipsData.forEach((equipData) => {
    equipData.forEach(([_equip, $equip = {}, _] = []) => {
      TP += TPByItem[$equip.api_id] || 0
    })
  })

  return TP
}

import { join } from 'path'

const { APPDATA_PATH } = window
export const PLUGIN_KEY = 'poi-plugin-navy-staff'
export const DATA_PATH = join(APPDATA_PATH, `${PLUGIN_KEY}.json`)

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

// ships: [ship for ship in fleet]
// equips: [[equip for equip on ship] for ship in fleet]
export const getTransportPoint = (shipsData, equipsData) => {
  let TP = 0
  shipsData.forEach((ship) => {
    TP += TPByShipType[ship.api_stype] || 0
    TP += TPByShip[ship.api_ship_id] || 0
  })

  equipsData.forEach((equipData) => {
    equipData.forEach(([equip, _] = []) => {
      TP += TPByItem[equip.api_slotitem_id] || 0
    })
  })

  return TP
}

export const combinedFleetType = {
  1: 'Carrier Task Force', // 空母機動部隊
  2: 'Surface Task Force', // 水上打撃部隊
  3: 'Transport Escort', // 輸送護衛部隊
}

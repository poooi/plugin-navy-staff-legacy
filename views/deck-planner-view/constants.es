import { map, each } from 'lodash'
import { resolve } from 'path'

const __ = window.i18n['poi-plugin-navy-staff'].__.bind(window.i18n['poi-plugin-navy-staff'])

// ship types dated 20170106, beginning with id=1
// const shipTypes = ["海防艦", "駆逐艦", "軽巡洋艦", "重雷装巡洋艦",
// "重巡洋艦", "航空巡洋艦", "軽空母", "戦艦", "戦艦", "航空戦艦", "正規空母",
// "超弩級戦艦", "潜水艦", "潜水空母", "補給艦", "水上機母艦", "揚陸艦", "装甲空母",
// "工作艦", "潜水母艦", "練習巡洋艦", "補給艦"]
// attention, shipSuperTypeMap uses api_id

export const shipSuperTypeMap = [
  {
    name: 'DD',
    id: [2],
  },
  {
    name: 'CL',
    id: [3, 4, 21],
  },
  {
    name: 'CA',
    id: [5, 6],
  },
  {
    name: 'BB',
    id: [8, 9, 10, 12],
  },
  {
    name: 'CV',
    id: [7, 11, 18],
  },
  {
    name: 'SS',
    id: [13, 14],
  },
  {
    name: 'Others',
    id: [1, 15, 16, 17, 19, 20, 22],
  },
]

export const reverseSuperTypeMap = {}

each(shipSuperTypeMap, ({ name, id }) => each(id, typeId => reverseSuperTypeMap[typeId] = name))


export const shipTypes = {
  1: __('DE'),
  2: __('DD'),
  3: __('CL'),
  4: __('CLT'),
  5: __('CA'),
  6: __('CAV'),
  7: __('CVL'),
  8: __('FBB'),
  9: __('BB'),
  10: __('BBV'),
  11: __('CV'),
  12: __('BB'),
  13: __('SS'),
  14: __('SSV'),
  15: __('AO'),
  16: __('AV'),
  17: __('LHA'),
  18: __('CVB'),
  19: __('AR'),
  20: __('AS'),
  21: __('CT'),
  22: __('AO'),
}

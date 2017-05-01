import React from 'react'
import { connect } from 'react-redux'
import { shipDataSelectorFactory, fleetShipsIdSelectorFactory } from 'views/utils/selectors'
import { resolve } from 'path'

import FleetInfo from './fleet-info'
import ShipView from './ship-view'

// const { i18n } = window
// const __ = i18n['poi-plugin-navy-staff'].__.bind(i18n['poi-plugin-navy-staff'])

window.i18n['poi-plugin-navy-staff'] = new (require('i18n-2'))({
  locales: ['zh-CN', 'zh-TW', 'ja-JP', 'en-US', 'ko-KR'],
  defaultLocale: 'en-US',
  directory: resolve(__dirname, '../i18n'),
  updateFiles: true,
  indent: "\t",
  extension: '.json',
  devMode: true,
})
window.i18n['poi-plugin-navy-staff'].setLocale(window.language)

const __ = window.i18n['poi-plugin-navy-staff'].__.bind(window.i18n['poi-plugin-navy-staff'])

const CombinedFleetView = connect(
  (state) => {
    return ({
      shipIds1: fleetShipsIdSelectorFactory(1)(state),
      shipIds2: fleetShipsIdSelectorFactory(1)(state),
    })
  }
)(({ shipIds1 = [], shipIds2 = [] }) => (
  <div>
    <FleetInfo combined />
    <div className="ship-list">
      <div className="main-fleet">
        {
          shipIds1.map(id =>
            <ShipView
              shipId={id}
              key={id}
            />
          )
        }
      </div>
      <div className="escort-fleet">
        {
          shipIds2.map(id =>
            <ShipView
              shipId={id}
              key={id}
            />
          )
        }
      </div>
    </div>
  </div>
  )
)

export default CombinedFleetView

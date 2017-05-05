import React, { Component } from 'react'
import { resolve } from 'path'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { Panel, Label } from 'react-bootstrap'
import FA from 'react-fontawesome'

import Area from './area'

// const { i18n } = window
// const __ = i18n['poi-plugin-navy-staff'].__.bind(i18n['poi-plugin-navy-staff'])

window.i18n['poi-plugin-navy-staff'] = new (require('i18n-2'))({
  locales: ['zh-CN', 'zh-TW', 'ja-JP', 'en-US', 'ko-KR'],
  defaultLocale: 'en-US',
  directory: resolve(__dirname, '../../i18n'),
  updateFiles: true,
  indent: "\t",
  extension: '.json',
  devMode: true,
})
window.i18n['poi-plugin-navy-staff'].setLocale(window.language)

const __ = window.i18n['poi-plugin-navy-staff'].__.bind(window.i18n['poi-plugin-navy-staff'])

const DeckPlannerView = connect(
  (state) => ({
    color: get(state, 'fcd.shiptag.color', []),
    mapname: get(state, 'fcd.shiptag.mapname', []),
  })
)(class DeckPlannerView extends Component {

  constructor(props) {
    super(props)

    const { mapname, color } = props

    this.state = {
      name: 'deck plan',
      areas: mapname.map((name, index) => ({
        name,
        color: color[index],
        ships: [],
      })),
    }
  }

  render() {
    const { areas } = this.state
    return (
      <div>
        {
          areas.map(area =>
            <Area area={area} />
          )
        }
      </div>
    )
  }

})
export default DeckPlannerView

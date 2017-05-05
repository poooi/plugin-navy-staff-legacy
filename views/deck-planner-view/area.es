import React, { Component } from 'react'
import { Panel, Label } from 'react-bootstrap'
import FA from 'react-fontawesome'
import { resolve } from 'path'
import { get } from 'lodash'
import fp from 'lodash/fp'
import { connect } from 'react-redux'

import AddShipDropdown from './add-ship-dropdown'
import { shipMenuDataSelector, ShipItemSelectorFactory } from './selectors'
import { shipTypes } from './constants'

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


const hexToRGBA = (hex, opacity = 1) => {
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    let color = hex.substring(1)
    if (color.length === 3) {
      color = [color[0], color[0], color[1], color[1], color[2], color[2]]
    }
    const r = parseInt(color.slice(0, 2), 16)
    const g = parseInt(color.slice(2, 4), 16)
    const b = parseInt(color.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  return ''
}

const ShipChip = connect(
  (state, props) => ({
    ...ShipItemSelectorFactory(props.shipId)(state),
    color: get(state, 'fcd.shiptag.color', []),
  })
)(({ typeId, name, lv, area, color }) =>
  <Label className="ship-chip">
    <span className="ship-type">
      {shipTypes[typeId]}
    </span>
    <span>
      {`${name} Lv.${lv}`}
    </span>
    {
      area > 0 && <FA name="tag" style={{ color: color[area] }} />
    }
  </Label>
)

const Area = connect(
  state => ({
    ships: shipMenuDataSelector(state),
  })
)(class Area extends Component {

  constructor(props) {
    super(props)

    this.state = {
      shipIds: [],
    }
  }

  handleAddShip = (eventKey, e) => {
    console.log(eventKey)
    this.setState({
      shipIds: [...new Set([...this.state.shipIds, eventKey])],
    })
  }

  render() {
    const { area, index, ships } = this.props
    const { shipIds } = this.state
    return (
      <div style={{ border: `solid 1px ${hexToRGBA(area.color, 0.5)}` }} className="area">
        <div style={{ backgroundColor: hexToRGBA(area.color, 0.5) }}>
          <div className="planned">
            <div>
              {__('Ships planned for this area: ')}
            </div>
            <div className="pool">
              {
                fp.map(id => <ShipChip shipId={id} />)(shipIds)
              }
              <Label className="ship-chip"><AddShipDropdown area={area.name} onSelect={this.handleAddShip} /></Label>
            </div>
          </div>
        </div>
        <div className="footer">
          <div>
            <Label style={{ color: area.color }}><FA name="tag" />{area.name}</Label>
          </div>
        </div>
      </div>
    )
  }
})


export default Area
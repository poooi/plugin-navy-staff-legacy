import React, { Component, PureComponent } from 'react'
import { Panel, Label, Button, Dropdown, MenuItem } from 'react-bootstrap'
import FA from 'react-fontawesome'
import { resolve } from 'path'
import { get } from 'lodash'
import fp from 'lodash/fp'
import { connect } from 'react-redux'

import { onAddShip, onRemoveShip, onDisplaceShip } from '../../redux'
import AddShipDropdown from './add-ship-dropdown'
import { shipMenuDataSelector, ShipItemSelectorFactory, deckPlannerAreaSelectorFactory } from '../../selectors'
import { shipTypes } from './constants'

const { dispatch } = window

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
)(class ShipChip extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      hover: false,
    }
  }

  handleMouseOver = () => {
    if (this.state.hover) {
      return
    }
    this.setState({
      hover: true,
    })
  }

  handleMouseLeave = () => {
    this.setState({
      hover: false,
    })
  }

  render() {
    const { id, typeId, name, lv, area, color, mapname, others, onRemove, onDisplace } = this.props
    const { hover } = this.state

    return (
      <Label
        className="ship-chip"
        onMouseOver={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
        onContextMenu={onRemove}
      >
        <span className="ship-type">
          {shipTypes[typeId]}{' | '}
        </span>
        <span>
          <Dropdown id={`displace-${id}`}>
            <a bsRole="toggle" className="ship-name">{`${name} Lv.${lv}`}</a>
            <Dropdown.Menu>
              {
                others.map(_area =>
                  <MenuItem eventKey={_area.areaIndex} key={_area.name} onSelect={onDisplace}>
                    {__('Move to ')} <Label style={{ color: _area.color }}><FA name="tag" />{_area.name}</Label>
                  </MenuItem>
                )
              }
            </Dropdown.Menu>
          </Dropdown>
        </span>
        <span>
          {
            area > 0 && <FA name="tag" style={{ color: color[area] }} />
          }
        </span>
        <span>
          {
            hover && <a onClick={onRemove} className="remove"><FA name="times-circle" /></a>
          }
        </span>
      </Label>
    )
  }
})

const Area = connect(
  (state, props) => ({
    ships: shipMenuDataSelector(state),
    shipIds: deckPlannerAreaSelectorFactory(props.index)(state),
  })
)(class Area extends Component {

  handleAddShip = (eventKey, e) => {
    dispatch(onAddShip({
      shipId: eventKey,
      areaIndex: this.props.index,
    }))
  }

  handleRemoveShip = id => () => {
    dispatch(onRemoveShip({
      shipId: id,
      areaIndex: this.props.index,
    }))
  }

  handleDisplace = id => (eventKey, e) => {
    dispatch(onDisplaceShip({
      shipId: id,
      fromAreaIndex: this.props.index,
      toAreaIndex: eventKey,
    }))
  }

  render() {
    const { area, index, others, ships, shipIds } = this.props
    return (
      <div style={{ border: `solid 1px ${hexToRGBA(area.color, 0.5)}` }} className="area">
        <div style={{ backgroundColor: hexToRGBA(area.color, 0.5) }}>
          <div className="planned">
            <div>
              {__('Ships planned for this area: ')}
            </div>
            <div className="pool">
              {
                fp.map(
                  id =>
                    <ShipChip
                      shipId={id}
                      onRemove={this.handleRemoveShip(id)}
                      onDisplace={this.handleDisplace(id)}
                      others={others}
                    />
                )(shipIds)
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

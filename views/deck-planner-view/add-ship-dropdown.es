import React, { Component } from 'react'
import { Dropdown, MenuItem, FormControl, Button, Label } from 'react-bootstrap'
import { connect } from 'react-redux'
import { get, map } from 'lodash'
import { resolve } from 'path'
import fp from 'lodash/fp'
import FontAwesome from 'react-fontawesome'

import { shipMenuDataSelector, deckPlannerAllShipIdsSelector } from '../../selectors'
import { shipSuperTypeMap } from './constants'

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

const Item = ({ eventKey, onSelect, children }) =>
  (
    <MenuItem eventKey={eventKey} onSelect={onSelect} className="ship-item">
      <span className="ship-item-content">
        {
          children
        }
      </span>
    </MenuItem>
  )

class ShipMenu extends Component {
  constructor(props) {
    super(props)

    this.state = {
      typeIndex: -1,
    }
  }

  handleTypeSelect = index => () => {
    this.setState({
      typeIndex: index,
    })
  }

  handleShipSelect = (eventKey, e) => {
    console.log(eventKey)
  }

  handleGoBack = () => {
    this.setState({
      typeIndex: -1,
    })
  }

  render() {
    const { shipItems, children } = this.props
    const { typeIndex } = this.state

    return (
      <ul className="dropdown-menu">
        {
          typeIndex >= 0 &&
            <MenuItem onSelect={this.handleGoBack}>{__('return to ship types')}</MenuItem>
        }
        {
          typeIndex >= 0
          ?
            React.Children.toArray(children)
              .filter(child => get(shipSuperTypeMap, `${typeIndex}.id`, []).includes(child.props.typeId))
              .filter(child => child.props.area === 0)
          :
            map(shipSuperTypeMap, (type, index) =>
              <Item key={type.name} eventKey={index} onSelect={this.handleTypeSelect(index)}>
                {__(type.name)}
              </Item>
            )
        }
      </ul>
    )
  }
}

const AddShipDropdown = connect(
  (state, props) => ({
    shipItems: shipMenuDataSelector(state),
    area: props.area || '',
    allShipIds: deckPlannerAllShipIdsSelector(state),
  })
)(({ shipItems, area, allShipIds, onSelect }) =>
  (<Dropdown id={`add-ship-dropdown-${area}`}>
    <Dropdown.Toggle bsStyle="link">
      <FontAwesome name="plus" />
    </Dropdown.Toggle>
    <ShipMenu bsRole="menu" >
      {
        fp.flow(
          fp.filter(ship => !allShipIds.includes(ship.id)),
          fp.sortBy(ship => -ship.lv),
          fp.map(ship => <Item onSelect={onSelect} key={ship.id} eventKey={ship.id} typeId={ship.typeId} area={ship.area}><span>{`${ship.name} Lv.${ship.lv}`}</span></Item>)
        )(shipItems)
      }
    </ShipMenu>
  </Dropdown>)
)

export default AddShipDropdown

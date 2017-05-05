import React, { Component } from 'react'
import { Panel, Label } from 'react-bootstrap'
import FA from 'react-fontawesome'

import AddShipDropdown from './add-ship-dropdown'


class Area extends Component {

  handleAddShip = (eventKey, e) => {
    console.log(eventKey)
  }

  render() {
    const { area } = this.props
    return (
      <Panel
        key={area.name}
        header={
          <div>
            <AddShipDropdown area={area.name} onSelect={this.handleAddShip} />
            <Label style={{ color: area.color }}><FA name="tag" /></Label>{area.name}
          </div>
        }
      >
        {area.name}
      </Panel>
    )
  }
}


export default Area

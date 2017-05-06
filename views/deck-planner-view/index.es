import React, { Component } from 'react'
import { resolve } from 'path'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { Panel, Label } from 'react-bootstrap'
import FA from 'react-fontawesome'

import Area from './area'
import { onDPInit } from '../../redux'
import { deckPlannerCurrentSelector } from '../../selectors'

const { dispatch } = window

const __ = window.i18n['poi-plugin-navy-staff'].__.bind(window.i18n['poi-plugin-navy-staff'])

const DeckPlannerView = connect(
  (state) => ({
    color: get(state, 'fcd.shiptag.color', []),
    mapname: get(state, 'fcd.shiptag.mapname', []),
    current: deckPlannerCurrentSelector(state),
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
        areaIndex: index,
      })),
    }
  }

  componentWillMount = () => {
    const { mapname, color, current } = this.props
    if (current.length !== mapname.length) {
      dispatch(onDPInit({
        color,
        mapname,
      }))
    }
  }

  render() {
    const { areas } = this.state
    return (
      <div>
        {
          areas.map(area =>
            <Area
              key={area.name}
              area={area}
              index={area.areaIndex}
              others={areas.filter(({ areaIndex }) => areaIndex !== area.areaIndex)}
            />
          )
        }
      </div>
    )
  }

})
export default DeckPlannerView

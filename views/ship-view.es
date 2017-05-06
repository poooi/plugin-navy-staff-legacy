import React from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip, Label} from 'react-bootstrap'
import FA from 'react-fontawesome'
import { get } from 'lodash'
import { resolve } from 'path'

import { shipInfoSelectorFactory } from '../selectors'
import { AACITable } from '../aaci'

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

const AACITooltip = ({ AACI: { AACIs, allAACIs, availableAACIs } }) =>
  <div>
    <div className="info-tooltip-entry">
      <span className="info-tooltip-item">
        {__('AACI Type')}
      </span>
      <span>
        {__('Shotdown')}
      </span>
    </div>
    {
      allAACIs.map(id =>
        <div className="info-tooltip-entry" key={id}>
          <span className="info-tooltip-item">
            <Label bsStyle={availableAACIs.includes(id) ? 'success' : 'default'}>
              {`${id}${get(AACITable, `${id}.name.length`, 0) > 0 ? ` - ${__(AACITable[id].name)}` : ''}`}
              {
                AACIs.includes(id) && <FA name="check" />
              }
            </Label>
          </span>
          <span>
            { (AACITable[id] || {}).fixed }
          </span>
        </div>
      )
    }
  </div>

const ShipView = connect(
  (state, { shipId }) => ({
    ...shipInfoSelectorFactory(shipId)(state),
  })
)(({ ship, equips, onslots, AACI, isOASW }) => {

  return (
    <div className="ship-view">
      <div className="ship-name">
        {ship.api_name}
      </div>
      <div className="ship-info">
        <div className="aaci">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip className="info-tooltip" id={`aaci-info-${ship.api_id}`}><AACITooltip AACI={AACI} /></Tooltip>}
          >
            {
              AACI.AACIs.length
              ?
                <Label bsStyle="success">{__('AACI on')}</Label>
              :
                <Label>{__('AACI off')}</Label>
            }
          </OverlayTrigger>
        </div>
        <div className="oasw">
          {
            isOASW
            ?
              <Label bsStyle="success">{__('OASW on')}</Label>
            :
              <Label>{__('OASW off')}</Label>
          }
        </div>
      </div>
    </div>
  )
})

export default ShipView

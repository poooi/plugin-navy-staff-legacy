import React from 'react'
import { connect } from 'react-redux'
import { Panel, OverlayTrigger, Tooltip, Label, Badge } from 'react-bootstrap'
import { get } from 'lodash'
import { resolve } from 'path'

import { fleetInfoSelectorFactory } from '../selectors'
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

const FleetInfo = connect(
  (state, { fleetId }) => ({
    ...fleetInfoSelectorFactory(fleetId)(state),
  })
)(({ TP, AACIs }) => {
  const TPTooltip = (
    <Tooltip id="staff-TP-tooltip">
      <span>
        {`${__('A rank:')} ${Math.floor(TP * 0.7)}`}
      </span>
    </Tooltip>
  )
  const AACITooltip = (
    <Tooltip id="staff-TP-tooptip" className="info-tooltip">
      <div className="info-tooltip-entry">
        <span className="info-tooltip-item">
          {__('AACI Type')}
        </span>
        <span>
          {__('Shotdown')}
        </span>
      </div>
      {
        AACIs.map(id =>
          <div key={id} className="info-tooltip-entry">
            <span className="info-tooltip-item">
              <Label bsStyle="success">
                {`${id}${get(AACITable, `${id}.name.length`, 0) > 0 ? ` - ${AACITable[id].name}` : ''}`}
              </Label>
            </span>
            <span>
              {(AACITable[id] || {}).fixed}
            </span>
          </div>
        )
      }
    </Tooltip>
  )
  return (
    <Panel className="fleet-info">
      <div>
        <OverlayTrigger
          overlay={TPTooltip}
          placement="bottom"
        >
          <span>{`TP: ${TP}`}</span>
        </OverlayTrigger>
      </div>
      <div>
        {
          AACIs.length > 0
          ?
            <OverlayTrigger
              overlay={AACITooltip}
              placement="bottom"
            >
              <Label bsStyle="success">{__('AACI on')}</Label>
            </OverlayTrigger>
          :
            <Label bsStyle="default">{__('AACI off')}</Label>
        }
      </div>
    </Panel>
  )
})

export default FleetInfo

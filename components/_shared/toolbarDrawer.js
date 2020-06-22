import React from 'react';
import '../../static/css/toolbar.less';

import BackButton from '../_shared/backButton'

import { ButtonToolbar, IconButton, Icon, Button } from 'rsuite';

// ****** FAKE DATA TO CHANGE *******

const ToolbarDrawer = ({ data, onBackButton, label, onDownload, onFilter, importModal, primaryButton, onCartonHistorique}) => (
  <>
    <div className="table-toolbar">
          <BackButton
            className="inner-left"
            label={label}
            onClick={onBackButton}
          />
          <ButtonToolbar className="inner-right">
          <Button
            appearance="default"
            onClick={onCartonHistorique}>
            <Icon 
              icon="history"
              style={{marginRight: '5px'}}/> 
            Historique
          </Button>
        <Button
          color="green"
          appearance="default"
          onClick={onDownload}>
          <Icon 
            icon="file-excel-o"
            style={{marginRight: '10px'}}/> 
          {primaryButton}
        </Button>
    </ButtonToolbar>
  </div>
</>
);
export default ToolbarDrawer;
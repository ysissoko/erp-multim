import React from 'react';
import { ButtonToolbar, TagPicker, Icon, Button, InputGroup, AutoComplete } from 'rsuite';
import '../../static/css/toolbar.less';
import BackButton from '../_shared/backButton'


const ToolbarSmall = ({ data, dataSearch, onAutocompleteInputChange, primaryButton, onBackButton, label, onDownload, onFilter, downloadExcel }) => (
  <>
    <div className="table-toolbar">
          <BackButton
            className="inner-left"
            label={label}
            onClick={onBackButton}
          />
          <ButtonToolbar className="inner-right">
          {downloadExcel && (
          <Button
            style={{float: 'inherit'}}
            color="green"
            appearance="default"
            onClick={onDownload}>
            <Icon 
              icon="file-excel-o"
              style={{marginRight: '10px'}}/> 
            {primaryButton}
          </Button>
          )}
          <InputGroup style={{float: 'inherit', width: '200px', marginRight:'10px'}}>
            <AutoComplete
              data={dataSearch}
              placeholder="Rechercher"
              onChange={onAutocompleteInputChange}
            />
            <InputGroup.Button>
              <Icon icon="search" />
            </InputGroup.Button>
          </InputGroup>
    </ButtonToolbar>
  </div>
</>
);
export default ToolbarSmall;
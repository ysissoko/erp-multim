import React from 'react';
import { ButtonToolbar, TagPicker, InputGroup, AutoComplete, Icon } from 'rsuite';
import '../../static/css/dataTable.less';

  const CustomFilter = ({ placeholder, onFilter, dataFilter, onAutocompleteInputChange, dataSearch, needFilter }) => {
    return (
      <div className="table-toolbar">
        <ButtonToolbar className="inner-right">
          {needFilter && (
          <TagPicker
            data={dataFilter}
            style={{ width: 250 }} menuStyle={{width: 250}}
            groupBy="role"
            placeholder="Filtrer par"
            onChange={onFilter}
          />
          )}

          <InputGroup inside style={{float: 'inherit', width: 300}}>
            <AutoComplete
              data={dataSearch}
              placeholder={placeholder}
              onChange={onAutocompleteInputChange}
            />
          <InputGroup.Addon>
            <Icon icon="search" />
          </InputGroup.Addon>
          </InputGroup>
        </ButtonToolbar>
      </div>
    );
};

export default CustomFilter;

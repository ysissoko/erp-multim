import React from 'react';
import { ButtonToolbar, TagPicker, InputGroup, Icon, Input } from 'rsuite';
import '../../static/css/dataTable.less';

  const CustomFilter = ({ placeholder, onFilter, dataFilter, onInputChange, value, valueFilter, onSearchClick, needFilter }) => {
    return (
      <div className="table-toolbar">
        <ButtonToolbar className="inner-right">
          {needFilter && (
          <TagPicker
            data={dataFilter}
            style={{ width: 250 }} menuStyle={{width: 250}}
            groupBy="role"
            value={valueFilter}
            placeholder="Filtrer par"
            onChange={onFilter}
          />
          )}

          <InputGroup inside style={{float: 'inherit', width: 300}}>
            <Input
              value={value}
              placeholder={placeholder}
              onChange={onInputChange}
            />
          <InputGroup.Button onClick={onSearchClick}>
            <Icon icon="search" />
          </InputGroup.Button>
          </InputGroup>
        </ButtonToolbar>
      </div>
    );
};

export default CustomFilter;

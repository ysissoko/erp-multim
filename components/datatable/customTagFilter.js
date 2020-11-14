import React from 'react';
import { ButtonToolbar, TagPicker, DateRangePicker, InputGroup, AutoComplete, Icon } from 'rsuite';
import '../../static/css/toolbar.less';

  const CustomTagFilter = ({ placeholder, onFilter, dataFilter, dataSearch, valueInput, valueFilter, valueDate, onFilterDate, onSelect, onDateRangeClean, onAutocompleteInputChange }) => {
    return (
      <div className="table-toolbar">
        <ButtonToolbar className="inner-right">

          <InputGroup inside style={{float: 'inherit', width: '200px'}}>
            <AutoComplete
              data={dataSearch}
              placeholder={placeholder}
              onChange={onAutocompleteInputChange}
              value={valueInput}
            />
            <InputGroup.Addon>
              <Icon icon="search" />
            </InputGroup.Addon>
          </InputGroup>

            <DateRangePicker
              placeholder="Date"
              format="DD-MM-YYYY"
              locale={{
                monday: 'Lun',
                tuesday: 'Mar',
                wednesday: 'Mer',
                thursday: 'Jeu',
                friday: 'Ven',
                saturday: 'Sam',
                sunday: 'Dim',
                ok: 'OK',
                today: 'Aujourdhui',
                yesterday: 'Hier',
                last7Days: '7 derniers jours'}}
              showOneCalendar
              style={{ width: 100, float: 'inherit', marginRight: '5px' }}
              placement="bottomEnd"
              value={valueDate}
              onChange={onFilterDate}
              onClean={onDateRangeClean}
            />

          <TagPicker
            data={dataFilter}
            style={{ width: 200, float: 'inherit' }} menuStyle={{width: 200}}
            groupBy="role"
            placeholder="Filtrer par"
            onChange={onFilter}
            onSelect={onSelect}
            value={valueFilter}
          />

        </ButtonToolbar>
      </div>
    );
};

export default CustomTagFilter;

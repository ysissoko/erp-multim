import React from 'react';
import { Table, Icon, Tag } from "rsuite";

import '../../static/css/dataTable.less';

import StatusTag from '../datatable/statusTag'
import ActionCell from '../datatable/actionCell'
import CheckCell from '../datatable/checkCell'
import EditCell from '../datatable/editCell'
import CheckHeaderColumn from '../datatable/checkHeaderColumn'

const { Column, HeaderCell, Cell, Pagination } = Table;

const DataTableTree = ({
    data,
    column,
    loading,
    onSortColumn,
    sortType,
    sortColumn,
    checked,
    checkedKeys,
    indeterminate,
    handleCheck,
    handleCheckAll,
    displayLength,
    page,
    total,
    handleChangePage,
    handleChangeLength,
    onRowClick,
    onDetails,
    handleEditState,
    handleChange,
    editing,
    moreActions,
    onExpandChange,
    renderTreeToggle
 }) => {
    return (
        <>
        <Table
            isTree
            rowKey="id"
            defaultExpandAllRows
            height={500}
            data={data}
            sortColumn={sortColumn}
            sortType={sortType}
            onSortColumn={onSortColumn}
            loading={loading}
            onExpandChange={onExpandChange}
        >
            {column.map((c) => {
                return ( 
                    <Column key={c} width={c.width} resizable={c.resizable} sortable={c.sortable}>
                      {c.datakey === "cartonOut" ? <HeaderCell style={{paddingLeft: '30px'}}>{c.text}</HeaderCell> : <HeaderCell>{c.text}</HeaderCell> }
                      {c.datakey === "cartonOut" ? 
                        <Cell style={{ paddingLeft: '30px', fontWeight:'bold', color: '#3EA060'}} dataKey="cartonOut"/>
                      : c.datakey === "carton" ? 
                        <Cell style={{ fontWeight:'bold', color: '#0E6BA8'}} dataKey="carton"/>
                      : <Cell dataKey={c.datakey}/>
                      }
                    </Column>
                );
            })}
        </Table>
        <Pagination
          lengthMenu={[
            {
              value: 100,
              label: 100
            },
            {
              value: 200,
              label: 200
            },
            {
              value: 500,
              label: 500
            }
            ,
            {
              value: 1000,
              label: 1000
            }
          ]}
          activePage={page}
          displayLength={displayLength}
          total={total}
          onChangePage={handleChangePage}
          onChangeLength={handleChangeLength}
        />
        </>
    ); 
  };
  
  export default DataTableTree;
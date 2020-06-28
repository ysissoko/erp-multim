import React from 'react';
import { Table } from "rsuite";

import '../../static/css/dataTable.less';

import StatusTag from '../datatable/statusTag'
import ActionCell from '../datatable/actionCell'
import CheckCell from '../datatable/checkCell'
import EditCell from '../datatable/editCell'
import CheckHeaderColumn from '../datatable/checkHeaderColumn'
import { getTagStatusColor } from '../../utils/date'

const { Column, HeaderCell, Cell, Pagination } = Table;

const DataTable = ({
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
    moreActions
 }) => {
    return (
        <>
        <Table
            height={500}
            affixHeader
            data={data}
            sortColumn={sortColumn}
            sortType={sortType}
            onSortColumn={onSortColumn}
            loading={loading}
            onRowClick={onDetails}
            loading={loading}
        >
            {column.map((c) => {
                return ( 
                    <Column key={c} width={c.width} resizable={c.resizable} sortable={c.sortable}>
                        {c.datakey === "id" ?
                          <CheckHeaderColumn disabled={c.disabled} checked={checked} indeterminate={indeterminate} onChange={handleCheckAll}/>
                        : <HeaderCell>{c.text}</HeaderCell>
                        }
                        {c.datakey === "statut" ?
                            <Cell dataKey="statut">
                                {rowData => {
                                    return (<StatusTag text={rowData.statut} color={getTagStatusColor(rowData.statut)}/>);}}
                            </Cell>
                        : c.datakey === "action" ?
                            <ActionCell dataKey="id" onRowClick={onRowClick} onClick={handleEditState} editing={editing} moreActions={moreActions} />
                        : c.datakey === "id"
                        ?   <CheckCell dataKey="id" disabled={c.disabled} checkedKeys={checkedKeys} onChange={handleCheck}/>
                        : c.datakey === "place"
                        ? <EditCell dataKey="place" onChange={handleChange}/>
                        : c.datakey === "marque"
                        ? <EditCell dataKey="marque" onChange={handleChange}/>
                        : c.datakey === "supply"
                        ? <EditCell dataKey="supply" onChange={handleChange}/>
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
  
  export default DataTable;
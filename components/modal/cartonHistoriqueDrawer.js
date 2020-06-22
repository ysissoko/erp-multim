import React from 'react';
import { Drawer, Button } from 'rsuite';
import DataTable from '../_shared/dataTable';


const CartonHistoriqueDrawer = ({ closeModal, columnHistorique, moveHistory }) => (
    <>
      <Drawer.Header>
        <Drawer.Title>Historique Mouvements de Carton</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
                <DataTable
                  data={moveHistory}
                  //column
                  column={columnHistorique}
                  //sortColumn={this.state.sortColumn}
                  //sortType={this.state.sortType}
                  // onSortColumn={this.handleSortColumn}
                  // loading={this.state.loading}
                   //checkbox
                  //  handleCheck={this.handleCheck}
                  //  handleCheckAll={this.handleCheckAll}
                  //  checkedKeys={this.state.checkedKeys}
                  //  indeterminate={indeterminate}
                  //  checked={checked}
                   //pagination
                  //  handleChangePage={this.handleChangePage}
                  //  handleChangeLength={this.handleChangeLength}
                  //  displayLength={this.state.displayLength}
                  //  page={this.state.page}
                  //  total={this.state.cartonMoveHistory.length}
                />
      </Drawer.Body>
      <Drawer.Footer>
        <Button onClick={closeModal} appearance="subtle">
          Fermer
        </Button>
      </Drawer.Footer>
    </>
  );

  export default CartonHistoriqueDrawer;
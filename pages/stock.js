import React from 'react';
import 'rsuite/lib/styles/index.less';
import '../static/css/dataTable.less';

import {Panel, Modal, IconButton, Icon, Drawer, Alert} from "rsuite";

import Frame from '../components/_shared/frame';
import HeaderTitle from '../components/_shared/headerTitle';
import HeaderTitleCarton from '../components/_shared/headerTitleCarton';
import DataTable from '../components/_shared/dataTable';

//ACTION BUTTON
import Toolbar from '../components/_shared/toolbar';
import {generateBarcodesPdf} from "../utils/barcode";
//MODAL
import InputModal from '../components/modal/inputModal';
import ConfirmModal from '../components/_shared/confirmModal';
import ToolbarDrawer from '../components/_shared/toolbarDrawer';

//Static Data for NavBar Column DataTable
import NavBar from '../components/_shared/navBar';
import stockNavbar from "../static/navbar/stockNavbar";

//Static Data for Receipt Column DataTable
import columnProduct from "../static/datatable/columnProduct";
import columnCarton from "../static/datatable/columnCarton";
import columnCartonOut from "../static/datatable/columnCartonOut";
import columnCartonHistorique from "../static/datatable/columnCartonHistorique";
import columnHistorique from "../static/datatable/columnHistorique";
import columnCartonProduct from '../static/datatable/columnCartonProduct';

// Static Data for Filter Button Name
import CustomFilter from '../components/datatable/customFilter';
import filterProduct from "../static/datatable/filterProduct";
import filterCarton from "../static/datatable/filterCarton";

// ******** FAKE DATA TO CHANGE ******
import receiptFilter from '../static/data/filter.js';

import {ProductInService, WhMovOpService, CartonInService, CartonOutService} from "../services/main.bundle";
import CartonHistoriqueDrawer from '../components/modal/cartonHistoriqueDrawer';
import {getFormattedDate} from "../utils/date";
import {getToken} from "../utils/token"

class Stock extends React.Component {

  constructor(props)
  {
    super(props);
    this.state = {
      show: false,
      receipt:true,
      moreActions: true, //actionCell
      plusActions: true, //actionCell
      onRowClicked: false, //onRowClick
      active: 1, //by default navbar
      activeButton: false, //disabled button modal
      stockNavbar,
      selectedCarton: null,
      productList: [],
      cartonsList: [],
      cartonsOutList: [],
      cartonMoveHistory: [],
      inputNumCartonsToCreate: "",
      inputNumCartonsOutToCreate: "",
      filterProduct,
      filterCarton,
      carton: false,
      showCartonOutModal: false,
      checkedKeys: [], //checkbox
      displayLength: 100, //pagination
      loading: false, //pagination
      page: 1, //pagination
      cartonsOutAutocompleteFilter: "",
      cartonsInAutocompleteFilter: "",
      historyAutocompleteFilter: "",
      productsAutocompleteFilter: "",
      cartonsOutStatusTagFilters: [],
      cartonsInStatusTagFilters: [],
    }

    this.handleNumCartonsInputChange = this.handleNumCartonsInputChange.bind(this);
    this.handleNumCartonsOutInputChange = this.handleNumCartonsOutInputChange.bind(this);
    this.handlePrintCartonsBarcodes = this.handlePrintCartonsBarcodes.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);

    // Autocomplete handlers
    this.onProductsAutocompleteChange = this.onProductsAutocompleteChange.bind(this);
    this.onCartonsInAutocompleteChange = this.onCartonsInAutocompleteChange.bind(this);
    this.onCartonsOutAutocompleteChange = this.onCartonsOutAutocompleteChange.bind(this);
    this.onHistoryAutocompleteChange = this.onHistoryAutocompleteChange.bind(this);
    this.onHandleCartonsOutFilterChange = this.onHandleCartonsOutFilterChange.bind(this);
    this.onHandleCartonsInFilterChange = this.onHandleCartonsInFilterChange.bind(this);
  }

  deleteSelectedCartonsInStock()
  {
    console.log("Delete selected cartons in");
    this.deleteMultipleEntities(this.cartonInService, this.refreshCartonInStock.bind(this));
  }

  deleteSelectedCartonsOutStock()
  {
    console.log("delete selected cartons out stock");
    console.log(this.state.checkedKeys);
    this.deleteMultipleEntities(this.cartonOutService, this.refreshCartonOutStock.bind(this));
  }

  deleteMultipleEntities(service, refreshFunction)
  {
    let deletePromises = [];

    this.state.checkedKeys.forEach(key => {
      let promise = service.delete(key);

      promise.then((deleteResult) => console.log(deleteResult))
              .catch(e => console.log(e));

      deletePromises.push(promise);
    });

    Promise.all(deletePromises).finally(() => {
      console.log("all delete complete close modal");
      this.closeModal('delete');
      refreshFunction();
    });
  }

  exportProductInBarcodes()
  {
    const {checkedKeys} = this.state;
    let barcodes = [];

    for (let key of checkedKeys)
    {
      const product = this.state.productList.find(product => product.id === key);
      barcodes.push({toBarcode: product.barcode, additionnalTxt: [product.code, product.product /** product name */]});
    }

    if (barcodes.length > 0)
      generateBarcodesPdf(barcodes);
  }

  handleConfirm()
  {
    console.log("Handle confirm");

    // Which active page ? to delete call to the correct service to delete the corresponding rows in the database
    switch (this.state.active)
    {
      // products in stock removable ???
      // case 1: this.deleteSelectedProductsInStock()
      // break;
      // cartons in stock
      case 2: this.deleteSelectedCartonsInStock()
      break;

      // cartons out stock
      case 3: this.deleteSelectedCartonsOutStock()
      break;
    }
  }

  handlePrintCartonsBarcodes()
  { const cartons = this.state.active === 2 ? this.state.cartonsList.filter((carton) => this.state.checkedKeys.indexOf(carton.id) !== -1).map(carton => ({toBarcode: carton.carton}))
    : this.state.active === 3 ? this.state.cartonsOutList.filter((carton) => this.state.checkedKeys.indexOf(carton.id) !== -1).map(carton => ({toBarcode: carton.cartonOut}))
    : null;

    generateBarcodesPdf(cartons);
  }

  handleNumCartonsInputChange(numCartons)
  {
    console.log(`number of cartons change ${numCartons}`);
    this.setState((prevState) => ({...prevState, inputNumCartonsToCreate:numCartons}));

    //control if input null, disabled the button
    if(numCartons === '') {
      this.setState({
        activeButton: false
      })
    } else {
      this.setState({
        activeButton: true
      })
    }
  }

  handleNumCartonsOutInputChange(numCartons)
  {
    console.log(`number of cartons change ${numCartons}`);
    this.setState((prevState) => ({...prevState, inputNumCartonsOutToCreate:numCartons}));

    //control if input null, disabled the button
    if(numCartons === '') {
      this.setState({
        activeButton: false
      })
    } else {
      this.setState({
        activeButton: true
      })
    }
  }

  getProductsQuantity(products)
  {
    let sum = 0;

    if (!products) return sum;

    for (let i=0; i<products.length; i++)
      sum += products[i].quantity

    return sum;
  }

  refreshProductInStock()
  {
    this.setState({
      loading: true
    });
    this.productInService.readAll()
    .then((response) => {
      this.setState((prevState) => ({...prevState,
        loading: false,
        productList: response.data.map((productIn) => ({
        id: productIn.id,
        product: productIn.product.name,
        quantity: productIn.quantity,
        code: productIn.product.refCode,
        place: productIn.carton.place.refCode,
        brand: productIn.product.brand.name,
        carton: productIn.carton.refCode,
        barcode: productIn.product.eanCode,
      }))}));
    }, error => Alert.warning(error.message, 2000))
  }

  refreshWhMovOps()
  {
    this.setState({
      loading: true
    });
    this.whMovOpService.readAll()
    .then((response) => {
      this.setState((prevState) => ({...prevState, loading: false, cartonMoveHistory: response.data.map((move) => ({ id: move.id, operation: move.refCode, carton: move.carton.refCode, initial: move.oldPlace.refCode, current: move.newPlace.refCode, lastUpdate: getFormattedDate(move.updatedAt)}))}));
    }, error => Alert.warning(error.message, 2000));
  }

  refreshCartonInStock()
  {
    this.setState({
      loading: true
    });
    this.cartonInService.readAll()
    .then((response) => {
      this.setState((prevState) => ({...prevState, loading: false, cartonsList: response.data.map((carton) => ({
          id: carton.id,
          carton: carton.refCode,
          statut: carton.scanned ? "enregistré": "à scanner",
          place: carton.scanned ? carton.place.refCode : "",
          operation:  carton.scanned ? carton.whInOp.refCode : "",
          moveHistory: carton.whMovOps.map(move => ({operation: move.refCode, initial: move.oldPlace.refCode, current: move.newPlace.refCode, lastUpdate: getFormattedDate(move.updatedAt) })),
          quantity: this.getProductsQuantity(carton.productsInStock),
          products: carton.productsInStock.map((productInStock) => ({product: productInStock.product.refCode, quantity: productInStock.quantity}))
        }))
      }));
    }, error => Alert.warning(error.message, 2000))
  }

  refreshCartonOutStock()
  {
    this.setState({
      loading: true
    });
    this.cartonOutService.readAll()
    .then((response) => {
      console.log(response)
      this.setState((prevState) => ({...prevState, loading: false, cartonsOutList: response.data.map((carton) => ({
        id: carton.id,
        cartonOut: carton.refCode,
        operation:  carton.scanned ? carton.whOutOp.refCode : "",
        statut: carton.scanned ? "enregistré": "à scanner",
        quantity: this.getProductsQuantity(carton.productsOutClassic),
        products: carton.productsOutClassic.map((productOutClassic) => ({product: productOutClassic.productOutStock.product.refCode, quantity: productOutClassic.quantity}))
        //whOutOp: carton.whOutOp,
      }))
      }));
    }, error => Alert.warning(error.message, 2000))
  }

  componentDidMount()
  {
    const token = getToken();

    if (!token)
      Router.push("/");

    this.productInService = new ProductInService(token);
    this.whMovOpService = new WhMovOpService(token);
    this.cartonInService = new CartonInService(token);
    this.cartonOutService = new CartonOutService(token);

    this.refreshCartonInStock();
    this.refreshCartonOutStock();
    this.refreshProductInStock();
    this.refreshWhMovOps();
  }

  openModal(type) {
    switch (type) {
      case 'carton' :
        this.setState({carton: !this.state.show});
        break;
      case 'carton_out' :
        this.setState({showCartonOutModal: !this.state.show});
        break;
      case 'delete' :
        this.setState({delete: !this.state.show});
        break;
      };
  };

  validateModal(type)
  {
    switch (type) {
      case 'carton' :
        this.createCartons();
        break;
      case 'carton_out':
        this.createCartonsOut();
        break;
    }
  }

  closeModal(type) {
    switch (type) {
      case 'carton' :
        this.setState({carton: this.state.show});
        break;
      case 'delete' :
        this.setState({delete: this.state.show});
        break;
      case 'cartonHistorique' :
        this.setState({cartonHistorique: this.state.show});
        break;
      case 'carton_out':
        this.setState({showCartonOutModal: this.state.show});
        break;
    }
  }

  //DRAWER Carton Historique
  toggleDrawer(placement) {
    this.setState({
      placement,
      cartonHistorique: true
    });
  }

  backTo(type) {
    switch (type) {
      case 'allCarton':
        this.setState({
          onRowClicked: !this.state.onRowClicked,
          checkedKeys: []
        });
        break;
    }
  }

  //select NavBar
  handleSelect = (activeKey) => {
    this.setState({
      active: activeKey,
      checkedKeys: [], //reset checkbox
      onRowClicked: false //reset details pages
    })
  }

  //ON ROW CLICK
  handleAction = (value) => {
    this.setState({
      onRowClicked: true,
      checkedKeys: [] //reset checkbox
    });
  }

  //Details Pages
  onDetailsSelect = (value) => {
    this.setState(prevState => ({...prevState, selectedCarton: value }));
    console.log(value)
  }

  createCartons()
  {
    console.log(`Create ${this.state.inputNumCartonsToCreate} cartons`);
    this.cartonInService.createBulkCartons(this.state.inputNumCartonsToCreate, null)
                    .then((response) => {
                      this.refreshCartonInStock();
                      this.closeModal("carton");
                    }, error => Alert.error(error.message, 10000));
  }

  createCartonsOut()
  {
    console.log(`Create ${this.state.inputNumCartonsOutToCreate} cartons`);
    this.cartonOutService.createBulkCartons(this.state.inputNumCartonsOutToCreate, null)
                    .then((response) => {
                      this.refreshCartonOutStock();
                      this.closeModal("carton_out");
                    }, error => Alert.error(error.message, 10000));
  }

    //CHECKBOX
  // TO DO : CHANGE DATA "this.state.productList"
  handleCheckAll = (value, checked) => {
    const checkedKeys = (checked && this.state.active === 1) ? this.state.productList.map(item => item.id)
    : (checked && this.state.active === 2) ? this.state.cartonsList.map(item => item.id)
    : (checked && this.state.active === 3) ? this.state.cartonsOutList.map(item => item.id)
    : (checked && this.state.active === 4) ? this.state.cartonMoveHistory.map(item => item.id)
    : [];
    this.setState({
      checkedKeys
    });
  }
  handleCheck = (value, checked) => {
    const { checkedKeys } = this.state;
    const nextCheckedKeys = checked
      ? [...checkedKeys, value]
      : checkedKeys.filter(item => item !== value);

    this.setState({
      checkedKeys: nextCheckedKeys
    });
  }

//SORT COLUMN
handleSortColumn = (sortColumn, sortType, page) => {
  this.setState({
    loading: true
  });
  setTimeout(() => {
    this.setState({
      sortColumn,
      sortType,
      loading: false
    });
  }, 500);
}

sortData = (data) => {
  const {sortColumn, sortType } = this.state;
    if (sortColumn && sortType) {
      return data.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === 'string') {
          x = x.charCodeAt();
        }
        if (typeof y === 'string') {
          y = y.charCodeAt();
        }
        if (sortType === 'asc') {
          return x - y;
        } else {
          return y - x;
        }
      });
    }
    return data;
}

//PAGINATION
handleChangePage = (dataKey) => {
  this.setState({
    page: dataKey
  });
}
handleChangeLength = (dataKey) => {
  this.setState({
    page: 1,
    displayLength: dataKey
  });
}
nextPage = (data) => {
  const { displayLength, page } = this.state;
    if (displayLength && page ) {
        return data.filter((v, i) => {
        const start = displayLength * (page - 1);
        const end = start + displayLength;
          return i >= start && i < end;
      });
    }
}

  onProductsAutocompleteChange(value)
  {
    this.setState(prevState => ({...prevState, productsAutocompleteFilter: value}))
  }

  onCartonsOutAutocompleteChange(value)
  {
    this.setState(prevState => ({...prevState, cartonsOutAutocompleteFilter: value}))
  }

  onCartonsInAutocompleteChange(value)
  {
    this.setState(prevState => ({...prevState, cartonsInAutocompleteFilter: value}))
  }

  onHistoryAutocompleteChange(value)
  {
    this.setState(prevState => ({...prevState, historyAutocompleteFilter: value}))
  }

  // Filters functions
  applyProductsFilters(productsList)
  {
    let filteredProductsList = productsList;

    if (this.state.productsAutocompleteFilter)
    {
      console.log(typeof this.state.productsAutocompleteFilter)
      filteredProductsList = filteredProductsList
                              .filter(item => item.product.includes(this.state.productsAutocompleteFilter.toUpperCase()) ||
                                              item.code.includes(this.state.productsAutocompleteFilter.toUpperCase()) ||
                                              item.place.includes(this.state.productsAutocompleteFilter.toUpperCase()) ||
                                              item.carton.includes(this.state.productsAutocompleteFilter.toUpperCase()))
    }

    return filteredProductsList;
  }

  applyCartonsOutFilters(cartonsOutList)
  {
    let filteredCartonsOutList = cartonsOutList;

    if (this.state.cartonsOutAutocompleteFilter)
    {
      filteredCartonsOutList = filteredCartonsOutList
                              .filter(item => item.cartonOut.includes(this.state.cartonsOutAutocompleteFilter.toUpperCase()))
    }


    if (this.state.cartonsOutStatusTagFilters && this.state.cartonsOutStatusTagFilters.length > 0)
    {
      filteredCartonsOutList = filteredCartonsOutList
                              .filter(item => this.state.cartonsOutStatusTagFilters.indexOf(item.statut) !== -1);
    }

    return filteredCartonsOutList;
  }

  applyCartonsInFilters(cartonsInList)
  {
    let filteredCartonsInList = cartonsInList;

    if (this.state.cartonsInAutocompleteFilter)
    {
      filteredCartonsInList = filteredCartonsInList
      .filter(item => item.carton.includes(this.state.cartonsInAutocompleteFilter.toUpperCase()) ||
                      item.place.includes(this.state.cartonsInAutocompleteFilter.toUpperCase()))
    }

    if (this.state.cartonsInStatusTagFilters && this.state.cartonsInStatusTagFilters.length > 0)
    {
      filteredCartonsInList = filteredCartonsInList
                              .filter(item => this.state.cartonsInStatusTagFilters.indexOf(item.statut) !== -1);
    }

    return filteredCartonsInList;
  }

  applyHistoryFilters(historyList)
  {
    let filteredHistoryList = historyList;

    if (this.state.historyAutocompleteFilter)
    {
      filteredHistoryList = filteredHistoryList
      .filter(item => item.operation.includes(this.state.historyAutocompleteFilter.toUpperCase()) ||
                      item.carton.includes(this.state.historyAutocompleteFilter.toUpperCase()) ||
                      item.initial.includes(this.state.historyAutocompleteFilter.toUpperCase()) ||
                      item.current.includes(this.state.historyAutocompleteFilter.toUpperCase()))
    }

    return filteredHistoryList;
  }

  onHandleCartonsOutFilterChange(tagFilters)
  {
    this.setState(prevState => ({...prevState, cartonsOutStatusTagFilters: tagFilters}))
  }

  onHandleCartonsInFilterChange(tagFilters)
  {
    this.setState(prevState => ({...prevState, cartonsInStatusTagFilters: tagFilters}))
  }

  render() {

    const {active, checkedKeys, onRowClicked} = this.state;

    const currentNav = this.state.active

      //CHECBKOX
      let checked = false;
      let indeterminate = false;

      //TO DO : CHANGE DATAs
      if (checkedKeys.length === 0) {
        checked = false;
      }
      else if (checkedKeys.length === (((currentNav === 1 && this.state.productList.length) || (currentNav === 2 && this.state.cartonsList.length) || (currentNav === 3 && this.state.cartonsOutList.length) || (currentNav === 4 && this.state.cartonMoveHistory.length)))) {
        checked = true;
      }  else if (checkedKeys.length > 0 && checkedKeys.length < ((currentNav === 1 && this.state.productList.length) || (currentNav === 2 && this.state.cartonsList.length) || (currentNav === 3 && this.state.cartonsOutList.length) || (currentNav === 4 && this.state.cartonMoveHistory.length))) {
        indeterminate = true;
      }

      let cartonsInList = this.applyCartonsInFilters(this.state.cartonsList);
      let cartonsOutList = this.applyCartonsOutFilters(this.state.cartonsOutList);
      let cartonsHistoryList = this.applyHistoryFilters(this.state.cartonMoveHistory);
      let productsList = this.applyProductsFilters(this.state.productList);

    return (
        <Frame activeKey="2">
          <HeaderTitle
            className="header-frame"
            title="Gestion du Stock"
            subtitle="Les différentes catégories pour gérer le stock dans l’entrepôt"
          />
              <Panel>
              <div style={{display: 'flex'}}>
                <NavBar
                  appearance="subtle"
                  active={active}
                  onSelect={this.handleSelect}
                  items={stockNavbar}
                />
              </div>
              {active === 1 && (
              <>
                <div className="table-toolbar">
                  <HeaderTitle
                      className="inner-left"
                      title={"Les produits"}
                      subtitle={"Visualiser les produits ici, pour en ajouter d’autre, rendez-vous dans Entrepôt > Catalogue."}
                    />
                   {(indeterminate || checked) && (
                    <IconButton
                      style={{marginTop: '20px', marginRight:'5px'}}
                      className="inner-right"
                      color="yellow"
                      icon={<Icon icon="qrcode" />}
                      appearance="primary"
                      onClick={() => this.exportProductInBarcodes()}
                    />)}
                </div>
                <CustomFilter
                  //needFilter={false}
                  placeholder="Rechercher par produit, place, carton..."
                  onAutocompleteInputChange={this.onProductsAutocompleteChange}
                  dataSearch={productsList.map(item => ({valu: item.code, label: item.code}))}
                  //onFilter={}
                />
                <DataTable
                  data={this.sortData(this.nextPage(productsList))}
                  //column
                  column={columnProduct}
                  sortColumn={this.state.sortColumn}
                  sortType={this.state.sortType}
                  onSortColumn={this.handleSortColumn}
                  loading={this.state.loading}
                  //checkbox
                  handleCheck={this.handleCheck}
                  handleCheckAll={this.handleCheckAll}
                  checkedKeys={this.state.checkedKeys}
                  indeterminate={indeterminate}
                  checked={checked}
                  //pagination
                  handleChangePage={this.handleChangePage}
                  handleChangeLength={this.handleChangeLength}
                  displayLength={this.state.displayLength}
                  page={this.state.page}
                  total={productsList.length}
                  //edit et action cell
                  moreActions={false}
                />
              </>
            )}
            {/* all carton in */}
            {active === 2 && (
              <>
              {!onRowClicked && (
                <>
                <div className="table-toolbar">
                  <HeaderTitle
                      className="inner-left"
                      title={"Cartons de stockage"}
                      subtitle={"Visualiser les cartons contenant les produits stockés dans l’entrepôt"}
                    />
                {(!indeterminate && !checked) && (
                  <Toolbar
                    data={receiptFilter}
                    primaryButton="Nouveau Carton IN"
                    //openModal={this.openModal}
                    importModal={() => this.openModal('carton')}
                  />)}
                  {(indeterminate || checked) && (
                    <>
                    <IconButton
                      style={{marginTop: '20px', marginRight:'10px'}}
                      className="inner-right"
                      color="red"
                      icon={<Icon icon="trash-o" />}
                      appearance="ghost"
                      onClick={() => this.openModal('delete')}
                    />
                    <IconButton
                      style={{marginTop: '20px', marginRight:'10px'}}
                      className="inner-right"
                      color="yellow"
                      icon={<Icon icon="qrcode" />}
                      appearance="primary"
                      onClick={this.handlePrintCartonsBarcodes}
                    />
                    </>
                  )}
                </div>
                <CustomFilter
                  //filter
                  needFilter={true}
                  placeholder="Rechercher par carton, whin, place..."
                  dataFilter={filterCarton}
                  onAutocompleteInputChange={this.onCartonsInAutocompleteChange}
                  //search
                  dataSearch={cartonsInList.map(item => ({value: item.carton, label: item.carton}))}
                  onFilter={this.onHandleCartonsInFilterChange}
                />
                <DataTable
                  data={this.sortData(this.nextPage(cartonsInList))}
                  onRowClick={this.handleAction}
                  onDetails={this.onDetailsSelect}
                  //column
                  column={columnCarton}
                  sortColumn={this.state.sortColumn}
                  sortType={this.state.sortType}
                  onSortColumn={this.handleSortColumn}
                  loading={this.state.loading}
                   //checkbox
                   handleCheck={this.handleCheck}
                   handleCheckAll={this.handleCheckAll}
                   checkedKeys={this.state.checkedKeys}
                   indeterminate={indeterminate}
                   checked={checked}
                   //pagination
                   handleChangePage={this.handleChangePage}
                   handleChangeLength={this.handleChangeLength}
                   displayLength={this.state.displayLength}
                   page={this.state.page}
                   total={cartonsInList.length}
                   //edit et action cell
                   moreActions={this.state.moreActions}
                   plusActions={false}
                />
                </>)}
                {onRowClicked && (
                <>
                  <ToolbarDrawer
                    label="Tous Mes Cartons"
                    onBackButton={() => this.backTo('allCarton')}
                    primaryButton="Télécharger"
                    onCartonHistorique={() => this.toggleDrawer('right')}
                  />
                  {/* TO DO CHANGE DATA */}
                  <HeaderTitleCarton
                    style={{paddingTop: '0px !important'}}
                    className="table-toolbar header-tag"
                    title={this.state.selectedCarton.carton}
                    status={this.state.selectedCarton.statut}
                    operation={this.state.selectedCarton.operation}
                    place={this.state.selectedCarton.place ? this.state.selectedCarton.place : "Pas encore de place attribuée" }
                  />
                <CustomFilter
                  style={{paddingTop: '0px !important'}}
                  placeholder="Rechercher par produit"
                  //dataSearch={filterCarton} // TO DO change data
                  //dataFilter={filterCarton}

                />
                <DataTable
                  data={this.state.selectedCarton.products}
                  //column
                  column={columnCartonProduct}
                  sortColumn={this.state.sortColumn}
                  sortType={this.state.sortType}
                  onSortColumn={this.handleSortColumn}
                  loading={this.state.loading}
                  //checkbox
                  handleCheck={this.handleCheck}
                  handleCheckAll={this.handleCheckAll}
                  checkedKeys={this.state.checkedKeys}
                  indeterminate={indeterminate}
                  checked={checked}
                  //pagination
                  handleChangePage={this.handleChangePage}
                  handleChangeLength={this.handleChangeLength}
                  displayLength={this.state.displayLength}
                  page={this.state.page}
                  total={this.state.selectedCarton.products.length} //TO CHANGE
                />
                </>
                )}
              </>
            )}
            {/* all carton out */}
            {active === 3 && (
              <>
              {!onRowClicked && (
                <>
                <div className="table-toolbar">
                  <HeaderTitle
                      className="inner-left"
                      title={"Cartons de livraison"}
                      subtitle={"Visualiser les cartons destinés à la livraison classique."}
                    />
                  {(!indeterminate && !checked) && (
                  <Toolbar
                    data={receiptFilter}
                    primaryButton="Nouveau Carton OUT"
                    //openModal={this.openModal}
                    importModal={() => this.openModal('carton_out')}
                  />)}
                  {(indeterminate || checked) && (
                    <>
                    <IconButton
                      style={{marginTop: '20px', marginRight:'10px'}}
                      className="inner-right"
                      color="red"
                      icon={<Icon icon="trash-o" />}
                      appearance="ghost"
                      onClick={() => this.openModal('delete')}
                    />
                    <IconButton
                      style={{marginTop: '20px', marginRight:'10px'}}
                      className="inner-right"
                      color="yellow"
                      icon={<Icon icon="qrcode" />}
                      appearance="primary"
                      onClick={this.handlePrintCartonsBarcodes}
                    />
                    </>
                  )}
                </div>
                <CustomFilter
                  //filter
                  needFilter={true}
                  placeholder="Rechercher par carton, whout..."
                  dataFilter={filterCarton}
                  onAutocompleteInputChange={this.onCartonsOutAutocompleteChange}
                  //search
                  dataSearch={cartonsOutList.map(item => ({value: item.cartonOut, label: item.cartonOut}))} //TO DO, autocomplete data
                  onFilter={this.onHandleCartonsOutFilterChange}
                />
                <DataTable
                  data={this.sortData(this.nextPage(cartonsOutList))}
                  onRowClick={this.handleAction}
                  onDetails={this.onDetailsSelect}
                  //column
                  column={columnCartonOut}
                  sortColumn={this.state.sortColumn}
                  sortType={this.state.sortType}
                  onSortColumn={this.handleSortColumn}
                  loading={this.state.loading}
                   //checkbox
                   handleCheck={this.handleCheck}
                   handleCheckAll={this.handleCheckAll}
                   checkedKeys={this.state.checkedKeys}
                   indeterminate={indeterminate}
                   checked={checked}
                   //pagination
                   handleChangePage={this.handleChangePage}
                   handleChangeLength={this.handleChangeLength}
                   displayLength={this.state.displayLength}
                   page={this.state.page}
                   total={cartonsOutList.length}
                   //edit et action cell
                   moreActions={this.state.moreActions}
                   plusActions={false}
                />
                </>
                )}
                {onRowClicked && (
                  <>
                    <ToolbarDrawer
                      label="Tous Mes Cartons"
                      onBackButton={() => this.backTo('allCarton')}
                      primaryButton="Télécharger"
                      onCartonHistorique={() => this.toggleDrawer('right')}
                    />
                    <HeaderTitleCarton
                      style={{paddingTop: '0px !important'}}
                      className="table-toolbar header-tag"
                      title={this.state.selectedCarton.cartonOut}
                      status={this.state.selectedCarton.statut}
                      //place={this.state.selectedCarton.place ? this.state.selectedCarton.place : "Pas encore de place attribuée" }
                    />
                  <CustomFilter
                    style={{paddingTop: '0px !important'}}
                    //data={}
                    //onFilter={}
                  />
                  <DataTable
                    data={this.state.selectedCarton.products}
                    //column
                    column={columnCartonProduct}
                    sortColumn={this.state.sortColumn}
                    sortType={this.state.sortType}
                    onSortColumn={this.handleSortColumn}
                    loading={this.state.loading}
                    //checkbox
                    handleCheck={this.handleCheck}
                    handleCheckAll={this.handleCheckAll}
                    checkedKeys={this.state.checkedKeys}
                    indeterminate={indeterminate}
                    checked={checked}
                    //pagination
                    handleChangePage={this.handleChangePage}
                    handleChangeLength={this.handleChangeLength}
                    displayLength={this.state.displayLength}
                    page={this.state.page}
                    total={this.state.cartonsList.length} //TO CHANGE
                  />
                  </>
                  )}
              </>)}

            {active === 4 && (
              <>
                <div className="table-toolbar">
                  <HeaderTitle
                      className="inner-left"
                      title={"Historique des mouvements"}
                      subtitle={"Visualiser les changements d’emplacements des cartons."}
                    />
                </div>
                <CustomFilter
                  placeholder="Rechercher par whmov, carton, place..."
                  onAutocompleteInputChange={this.onHistoryAutocompleteChange}
                  //data={}
                  //onFilter={}
                />
                <DataTable
                  data={this.sortData(this.nextPage(cartonsHistoryList))}
                  //column
                  column={columnHistorique}
                  sortColumn={this.state.sortColumn}
                  sortType={this.state.sortType}
                  onSortColumn={this.handleSortColumn}
                  loading={this.state.loading}
                   //checkbox
                   handleCheck={this.handleCheck}
                   handleCheckAll={this.handleCheckAll}
                   checkedKeys={this.state.checkedKeys}
                   indeterminate={indeterminate}
                   checked={checked}
                   //pagination
                   handleChangePage={this.handleChangePage}
                   handleChangeLength={this.handleChangeLength}
                   displayLength={this.state.displayLength}
                   page={this.state.page}
                   total={cartonsHistoryList.length}
                   //edit et action cell
                   moreActions={this.state.moreActions}
                />
              </>
            )}
            </Panel>

                {/* CONFIRMATION MODAL FOR DELETE ACTION */}
                <div className="modal-container">
                  <Modal backdrop="static" show={this.state.delete} onHide={() => this.closeModal('delete')} size="xs" backdrop="static">
                    <ConfirmModal
                      text="Êtes-vous sûr de vouloir supprimer ?"
                      secondaryButton="Non. Annuler."
                      primaryButton="Oui. Supprimer"
                      handleConfirm={this.handleConfirm}
                      closeModal={() => this.closeModal('delete')}
                    />
                  </Modal>
                </div>

                  {/* MODAL ADD NEW carton */}
                  <div className="modal-container">
                  <Modal show={this.state.carton} onHide={() => this.closeModal('carton')} size="xs" backdrop="static">
                    <InputModal
                      modalType={this.state.active === 2 ? 'cartonIN' : this.state.active === 3 ? 'cartonOUT' : null}
                      title="Nouveau Carton"
                      subtitle={this.state.active === 2 ? 'Créer un/plusieurs carton(s) de stockage' : this.state.active === 3 ? 'Créer un/plusieurs carton(s) de livraison' : null}
                      icon="dropbox"
                      text="Combien de cartons souhaitez-vous créer ?"
                      placeholder="10"
                      secondaryButton="Annuler"
                      primaryButton="Créer Nouveau Carton"
                      closeModal={() => this.closeModal('carton')}
                      inputValue={this.state.inputNumCartonsToCreate}
                      onInputChange={this.handleNumCartonsInputChange}
                      validateModal={() => this.validateModal("carton")}
                      disabled={!this.state.activeButton}
                    />
                  </Modal>
                </div>

                {/* MODAL ADD NEW carton */}
                <div className="modal-container">
                  <Modal show={this.state.showCartonOutModal} onHide={() => this.closeModal('carton_out')} size="xs" backdrop="static">
                    <InputModal
                      modalType="cartonOUT"
                      title="Nouveau cartons"
                      subtitle="Créer un/plusieurs carton(s) pour la livraison"
                      icon="dropbox"
                      text="Combien de carton souhaitez-vous créer ?"
                      placeholder="10"
                      secondaryButton="Annuler"
                      primaryButton="Créer Nouveau Carton"
                      closeModal={() => this.closeModal('carton_out')}
                      inputValue={this.state.inputNumCartonsOutToCreate}
                      onInputChange={this.handleNumCartonsOutInputChange}
                      validateModal={() => this.validateModal("carton_out")}
                      disabled={!this.state.activeButton}
                    />
                  </Modal>
                </div>

                {/* OPEN Selected Carton MOVE historique */}
                <Drawer
                  placement={this.state.placement}
                  show={this.state.cartonHistorique}
                  onHide={() => this.closeModal('cartonHistorique')}
                >
                  <CartonHistoriqueDrawer
                    moveHistory={this.state.selectedCarton ? this.state.selectedCarton.moveHistory : []}
                    columnHistorique={columnCartonHistorique}
                    closeModal={() => this.closeModal('cartonHistorique')}
                  />
                </Drawer>

        </Frame>
    );
  }
}

export default Stock;

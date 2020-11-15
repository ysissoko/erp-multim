import React from 'react';
import 'rsuite/lib/styles/index.less';
import '../static/css/dataTable.less';

import {Panel, Modal, IconButton, Icon, Drawer, Alert, FormGroup, RadioGroup, Radio, ControlLabel} from "rsuite";

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

import {ProductInService, WhMovOpService, CartonInService, CartonOutService} from "../services/main";
import CartonHistoriqueDrawer from '../components/modal/cartonHistoriqueDrawer';
import {getFormattedDate} from "../utils/date";
import {getToken} from "../utils/token"

const AUTOCOMPLETE_TIMEOUT = 30;
class Stock extends React.Component {

  constructor(props)
  {
    super(props);

    this.productInAutocompleteTimeout = null;
    this.cartonInAutocompleteTimeout = null;
    this.cartonOutAutocompleteTimeout = null;
    this.historyAutocompleteTimeout = null;

    this.state = {
      show: false,
      editing: false,
      receipt:true,
      moreActions: true, //actionCell
      onRowClicked: false, //onRowClick
      active: 1, //by default navbar
      activeButton: false, //disabled button modal
      stockNavbar,
      selectedCartonInInfo: null,
      selectedCartonInProducts: [],
      selectedCartonOutProducts: [],
      selectedCartonHistory: null,
      productInFilterType: "product_name",
      cartonInFilterType: "carton_ref",
      cartonOutFilterType: 'cartonout_ref',
      historyFilterType: 'whmov_ref',
      productList: [],
      cartonsList: [],
      cartonsOutList: [],
      cartonMoveHistory: [],
      inputNumCartonsToCreate: "",
      inputNumCartonsOutToCreate: "",
      carton: false,
      showCartonOutModal: false,
      checkedKeys: [], //checkbox
      productPageDispLen: 100, //pagination
      cartonsInPageDispLen: 100, //pagination
      cartonsOutPageDispLen: 100, //pagination
      historyPageDispLen: 100, //pagination
      pageCartonOutDetailsDispLen: 100,
      pageCartonInDetailsDispLen: 100,
      loading: false, //pagination
      pageProducts: 1, //pagination
      pageCartonsIn: 1, //pagination
      pageCartonsOut: 1, //pagination
      pageHistory: 1, //pagination
      pageCartonInDetails: 1, //pagination
      pageCartonOutDetails: 1, //pagination
      productsTotal: 0, //pagination
      cartonsInTotal: 0, //pagination
      cartonsOutTotal: 0, //pagination
      historyTotal: 0, //pagination
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
    this.onProductsInputChange = this.onProductsInputChange.bind(this);
    this.onCartonsInInputChange = this.onCartonsInInputChange.bind(this);
    this.onCartonsOutInputChange = this.onCartonsOutInputChange.bind(this);
    this.onHistoryInputChange = this.onHistoryInputChange.bind(this);
    this.onHandleCartonsOutFilterChange = this.onHandleCartonsOutFilterChange.bind(this);
    this.onHandleCartonsInFilterChange = this.onHandleCartonsInFilterChange.bind(this);

    this.updateCartonInList = this.updateCartonInList.bind(this);
    this.updateCartonOutList = this.updateCartonOutList.bind(this);

    this.refreshCartonInStock = this.refreshCartonInStock.bind(this);
    this.refreshCartonOutStock = this.refreshCartonOutStock.bind(this);
    this.refreshWhMovOps = this.refreshWhMovOps.bind(this);
    this.refreshProductInStock = this.refreshProductInStock.bind(this);
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

  exportProductIn()
  {
    console.log("Export product in")
    this.productInService.exportExcelFile(this.state.productList.filter(product => this.state.checkedKeys.indexOf(product.id) !== -1));
  }

  updateWhMovList(pages)
  {
    this.setState((prevState) => ({
      ...prevState, 
      loading: false, 
      historyTotal: pages.total, 
      cartonMoveHistory: pages.data.map((move) => ({ 
        id: move.id, operation: move.refCode, 
        carton: move.carton.refCode, 
        initial: move.oldPlace.refCode, 
        current: move.newPlace.refCode, 
        lastUpdate: getFormattedDate(move.updatedAt)
      }))
    }));
  }

  updateCartonOutList(pages)
  {
    this.setState((prevState) => ({...prevState, loading: false, cartonsOutTotal: pages.total, cartonsOutList: pages.data.map((carton) => ({
        id: carton.id,
        cartonOut: carton.refCode,
        operation:  carton.scanned ? carton.whOutOp.refCode : "",
        statut: carton.scanned ? "enregistré": "à scanner",
        quantity: carton.productsCount,
      }))
    }));
  }

  updateCartonInList(pages)
  {
    this.setState((prevState) => ({...prevState, loading: false, cartonsInTotal: pages.total, cartonsList: pages.data.map((carton) => ({
      id: carton.id,
      carton: carton.refCode,
      statut: carton.scanned ? "enregistré": "à scanner",
      place: carton.scanned ? carton.place.refCode : "",
      operation:  carton.scanned ? carton.whInOp.refCode : "",
      quantity: carton.productsCount,
    }))
  }));
  }

  updateProductsList(pages)
  {
    this.setState((prevState) => ({...prevState,
      loading: false,
      productsTotal: pages.total,
      productList: pages.data.map((productIn) => ({
      id: productIn.id,
      product: productIn.product.name,
      quantity: productIn.quantity,
      code: productIn.product.refCode,
      place: productIn.carton.place.refCode,
      brand: productIn.product.brand.name,
      carton: productIn.carton.refCode,
      barcode: productIn.product.eanCode,
    }))}));
  }

  refreshCartonInStock()
  {
    this.setState({
      loading: true
    });
    
    this.cartonInService.filterCartonsIn({
      type: this.state.cartonInFilterType,
      tagFilters: this.state.cartonsInStatusTagFilters,
      searchTerm: this.state.cartonsInAutocompleteFilter.trim(),
      page: this.state.pageCartonsIn,
      limit: this.state.cartonsInPageDispLen
    })
    .then(response => {
      const pages = response.data;
      this.updateCartonInList(pages);
    })
  }

  refreshCartonOutStock()
  {
    this.setState({
      loading: true
    });

    this.cartonOutService.filterCartonsOut({
      type: this.state.cartonOutFilterType,
      tagFilters: this.state.cartonsOutStatusTagFilters,
      searchTerm: this.state.cartonsOutAutocompleteFilter.trim(),
      page: this.state.pageCartonsOut,
      limit: this.state.cartonsOutPageDispLen
    })
    .then(response => {
      const pages = response.data;
      this.updateCartonOutList(pages);
    })
  }

  refreshProductInStock()
  {
    this.setState({
      loading: true
    });
    
    this.productInService.filterProductIn({
      type: this.state.productInFilterType,
      searchTerm: this.state.productsAutocompleteFilter.trim(),
      page: this.state.pageProducts,
      limit: this.state.productPageDispLen
    })
    .then(response => {
      const pages = response.data;
      this.updateProductsList(pages);
    })
  }

  refreshWhMovOps()
  {
    this.setState({
      loading: true
    });

    this.whMovOpService.filterHistory({
      type: this.state.historyFilterType,
      searchTerm: this.state.historyAutocompleteFilter.trim(),
      page: this.state.pageHistory,
      limit: this.state.historyPageDispLen
    })
    .then(response => {
      const pages = response.data;
      this.updateWhMovList(pages);
    })
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

  componentWillUnmount()
  {
    if (this.productInAutocompleteTimeout)
      clearTimeout(this.productInAutocompleteTimeout)

    if (this.cartonInAutocompleteTimeout)
      clearTimeout(this.cartonInAutocompleteTimeout)

    if (this.cartonOutAutocompleteTimeout)
      clearTimeout(this.cartonOutAutocompleteTimeout)

    if (this.historyAutocompleteTimeout)
      clearTimeout(this.historyAutocompleteTimeout)

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
          checkedKeys: [],
          selectedCartonInInfo: null,
          selectedCartonInProducts: [],
          selectedCartonOutProducts: [],
          selectedCartonHistory: null,
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
  handleAction = () => {
    this.setState({
      onRowClicked: true,
      checkedKeys: [] //reset checkbox
    });
  }

  //Details Pages
  onCartonInDetailsSelect = (value) => {
    this.cartonInService.getCartonInHistory(value.carton).then(response => {
      const whMovOps = response.data.whMovOps;
      this.cartonInService.getCartonInInfo(value.carton).then(response => {
        const cartonIn = response.data;
        this.setState(prevState => ({...prevState,
          selectedCartonHistory: whMovOps.map(move => ({
            operation: move.refCode, 
            initial: move.oldPlace.refCode, 
            current: move.newPlace.refCode, 
            lastUpdate: getFormattedDate(move.updatedAt) 
          })),
          selectedCartonInInfo: value, 
          selectedCartonInProducts: cartonIn.productsInStock.map((productInStock) => ({product: productInStock.product.refCode, quantity: productInStock.quantity})) 
        }));
      })
    })
  }

  onCartonOutDetailsSelect = (value) => {
    console.log(value)
    this.cartonOutService.getCartonOutInfo(value.cartonOut).then(response => {
      const cartonOut = response.data;
      this.setState(prevState => ({...prevState, 
        selectedCartonOutInfo: value, 
        selectedCartonOutProducts: cartonOut.productsOutClassic.map((productOutClassic) => ({product: productOutClassic.productOutStock.product.refCode, quantity: productOutClassic.quantity})) 
      }));
    })
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
    if (this.state.active === 1)
      this.setState({ pageProducts: dataKey });

    if (this.state.active === 2)
      this.setState({ pageCartonsIn: dataKey });
      
    if (this.state.active === 3)
      this.setState({ pageCartonsOut: dataKey });

    if (this.state.active === 4)
      this.setState({ pageHistory: dataKey });
  }

  handleChangeLength = (dataKey) => {
    if (this.state.active === 1)
      this.setState({pageProducts: 1, productPageDispLen: dataKey });

    if (this.state.active === 2)
      this.setState({pageCartonsIn: 1, cartonsInPageDispLen: dataKey });

    if (this.state.active === 3)
      this.setState({pageCartonsOut: 1, cartonsOutPageDispLen: dataKey });

    if (this.state.active === 4)
      this.setState({pageHistory: 1, historyPageDispLen: dataKey });
  }

  onProductsInputChange(value)
  {
    this.setState(prevState => ({...prevState, productsAutocompleteFilter: value}))
  }

  onCartonsOutInputChange(value)
  {
      this.setState(prevState => ({...prevState, cartonsOutAutocompleteFilter: value}))
  }

  onCartonsInInputChange(value)
  {
      this.setState(prevState => ({...prevState, cartonsInAutocompleteFilter: value}))
  }

  onHistoryInputChange(value)
  {
    this.setState(prevState => ({...prevState, historyAutocompleteFilter: value}))
  }

  onHandleCartonsOutFilterChange(tagFilters)
  {
    this.setState(prevState => ({...prevState, cartonsOutStatusTagFilters: tagFilters}))
  }

  onHandleCartonsInFilterChange(tagFilters)
  {
    this.setState(prevState => ({...prevState, cartonsInStatusTagFilters: tagFilters}))
  }

  handleEditProductQty = (rowData) => {
    const {productList} = this.state;
    const activeItem = productList.find(item => item.id === rowData.id);
    
    activeItem.status = activeItem.status ? null : 'EDIT';
    console.log(activeItem.status)
    const newQty = parseInt(rowData.quantity);

    if (activeItem.status === null)
    {
      if (newQty >= 0)
        this.productInService.update(rowData.id, {quantity: newQty})
                              .then(result => console.log(result))
                              .catch(e => console.error(e));
    }

    this.setState({
      productList
    });
  }

  //EDIT CELL
  handleChangeProductQty = (id, key, value) => {
    if (parseInt(value) >= 0)
    { 
      const { productList } = this.state;

      productList.find(item => item.id === id)[key] = value;
  
      this.setState({
        productList
      });
    }
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
                     <>
                     <IconButton
                     style={{marginTop: '20px', marginRight:'10px'}}
                     className="inner-right"
                     color="violet"
                     icon={<Icon icon="file-excel-o" />}
                     appearance="primary"
                     onClick={() => this.exportProductIn()}
                    />
                    <IconButton
                      style={{marginTop: '20px', marginRight:'5px'}}
                      className="inner-right"
                      color="yellow"
                      icon={<Icon icon="qrcode" />}
                      appearance="primary"
                      onClick={() => this.exportProductInBarcodes()}
                    />
                    </>)}
                </div>

                <CustomFilter
                  placeholder="Rechercher par produit, place, carton..."
                  onInputChange={this.onProductsInputChange}
                  value={this.state.productsAutocompleteFilter}
                  onSearchClick={this.refreshProductInStock}
                />

                <FormGroup controlId="radioList">
                    <ControlLabel>Filtrer par: </ControlLabel>
                    <RadioGroup value={this.state.productInFilterType}  name="radioList" onChange={(v) => this.setState(prevState => ({...prevState, productInFilterType: v}))} inline>
                      <Radio value="product_name" checked={true}>Nom produit</Radio>
                      <Radio value="product_ref">Ref produit</Radio>
                      <Radio value="product_brand">Marque</Radio>
                      <Radio value="product_ean">EAN</Radio>
                      <Radio value="product_place">Emplacement</Radio>
                      <Radio value="product_carton">Ref carton</Radio>
                    </RadioGroup>
                  </FormGroup>

                <DataTable
                  data={this.sortData(this.state.productList)}
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
                  displayLength={this.state.productPageDispLen}
                  page={this.state.pageProducts}
                  total={this.state.productsTotal}
                  editing={true}
                  handleEditState={this.handleEditProductQty}
                  handleChange={this.handleChangeProductQty}
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
                  needFilter={true}
                  dataFilter={filterCarton}
                  valueFilter={this.state.cartonsInStatusTagFilters}
                  placeholder="Rechercher par carton, whin, place..."
                  onInputChange={this.onCartonsInInputChange}
                  value={this.state.cartonsInAutocompleteFilter}
                  onFilter={this.onHandleCartonsInFilterChange}
                  onSearchClick={this.refreshCartonInStock}
                />

                <FormGroup controlId="radioList">
                    <ControlLabel>Filtrer par: </ControlLabel>
                    <RadioGroup value={this.state.cartonInFilterType} name="radioList" onChange={(v) => this.setState(prevState => ({...prevState, cartonInFilterType: v}))} inline>
                      <Radio value="carton_ref" checked={true}>Ref carton</Radio>
                      <Radio value="carton_whin">Ref whin</Radio>
                      <Radio value="carton_place">Place</Radio>
                    </RadioGroup>
                  </FormGroup>

                <DataTable
                  data={this.sortData(this.state.cartonsList)}
                  onRowClick={this.handleAction}
                  onDetails={this.onCartonInDetailsSelect}
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
                   displayLength={this.state.cartonsInPageDispLen}
                   page={this.state.pageCartonsIn}
                   total={this.state.cartonsInTotal}
                   //edit et action cell
                   moreActions={this.state.moreActions}
                />
                </>)}
                {onRowClicked && (this.state.selectedCartonInInfo && this.state.selectedCartonInProducts) && (
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
                    title={this.state.selectedCartonInInfo.carton}
                    status={this.state.selectedCartonInInfo.statut}
                    operation={this.state.selectedCartonInInfo.operation}
                    place={this.state.selectedCartonInInfo.place ? this.state.selectedCartonInInfo.place : "Pas encore de place attribuée" }
                  />

                <DataTable
                  data={this.state.selectedCartonInProducts}
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
                  handleChangePage={(dataKey) => this.setState((prevState) => ({...prevState, pageCartonInDetails: dataKey}))}
                  handleChangeLength={(dataKey) => this.setState((prevState) => ({...prevState, pageCartonInDetailsDispLen: dataKey}))}
                  displayLength={this.state.pageCartonInDetailsDispLen}
                  page={this.state.pageCartonInDetails}
                  total={this.state.selectedCartonInProducts.length}
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
                  onInputChange={this.onCartonsOutInputChange}
                  onFilter={this.onHandleCartonsOutFilterChange}
                  value={this.state.cartonsOutAutocompleteFilter}
                  valueFilter={this.state.cartonsOutStatusTagFilters}
                  onSearchClick={this.refreshCartonOutStock}
                />

                <FormGroup controlId="radioList">
                  <ControlLabel>Filtrer par: </ControlLabel>
                  <RadioGroup value={this.state.cartonOutFilterType} name="radioList" onChange={(v) => this.setState(prevState => ({...prevState, cartonOutFilterType: v}))} inline>
                    <Radio value="cartonout_ref" checked={true}>Ref carton</Radio>
                    <Radio value="cartonout_whout">Ref whout</Radio>
                  </RadioGroup>
                </FormGroup>

                <DataTable
                  data={this.sortData(this.state.cartonsOutList)}
                  onRowClick={this.handleAction}
                  onDetails={this.onCartonOutDetailsSelect}
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
                   displayLength={this.state.cartonsOutPageDispLen}
                   page={this.state.pageCartonsOut}
                   total={this.state.cartonsOutTotal}
                   //edit et action cell
                   moreActions={this.state.moreActions}
                />
                </>
                )}
                { onRowClicked && (this.state.selectedCartonOutInfo && this.state.selectedCartonOutProducts) && (
                  <>
                    <ToolbarDrawer
                      label="Tous Mes Cartons"
                      onBackButton={() => this.backTo('allCarton')}
                    />
                    <HeaderTitleCarton
                      style={{paddingTop: '0px !important'}}
                      className="table-toolbar header-tag"
                      title={this.state.selectedCartonOutInfo.cartonOut}
                      status={this.state.selectedCartonOutInfo.statut}
                    />

                  <DataTable
                    data={this.state.selectedCartonOutProducts}
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
                    handleChangePage={(dataKey) => this.setState((prevState) => ({...prevState, pageCartonOutDetails: dataKey}))}
                    handleChangeLength={(dataKey) => this.setState((prevState) => ({...prevState, pageCartonOutDetailsDispLen: dataKey}))}
                    displayLength={this.state.pageCartonOutDetailsDispLen}
                    page={this.state.pageCartonOutDetails}
                    total={this.state.selectedCartonOutProducts.length}
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
                  onInputChange={this.onHistoryInputChange}
                  value={this.state.historyAutocompleteFilter}
                  onSearchClick={this.refreshWhMovOps}
                />

                <FormGroup controlId="radioList">
                    <ControlLabel>Filtrer par: </ControlLabel>
                    <RadioGroup value={this.state.historyFilterType} name="radioList" onChange={(v) => this.setState(prevState => ({...prevState, historyFilterType: v}))} inline>
                      <Radio value="whmov_ref" checked={true}>Ref déplacement</Radio>
                      <Radio value="whmov_carton">Ref carton</Radio>
                      <Radio value="whmov_old_place">Emplacement initial</Radio>
                      <Radio value="whmov_new_place">Emplacement final</Radio>
                    </RadioGroup>
                  </FormGroup>

                <DataTable
                  data={this.sortData(this.state.cartonMoveHistory)}
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
                   displayLength={this.state.historyPageDispLen}
                   page={this.state.pageHistory}
                   total={this.state.historyTotal}
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
                    moveHistory={this.state.selectedCartonHistory ? this.state.selectedCartonHistory : []}
                    columnHistorique={columnCartonHistorique}
                    closeModal={() => this.closeModal('cartonHistorique')}
                  />
                </Drawer>

        </Frame>
    );
  }
}

export default Stock;

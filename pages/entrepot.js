import React, { Component } from 'react';
import 'rsuite/lib/styles/index.less';
import '../static/css/dataTable.less';

import {Panel, Modal, IconButton, Icon, Alert} from "rsuite";

import Frame from '../components/_shared/frame'
import HeaderTitle from '../components/_shared/headerTitle'
import DataTable from '../components/_shared/dataTable'

//ACTION BUTTON
import Toolbar from '../components/_shared/toolbar'
import DeleteButton from '../components/_shared/deleteButton'

//FILTER & SEARCH
import CustomFilter from '../components/datatable/customFilter';

//MODAL
import PlaceModal from '../components/modal/placeModal'
import CatalogueModal from '../components/modal/catalogueModal'
import InputModal from '../components/modal/inputModal'
import ConfirmModal from '../components/_shared/confirmModal'

//Static Data for NavBar Column DataTable
import NavBar from '../components/_shared/navBar'
import entrepotNavbar from "../static/navbar/entrepotNavbar";

//Static Data for Receipt Column DataTable
import columnPlace from "../static/datatable/columnPlace";
import columnMarque from "../static/datatable/columnMarque";
import columnFournisseur from "../static/datatable/columnFournisseur";
import columnCatalogue from "../static/datatable/columnCatalogue";
import {generateBarcodesPdf} from "../utils/barcode"

// ******** FAKE DATA TO CHANGE ********
import receiptFilter from '../static/data/filter.js'

// ******** Import needed services from the submodule to request the REST API ********
import {BrandService, PlaceService, ProviderService, ProductService} from "../services/main.bundle"
import { getToken } from "../utils/token"

class Entrepot extends React.Component {

  constructor(props)
  {
    //Call component super class constructor
    super(props);

    this.state = {
      show: false,
      receipt:true,
      editing: false,
      moreActions: false,
      activeButton: false, //active button when input not null
      active: 1,
      entrepotNavbar,
      placeList: [],
      brandList: [],
      productList: [],
      providerList: [],
      catalogExcelFile: null,
      marque: false,
      catalogue: false,
      place: false,
      fournisseur: false,
      delete: false, //delete confirm modal
      brandModalInputValue: "",
      placeModalInputValue: "",
      providerModalInputValue: "",
      checkedKeys: [], //checkbox
      displayLength: 100, //pagination
      loading: false, //pagination
      page: 1, //pagination,
      brandsAutocompleteFilter: "",
      providersAutocompleteFilter: "",
      placesAutocompleteFilter: "",
      catalogAutocompleteFilter: ""
    }

    this.handleBrandInputValueChange = this.handleBrandInputValueChange.bind(this);
    this.handlePlaceInputValueChange = this.handlePlaceInputValueChange.bind(this);
    this.handleProviderInputChange = this.handleProviderInputChange.bind(this);
    this.handleUploadCatalogExcelFile = this.handleUploadCatalogExcelFile.bind(this);
    this.handlePrintPlacesBarcodesBtnClick = this.handlePrintPlacesBarcodesBtnClick.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);

    // Autocomplete handlers
    this.onProvidersAutocompleteInputChange = this.onProvidersAutocompleteInputChange.bind(this);
    this.onBrandsAutocompleteInputChange = this.onBrandsAutocompleteInputChange.bind(this);
    this.onPlacesAutocompleteChange = this.onPlacesAutocompleteChange.bind(this);
    this.onCatalogAutocompleteChange = this.onCatalogAutocompleteChange.bind(this);
  }

  handlePrintPlacesBarcodesBtnClick()
  {
    const places = this.state.placeList.filter((place) => this.state.checkedKeys.indexOf(place.id) !== -1)
                                      .map(place => ({toBarcode: place.place}))

    generateBarcodesPdf(places);

    //reset checkbow after action
    this.setState({
      checkedKeys: []
    })
  }

  refreshCatalog()
  {
    this.productService.readAll().then((response) => {
      this.setState((prevState) => ({...prevState, checkedKeys: [], productList: response.data.map((product) => ({ id: product.id, product: product.name, refCode: product.refCode, barcode: product.eanCode, brand: product.brand.name}))}));
    }, error => Alert.warning(error.message, 2000));
  }

  refreshBrandsList()
  {
    this.brandService.readAll("join=products").then((response) => {
      console.log(response.data);
      // Convert the successfully retrieved data and convert the array to be 'datable compliant'
      this.setState((prevState) => ({...prevState, checkedKeys: [], brandList: response.data.map((brand) => ({ id: brand.id, marque: brand.name, product: brand.products.length}))}));
    }, (error) => Alert.warning(error.message, 2000));
  }

  refreshPlacesList()
  {
    this.placeService.readAll().then((response) => {
      console.log(response.data);
      // Convert the successfully retrieved data and convert the array to be 'datable compliant'
      this.setState((prevState) => ({...prevState, checkedKeys: [], placeList: response.data.map((place) => ({ id: place.id, place: place.refCode}))}));
    }, (error) => Alert.warning(error.message, 2000));
  }

  refreshProvidersList()
  {
    this.providerService.readAll().then((response) => {
      console.log(response.data);
      // Convert the successfully retrieved data and convert the array to be 'datable compliant'
      this.setState((prevState) => ({...prevState, checkedKeys: [], providerList: response.data.map((provider) => ({ id: provider.id, supply: provider.name}))}));
    }, (error) => Alert.warning(error.message, 2000));
  }

  // Call to API request in this lifecycle hook (triggered when component get mounted on the DOM)
  componentDidMount()
  {
    const token = getToken();

    if (!token)
      Router.push("/");

    // Services instantiation
    this.brandService = new BrandService(token);
    this.placeService = new PlaceService(token);
    this.providerService = new ProviderService(token);
    this.productService = new ProductService(token);

    this.refreshBrandsList();
    this.refreshCatalog()
    this.refreshProvidersList();
    this.refreshPlacesList();
  }

  deleteMultipleEntities(service, refreshFunction)
  {
    let deletePromises = [];

    this.state.checkedKeys.forEach(key => {
      let promise = service.delete(key);

      promise.then((deleteResult) => console.log(deleteResult))
              .catch(e => Alert.warning(e.message, 2000));

      deletePromises.push(promise);
    });

    Promise.all(deletePromises).finally(() => {
      console.log("all delete complete close modal");
      this.closeModal('delete');
      refreshFunction();
    });
  }

  deleteSelectedBrands()
  {
    console.log("delete selected brands");
    this.deleteMultipleEntities(this.brandService, this.refreshBrandsList.bind(this));
  }

  deleteSelectedProviders()
  {
    console.log("delete selected providers");
    this.deleteMultipleEntities(this.providerService, this.refreshProvidersList.bind(this));
  }

  deleteSelectedPlaces()
  {
    console.log("delete selected places");
    this.deleteMultipleEntities(this.placeService, this.refreshPlacesList.bind(this));
  }

  // ******************** MODALS ***********************

  handleConfirm()
  {
    console.log(this.state.active)
    // Which active page ? to delete call to the correct service to delete the corresponding rows in the database
    switch (this.state.active)
    {
      // place
      case 1: this.deleteSelectedPlaces()
      break;

      // cartons in stock
      case 2: this.deleteSelectedBrands()
      break;

      // cartons out stock
      case 3: this.deleteSelectedProviders()
      break;
    }
  }

  handleUploadCatalogExcelFile(value)
  {
    this.setState((prevState) => ({...prevState, catalogExcelFile: value}))

    //control if input null, disabled the button
    if(value === '') {
      this.setState({
        activeButton: false
      })
    } else {
      this.setState({
        activeButton: true
      })
    }
  }

  handleBrandInputValueChange(value)
  {
    this.setState((prevState) => ({...prevState, brandModalInputValue: value}))

    //control if input null, disabled the button
    if(value === '') {
      this.setState({
        activeButton: false
      })
    } else {
      this.setState({
        activeButton: true
      })
    }
  }

  handlePlaceInputValueChange(value)
  {
    this.setState((prevState) => ({...prevState, placeModalInputValue: value, activeButton: true}))

      //control if input null, disabled the button
      if(value === '') {
        this.setState({
          activeButton: false
        })
      } else {
        this.setState({
          activeButton: true
        })
      }
  }

  handleProviderInputChange(value)
  {
    this.setState((prevState) => ({...prevState, providerModalInputValue: value, activeButton: true}))

    //control if input null, disabled the button
    if(value === '') {
      this.setState({
        activeButton: false
      })
    } else {
      this.setState({
        activeButton: true
      })
    }
  }

  openModal(type) {
    switch (type) {
      case 'place' :
        this.setState({place: !this.state.show, activeButton: false});
        break;
      case 'marque' :
        this.setState({marque: !this.state.show, activeButton: false});
        break;
      case 'fournisseur' :
        this.setState({fournisseur: !this.state.show, activeButton: false});
        break;
      case 'catalogue' :
        this.setState({catalogue: !this.state.show, activeButton: false});
        break;
      case 'delete' :
        this.setState({delete: !this.state.show});
        break;
      };
  };

  validateModal(type)
  {
    switch (type) {
      case 'place':
        this.createPlace();
        break;
      case 'marque' :
        this.createBrand();
        break;
      case 'fournisseur' :
        this.createProvider();
        break;
      case 'catalogue' :
        this.importExcel();
        break;
      };
  }

  closeModal(type) {
    switch (type) {
      case 'place' :
        this.setState({place: this.state.show, activeButton: false});
        break;
      case 'marque' :
        this.setState({marque: this.state.show, activeButton: false});
        break;
      case 'fournisseur' :
        this.setState({fournisseur: this.state.show, activeButton: false});
        break;
      case 'catalogue' :
        this.setState({catalogue: this.state.show, activeButton: false});
        break;
      case 'delete' :
        this.setState({delete: this.state.show});
        break;
      };
  }

  //BUTTON ACTION
  handleSelect = (activeKey) => {
    this.setState({
      active: activeKey,
      checkedKeys: [] //reset checkbox
    })
  }

  //CHECKBOX
  // TO DO : CHANGE DATA "receiptList"
  handleCheckAll = (value, checked) => {
    const checkedKeys = (checked && this.state.active === 1) ? this.state.placeList.map(item => item.id)
    : (checked && this.state.active === 2) ? this.state.brandList.map(item => item.id)
    : (checked && this.state.active === 3) ? this.state.providerList.map(item => item.id)
    : (checked && this.state.active === 4) ? this.state.productList.map(item => item.id)
    : [];
    this.setState({
      checkedKeys
    });
    console.log("checkedKeys", checkedKeys)
    console.log("ACTIVE", this.state.active)
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
  handleSortColumn = (sortColumn, sortType) => {
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

  //EDIT CELL
  handleChange = (id, key, value) => {

    const { placeList, brandList, providerList } = this.state;

    const nextData = (this.state.active === 1) ? Object.assign([], placeList)
    : (this.state.active === 2) ? Object.assign([], brandList)
    : (this.state.active === 3) ? Object.assign([], providerList)
    : [];

    console.log(id)

    nextData.find(item => item.id === id)[key] = value;
    this.setState({
      nextData
    });
  }

  handleEditState = (rowData) => {

    const { placeList, brandList, providerList } = this.state;

    console.log(rowData)
    const nextData = (this.state.active === 1) ? Object.assign([], placeList)
    : (this.state.active === 2) ? Object.assign([], brandList)
    : (this.state.active === 3) ? Object.assign([], providerList)
    : [];

    const activeItem = nextData.find(item => item.id === rowData.id);

    activeItem.status = activeItem.status ? null : 'EDIT';

    if (activeItem.status === null)
    {
      // Which page is currently active ?
      switch (this.state.active)
      {
        case 1:{
          console.log("update place");
          this.placeService.update(rowData.id, {refCode: rowData.place})
                            .then(result => console.log(result))
                            .catch(e => Alert.error(e.message, 2000));
        }
        break;
        case 2:{
          console.log("Update brand");
          this.brandService.update(rowData.id, {name: rowData.marque})
                            .then(result => console.log(result))
                            .catch(e => Alert.error(e.message, 2000));
        }
        break;
        case 3:{
          console.log("update provider");
          this.providerService.update(rowData.id, {name: rowData.supply})
                              .then(result => console.log(result))
                              .catch(e => Alert.error(e.message, 2000));
        }
        break;
      }
    }

    console.log(nextData);

    this.setState({
      nextData
    });
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

  importExcel(){
    console.log(this.state.catalogExcelFile.blobFile);
    this.productService.importExcelFile(this.state.catalogExcelFile.blobFile).then((products) => {
      this.refreshCatalog();
      this.closeModal("catalogue");
    }, error => Alert.error(error.message, 5000));
  }

  createBrand()
  {
    this.brandService.create({name: this.state.brandModalInputValue.toUpperCase()}).then((response)=>{
      this.refreshBrandsList();
      this.closeModal('marque');
    }, error => Alert.error(error.message, 5000));
  }

  createPlace()
  {
    this.placeService.create({refCode: this.state.placeModalInputValue}).then((response)=>{
      // Insert new brand in brand list
      this.refreshPlacesList();
      this.closeModal('place');
    }, error => Alert.error(error.message, 5000));
  }

  createProvider()
  {
    this.providerService.create({name: this.state.providerModalInputValue.toUpperCase()}).then((response)=>{
      this.refreshProvidersList();
      this.closeModal('fournisseur');
    }, error => Alert.error(error.message, 5000));
  }

  // Filters
  // For brands list
  applyBrandsFilters(brandsList)
  {
    let filteredBrandsList = brandsList;

    if (this.state.brandsAutocompleteFilter)
    {
      filteredBrandsList = filteredBrandsList.filter(item => item.marque.includes(this.state.brandsAutocompleteFilter.toUpperCase()));
    }

    return filteredBrandsList;
  }

  // For providers
  applyProvidersFilters(providersList)
  {
    let filteredProvidersList = providersList;

    if (this.state.providersAutocompleteFilter)
    {
      filteredProvidersList = filteredProvidersList.filter(item => item.supply.includes(this.state.providersAutocompleteFilter.toUpperCase()));
    }

    return filteredProvidersList;
  }

  // For places
  applyPlacesFilters(placesList)
  {
    let filteredPlacesList = placesList;

    if (this.state.placesAutocompleteFilter)
    {
      filteredPlacesList = filteredPlacesList.filter(item => item.place.includes(this.state.placesAutocompleteFilter.toUpperCase()));
    }

    return filteredPlacesList;
  }

  applyCatalogFilters(productsList)
  {
    let filteredProductsList = productsList;

    if (this.state.catalogAutocompleteFilter)
    {
      filteredProductsList = filteredProductsList
                              .filter(item => item.product.includes(this.state.catalogAutocompleteFilter.toUpperCase()) ||
                                              item.refCode.includes(this.state.catalogAutocompleteFilter.toUpperCase()) ||
                                              item.barcode.includes(this.state.catalogAutocompleteFilter) ||
                                              item.brand.includes(this.state.catalogAutocompleteFilter.toUpperCase()));
    }

    return filteredProductsList;
  }

  // Autocomplete handlers
  onPlacesAutocompleteChange(value)
  {
    console.log(value)
    this.setState(prevState => ({...prevState, placesAutocompleteFilter: value}));
  }

  onBrandsAutocompleteInputChange(value)
  {
    this.setState(prevState => ({...prevState, brandsAutocompleteFilter: value}));
  }

  onProvidersAutocompleteInputChange(value)
  {
    this.setState(prevState => ({...prevState, providersAutocompleteFilter: value}));
  }

  onCatalogAutocompleteChange(value)
  {
    console.log(value);
    this.setState(prevState => ({...prevState, catalogAutocompleteFilter: value}));
  }

  render() {
    const {active, checkedKeys} = this.state;

    const currentNav = this.state.active

    //CHECBKOX
    let checked = false;
    let indeterminate = false;

    if (checkedKeys.length === 0) {
      checked = false;
    } else if (checkedKeys.length === ((currentNav === 1 && this.state.placeList.length) || (currentNav === 2 && this.state.brandList.length) || (currentNav === 3 && this.state.providerList.length) || (currentNav === 4 && this.state.productList.length))) {
      checked = true;
    } else if (checkedKeys.length > 0 && checkedKeys.length < ((currentNav === 1 && this.state.placeList.length) || (currentNav === 2 && this.state.brandList.length) || (currentNav === 3 && this.state.providerList.length) || (currentNav === 4 && this.state.productList.length))) {
      indeterminate = true;
    }

    // Apply filters to lists
    let brandsList = this.applyBrandsFilters(this.state.brandList);
    let providersList = this.applyProvidersFilters(this.state.providerList);
    let placesList = this.applyPlacesFilters(this.state.placeList);
    let productList = this.applyCatalogFilters(this.state.productList);

    return (
        <Frame activeKey="3">
          <HeaderTitle
          className="header-frame"
            title="Gestion de l'Entrepôt"
            subtitle="Les différentes catégories pour gérer la marchandise"
          />
          <Panel>
              <div style={{display: 'flex'}}>
                <NavBar
                  appearance="subtle"
                  active={active}
                  onSelect={this.handleSelect}
                  items={entrepotNavbar}
                />
              </div>
              {active === 1 && (
              <>
                <div className="table-toolbar">
                  <HeaderTitle
                      className="inner-left"
                      title={"Les Emplacements"}
                      subtitle={"Visualiser les emplacements ou créer-en de nouveaux."}
                    />
                  {(!indeterminate && !checked) && (
                  <Toolbar
                    data={receiptFilter}
                    primaryButton="Nouveau Emplacement"
                    importModal={() => this.openModal('place')}
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
                      onClick={this.handlePrintPlacesBarcodesBtnClick}
                    />
                    </>
                  )}
                </div>
                <CustomFilter
                  //search
                  placeholder="Rechercher par place..."
                  dataSearch={placesList.map(item => ({value: item.place, label: item.place}))} //TO DO, autocomplete data
                  //onFilter={}
                  onAutocompleteInputChange={this.onPlacesAutocompleteChange}
                />
                <DataTable
                  data={this.sortData(this.nextPage(placesList))}
                  column={columnPlace}
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
                  total={placesList.length}
                  //edit et action cell
                  editing={!this.state.editing}
                  moreActions={this.state.moreActions}
                  handleChange={this.handleChange}
                  handleEditState={this.handleEditState}
                />
              </>
            )}
            {active === 2 && (
              <>
                <div className="table-toolbar">
                  <HeaderTitle
                      className="inner-left"
                      title={"Les Marques"}
                      subtitle={"Visualiser les marques ou créer-en de nouvelles."}
                    />
                  {(!indeterminate && !checked) &&(
                  <Toolbar
                    data={receiptFilter}
                    primaryButton="Nouvelle Marque"
                    //deleteModal={() => this.openModal('delete')}
                    importModal={() => this.openModal('marque')}
                  />)}
                  {(indeterminate || checked) && (
                    <IconButton
                      style={{marginTop: '20px', marginRight:'5px'}}
                      className="inner-right"
                      color="red"
                      icon={<Icon icon="trash-o" />}
                      appearance="ghost"
                      onClick={() => this.openModal('delete')}
                    />
                  )}
                </div>
                <CustomFilter
                  //search
                  placeholder="Rechercher par marque..."
                  dataSearch={brandsList.map(item => ({value: item.marque, label: item.marque}))} //TO DO, autocomplete data
                  onAutocompleteInputChange={this.onBrandsAutocompleteInputChange}
                  //onFilter={}
                />
                <DataTable
                  data={this.sortData(this.nextPage(brandsList))}
                  //column
                  column={columnMarque}
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
                  total={brandsList.length}
                  //edit et action cell
                  editing={!this.state.editing}
                  moreActions={this.state.moreActions}
                  handleChange={this.handleChange}
                  handleEditState={this.handleEditState}
                />
              </>
            )}
            {active === 3 && (
              <>
                <div className="table-toolbar">
                  <HeaderTitle
                      className="inner-left"
                      title={"Les Fournisseurs"}
                      subtitle={"Visualiser les fournisseurs ou créer-en de nouvelles."}
                    />
                  {(!indeterminate && !checked) &&(
                  <Toolbar
                    data={receiptFilter}
                    primaryButton="Nouveau Fournisseur"
                    //deleteModal={() => this.openModal('delete')}
                    importModal={() => this.openModal('fournisseur')}
                  />)}
                  {(indeterminate || checked) && (
                    <IconButton
                      style={{marginTop: '20px', marginRight:'5px'}}
                      className="inner-right"
                      color="red"
                      icon={<Icon icon="trash-o" />}
                      appearance="ghost"
                      onClick={() => this.openModal('delete')}
                    />
                  )}
                </div>
                <CustomFilter
                  //search
                  placeholder="Rechercher par fournisseur..."
                  dataSearch={providersList.map(item => ({value: item.supply, label: item.supply}))} //TO DO, autocomplete data
                  onAutocompleteInputChange={this.onProvidersAutocompleteInputChange}
                />
                <DataTable
                  data={this.sortData(this.nextPage(providersList))}
                  //column
                  column={columnFournisseur}
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
                  total={providersList.length}
                  //edit et action cell
                  editing={!this.state.editing}
                  moreActions={this.state.moreActions}
                  handleChange={this.handleChange}
                  handleEditState={this.handleEditState}
                />
              </>
            )}
            {active === 4 && (
              <>
                <div className="table-toolbar">
                  <HeaderTitle
                      className="inner-left"
                      title={"Le Catalogue"}
                      subtitle={"Visualiser les produits du catalogue"}
                    />
                  {(!indeterminate && !checked) && (
                  <Toolbar
                    data={receiptFilter}
                    primaryButton="Catalogue"
                    //deleteModal={() => this.openModal('delete')}
                    importModal={() => this.openModal('catalogue')}
                  />)}
                  {(indeterminate || checked) && (
                    <IconButton
                      style={{marginTop: '20px', marginRight:'5px'}}
                      className="inner-right"
                      color="red"
                      icon={<Icon icon="trash-o" />}
                      appearance="ghost"
                      onClick={() => this.openModal('delete')}
                    />
                  )}
                </div>
                <CustomFilter
                  //search
                  placeholder="Rechercher par produit, marque, barcode..."
                  //dataSearch={"todo"} //TO DO, autocomplete data
                  onAutocompleteInputChange={this.onCatalogAutocompleteChange}
                />
                <DataTable
                  data={this.sortData(this.nextPage(productList))}
                  //column
                  column={columnCatalogue}
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
                  total={productList.length}
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
                      closeModal={() => this.closeModal('delete')}
                      handleConfirm={this.handleConfirm}
                    />
                  </Modal>
                </div>

                {/* MODAL ADD NEW PLACE */}
                <div className="modal-container">
                  <Modal show={this.state.place} onHide={() => this.closeModal('place')} size="xs" backdrop="static">
                    <PlaceModal
                      text="J'importe mon fichier excel"
                      placeholder="A101"
                      secondaryButton="Annuler"
                      primaryButton="Créer le(s) Emplacement(s)"
                      onInputChange={this.handlePlaceInputValueChange}
                      validateModal= {() => this.validateModal('place')}
                      closeModal={() => this.closeModal('place')}
                      disabled={!this.state.activeButton}
                    />
                  </Modal>
                </div>

                {/* MODAL ADD NEW CATALOGUE */}
                <div className="modal-container">
                  <Modal show={this.state.catalogue} onHide={() => this.closeModal('catalogue')} size="xs" backdrop="static">
                    <CatalogueModal
                      text="J'importe mon fichier excel"
                      secondaryButton="Annuler"
                      primaryButton="Importer le catalogue"
                      closeModal={() => this.closeModal('catalogue')}
                      validateModal= {() => this.validateModal('catalogue')}
                      handleUploadExcelFile= {this.handleUploadCatalogExcelFile}
                      disabled={!this.state.activeButton} //if input null disabled the button
                    />
                  </Modal>
                </div>

                {/* MODAL ADD NEW MARQUE */}
                <div className="modal-container">
                  <Modal show={this.state.marque} onHide={() => this.closeModal('marque')} size="xs" backdrop="static">
                    <InputModal
                      modalType={this.state.active === 2 ? 'brand' : null}
                      title="Nouvelle Marque"
                      subtitle="Ajouter une nouvelle marque"
                      icon="tag"
                      text="Quelle est le nom de la marque ?"
                      placeholder="marque"
                      secondaryButton="Annuler"
                      primaryButton="Créer la nouvelle marque"
                      value={this.state.brandModalInputValue}
                      onInputChange={this.handleBrandInputValueChange}
                      validateModal= {() => this.validateModal('marque')}
                      closeModal={() => this.closeModal('marque')}
                      disabled={!this.state.activeButton} //if input null disabled the button
                    />
                  </Modal>
                </div>

                  {/* MODAL ADD NEW fournisseur */}
                  <div className="modal-container">
                  <Modal show={this.state.fournisseur} onHide={() => this.closeModal('fournisseur')} size="xs" backdrop="static">
                    <InputModal
                      modalType={this.state.active === 3 ? 'supplier' : null}
                      title="Nouveau Fournisseur"
                      subtitle="Ajouter un nouveau fournisseur"
                      icon="globe2"
                      text="Quel est le fournisseur ?"
                      placeholder="fournisseur"
                      secondaryButton="Annuler"
                      primaryButton="Créer Nouveau Fournisseur"
                      value={this.state.providerModalInputValue}
                      onInputChange={this.handleProviderInputChange}
                      validateModal= {() => this.validateModal('fournisseur')}
                      closeModal={() => this.closeModal('fournisseur')}
                      disabled={!this.state.activeButton}
                    />
                  </Modal>
                </div>


        </Frame>
    );
  }
}

export default Entrepot;

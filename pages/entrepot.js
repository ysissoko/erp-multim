import React, { Component } from 'react';
import 'rsuite/lib/styles/index.less';
import '../static/css/dataTable.less';

import {Panel, Modal, IconButton, Icon, Alert, Loader, FormGroup, ControlLabel, RadioGroup, Radio} from "rsuite";

import Frame from '../components/_shared/frame'
import HeaderTitle from '../components/_shared/headerTitle'
import DataTable from '../components/_shared/dataTable'

//ACTION BUTTON
import Toolbar from '../components/_shared/toolbar'

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

// Filters for datatables
import receiptFilter from '../static/data/filter.js'

// ******** Import needed services from the submodule to request the REST API ********
import {BrandService, PlaceService, ProviderService, ProductService} from "../services/main"
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
      placesExcelFile: null,
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
      catalogFilterType: 'product_name',
      brandModalInputValue: "",
      placeModalInputValue: "",
      providerModalInputValue: "",
      checkedKeys: [], //checkbox
      productsPageDispLen: 100, //pagination
      brandsPageDispLen: 100, //pagination
      placesPageDispLen: 100, //pagination
      providersPageDispLen: 100, //pagination
      loading: false, //pagination,
      onImportLoading: false,
      pagePlaces: 1, //pagination,
      pageProviders: 1, //pagination,
      pageBrands: 1, //pagination,
      pageProducts: 1, //pagination,
      // Pagination: total number of entries. Retrieve entries chunk by chunk from the backend
      productsTotal: 0,
      brandsTotal: 0,
      placesTotal: 0,
      providersTotal: 0,
      // Time out lorsque l'on tape dans la recherche pour eviter de faire la requête à chaque lettre entrée
      brandsAutocompleteFilter: "",
      providersAutocompleteFilter: "",
      placesAutocompleteFilter: "",
      catalogAutocompleteFilter: "",
      importInProgress: false
    }

    this.handleBrandInputValueChange = this.handleBrandInputValueChange.bind(this);
    this.handlePlaceInputValueChange = this.handlePlaceInputValueChange.bind(this);
    this.handleProviderInputChange = this.handleProviderInputChange.bind(this);
    this.handleUploadCatalogExcelFile = this.handleUploadCatalogExcelFile.bind(this);
    this.handlePlacesUploadExcelFile = this.handlePlacesUploadExcelFile.bind(this);
    this.handlePrintPlacesBarcodesBtnClick = this.handlePrintPlacesBarcodesBtnClick.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);

    // Autocomplete handlers
    this.onProvidersInputChange = this.onProvidersInputChange.bind(this);
    this.onBrandsInputChange = this.onBrandsInputChange.bind(this);
    this.onPlacesInputChange = this.onPlacesInputChange.bind(this);
    this.onCatalogInputChange = this.onCatalogInputChange.bind(this);

    this.refreshCatalog = this.refreshCatalog.bind(this);
    this.refreshBrandsList = this.refreshBrandsList.bind(this);
    this.refreshPlacesList = this.refreshPlacesList.bind(this);
    this.refreshProvidersList = this.refreshProvidersList.bind(this);
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

  componentDidUpdate(prevProps, prevState)
  {
    if (this.state.pageProviders !== prevState.pageProviders
       || this.state.providersPageDispLen !== prevState.providersPageDispLen)
    {
      this.refreshProvidersList();
    }

    if (this.state.pageBrands !== prevState.pageBrands
       || this.state.brandsPageDispLen !== prevState.brandsPageDispLen)
    {
      this.refreshBrandsList();
    }

    if (this.state.pageProducts !== prevState.pageProducts
       || this.state.productsPageDispLen !== prevState.productsPageDispLen)
    {
      this.refreshCatalog();
    }

    if (this.state.pagePlaces !== prevState.pagePlaces
       || this.state.placesPageDispLen !== prevState.placesPageDispLen)
    {
      this.refreshPlacesList();
    }
  }

  refreshCatalog()
  {
    this.setState({
      loading: true
    });

    this.productService.filterProduct({
      type: this.state.catalogFilterType,
      searchTerm: this.state.catalogAutocompleteFilter.trim(),
      page: this.state.pageProducts,
      limit: this.state.productsPageDispLen
    })
    .then(response => {
      const pages = response.data;
      this.updateCatalog(pages);
    })
  }

  refreshBrandsList()
  {
    this.setState({
      loading: true
    });

    this.brandService.filterBrand({
      searchTerm: this.state.brandsAutocompleteFilter.trim(),
      page: this.state.pageBrands,
      limit: this.state.brandsPageDispLen
    })
    .then(response => {
      const pages = response.data;
      this.updateBrandsList(pages);
    })
  }

  refreshPlacesList()
  {
    this.setState({
      loading: true
    });

    this.placeService.filterPlace({
      searchTerm: this.state.placesAutocompleteFilter.trim(),
      page: this.state.pagePlaces,
      limit: this.state.placesPageDispLen
    })
    .then(response => {
      const pages = response.data;
      this.updatePlacesList(pages);
    })
  }

  refreshProvidersList()
  {
    this.setState({
      loading: true
    });

    this.providerService.filterProvider({
      searchTerm: this.state.providersAutocompleteFilter.trim(),
      page: this.state.pageProviders,
      limit: this.state.providersPageDispLen
    })
    .then(response => {
      const pages = response.data;
      this.updateProvidersList(pages);
    })
  }

  updateBrandsList(pages)
  {
    this.setState((prevState) => ({
      ...prevState, 
      brandsTotal: pages.total, 
      loading: false, 
      checkedKeys: [], 
      brandList: pages.data.map((brand) => ({ id: brand.id, marque: brand.name, product: brand.productsCount }))
    }));
  }

  updateCatalog(pages)
  {
    this.setState((prevState) => ({
      ...prevState, 
      productsTotal: pages.total, 
      loading: false, 
      checkedKeys: [], 
      productList: pages.data.map((product) => ({ id: product.id, product: product.name, refCode: product.refCode, barcode: product.eanCode, brand: product.brand.name}))
    }));
  }

  updateProvidersList(pages)
  {
    this.setState((prevState) => ({
      ...prevState, 
      loading: false,
      providersTotal: pages.total, 
      checkedKeys: [], 
      providerList: pages.data.map((provider) => ({ id: provider.id, supply: provider.name}))
    }));
  }

  updatePlacesList(pages)
  {
    this.setState((prevState) => ({
      ...prevState, 
      placesTotal: pages.total, 
      loading: false, 
      checkedKeys: [], 
      placeList: pages.data.map((place) => ({ id: place.id, place: place.refCode }))}));
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

  deleteSelectedProducts()
  {
    console.log("delete selected products");
    this.deleteMultipleEntities(this.productService, this.refreshCatalog.bind(this));
  }

  // ******************** MODALS ***********************

  handleConfirm()
  {
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

      // products
      case 4: this.deleteSelectedProducts()
      break;
    }
  }

  handleUploadCatalogExcelFile(blobs)
  {
    const blob = blobs[0];

    //control if input null, disabled the button
    if(!blob || !blob.blobFile)
    {
      this.setState({
        activeButton: false,
        catalogExcelFile: null
      });
    }
    else
    {
      this.setState((prevState) => ({...prevState, catalogExcelFile: blob.blobFile, activeButton: true}));
    }
  }

  handlePlacesUploadExcelFile(blobs)
  {
    const blob = blobs[0];

    //control if input null, disabled the button
    if(!blob || !blob.blobFile) {
      this.setState({
        activeButton: false,
        placesExcelFile: false
      })
    }
    else
    {
      this.setState((prevState) => ({...prevState, placesExcelFile: blob.blobFile, activeButton: true}))
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
      case 'places':
          this.importExcelPlaces();
          break;
      case 'marque' :
        this.createBrand();
        break;
      case 'fournisseur' :
        this.createProvider();
        break;
      case 'catalogue' :
        if (!this.state.importInProgress) this.importExcel();
        break;
      };
  }

  closeModal(type) {
    switch (type) {
      case 'place' :
        this.setState({place: this.state.show, placesExcelFile: null, activeButton: false});
        break;
      case 'marque' :
        this.setState({marque: this.state.show, activeButton: false});
        break;
      case 'fournisseur' :
        this.setState({fournisseur: this.state.show, activeButton: false});
        break;
      case 'catalogue' :
        this.setState({catalogue: this.state.show, catalogExcelFile: null, activeButton: false});
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

    const { placeList, brandList, providerList, productList } = this.state;

    const nextData = (this.state.active === 1) ? Object.assign([], placeList)
    : (this.state.active === 2) ? Object.assign([], brandList)
    : (this.state.active === 3) ? Object.assign([], providerList)
    : (this.state.active === 4) ? Object.assign([], productList)
    : [];

    nextData.find(item => item.id === id)[key] = value;
    
    this.setState({
      nextData
    });
  }

  handleEditState = (rowData) => {

    const { placeList, brandList, providerList, productList } = this.state;

    const nextData = (this.state.active === 1) ? Object.assign([], placeList)
    : (this.state.active === 2) ? Object.assign([], brandList)
    : (this.state.active === 3) ? Object.assign([], providerList)
    : (this.state.active === 4) ? Object.assign([], productList)
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
        case 4:{
          console.log("update catalog product");
          this.productService.update(rowData.id, {name: rowData.product})
                              .then(result => console.log(result))
                              .catch(e => Alert.error(e.message, 2000));
        }
        break;
      }
    }

    this.setState({
      nextData
    });
  }

  //PAGINATION
  handleChangePage = (dataKey) => {
    console.log("change page" + dataKey)
    // places
    if (this.state.active === 1)
    {
      this.setState({ pagePlaces: dataKey });
    }

    // brands
    if (this.state.active === 2)
    {
      this.setState({ pageBrands: dataKey });
    }

    // providers
    if (this.state.active === 3)
    {
      this.setState({ pageProviders: dataKey });
    }

    // products
    if (this.state.active === 4)
    {
      this.setState({ pageProducts: dataKey });
    }
  }

  handleChangeLength = (dataKey) => {
    if(this.state.active === 1)
      this.setState({ pagePlaces: 1,  placesPageDispLen: dataKey });
    if(this.state.active === 2)
      this.setState({ pageBrands: 1,  brandsPageDispLen: dataKey });
    if(this.state.active === 3)
      this.setState({ pageProviders: 1,  providersPageDispLen: dataKey });
    if(this.state.active === 4)
      this.setState({ pageProducts: 1,  productsPageDispLen: dataKey });
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

  importExcel()
  {
    this.setState(prevState => ({...prevState, importInProgress: true, onImportLoading: true}));

    this.productService.importExcelFile(this.state.catalogExcelFile).then((products) => {
      this.setState(prevState => ({...prevState, importInProgress: false, onImportLoading: false}));
      this.refreshCatalog();
      this.closeModal("catalogue");
      Alert.success("Import OK");
    }).catch(error => {
      this.setState(prevState => ({...prevState, importInProgress: false, onImportLoading: false}));
      if (error.response) Alert.error(error.response.data.message, 5000)
      else Alert.error(error.message);
    });
  }

  importExcelPlaces(){
    this.placeService.importExcelFile(this.state.placesExcelFile).then((places) => {
      this.refreshPlacesList();
      this.closeModal("place");
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

  // Autocomplete handlers
  onPlacesInputChange(value)
  {
      this.setState(prevState => ({...prevState, placesAutocompleteFilter: value}));
  }

  onBrandsInputChange(value)
  {
      this.setState(prevState => ({...prevState, brandsAutocompleteFilter: value}));
  }

  onProvidersInputChange(value)
  {
    this.setState(prevState => ({...prevState, providersAutocompleteFilter: value}));
  }

  onCatalogInputChange(value)
  {
    this.setState(prevState => ({...prevState, catalogAutocompleteFilter: value}));
  }

  exportProductBarcodes()
  {
    const {checkedKeys} = this.state;
    let barcodes = [];

    for (let key of checkedKeys)
    {
      const product = this.state.productList.find(product => product.id === key);
      barcodes.push({toBarcode: product.barcode, additionnalTxt: [product.refCode, product.product /** product name */]});
    }

    if (barcodes.length > 0)
      generateBarcodesPdf(barcodes);
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
                  onInputChange={this.onPlacesInputChange}
                  value={this.state.placesAutocompleteFilter}
                  onSearchClick={this.refreshPlacesList} 
                />
                <DataTable
                  data={this.sortData(this.state.placeList)}
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
                  displayLength={this.state.placesPageDispLen}
                  page={this.state.pagePlaces}
                  total={this.state.placesTotal}
                  //edit et action cell
                  handleChange={this.handleChange}
                  handleEditState={this.handleEditState}
                  editing={true}
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
                  value={this.state.brandsAutocompleteFilter}
                  onInputChange={this.onBrandsInputChange}
                  onSearchClick={this.refreshBrandsList} 
                />
                <DataTable
                  data={this.sortData(this.state.brandList)}
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
                  displayLength={this.state.brandsPageDispLen}
                  page={this.state.pageBrands}
                  total={this.state.brandsTotal}
                  //edit et action cell
                  handleChange={this.handleChange}
                  handleEditState={this.handleEditState}
                  editing={true}
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
                  onInputChange={this.onProvidersInputChange}
                  onSearchClick={this.refreshProvidersList} 
                  value={this.state.providersAutocompleteFilter}
                />

                <DataTable
                  data={this.sortData(this.state.providerList)}
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
                  displayLength={this.state.providersPageDispLen}
                  page={this.state.pageProviders}
                  total={this.state.providersTotal}
                  //edit et action cell
                  handleChange={this.handleChange}
                  handleEditState={this.handleEditState}
                  editing={true}
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
                    <>
                    <IconButton
                      style={{marginTop: '20px', marginRight:'5px'}}
                      className="inner-right"
                      color="red"
                      icon={<Icon icon="trash-o" />}
                      appearance="ghost"
                      onClick={() => this.openModal('delete')}
                    />
                    <IconButton
                      style={{marginTop: '20px', marginRight:'5px'}}
                      className="inner-right"
                      color="yellow"
                      icon={<Icon icon="qrcode" />}
                      appearance="primary"
                      onClick={() => this.exportProductBarcodes()}
                    />
                    </>
                  )}
                </div>
                <CustomFilter
                  //search
                  placeholder="Rechercher par produit, marque, barcode..."
                  onInputChange={this.onCatalogInputChange}
                  value={this.state.catalogAutocompleteFilter}
                  onSearchClick={this.refreshCatalog} 
                />

                <FormGroup controlId="radioList">
                  <ControlLabel>Filtrer par: </ControlLabel>
                  <RadioGroup value={this.state.catalogFilterType} name="radioList" onChange={(v) => this.setState(prevState => ({...prevState, catalogFilterType: v}))} inline>
                    <Radio value="product_name" checked={true}>Nom produit</Radio>
                    <Radio value="product_ref">Ref produit</Radio>
                    <Radio value="product_brand">Marque</Radio>
                    <Radio value="product_ean">EAN</Radio>
                  </RadioGroup>
                </FormGroup>

                <DataTable
                  data={this.sortData(this.state.productList)}
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
                  displayLength={this.state.productsPageDispLen}
                  page={this.state.pageProducts}
                  total={this.state.productsTotal}                  
                  handleChange={this.handleChange}
                  handleEditState={this.handleEditState}
                  editing={true}
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
                      handleUploadExcelFile={this.handlePlacesUploadExcelFile}
                      placeholder="A101"
                      secondaryButton="Annuler"
                      primaryButton="Créer le(s) Emplacement(s)"
                      onInputChange={this.handlePlaceInputValueChange}
                      validateModal= {() => {
                        // Import excel file or create manually
                        if(this.state.placesExcelFile)
                          this.validateModal('places')
                        else
                          this.validateModal("place")
                      }}
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
                      disabled={this.state.importInProgress || !this.state.activeButton} //if input null disabled the button
                    />
                    {this.state.onImportLoading && (
                      <Loader vertical backdrop center speed="fast" size="md" content="Medium" content="loading..."/>
                    )}
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

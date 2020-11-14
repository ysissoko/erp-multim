import React, { Component } from 'react';
import 'rsuite/lib/styles/index.less';
import '../static/css/dataTable.less';

import {Panel, Modal, IconButton, Icon, Loader, Alert} from "rsuite";

import Frame from '../components/_shared/frame'
import HeaderTitle from '../components/_shared/headerTitle'
import HeaderTitleTagWhIn from '../components/_shared/headerTitleTagWhIn'
import DataTable from '../components/_shared/dataTable'
import DataTableTree from '../components/_shared/dataTableTree'

//ACTION BUTTON
import Toolbar from '../components/_shared/toolbar'
import ToolbarSmall from '../components/_shared/toolbarSmall';

//MODAL
import ReceiptModal from '../components/modal/receiptModal'
import DeliveryModal from '../components/modal/deliveryModal'
import InputModal from '../components/modal/inputModal'
import ConfirmModal from '../components/_shared/confirmModal'
import ResetModal from '../components/_shared/resetModal'
import ChoiceModal from '../components/modal/choiceModal'

//Static Data for NavBar Column DataTable
import NavBar from '../components/_shared/navBar'
import operationNavbar from "../static/navbar/operationNavbar";

//Static Data for Receipt Column DataTable
import columnReceipt from "../static/datatable/columnReceipt";
import columnDelivery from "../static/datatable/columnDelivery";
import columnWHIN from "../static/datatable/columnWHIN";
import columnWHOUTDrop from "../static/datatable/columnWHOUTDrop";
import columnWHOUTClassic from "../static/datatable/columnWHOUTClassic";

//Static Data For Details Page
import whinLabel from "../static/data/whinLabel";
import whoutLabel from "../static/data/whoutLabel";
//import whin from '../static/data/whin';

// Static Data for Filter Button
import receiptFilter from '../static/data/filter.js'
import filterReceipt from "../static/datatable/filterReceipt";
import filterDelivery from "../static/datatable/filterDelivery";

import {ProviderService, WhInOpService, CartonInService, WhOutOpService, CartonOutService} from "../services/main"
import {getFormattedDate, getTagByDeliveryStatus, getTagByReceiptStatus} from "../utils/date"
import CustomTagFilter from '../components/datatable/customTagFilter';
import HeaderTitleTagWhOut from '../components/_shared/headerTitleTagWhOut';
import Router from 'next/router';
import { getToken}  from "../utils/token"
import {getPaginatedData} from '../utils/pagination'
import {exportWhOutToPdf} from "../utils/whout-export-pdf"

const AUTOCOMPLETE_TIMEOUT = 100;

class Operation extends Component {

  constructor(props)
  {
    super(props);

    this.whOutAutocompleteTimeout = null;
    this.whInAutocompleteTimeout = null;

    this.state = {
      resetReceipts: false,
      resetDeliveries: false,
      show: false,
      receipt:true,
      moreActions: true, //actionCell
      onRowClicked: false, //onRowClick
      active: 1,
      activeButton: false, //button in modal
      onLoading: false, //loading icon in modal
      operationNavbar,
      providersList: [],
      receiptList: [],
      deliveriesList: [],
      rawReceiptList: [],
      rawDeliveryList: [],
      deliveryType: "classic",
      selectedWhInProductListDetails: [],
      selectedWhOutProductListDetails : [],
      selectedWhOutClassicProductListDetails: [],
      selectedReceipt: null,
      selectedDelivery: null,
      deliveryExcelFile: null,
      providerToCreate: null,
      numCartonsIn: 0,
      numCartonsOut: 0,
      whInRefCodeToCreate:"",
      filterReceipt, //button quick filter
      filterDelivery, //button quick filter
      receipt: false, //show navbar
      delivery: false, //show navbar
      delete: false,  //delete confirm modal
      checkedKeys: [], //checkbox
      whInPageDispLen: 100, //pagination
      whOutPageDispLen: 100, //pagination
      whInDetailsDispLen: 100,
      loading: false, //pagination
      pageWhIn: 1, //pagination
      pageWhOut: 1, //pagination
      pageWhInDetail: 1,
      whOutTotal: 0, //pagination
      whInTotal: 0, //pagination
      whInCartonsTotal: 0,
      dateRangeFilterWhIn: undefined,
      dateRangeFilterWhOut: undefined,
      dateRangeFilterCartonOut: undefined,
      whInStatusFilters: [],
      whOutStatusFilters: [],
      whInSearchTerm: "",
      whOutSearchTerm: "",
      whoutMissingProducts: false,
      whoutClassicMissingProducts: false,
      sortedExport: true,
      importInProgress: false,
      missingDeliveries: [],
      missingProductsDeliveryClassic: {}
    }

    this.handleCartonInputChange = this.handleCartonInputChange.bind(this);
    this.handleSelectProvider = this.handleSelectProvider.bind(this);
    this.handleInvoiceNumberChange = this.handleInvoiceNumberChange.bind(this);
    this.handleUploadDeliveryExcelFile = this.handleUploadDeliveryExcelFile.bind(this);
    this.handleCartonOutCountChange = this.handleCartonOutCountChange.bind(this);
    this.handleExportWhOutToExcel = this.handleExportWhOutToExcel.bind(this);
    this.handleExporWhoutClassicToExcel = this.handleExporWhoutClassicToExcel.bind(this);
    this.handleDeliveryTypeChange = this.handleDeliveryTypeChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleConfirmMissingWhoutExport = this.handleConfirmMissingWhoutExport.bind(this);
    this.handleConfirmMissingWhoutClassicExport = this.handleConfirmMissingWhoutClassicExport.bind(this);
    this.handleExportSortedChange = this.handleExportSortedChange.bind(this);
    this.handleWhInDetailsChangePage = this.handleWhInDetailsChangePage.bind(this);
    this.handleWhInDetailsChangeLength = this.handleWhInDetailsChangeLength.bind(this);
    this.handleDownloadPdf = this.handleDownloadPdf.bind(this);
    this.onWhOutDateClean = this.onWhOutDateClean.bind(this);
    this.onWhInDateClean = this.onWhInDateClean.bind(this);
    this.onWhInFilter = this.onWhInFilter.bind(this);
    this.onWhInAutocompleteInputChange = this.onWhInAutocompleteInputChange.bind(this);
    this.onWhOutAutocompleteInputChange = this.onWhOutAutocompleteInputChange.bind(this);
    this.onWhOutFilterChange = this.onWhOutFilterChange.bind(this);
  }

  handleConfirmMissingWhoutClassicExport()
  {
    console.log("*********** Export des whout classic manquant *********");
    this.whOutService.exportMissingProductsForDelivery(this.state.missingProductsDeliveryClassic);
  }

  handleConfirmMissingWhoutExport()
  {
    console.log("*********** Export des whout manquant *********");
    this.whOutService.exportMissingDeliveries(this.state.missingDeliveries);
  }

  handleDownloadPdf()
  {
    console.log("download as pdf")
    exportWhOutToPdf(this.state.selectedDelivery);
  }

  // Triggered when date filter is cleaned
  onWhOutDateClean(event)
  {
    console.log("wh out date clean")
    this.setState(prevState => ({...prevState, dateRangeFilterWhOut: undefined}));
  }

  // Triggered when date filter is cleaned
  onWhInDateClean(event)
  {
    console.log("whin date clean")
    this.setState(prevState => ({...prevState, dateRangeFilterWhIn: undefined}));
  }

  deleteMultipleEntities(service, refreshFunction)
  {
    let deletePromises = [];

    this.state.checkedKeys.forEach(key => {
      let promise = service.delete(key);

      promise.then((deleteResult) => console.log(deleteResult))
              .catch(e => {
                if (e.response.status === 400)
                  Alert.error("Suppression impossible. Des produits sont rattachés à l'opération.", 5000)
                else
                  Alert.error(e.message, 5000)
              });

      deletePromises.push(promise);
    });

    Promise.all(deletePromises).finally(() => {
      console.log("all delete complete close modal");
      this.closeModal('delete');
      refreshFunction();
    });
  }

  resetMultipleOperationsStatus(service, refreshFunction)
  {
    let updatePromises = [];

    this.state.checkedKeys.forEach(key => {
      let promise = service.update(key, {status: "todo"});

      promise.then((updateResult) => console.log(updateResult))
              .catch(e => {
                Alert.error("Impossible de réinitialiser l'opération.", 5000);
              });

      updatePromises.push(promise);
    });

    Promise.all(updatePromises).finally(() => {
      console.log("all update complete close modal");
      this.closeModal('reset');
      refreshFunction();
    });
  }

  deleteSelectedWhInOps()
  {
    console.log("Delete selected wh in operations");
    this.deleteMultipleEntities(this.whInOpService, this.refreshWhInList.bind(this));
  }

  deleteSelectedWhOutOps()
  {
    console.log("delete selected wh out operations");
    console.log(this.state.checkedKeys);
    this.deleteMultipleEntities(this.whOutService, this.refreshWhOutList.bind(this));
  }

  handleConfirm()
  {
    console.log("Handle confirm");

    // Which active page ? to delete call to the correct service to delete the corresponding rows in the database
    switch (this.state.active)
    {
      // wh in operations
      case 1: this.deleteSelectedWhInOps()
      break;

      // cartons out stock
      case 2: this.deleteSelectedWhOutOps()
      break;
    }
  }

  handleDeliveryTypeChange(value, e)
  {
    this.setState(prevState => ({...prevState, deliveryType: value}))
  }

  handleExportWhOutToExcel()
  {
    console.log("export whout to excel")
    this.whOutService.exportExcelFile([this.state.selectedDelivery], true);
  }

  handleExporWhoutClassicToExcel()
  {
    console.log("export whout classic to excel ")
    this.whOutService.exportWhOutClassicToExcel(this.state.selectedDelivery);
  }

  handleCartonOutCountChange(numCartonsOut, event)
  {
    this.setState((prevState) => ({...prevState, numCartonsOut: numCartonsOut}));

    //control if input null, disabled the button
    if(numCartonsOut === '') {
      this.setState({
        activeButton: false
      })
    }
    else {
      this.setState({
        activeButton: true
      })
    }

  }

  handleUploadDeliveryExcelFile(blobs)
  {
    const blob = blobs[0];

    //control if input null, disabled the button
    if(!blob || !blob.blobFile) {
      this.setState({
        activeButton: false,
        deliveryExcelFile: false
      })
    }
    else
    {
      this.setState(prevState => ({...prevState, deliveryExcelFile: blob.blobFile, activeButton: true}));
    }
  }

  handleSelectProvider(provider)
  {
    this.setState((prevState) => ({...prevState, providerToCreate: provider}));
  }

  handleCartonInputChange(numCartonsIn)
  {
    this.setState((prevState) => ({...prevState, numCartonsToCreate: numCartonsIn}));
  }

  handleInvoiceNumberChange(invoiceNumber)
  {
    this.setState((prevState) => ({...prevState, whInRefCodeToCreate: `WHIN${invoiceNumber}`}));

    //control if input null, disabled the button
    if(invoiceNumber === '')
      this.setState({ activeButton: false })
    else
      this.setState({ activeButton: true })
  }

  refreshProvidersList()
  {
    this.providerService.readAll().then((response) => {
      this.setState((prevState) => ({...prevState, providersList: response.data}))
    }, error => Alert.warning(error.message, 2000));
  }

  refreshWhInList()
  {
    this.setState({
      loading: true
    });

    this.whInOpService.filterWhIn({
      searchTerm: this.state.whInSearchTerm,
      dateRange: (this.state.dateRangeFilterWhIn) ? this.state.dateRangeFilterWhIn.map(d => d.toISOString()) : undefined,
      statusTags: this.state.whInStatusFilters,
      page: this.state.pageWhIn,
      limit: this.state.whInPageDispLen
    }).then(response => {
      const pages = response.data;

      this.setState((prevState) => ({...prevState,
        loading: false,
        rawReceiptList: pages.data,
        whInTotal: pages.total,
        receiptList: pages.data.map(receipt => ({id: receipt.id,
          statut: getTagByReceiptStatus(receipt.status),
          operation: receipt.refCode,
          date: getFormattedDate(receipt.createdAt),
          rawDate: new Date(receipt.createdAt),
          products: receipt.productsCount })
      )}));
    }).catch(e => console.log(error));
  }

  refreshWhOutList()
  {
    this.setState({
      loading: true
    });

    this.whOutService.filterWhOut({
      searchTerm: this.state.whOutSearchTerm,
      dateRange: (this.state.dateRangeFilterWhOut) ? this.state.dateRangeFilterWhOut.map(d => d.toISOString()) : undefined,
      statusTags: this.state.whOutStatusFilters,
      page: this.state.pageWhOut,
      limit: this.state.whOutPageDispLen
    }).then(response => {
      const pages = response.data;
      this.setState((prevState) => ({...prevState,
        loading: false,
        rawDeliveryList: pages.data,
        whOutTotal: pages.total,
        deliveriesList: pages.data.map(delivery => ({
          id: delivery.id,
          operation: delivery.refCode,
          date: getFormattedDate(delivery.createdAt),
          statut: getTagByDeliveryStatus(delivery.status),
          products: delivery.productsCountScanned,
          productsToScan: delivery.productsCountNeeded,
          batch: delivery.batch.refCode, // Dans le cas du classique pas de
          orderNum: delivery.orderNum,
          rawDate: new Date(delivery.createdAt),
          orderDate: getFormattedDate(delivery.orderDate),
          type: delivery.type,
          name: delivery.clientName,
          phone: delivery.clientTel,
          street: delivery.clientAddress,
          city: delivery.clientCity,
          country: delivery.clientCountry,
          carton: delivery.cartons })
        )}));
    }).catch(e => console.log(error));
  }

  componentDidMount()
  {
    const token = getToken();

    if (!token)
      Router.push("/");

    this.providerService = new ProviderService(token);
    this.whInOpService = new WhInOpService(token);
    this.cartonInService = new CartonInService(token);
    this.whOutService = new WhOutOpService(token);
    this.cartonOutService = new CartonOutService(token);

    this.refreshProvidersList();
    this.refreshWhInList();
    this.refreshWhOutList();
  }

  componentDidUpdate(prevProps, prevState)
  {
    if (this.state.pageWhIn != prevState.pageWhIn
      || this.state.whInPageDispLen != prevState.whInPageDispLen
      || this.state.whInSearchTerm != prevState.whInSearchTerm
      || this.state.whInStatusFilters != prevState.whInStatusFilters
      || this.state.dateRangeFilterWhIn != prevState.dateRangeFilterWhIn)
      {
        this.refreshWhInList();
      }
      

    if (this.state.pageWhOut != prevState.pageWhOut 
      || this.state.whOutPageDispLen != prevState.whOutPageDispLen
      || this.state.whOutSearchTerm != prevState.whOutSearchTerm
      || this.state.whOutStatusFilters != prevState.whOutStatusFilters
      || this.state.dateRangeFilterWhOut != prevState.dateRangeFilterWhOut)
      this.refreshWhOutList();
  }

  componentWillUnmount()
  {
    if (this.whOutAutocompleteTimeout)
      clearTimeout(this.whOutAutocompleteTimeout)
      
    if (this.whInAutocompleteTimeout)
      clearTimeout(this.whInAutocompleteTimeout)
  }

  //MODAL
  openModal(type) {
    switch (type) {
      case 'receipt' :
        this.setState({receipt: !this.state.show});
        break;
      case 'delivery' :
        this.setState({delivery: !this.state.show});
      break;
      case 'carton' :
        this.setState({carton: !this.state.show});
      break;
      case 'delete' :
        this.setState({delete: !this.state.show});
      break;
      case 'reset_receipts' :
        this.setState({resetReceipts: !this.state.show});
      break;
      case 'reset_deliveries' :
        this.setState({resetDeliveries: !this.state.show});
      break;
      case 'export' :
        this.setState({export: !this.state.show});
      break;
      case 'whoutClassicMissingProducts':
        this.setState({whoutClassicMissingProducts: !this.state.show});
      break;
      case 'whoutMissingProducts':
        this.setState({whoutMissingProducts: !this.state.show});
      break;
      };
  };

  validateModal(type)
  {
    switch (type) {
      case 'receipt' :
        this.createWhInOp();
        break;
      case 'delivery':
        if (!this.state.importInProgress) this.createDelivery();
      break;
      case 'carton':
        this.createCartonOut(null);
        break;
      case 'reset_receipts':
        this.resetReceipts();
      break;
      case 'reset_deliveries':
        this.resetDeliveries();
      break;
      case 'export':
        this.exportDeliveries();
        break;
      case 'whoutMissingProducts':
        this.handleConfirmMissingWhoutExport();
      break;
      case 'whoutClassicMissingProducts':
        this.handleConfirmMissingWhoutClassicExport()
        break;
    };

    this.closeModal(type);
  }

  /**
   * @description reset the selected deliveries status to "Todo" status
   */
  resetReceipts()
  {
    this.resetMultipleOperationsStatus(this.whInOpService, this.refreshWhInList.bind(this));
  }

  resetDeliveries()
  {
    this.resetMultipleOperationsStatus(this.whOutService, this.refreshWhOutList.bind(this));
  }

  closeModal(type) {
    switch (type) {
      case 'receipt' :
        this.setState({receipt: this.state.show});
        break;
      case 'delivery' :
        this.setState({delivery: this.state.show});
        break;
      case 'carton' :
        this.setState({carton: this.state.show});
      break;
      case 'delete' :
        this.setState({delete: this.state.show});
        break;
      case 'reset_receipts' :
        this.setState({resetReceipts: this.state.show});
        break;
      case 'reset_deliveries' :
        this.setState({resetDeliveries: this.state.show});
        break;
      case 'export' :
        this.setState({export: this.state.show});
        break;
      case 'whoutMissingProducts':
        this.setState({whoutMissingProducts: this.state.show})
        break;
      case 'whoutClassicMissingProducts':
        this.setState({whoutClassicMissingProducts: this.state.show})
        break;
      };
  }

  backTo(type) {
    switch (type) {
      case 'allReceipt':
        this.setState({
          onRowClicked: !this.state.onRowClicked,
          checkedKeys: []
        });
        break;
      case 'allDelivery':
        this.setState({
          onRowClicked: !this.state.onRowClicked,
          checkedKeys: []
        });
        break;
    }
  }

  //BUTTON
  handleSelect = (activeKey) => {
    this.setState({
      active: activeKey,
      checkedKeys: [], //reset checkbox
      onRowClicked: false //reset details
    })
  }

  //ON ROW CLICK
  handleAction = () => {
    this.setState({
      onRowClicked: true,
      checkedKeys: [] //reset checkbox
    });
  }

  //CHECKBOX
  // TO DO : CHANGE DATA "receiptList"
  handleCheckAll = (value, checked) => {
    const checkedKeys = (checked && this.state.active === 1) ? this.state.receiptList.map(item => item.id)
    : (checked && this.state.active === 2) ? this.state.deliveriesList.map(item => item.id)
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

  createCartonOut(whoutOpId)
  {
    if (this.state.numCartonsOut != 0)
    {
      this.cartonOutService.createBulkCartons(this.state.numCartonsOut, whoutOpId)
                            .then((response) => {
                              this.closeModal('carton');
                            }, error => Alert.error(error.message, 10000));
    }
  }

  createDelivery()
  {
    console.log(`Create delivery type ${this.state.deliveryType}`);
    this.setState((prevState) => ({...prevState, importInProgress: true, onLoading: true}));

    if (this.state.deliveryType === "dropshipping")
    {
      this.whOutService.importDeliveriesFromExcelFile(this.state.deliveryExcelFile)
          .then((deliveriesNotImported) => {
            this.setState((prevState) => ({...prevState, importInProgress: false, onLoading: false}));
            this.createCartonOut(null);
            this.refreshWhOutList();
            this.closeModal('delivery');
            console.log(deliveriesNotImported);

            if (deliveriesNotImported.length === 0)
              Alert.success('Création du WH/OUT avec succès !', 5000);
            else
            {
              this.setState(prevState => ({...prevState, missingDeliveries: deliveriesNotImported}));
              this.openModal("whoutMissingProducts");
              Alert.warning("Certains whout n'ont pas été créés veuillez vérifier les stocks");
            }

          }, error => {
            this.setState((prevState) => ({...prevState, importInProgress: false, onLoading: false}));
            Alert.error(error.message, 5000)
          });
    }
    else
    {
      this.whOutService.importClassicDeliveriesExcelFile(this.state.deliveryExcelFile)
          .then((deliveryClassic) => {
            this.setState((prevState) => ({...prevState, importInProgress: false, onLoading: false}));
            this.createCartonOut(null);
            this.refreshWhOutList();

            console.log("Data de l'importation");
            console.log(deliveryClassic.productsNotImported);

            if (deliveryClassic.productsNotImported.length === 0)
              Alert.success('Création du WH/OUT avec succès !', 5000);
            else
            {
              this.setState(prevState => ({...prevState, missingProductsDeliveryClassic: deliveryClassic}));
              this.openModal("whoutClassicMissingProducts");
              Alert.warning("Certains produits n'ont pas été créés pour le whout");
            }

            this.closeModal('delivery');
          }, error => {
            this.setState((prevState) => ({...prevState, importInProgress: false, onLoading: false}));
            Alert.error(error.message, 5000);
            this.closeModal('delivery');
          });
    }
  }

  createWhInOp()
  {
    //console.log(`WH in to create ${this.state.whInRefCodeToCreate}, number of cartons: ${this.state.numCartonsToCreate}, provider: ${this.state.providerToCreate} `)
    this.whInOpService.create({refCode: this.state.whInRefCodeToCreate, provider: {id: this.state.providerToCreate}})
                      .then((response) => {
                        console.log(response.data);
                        this.cartonInService.createBulkCartons(this.state.numCartonsToCreate, null)
                                            .then((success) => {
                                              this.refreshWhInList();
                                              this.closeModal('receipt');
                                              Alert.success('Création de la réception ' + this.state.whInRefCodeToCreate + ' avec succès !' , 5000)
                                            }, error => Alert.error(error.message, 10000));
                      }, error => Alert.error(error.message, 10000));

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


  onWhInFilter = (whInStatusFilters) => {
      this.setState(prevState => ({...prevState, whInStatusFilters: whInStatusFilters}));
  }

  onWhOutFilter = (whOutStatusFilters) => {
    console.log(whOutStatusFilters)
      this.setState(prevState => ({...prevState, whOutStatusFilters: whOutStatusFilters}));
  }

  onWhOutDateFilter = (dateRange) => {
    console.log("WH out filter date")
      this.setState(prevState => ({...prevState, dateRangeFilterWhOut: dateRange}))
  }

  onCartonOutDateFilter = (dateRange) => {
    console.log("carton out filter date")
      this.setState(prevState => ({...prevState, dateRangeFilterCartonOut: dateRange}))
  }

  onWhInDateFilter = (dateRange) => {
    console.log("WH in filter date")
    this.setState(prevState => ({...prevState, dateRangeFilterWhIn: dateRange}))
  }

  onReceiptDetailsSelect = (value) => {

    const selectedReceipt = this.state.rawReceiptList.find(receipt => receipt.refCode === value.operation);

    this.setState(prevState => {
      return {...prevState, selectedReceipt: selectedReceipt, }
    });

    let selectedWhInProductListDetails = [];

    this.whInOpService.getWhInInfo(selectedReceipt.refCode).then((response) => {
      response.data.cartons.forEach((carton) => {
          carton.productsInStock.forEach((productInStock) => {
            selectedWhInProductListDetails.push({carton: carton.refCode, product: productInStock.product.refCode, quantity: productInStock.quantity, barcode: productInStock.product.eanCode, place: carton.place.refCode });
        })})

        this.setState(prevState => {
        return {...prevState, selectedWhInProductListDetails: selectedWhInProductListDetails}
      })
    }, error => console.error(error))
  }

  //Details Pages
  onDeliveryDetailsSelect = (value) => {

    const selectedDelivery = this.state.rawDeliveryList.find(delivery => delivery.refCode === value.operation);
    let selectedWhOutProductListDetails = [];
    let selectedWhOutClassicProductListDetails = [];

    if (selectedDelivery)
    {

      this.setState(prevState => {
        return {...prevState, selectedDelivery: selectedDelivery}
      });

      this.whOutService.getWhOutInfo(selectedDelivery.refCode).then(response => {
        const delivery = response.data;
        console.log(delivery)
        if (delivery.type === "classic")
        {
          if (delivery.cartonsOut)
          {
            delivery.cartonsOut.forEach((cartonOut) => {
              let treeData = {
                id: cartonOut.id,
                cartonOut: cartonOut.refCode,
                children: []
              };
  
              cartonOut.productsOutClassic.forEach((productOutClassic) => {
                const productOutStock = delivery.productsOutStock.find(productOutStock => productOutStock.id === productOutClassic.productOutStock.id);
  
                if (productOutStock)
                {
                  treeData.children.push({
                    id: productOutStock.id,
                    carton: productOutStock.cartonIn.refCode,
                    place: productOutStock.cartonIn.place.refCode,
                    product: productOutStock.product.refCode,
                    quantityNeeded: productOutStock.quantityNeeded,
                    quantityScanned: productOutClassic.quantity
                  })
                }
              })
  
              selectedWhOutClassicProductListDetails.push(treeData);
            })
          }
  
          // Affichage des products out classic sans cartons
  
          let treeDataNotPlacedProducts = {
            id: -1,
            cartonOut: "A SCANNER",
            children: []
          };

          delivery.productsOutStock
          .filter(productOutStock => !productOutStock.scanned && productOutStock.quantityScanned != productOutStock.quantityNeeded)
          .map(productOutStock => {
              treeDataNotPlacedProducts.children.push({
              id: productOutStock.id,
              carton: productOutStock.cartonIn.refCode,
              place: productOutStock.cartonIn.place.refCode,
              product: productOutStock.product.refCode,
              quantityNeeded: productOutStock.quantityNeeded,
              quantityScanned: productOutStock.quantityScanned
            })
          })
          
          if (treeDataNotPlacedProducts.length > 0)
            selectedWhOutClassicProductListDetails.push(treeDataNotPlacedProducts);

          this.setState(prevState => {
            return {...prevState, selectedWhOutClassicProductListDetails: selectedWhOutClassicProductListDetails}
          });
        } else {
            delivery.productsOutStock.forEach((productOutStock) => {
              selectedWhOutProductListDetails.push({
                carton: productOutStock.cartonIn.refCode,
                product: productOutStock.product.refCode,
                place: productOutStock.cartonIn.place.refCode,
                quantityScanned: productOutStock.quantityScanned,
                quantityNeeded: productOutStock.quantityNeeded
              });
          })

          this.setState(prevState => {
            return {...prevState, selectedWhOutProductListDetails: selectedWhOutProductListDetails}
          });
        }
      }, error => console.error(error))
    }
  }

  onWhOutFilterChange(values)
  {
    console.log(values);
    this.setState(prevState => ({...prevState, whOutStatusFilters: values}))
  }

  //PAGINATION
  handleChangePage = (dataKey) => {

    if (this.state.active === 1)
    {
      this.setState({ pageWhIn: dataKey });
    }

    if (this.state.active === 2)
    {
      this.setState({ pageWhOut: dataKey });
    }
  }

  handleWhInDetailsChangePage(dataKey)
  {
    this.setState({pageWhInDetail: dataKey});
  }

  handleChangeLength = (dataKey) => {
    if (this.state.active === 1)
      this.setState({pageWhIn: 1, whInPageDispLen: dataKey });
    
      if (this.state.active === 2)
      this.setState({pageWhOut: 1, whOutPageDispLen: dataKey });
  }

  handleWhInDetailsChangeLength(dataKey)
  {
    this.setState({whInDetailsDispLen: dataKey});
  }

  onWhInAutocompleteInputChange(searchTerm)
  {
    if (this.whInAutocompleteTimeout)
      clearTimeout(this.whInAutocompleteTimeout);

    this.whInAutocompleteTimeout = setTimeout(() => {
      this.setState(prevState => ({...prevState, whInSearchTerm: searchTerm}));
    }, AUTOCOMPLETE_TIMEOUT);
  }

  onWhOutAutocompleteInputChange(searchTerm)
  {
    if (this.whOutAutocompleteTimeout)
      clearTimeout(this.whOutAutocompleteTimeout);

    this.whOutAutocompleteTimeout = setTimeout(() => {
      this.setState(prevState => ({...prevState, whOutSearchTerm: searchTerm}));
    }, AUTOCOMPLETE_TIMEOUT);
  }

  exportDeliveries()
  {
    this.whOutService.exportExcelFile(this.state.rawDeliveryList.filter(delivery => this.state.checkedKeys.indexOf(delivery.id) !== -1), this.state.sortedExport);
  }

  handleExportSortedChange = (sorted) => this.setState(prevState => ({...prevState, sortedExport: sorted}))

  render() {

    const {active, checkedKeys, onRowClicked } = this.state;
    const currentNav = this.state.active

   // console.log(treeData)

    //CHECKKOX
    let checked = false;
    let indeterminate = false;

    if (checkedKeys.length === 0) {
      checked = false;
    } else if (checkedKeys.length === ((currentNav === 1 && this.state.receiptList.length) || (currentNav === 2 && this.state.deliveriesList.length))) {
      checked = true;
    } else if (checkedKeys.length > 0 && checkedKeys.length < ((currentNav === 1 && this.state.receiptList.length) || (currentNav === 2 && this.state.deliveriesList.length))) {
      indeterminate = true;
    }

    return (
        <Frame activeKey="1">
          <HeaderTitle
            className="header-frame"
            title="Opération"
            subtitle="Gérer ici la réception et la livraison de la marchandise"
          />

            <Panel>
              <div style={{display: 'flex'}}>
                <NavBar
                  appearance="subtle"
                  active={active}
                  onSelect={this.handleSelect}
                  items={operationNavbar}
                />
              </div>
              {active === 1 && (
              <>
              {!onRowClicked && (
                <>
                <div className="table-toolbar">
                  <HeaderTitle
                      className="inner-left"
                      title={"Bon de Réception"}
                      subtitle={"Créer les bons de réception et/ou générer des cartons de stockage"}
                    />
                  {(!indeterminate && !checked) && (
                    <Toolbar
                    primaryButton="Nouvelle Réception"
                    importModal={() => this.openModal('receipt')}
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
                      color="cyan"
                      icon={<Icon icon="reload" />}
                      appearance="primary"
                      onClick={() => this.openModal('reset_receipts')}
                    />
                    </>
                  )}
                </div>
                <CustomTagFilter
                    //search
                    placeholder="Rechercher par whin"
                    //filter by
                    onFilter={this.onWhInFilter}
                    dataFilter={receiptFilter}
                    //date filter
                    value={this.state.valueDate}
                    onFilterDate={this.onWhInDateFilter}
                    onDateRangeClean={this.onWhInDateClean}
                    onAutocompleteInputChange={this.onWhInAutocompleteInputChange}
                  />
                <DataTable
                  //loading data
                  loading={this.state.loading}
                  data={this.sortData(this.state.receiptList)}
                  onRowClick={this.handleAction}
                  onDetails={this.onReceiptDetailsSelect}
                  //column
                  column={columnReceipt}
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
                  displayLength={this.state.whInPageDispLen}
                  page={this.state.pageWhIn}
                  total={this.state.whInTotal}
                  //edit et action cell
                  moreActions={this.state.moreActions}
                />
                </>)}
                {onRowClicked && (this.state.selectedWhInProductListDetails) && (
                <>
                  <ToolbarSmall
                    //data={receiptFilter}
                    label="Mes Bons de Réception"
                    onBackButton={() => this.backTo('allReceipt')}
                    primaryButton="Télécharger"
                    downloadExcel={false}
                    downloadPdf={false}
                  />
                  {/* TO DO CHANGE DATA */}
                  <HeaderTitleTagWhIn
                    className="table-toolbar header-tag"
                    //label
                    label={whinLabel}
                    receipt={this.state.selectedReceipt}
                  />
                <DataTable
                  //TO DO : ADD DATA
                  data={this.sortData(getPaginatedData(this.state.pageWhInDetail, this.state.whInDetailsDispLen, this.state.selectedWhInProductListDetails))}
                  //column
                  column={columnWHIN}
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
                  handleChangePage={this.handleWhInDetailsChangePage}
                  handleChangeLength={this.handleWhInDetailsChangeLength}
                  displayLength={this.state.whInDetailsDispLen}
                  page={this.state.pageWhInDetail}
                  total={this.state.selectedWhInProductListDetails.length}
                />
                </>
                )}
              </>
            )}
            {active === 2 && (
              <>
             {!onRowClicked && (
                <>
                <div className="table-toolbar">
                  <HeaderTitle
                      className="inner-left"
                      title={"Bon de Préparation"}
                      subtitle={"Visualiser les cartons contenant les produits stockés dans l’entrepôt"}
                    />
                 {( !indeterminate && !checked) && (
                  <>
                  <Toolbar
                    primaryButton="Bon de Préparation"
                    importModal={() => this.openModal('delivery')}
                    data={receiptFilter}
                  />
                  <IconButton
                    style={{marginTop: '20px', marginRight:'5px'}}
                    className="inner-right"
                    color="green"
                    icon={<Icon icon="dropbox" />}
                    appearance="primary"
                    onClick={() => this.openModal('carton')}
                  />
                  </>
                  )}
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
                      color="cyan"
                      icon={<Icon icon="reload" />}
                      appearance="primary"
                      onClick={() => this.openModal('reset_deliveries')}
                    />
                    <IconButton
                      style={{marginTop: '20px', marginRight:'10px'}}
                      className="inner-right"
                      color="violet"
                      icon={<Icon icon="file-excel-o" />}
                      appearance="primary"
                      onClick={() => this.openModal('export')}
                     // onClick={this.handleExportMultipleWhOutToExcel} //TO DO
                    />
                    </>
                  )}
                </div>

                <CustomTagFilter
                  //filter by
                  placeholder="Rechercher par whout"
                  dataFilter={filterDelivery}
                  onAutocompleteInputChange={this.onWhOutAutocompleteInputChange}
                  value={this.state.valueDate}
                  onFilterDate={this.onWhOutDateFilter}
                  onDateRangeClean={this.onWhOutDateClean}
                  onSelect={this.onWhOutFilter}
                  onFilter={this.onWhOutFilterChange}
                />

                <DataTable
                  data={this.sortData(this.state.deliveriesList)}
                  onRowClick={this.handleAction}
                  onDetails={this.onDeliveryDetailsSelect}
                  //column
                  column={columnDelivery}
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
                  displayLength={this.state.whOutPageDispLen}
                  page={this.state.pageWhOut}
                  total={this.state.whOutTotal}
                  //edit et action cell
                  moreActions={this.state.moreActions}
                />
              </> )}
              {onRowClicked && (
                <>
                  <ToolbarSmall
                    label="Mes Bons de Préparation"
                    onBackButton={() => this.backTo('allDelivery')}
                    primaryButton="Excel"
                    downloadExcel={true}
                    downloadPdf={true}
                    onDownload={this.state.selectedDelivery.type === "classic" ? this.handleExporWhoutClassicToExcel : this.handleExportWhOutToExcel}
                    onDownloadPdf={this.handleDownloadPdf}
                    //search
                    //onAutocompleteInputChange={}
                  />
                  {/* TO DO CHANGE DATA */}
                  <HeaderTitleTagWhOut
                    className="table-toolbar header-tag"
                    //label
                    label={whoutLabel}
                    //all data
                    delivery={this.state.selectedDelivery}
                  />

                {this.state.selectedDelivery.type === "classic" && (
                  <DataTableTree
                  //TO DO : ADD DATA
                  data={this.state.selectedWhOutClassicProductListDetails} //pour tester le TreeDtable, remplace par this.state.treeData
                  //column
                  column={columnWHOUTClassic}
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
                  total={this.state.selectedWhOutProductListDetails.length}
                />)}
                {this.state.selectedDelivery.type === "dropshipping" && (
                  <DataTable
                  //TO DO : ADD DATA
                  data={this.state.selectedWhOutProductListDetails}
                  //column
                  column={columnWHOUTDrop}
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
                  total={this.state.selectedWhOutProductListDetails.length}
                />)}

                </>
                )}
                </>
            )}
            </Panel>


          {/* CONFIRMATION MODAL FOR DELETE ACTION */}
          <div className="modal-container">
            <Modal backdrop="static" show={this.state.delete} onHide={() => this.closeModal('delete')} size="xs" backdrop="static">
              <ConfirmModal
                text="Êtes-vous sûr de vouloir supprimer l'opération ?"
                secondaryButton="Non. Annuler."
                primaryButton="Oui. Supprimer"
                closeModal={() => this.closeModal('delete')}
                handleConfirm={this.handleConfirm}
              />
            </Modal>
          </div>

          {/* CONFIRMATION EXPORT MISSING PRODUCT WHOUT */}
          <div className="modal-container">
            <Modal backdrop="static" show={this.state.whoutMissingProducts} onHide={() => this.closeModal('whoutMissingProducts')} size="xs" backdrop="static">
              <ConfirmModal
                header="Exportation du fichier Excel"
                text="Exporter le fichier de commandes manquantes ?"
                secondaryButton="Non. Annuler."
                primaryButton="Oui. Exporter"
                closeModal={() => this.closeModal('whoutMissingProducts')}
                handleConfirm={() => this.validateModal('whoutMissingProducts')}
              />
            </Modal>
          </div>

          {/* CONFIRMATION EXPORT MISSING PRODUCT WHOUT */}
          <div className="modal-container">
            <Modal backdrop="static" show={this.state.whoutClassicMissingProducts} onHide={() => this.closeModal('whoutClassicMissingProducts')} size="xs" backdrop="static">
              <ConfirmModal
                header="Exportation du fichier Excel"
                text="Exporter le fichier de produits manquants pour la commande ?"
                secondaryButton="Non. Annuler."
                primaryButton="Oui. Exporter"
                closeModal={() => this.closeModal('whoutClassicMissingProducts')}
                handleConfirm={() => this.validateModal('whoutClassicMissingProducts')}
              />
            </Modal>
          </div>

          {/* CONFIRMATION MODAL FOR RESET ACTION */}
          <div className="modal-container">
            <Modal backdrop="static" show={this.state.resetReceipts} onHide={() => this.closeModal('reset_receipts')} size="xs" backdrop="static">
              <ResetModal
                text="Êtes-vous sûr de vouloir réinitialiser l'opération de réception et la remettre au statut"
                tagStatut={this.state.active === 1 ? "À RÉCEPTIONNER" : "À PRÉPARER" }
                secondaryButton="Non. Annuler."
                primaryButton="Oui. Changer le statut."
                closeModal={() => this.closeModal('reset_receipts')}
                validateModal={() => this.validateModal('reset_receipts')}
              />
            </Modal>
          </div>
          <div className="modal-container">
            <Modal backdrop="static" show={this.state.resetDeliveries} onHide={() => this.closeModal('reset_deliveries')} size="xs" backdrop="static">
              <ResetModal
                text="Êtes-vous sûr de vouloir réinitialiser l'opération de livraison et la remettre au statut"
                tagStatut={this.state.active === 1 ? "À RÉCEPTIONNER" : "À PRÉPARER" }
                secondaryButton="Non. Annuler."
                primaryButton="Oui. Changer le statut."
                closeModal={() => this.closeModal('reset_deliveries')}
                validateModal={() => this.validateModal('reset_deliveries')}
              />
            </Modal>
          </div>


          {/* MODAL ADD NEW RECEIPT */}
          <div className="modal-container">
            <Modal show={this.state.receipt} onHide={() => this.closeModal('receipt')} size="xs" backdrop="static">
              <ReceiptModal
                secondaryButton="Annuler"
                primaryButton="Créer Bon de Réception"
                closeModal={() => this.closeModal('receipt')}
                providersList={this.state.providersList.map(provider => ({value: provider.id, label: provider.name}))}
                handleCartonInputChange={this.handleCartonInputChange}
                handleSelectProvider={this.handleSelectProvider}
                handleInvoiceNumberChange={this.handleInvoiceNumberChange}
                validateModal={() => this.validateModal('receipt')}
                disabled={!this.state.activeButton}
              />
            </Modal>
          </div>

            {/* MODAL ADD NEW DELIVERY */}
            <div className="modal-container">
            <Modal show={this.state.delivery} onHide={() => this.closeModal('delivery')} size="sm" backdrop="static">
              <DeliveryModal
                deliveryType={this.state.deliveryType}
                secondaryButton="Annuler"
                primaryButton="Créer Bon de Préparation"
                closeModal={() => this.closeModal('delivery')}
                validateModal= {() => this.validateModal('delivery')}
                handleUploadExcelFile= {this.handleUploadDeliveryExcelFile}
                handleCartonOutCountChange = {this.handleCartonOutCountChange}
                handleDeliveryTypeChange={this.handleDeliveryTypeChange}
                disabled={this.state.importInProgress || !this.state.activeButton}
              />
            {this.state.onLoading && (
              <Loader vertical backdrop center speed="fast" size="md" content="Medium" content="loading..."/>
            )}
            </Modal>
          </div>

          {/* MODAL ADD NEW CARTON C-OUT */}
          <div className="modal-container">
          <Modal show={this.state.carton} onHide={() => this.closeModal('carton')} size="xs" backdrop="static">
            <InputModal
              modalType="cartonOUT"
              title="Nouveaux Cartons"
              subtitle="Créer des cartons pour la livraison "
              icon="dropbox"
              text="Combien de cartons souhaitez-vous ?"
              placeholder="10"
              secondaryButton="Annuler"
              primaryButton="Créer le(s) carton(s)"
              validateModal= {() => this.validateModal('carton')}
              closeModal={() => this.closeModal('carton')}
              onInputChange={this.handleCartonOutCountChange}
              disabled={!this.state.activeButton}
            />
          </Modal>
        </div>

          {/* MODAL ADD NEW CARTON C-OUT */}
          <div className="modal-container">
          <Modal show={this.state.export} onHide={() => this.closeModal('export')} size="xs" backdrop="static">
            <ChoiceModal
              title="Export Excel"
              subtitle="Bon de préparation"
              secondaryButton="Annuler"
              primaryButton="Exporter"
              validateModal= {() => this.validateModal('export')}
              closeModal={() => this.closeModal('export')}
              onInputChange={this.handleCartonOutCountChange}
              onExportModelChange={this.handleExportSortedChange}
            />
          </Modal>
        </div>

        </Frame>
    );
  }
}

export default Operation;

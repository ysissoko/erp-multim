// tableau receipt et devliery identique pour l'instant

export default [
    {
      key: 0,
      text: "ID",
      datakey: "id",
      width: 50,
      sortable: false,
      resizable: false,
      disabled: true
    },
    {
      key: 1,
      text: "Carton Entrée",
      datakey: "carton",
      width: 250,
      sortable: true,
      resizable: true
    },
    {
      key: 2,
      text: "Product",
      datakey: "product",
      width: 400,
      sortable: true,
      resizable: true
    },
    {
      key: 3,
      text: "Code EAN",
      datakey: "barcode",
      width: 150,
      sortable: true,
      resizable: true
  },
  {
      key: 4,
      text: "Place",
      datakey: "place",
      width: 100,
      sortable: true,
      resizable: true
  },
  {
    key: 5,
    text: "Stock",
    datakey: "quantity",
    width: 200,
    sortable: true,
    resizable: true
},

];
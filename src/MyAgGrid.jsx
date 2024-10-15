import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {LicenseManager} from 'ag-grid-enterprise';

LicenseManager.setLicenseKey("CompanyName=Broadridge Financial Solutions, Inc.,LicensedGroup=Sam Patel,LicenseType=MultipleApplications,LicensedConcurrentDeveloperCount=15,LicensedProductionInstancesCount=5,AssetReference=AG-024562,ExpiryDate=7_February_2025_[v2]_MTczODg4NjQwMDAwMA==7709d1fa285969de1a690bdc577a9991");

const MyAgGrid = () => {
  const columnDefs = [
    { headerName: 'Make', field: 'make' },
    { headerName: 'Model', field: 'model' },
    { headerName: 'Price', field: 'price' }
  ];

  const rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 , sortable: true, filter: true},
    { make: 'Ford', model: 'Mondeo', price: 32000,  sortable: true, filter: true },
    { make: 'Porsche', model: 'Boxster', price: 72000,  sortable: true, filter: true}
  ];

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        pagination={true}
        paginationPageSize={10}
        defaultColDef= {{
          'enablePivot': false,
          'enableValue': false,
          'filter': true,
          'filterParams': {
            'buttons': [
              'apply',
              'reset'
            ],
            'closeOnApply': true
          },
          'menuTabs': ['filterMenuTab'],
          'resizable': true
        }}
        sideBar={{
          'defaultToolPanel': '',
          'toolPanels': [
            {
              'iconKey': 'columns',
              'id': 'columns',
              'labelDefault': 'Columns',
              'labelKey': 'columns',
              'toolPanel': 'agColumnsToolPanel',
              'toolPanelParams': {
                'sortable': true,
                'suppressColumnExpandAll': false,
                'suppressColumnFilter': false,
                'suppressColumnSelectAll': false,
                'suppressPivotMode': true,
                'suppressPivots': true,
                'suppressRowGroups': false,
                'suppressSideButtons': true,
                'suppressSyncLayoutWithGrid': true,
                'suppressValues': true
              }
            }
          ]
        }}
      />
    </div>
  );
};

export default MyAgGrid;

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Input, Pagination, Row } from 'antd';
import _ from 'lodash';
import KgmField from 'components/KgmField/KgmField';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';

import processHelper from 'core/helpers/ProcessHelper';
import { CONSTANTS } from 'core/Constants';
import './index.less';

type Props = {
  process: any;
  data: any;
  constructOutputData: any;
  gridChange: any;
  gridSearch: any;
  currentSearchKey: string;
  theme: string;
  onRecordsSelect: any;
};


const getColumns = (presentationRules: any, formData: Array<any>, presentation: any) => {
  const pRuleKeys = Object.keys(presentationRules)
  const columns: any = [];
  if (presentation.actions?.length) {
    columns.push({ field: "", sortable: false, width: 64, suppressSizeToFit: true, suppressColumnsToolPanel: true, filter: false, headerCheckboxSelection: true, checkboxSelection: true, suppressMovable: true, pinned: 'left' })
  }
  pRuleKeys.forEach((pRuleKey: any, index: number) => {
    const presentationRule = presentationRules[pRuleKey];
    if (presentationRule.visible) {
      const column: any = {
        headerName: presentationRule.label,
        field: presentationRule.attrName,
        type: 'nonEditableColumn',
        cellRenderer: (props) => {
          const { data } = props;
          return <KgmField presentationRule={presentationRule} data={data}></KgmField>;
        }
      };
      if (index === 1) {
        column.pinned = 'left';
      }
      columns.push(column);
    }
  });
  return columns;
}

const KgmGrid = ({ process, data, theme, constructOutputData, gridChange, gridSearch, currentSearchKey, onRecordsSelect }: Props) => {
  const [columns, setColumns] = useState([]);
  const gridRef: any = useRef();
  const gridStyle = useMemo(() => ({ height: '84.5%', width: '100%' }), []);

  const processDetails = processHelper.getProcessDetails(process, data, false);
  const { primaryEntity, presentationRules, embedPresentations, presentation } = processDetails;
  const { verbProperties } = constructOutputData;
  const { endRecord, pageSize, startRecord, totalRecords } = verbProperties;
  const [searchBy, setSearchBy] = useState(currentSearchKey);

  useEffect(() => {
    setColumns(getColumns(presentationRules, data, presentation));
  }, []);

  useEffect(() => {
    setSearchBy(currentSearchKey);
  }, [currentSearchKey]);

  const itemRender = (current, type, originalElement) => {
    if (type === CONSTANTS.PREV) {
      return <a>Previous</a>;
    }
    if (type === CONSTANTS.NEXT) {
      return <a>Next</a>;
    }
    return originalElement;
  }

  const onPageChange = (page, pageSize) => {
    if (!searchBy) {
      gridChange(CONSTANTS.DEFAULT, page, pageSize);
    } else {
      gridSearch(searchBy, page);
    }
  }

  const onGridSearch = (e) => {
    const { value } = e.target;
    gridSearch(value, Math.ceil(startRecord / pageSize));
    setSearchBy(value)
  }

  const renderPagination = () => {
    return <Row justify="space-between" style={{ paddingTop: "5px" }}>
      <Col className='pagination_result'>Showing <span>{startRecord}</span> to <span>{endRecord}</span> of <span>{totalRecords}</span> record(s) </Col>
      <Col>
        <Pagination total={+totalRecords} itemRender={itemRender} defaultPageSize={+pageSize} current={Math.ceil(startRecord / pageSize)} showSizeChanger={false} hideOnSinglePage={true} onChange={onPageChange} />
      </Col>
    </Row>
  }


  const setAutoHeight = useCallback(() => {
    gridRef.current.api.setDomLayout('autoHeight');
  }, []);

  const setFixedHeight = useCallback(() => {
    gridRef.current.api.setDomLayout('normal');
  }, []);

  const onGridReady = e => {
    e.api.sizeColumnsToFit();
    e.columnApi.resetColumnState();
  }

  const onSelectionChanged = useCallback((event) => {
    const rows = event.api.getSelectedNodes();
    onRecordsSelect(rows);
  }, []);

  const gridOptions = {
    allowDragFromColumnsToolPanel: true,
    animateRows: true,
    enableCellChangeFlash: true,
    rowBuffer: 100,
    rowData: data,
    rowSelection: 'multiple',
    onSelectionChanged: onSelectionChanged,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      flex: 1,
      // floatingFilter: true,
    },
    modules: [],
    sideBar: {
      toolPanels: [
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
          minWidth: 180,
          maxWidth: 400,
          width: 250
        },
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressRowGroups: true,
            suppressValues: true,
            suppressPivotMode: true,
            // suppressColumnFilter: true,
            // suppressColumnSelectAll: true
          }
        }
      ]
    },
    debounceVerticalScrollbar: true,
    columnDefs: columns,
    columnTypes: {
      nonEditableColumn: { editable: false },
      dateColumn: {
        filter: 'agDateColumnFilter',
        suppressMenu: true
      }
    },
    onGridReady: onGridReady,
    suppressCellFocus: true,
    headerHeight: 32,
    rowHeight: 32
  }

  return (
    <div className='list-content'>
      <Row justify="end" style={{ padding: "3px 0px" }}>
        <Col style={{ width: '50%' }} >
          <Input.Search size="large" placeholder="Search..." value={searchBy} allowClear onChange={onGridSearch} enterButton />
        </Col>
      </Row>
      <div className={theme === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"} style={gridStyle}>
        <AgGridReact ref={gridRef} {...gridOptions}>
        </AgGridReact>
      </div>
      {renderPagination()}
    </div>
  );
};

export default KgmGrid;
// KgmGrid.whyDidYouRender = true


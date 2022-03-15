import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Input, Modal, Pagination, Row, Tag } from 'antd';
import _ from 'lodash';
import KgmField from 'components/KgmField/KgmField';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/agGridBalhamFont.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';

import processHelper from 'core/helpers/ProcessHelper';
import { CONSTANTS, HTML_CONTROLS } from 'core/Constants';
import './index.less';
import './index.scss';
import { getMultiListPreviewData } from './GridHelper';
import KModal from 'components/KModal/KModal';
import KgmList from 'containers/KgmList/KgmList';
import PresentationHelper from 'core/helpers/PresentationHelper';

type Props = {
  process: any;
  data: any;
  constructOutputData: any;
  gridChange: any;
  gridSearch: any;
  currentSearchKey: string;
  theme: string;
  onRecordsSelect: any;
  tabId: any;
};

const KgmGrid = ({ process, data, theme, constructOutputData, gridChange, gridSearch, currentSearchKey, onRecordsSelect, tabId }: Props) => {
  const [columns, setColumns] = useState([]);
  const gridRef: any = useRef();
  const gridStyle = useMemo(() => ({ height: '84.5%', width: '100%' }), []);
  const processDetails = processHelper.getProcessDetails(process, data, false);
  const { primaryEntity, presentationRules, embedPresentations, presentation, stepInfo } = processDetails;
  const { verbProperties } = constructOutputData;
  const { endRecord, pageSize, startRecord, totalRecords } = verbProperties;
  const [searchBy, setSearchBy] = useState(currentSearchKey);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalState, setModalState] = useState({ header: "", content: null });

  const getColumns = () => {
    const _self = this;
    const pRuleKeys = Object.keys(presentationRules)
    const columns: any = [];
    if (presentation.actions?.length) {
      columns.push({
        field: "", sortable: false, width: 64, suppressSizeToFit: true, suppressColumnsToolPanel: true, filter: false,
        headerCheckboxSelection: true, checkboxSelection: true, suppressMovable: true, pinned: 'left', resizable: false
      });
    }
    pRuleKeys.forEach((pRuleKey: any, index: number) => {
      const presentationRule = presentationRules[pRuleKey];
      const { htmlControl, attrName, label, uiSettings, embeddedPresentationId } = presentationRule;
      const convertToDecimal = uiSettings?.convertToDecimal;
      let { entityConsumedFullNameForSearch, displayName } = processHelper.getEntityConsumedFullNameForSearch(presentationRule);
      if (presentationRule.visible) {
        let column: any = {
          headerName: label,
          field: attrName,
          // valueGetter : ,
          type: 'nonEditableColumn',
          // cellRenderer: (props) => {
          //   const { data } = props;
          //   return <KgmField presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={false} presentation={presentation} fieldChanged={() => { }}></KgmField>;
          // }
        };
        if (index === 1) {
          column.pinned = 'left';
        }

        switch (htmlControl) {
          case HTML_CONTROLS.MULTISELECT:
            if (embeddedPresentationId) {
              column.cellRenderer = (props) => {
                const rowData = props.data;
                const value = _.get(rowData, attrName);
                const tags = value.map(tag => {
                  const tagLabel = _.get(tag, displayName);
                  return <Tag className="edit-tag" key={tag.id} closable={false}>{tagLabel}</Tag>
                });
                return <span onClick={async () => {
                  const Guid = PresentationHelper.getCurrentTabGuid(stepInfo.processName);
                  const multiListData: any = await getMultiListPreviewData(presentationRule, stepInfo.processName, primaryEntity, rowData, Guid);
                  const modalContent = <KgmList process={multiListData.constructOutputData.uiResource} data={multiListData.constructOutputData.detailedObjects} tabId={Guid} constructOutputData={multiListData.constructOutputData} currentSearchKey={""} />
                  setModalState({ header: multiListData.constructOutputData.uiResource.headerName, content: modalContent });
                  setModalVisible(true);
                }}>
                  {tags}
                </span>;
              }
            } else {
              column.cellRenderer = (props) => {
                const rowData = props.data;
                const value = _.get(rowData, attrName);
                const tags = value.map(tag => {
                  const tagLabel = _.get(tag, displayName);
                  return <Tag className="edit-tag" key={tag.id} closable={false}>{tagLabel}</Tag>
                });
                return <span>
                  {tags}
                </span>;
              }
            }
            break;
          case HTML_CONTROLS.DATE:
            break;
          case HTML_CONTROLS.DATETIME:
            break;
          case HTML_CONTROLS.TIME:
            break;
          case HTML_CONTROLS.TREESELECT:
            break;
          case HTML_CONTROLS.IMAGE:
            break;
          case HTML_CONTROLS.PREVIEW:
            break;
          case HTML_CONTROLS.FILE:
            break;
          case HTML_CONTROLS.SEARCH:
            break;
          case HTML_CONTROLS.RADIO:
            break;
          case HTML_CONTROLS.SELECT:
            break;
          case HTML_CONTROLS.TEXT:
            break;
          case HTML_CONTROLS.NUMBER:
            break;
          case HTML_CONTROLS.BOOLEAN:
            break;
          case HTML_CONTROLS.CURRENCY:
            break;
          case HTML_CONTROLS.ACTIVITY:
            break;
          case HTML_CONTROLS.COMMENTS:
            break;
          case HTML_CONTROLS.CUSTOMACTIVITYLOG:
            break;
          case HTML_CONTROLS.CHECKLIST:
            break;
        }
        columns.push(column);
      }
    });
    return columns;
  }

  useEffect(() => {
    setColumns(getColumns());
    if (gridRef?.current?.columnApi) {
      autoSizeAll(false);
    }
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
    let recordSummary = <Col className='pagination_result'>Showing <span>{startRecord}</span> to <span>{endRecord}</span> of <span>{totalRecords}</span> record(s) </Col>;
    if (totalRecords === 0) {
      recordSummary = <Col></Col>;
    }
    return <Row justify="space-between" style={{ paddingTop: "5px" }}>
      {recordSummary}
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

  const autoSizeAll = useCallback((skipHeader) => {
    const allColumnIds = [];
    gridRef.current.columnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.getId());
    });
    gridRef.current.columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }, []);


  const onGridReady = e => {
    if (columns.length > 5) {
      autoSizeAll(true);
    } else {
      e.api.sizeColumnsToFit();
      e.columnApi.resetColumnState();
    }
  }

  const onFirstDataRendered = useCallback((params) => {
    if (columns.length > 5) {
      autoSizeAll(true);
    } else {
      gridRef.current.api.sizeColumnsToFit();
      gridRef.current.columnApi.resetColumnState();
    }
  }, []);

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
    suppressRowClickSelection: true,
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
    onFirstDataRendered: onFirstDataRendered,
    suppressCellFocus: true,
    headerHeight: 32,
    rowHeight: 32
  }

  return (
    <div className='list-content'>
      <Row justify="end" style={{ padding: "3px 0px" }}>
        <Col className='grid-search' style={{ width: '50%' }} >
          <Input.Search size="middle" placeholder="Search..." value={searchBy} allowClear onChange={onGridSearch} enterButton />
        </Col>
      </Row>
      <div className={theme === "light" ? "ag-theme-balham" : "ag-theme-balham-dark"} style={gridStyle}>
        <AgGridReact ref={gridRef} {...gridOptions}>
        </AgGridReact>
      </div>
      {renderPagination()}
      <Modal bodyStyle={{ maxHeight: "90%", height: "300px" }} width={"90%"} title={modalState.header} cancelButtonProps={{ hidden: true }} onCancel={() => setModalVisible(false)} okButtonProps={{ hidden: true }} closable={true} visible={modalVisible} >
        {modalState.content}
      </Modal>
    </div >
  );
};

export default KgmGrid;
// KgmGrid.whyDidYouRender = true


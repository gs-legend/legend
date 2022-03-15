import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Input, Modal, Pagination, Row, Tag, Image } from 'antd';
import _ from 'lodash';

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
import KgmList from 'containers/KgmList/KgmList';
import PresentationHelper from 'core/helpers/PresentationHelper';
import { formatDate, formatDateTime, formatTime } from 'core/helpers/FieldsHelper';
import { FaSitemap } from 'react-icons/fa';
import DataService from 'core/DataService';
import DefaultImage from "assets/images/defaultImg.png";
type Props = {
  process: any;
  data: any;
  constructOutputData: any;
  gridChange: any;
  gridSearch: any;
  currentSearchKey: string;
  theme: string;
  onRecordsSelect: any;
  isEmbed: boolean;
  isEditable: boolean;
};

const KgmGrid = ({ process, data, theme, constructOutputData, gridChange, gridSearch, currentSearchKey, onRecordsSelect, isEmbed, isEditable }: Props) => {
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
          case HTML_CONTROLS.SEARCH:
          case HTML_CONTROLS.SELECT:
          case HTML_CONTROLS.RADIO:
            column.cellRenderer = (props) => {
              const entityConsumed = PresentationHelper.getEntityConsumed(presentationRule);
              const displayAttributes = PresentationHelper.getDisplayAttributes(presentationRule);
              const rowData = props.data;
              const value = _.get(rowData, entityConsumed);
              const Color = value?.Color;
              const displayString = PresentationHelper.computeDisplayString(value, displayAttributes);
              const statusIcon = Color ? <span className='statusIcon' style={{ backgroundColor: Color?.bgCode ?? "default" }}></span> : <></>;
              return <>
                {statusIcon}
                {displayString}
              </>;
            }
            break;
          case HTML_CONTROLS.DATE:
          case HTML_CONTROLS.DATETIME:
          case HTML_CONTROLS.TIME:
          case HTML_CONTROLS.TEXT:
          case HTML_CONTROLS.NUMBER:
          case HTML_CONTROLS.BOOLEAN:
            column.cellRenderer = (props) => {
              const rowData = props.data;
              let value = _.get(rowData, attrName);
              switch (htmlControl) {
                case HTML_CONTROLS.DATE:
                  value = formatDate(value);
                  break;
                case HTML_CONTROLS.DATETIME:
                  value = formatDateTime(value);
                  break;
                case HTML_CONTROLS.TIME:
                  value = formatTime(value);
                  break;
              }
              const Color = value?.Color;
              const statusIcon = Color ? <span className='statusIcon' style={{ backgroundColor: Color?.bgCode ?? "default" }}></span> : <></>;
              return <>
                {statusIcon}
                {value}
              </>;
            }
            break;
          case HTML_CONTROLS.TREESELECT:
            column.cellRenderer = (props) => {
              return <>
                <Button title="View Tree Map" onclick={() => { }} icon={FaSitemap}></Button>
              </>;
            }

            break;
          case HTML_CONTROLS.IMAGE:
          case HTML_CONTROLS.PREVIEW:
          case HTML_CONTROLS.FILE:
            column.cellRenderer = (props) => {
              const rowData = props.data;
              const value = _.get(rowData, attrName);
              const displayImage = presentationRule?.uiSettings?.displayImage;
              let retVal = <></>;
              if (displayImage) {
                const frameSrc = DataService.BASE_URL + 'dms/viewDocument?docId=' + value.split(":")[0];
                retVal = <Image width={32} src={frameSrc} />
              } else {
                retVal = <Image width={32} src={DefaultImage} />
              }
              return <>
                {retVal}
              </>;
            }

            break;
          case HTML_CONTROLS.FILE:
          case HTML_CONTROLS.CURRENCY:
          case HTML_CONTROLS.ACTIVITY:
          case HTML_CONTROLS.COMMENTS:
          case HTML_CONTROLS.CUSTOMACTIVITYLOG:
          case HTML_CONTROLS.CHECKLIST:
            column.cellRenderer = (props) => {
              return <>
              </>;
            }

            break;
        }
        columns.push(column);
      }
    });
    return columns;
  }

  const getEmbedColumns = () => {
    const _self = this;
    const pRuleKeys = Object.keys(presentationRules)
    const columns: any = [];

    pRuleKeys.forEach((pRuleKey: any, index: number) => {
      const presentationRule = presentationRules[pRuleKey];
      const { htmlControl, attrName, label, uiSettings, embeddedPresentationId } = presentationRule;
      if (presentationRule.visible) {

      }
    });
    return columns;
  }

  useEffect(() => {
    if (!isEmbed) {
      setColumns(getColumns());
    }
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
      e.columnApi.autoSizeAllColumns();
    } else {
      e.api.sizeColumnsToFit();
      e.columnApi.resetColumnState();
    }
  }

  const onFirstDataRendered = useCallback((params) => {
    // if (columns.length > 5) {
    //   gridRef.current.columnApi.autoSizeAllColumns();
    // } else {
    //   gridRef.current.api.sizeColumnsToFit();
    //   gridRef.current.columnApi.resetColumnState();
    // }
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
    suppressColumnVirtualisation: true,
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
    },
    onGridReady: onGridReady,
    onFirstDataRendered: onFirstDataRendered,
    suppressCellFocus: true,
    headerHeight: 32,
    rowHeight: 32
  }

  const embedGridOptions = {
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
      editable: isEditable
    },
    modules: [],
    debounceVerticalScrollbar: true,
    columnDefs: getEmbedColumns(),
    columnTypes: {
      nonEditableColumn: { editable: false },
    },
    onGridReady: onGridReady,
    onFirstDataRendered: onFirstDataRendered,
    suppressCellFocus: true,
    headerHeight: 32,
    rowHeight: 32
  }

  return (
    !isEmbed ?
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
      :
      <div className='list-content embedded'>
        <div className={theme === "light" ? "ag-theme-balham" : "ag-theme-balham-dark"} style={gridStyle}>
          <AgGridReact ref={gridRef} {...embedGridOptions}>
          </AgGridReact>
        </div>
      </div >
  );
};

export default KgmGrid;
// KgmGrid.whyDidYouRender = true


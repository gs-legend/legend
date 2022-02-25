import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { callProcessSubmitAction, callProcessTriggerActions } from 'core/services/kgm/ProcessService';
import { connect } from 'react-redux';
import _ from 'lodash';
import KgmField from 'components/KgmField/KgmField';

import { AgGridReact } from 'components/Grid/ReactGrid';
import 'components/Grid/core';
import 'components/Grid/core/styles/ag-grid.scss';
import 'components/Grid/styles/ag-theme-alpine.css';
import 'components/Grid/styles/ag-theme-alpine-dark.css';
import { selectTheme } from 'core/services/kgm/PresentationService';
import { RootState } from 'core/store';
import processHelper from 'core/helpers/ProcessHelper';
import './index.less';
import { Col, Pagination, Row } from 'antd';

type OwnProps = {
  process: any;
  data: any;
  constructOutputData: any;
};

const mapStateToProps = (state: RootState) => {
  return {
    theme: selectTheme(state),
  };
};

const mapDispatchToProps = {
  callTriggerAction: callProcessTriggerActions.request,
  callTriggerSubmit: callProcessSubmitAction.request,
};

type Props = ReturnType<typeof mapStateToProps> & OwnProps & typeof mapDispatchToProps;

const getColumns = (presentationRules: any, formData: Array<any>) => {
  const pRuleKeys = Object.keys(presentationRules)
  const columns: any = [
    { field: "", sortable: false, width: 64, suppressSizeToFit: true, filter: false, headerCheckboxSelection: true, checkboxSelection: true, suppressMovable: true, pinned: 'left' },
  ];
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
      // if (index === 0) {
      //   column.pinned = 'left';
      // }
      columns.push(column);
    }
  });
  return columns;
}


const KgmGrid = ({ process, data, callTriggerAction, callTriggerSubmit, theme, constructOutputData }: Props) => {
  const [columns, setColumns] = useState([]);
  const gridRef: any = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '91%', width: '100%' }), []);

  const processDetails = processHelper.getProcessDetails(process, data, false);
  const { entity, presentationRules, embedPresentations, presentation } = processDetails;
  const { verbProperties } = constructOutputData;
  const { endRecord, pageSize, startRecord, totalRecords } = verbProperties;

  useEffect(() => {
    setColumns(getColumns(presentationRules, data));
  }, []);

  const itemRender = (current, type, originalElement) => {
    if (type === 'prev') {
      return <a>Previous</a>;
    }
    if (type === 'next') {
      return <a>Next</a>;
    }
    return originalElement;
  }

  const onPageChange = (page, pageSize) => {
    console.log(page, pageSize)
  }

  const renderPagination = () => {
    return <Row justify="space-between" style={{ paddingTop: "5px" }}>
      <Col className='pagination_result'>Showing <span>{startRecord}</span> to <span>{endRecord}</span> of <span>{totalRecords}</span> record(s) </Col>
      <Col>
        <Pagination total={+totalRecords} itemRender={itemRender} defaultPageSize={+pageSize} showSizeChanger={false} hideOnSinglePage={true} onChange={onPageChange} />
      </Col>
    </Row>
  }

  const rowData = data[entity];
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1
  }), []);

  const columnTypes = {
    nonEditableColumn: { editable: false },
    dateColumn: {
      filter: 'agDateColumnFilter',
      suppressMenu: true
    }
  };


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

  const sideBarOptions = {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
        }
      }
    ]
  }
  // const { ClientSideRowModelModule, ColumnToolPanelModule, SideBarModule } = AgGrid;
  const GridModules = [];//[ClientSideRowModelModule, ColumnToolPanelModule, SideBarModule];
  return (
    <div className='list-content'>
      <div className={theme === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"} style={gridStyle}>
        <AgGridReact ref={gridRef} allowDragFromColumnsToolPanel={true} animateRows={true} enableCellChangeFlash={true}
          rowData={rowData} defaultColDef={defaultColDef} modules={GridModules} sideBar={sideBarOptions}
          columnDefs={columns} columnTypes={columnTypes} onGridReady={onGridReady} suppressCellFocus={true}>
        </AgGridReact>
      </div>
      {renderPagination()}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(KgmGrid);
// KgmGrid.whyDidYouRender = true

import { Button, Form, Table } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
import { RiAddCircleFill } from 'react-icons/ri';
import { callProcessSubmitAction, callProcessTriggerActions } from 'core/services/kgm/ProcessService';
import { connect } from 'react-redux';
import Split from 'react-split';
import { EditTwoTone, SaveTwoTone, StopOutlined } from '@ant-design/icons';
import _ from 'lodash';
import KgmField from 'components/KgmField/KgmField';

import { AgGridReact } from 'ag-grid-react';
import * as AgGrid from 'assets/scripts/ag-grid-enterprise.min.js';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';
import { selectTheme } from 'core/services/kgm/PresentationService';
import { RootState } from 'core/store';
import processHelper from 'core/helpers/ProcessHelper';

type OwnProps = {
  process: any;
  data: any;
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

const KgmList = ({ process, data, callTriggerAction, callTriggerSubmit, theme }: Props) => {
  const gridRef: any = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  const processDetails = processHelper.getProcessDetails(process, data, false);
  const { entity, columns, presentationRules, embedPresentations, presentation } = processDetails;

  const rowData = data[entity];
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true
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

  const { ClientSideRowModelModule } = AgGrid;
  return (
    <div className='list-content'>
      <div className={theme === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"} style={gridStyle}>
        <AgGridReact ref={gridRef} allowDragFromColumnsToolPanel={true} animateRows={true} enableCellChangeFlash={true} domLayout="autoHeight"
          rowData={rowData} defaultColDef={defaultColDef} modules={[ClientSideRowModelModule]}
          columnDefs={columns} columnTypes={columnTypes}>
        </AgGridReact>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(KgmList);
// KgmList.whyDidYouRender = true


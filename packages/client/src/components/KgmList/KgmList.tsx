import { Button, Form, Table } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import './index.less';
import { RiAddCircleFill } from 'react-icons/ri';
import { callProcessDataActions, callProcessSubmitAction, callProcessTriggerActions } from 'core/services/kgm/process/process.service';
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
import { selectTheme } from 'core/services/kgm/presentation.service';
import { RootState } from 'core/store';
import processHelper from 'core/helpers/process.helper';

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
  callProcessData: callProcessDataActions.request,
};

type Props = ReturnType<typeof mapStateToProps> & OwnProps & typeof mapDispatchToProps;

const KgmList = ({ process, data, callTriggerAction, callTriggerSubmit, callProcessData, theme }: Props) => {
  const processDetails = processHelper.getProcessDetails(process);
  const { entity, columns, presentationRules, embedPresentations, presentation } = processDetails;

  useEffect(() => {
    if (presentation.onLoadRequired) {
      callProcessData(process.stepInfo.processName);
    }
  }, [])


  const rowData = data[entity];
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true
  }), []);

  const { ClientSideRowModelModule } = AgGrid;
  return (
    <div className='list-content'>
      <div className={theme === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"} style={{ height: "100%" }}>
        <AgGridReact allowDragFromColumnsToolPanel={true} animateRows={true} enableCellChangeFlash={true} domLayout="autoHeight"
          rowData={rowData} defaultColDef={defaultColDef} modules={[ClientSideRowModelModule]}
          columnDefs={columns}>
        </AgGridReact>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(KgmList);

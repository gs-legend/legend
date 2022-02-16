import { Button, Form, Table } from 'antd';
import React, { useMemo, useState } from 'react';
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

const getProcessDetails = (process: any) => {
  const { presentations } = process;
  const { presentationRuleMap, entityLevelMap } = presentations;
  const entity = entityLevelMap[0];
  const mainPresentaion = presentationRuleMap[entity];
  const embedPresentations: any = [];
  _.each(mainPresentaion, (pEntity: any) => {
    if (pEntity.entityId !== entity) {
      embedPresentations.push({
        ...mainPresentaion[pEntity],
        entityName: pEntity.entityId,
      });
    }
  });
  const { formName, presentationRules } = mainPresentaion[0];
  const columns: any = [
    { field: "", sortable: true, filter: true, headerCheckboxSelection: true, checkboxSelection: true, },
  ];
  const pRuleKeys = Object.keys(presentationRules)
  pRuleKeys.forEach((pRuleKey: any) => {
    const pRule = presentationRules[pRuleKey];
    const column = {
      headerName: pRule.label,
      field: pRule.attrName,
      cellRenderer: (props) => {
        const { colDef, data } = props;
        console.log(props)
        return _.get(data, colDef.field) || "";
      }
    };
    if (pRule.visible) {
      columns.push(column);
    }
  });
  return { entity, formName, columns, presentationRules, embedPresentations };
};

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const KgmList = ({ process, data, callTriggerAction, callTriggerSubmit, callProcessData, theme }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null as any);
  const [selectedRecord, setSelectedRecord] = useState(null as any);
  const [currentAction, setCurrentAction] = useState('ADD');
  const processDetails = getProcessDetails(process);
  const { entity, formName, columns } = processDetails;
  const [form] = Form.useForm();

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      setSelectedRecord(selectedRows);
    },
  };

  const onActionClick = (action: string, payload: any) => {
    setCurrentAction(action);
    callTriggerAction({ action, payload, callback: triggerCallback });
  };

  const triggerCallback = (res: any) => {
    setEditingData(res);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    form.resetFields();
    setIsEditing(false);
  };

  const submitCallBack = (response: any) => {
    const processKey = process.entity;
    callProcessData(processKey);
    form.resetFields();
    if (currentAction === 'ADD') {
      const newEditingData = { ...editingData, data: [] };
      setEditingData(newEditingData);
    }
  };

  const save = () => {
    const { data } = editingData;
    let dataToSave = data;
    if (_.isArray(data)) {
      dataToSave = data[0];
    }
    const payload = {
      action: currentAction,
      processName: entity,
      data: dataToSave,
      callBack: submitCallBack,
    };
    callTriggerSubmit(payload);
  };

  const onFieldChanged = (attrName: string, value: any) => {
    const newEditingData = { ...editingData };
    let { data } = newEditingData;
    if (!data) {
      data = [{}];
    }
    if (_.isArray(data) && !data.length) {
      data.push({});
    }

    if (_.isArray(data)) {
      _.set(data[0], attrName, value);
    } else {
      _.set(data, attrName, value);
    }

    setEditingData(newEditingData);
  };

  const getFields = () => {
    if (!editingData) return <></>;
    const { data, metaData } = editingData;
    const presentations = metaData.presentation;
    const details = getProcessDetails(metaData);
    const pRules = details.presentationRules;
    const fields = pRules.map((pRule: any, index: number) => {
      if (pRule.visible) {
        if (pRule.type === 'field') {
          const key = pRule.attrName + '_' + index;
          return <KgmField key={key} presentationRule={pRule} presentation={details} data={data} onChange={onFieldChanged}></KgmField>;
        } else if (pRule.type === 'embed') {
          const key = pRule.attrName + '_' + index;
          return <KgmField key={key} presentationRule={pRule} presentation={presentations[pRule.attrName]} data={data} onChange={onFieldChanged}></KgmField>;
        }
      } else return null;
    });
    return fields;
  };

  const addBtnClassName = isEditing ? 'disabled' : '';
  const title = () => (
    <>
      <div className='list'>List {formName}</div>
      <div className='fixed-actions'>
        {selectedRecord && selectedRecord.length === 1 ? (
          <Button
            type='primary'
            shape='circle'
            icon={<EditTwoTone />}
            onClick={() => {
              onActionClick('EDIT', {
                processName: entity,
                key: selectedRecord[0].id,
              });
            }}
          />
        ) : (
          <></>
        )}
        <RiAddCircleFill
          className={addBtnClassName}
          title='Add New'
          onClick={() => {
            onActionClick('ADD', { processName: entity });
          }}
        />
      </div>
    </>
  );

  const rowData = data[entity];
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true
  }), []);

  const {ClientSideRowModelModule} =AgGrid;
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

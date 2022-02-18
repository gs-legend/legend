import React, { useState, useEffect } from 'react';
import './index.less';
import { Tabs } from 'antd';
import { PushpinTwoTone } from '@ant-design/icons';
import { RootState } from 'core/store';
import { connect } from 'react-redux';
import Dashboard from 'components/Dashboard';
import MasterData from 'components/MasterData';
import Reports from 'components/Reports';
import DataMigration from 'components/DataMigration';
import ProcessContainer from 'containers/ProcessContainer/ProcessContainer';
import { removeProcessAction } from 'core/services/kgm/ProcessService';

type OwnProps = {
  tabs: any;
  currentPaneIndex: number;
  currentProcess: string;
  setCurrentTab: Function;
  setSplitTab: Function;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const mapDispatchToProps = {
  removeProcess: removeProcessAction,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;

const { TabPane } = Tabs;

const TabsContainer = ({ tabs, currentPaneIndex, currentProcess, setSplitTab, setCurrentTab, removeProcess }: Props) => {
  const [panes, setPanes] = useState(Array<JSX.Element>());

  useEffect(() => {
    const tabPanes: Array<JSX.Element> = [];

    const getTabHeader = (processKey: string, formName: string, canSplit: boolean) => {
      let pinBtn = (
        <div className='tab_pin' onClick={() => setSplitTab(processKey)}>
          <PushpinTwoTone />
        </div>
      );
      if (!canSplit) {
        pinBtn = <></>;
      }
      return (
        <div className='tab_header'>
          {formName}
          {pinBtn}
        </div>
      );
    };

    tabs.forEach((tab: any, i: number) => {
      const { process, processKey } = tab;
      let isClosable = true;
      let canSplit = true;
      let tabHeader = <></>;
      let processContainer = <></>;
      switch (processKey) {
        case 'dashboard':
          isClosable = false;
          canSplit = false;
          tabHeader = getTabHeader(processKey, 'Dashboard', canSplit);
          processContainer = <Dashboard>Dashboard</Dashboard>;
          break;
        case 'masterData':
          tabHeader = getTabHeader(processKey, 'Master Data', canSplit);
          processContainer = <MasterData>Master Data</MasterData>;
          break;
        case 'reports':
          tabHeader = getTabHeader(processKey, 'Reports', canSplit);
          processContainer = <Reports>Reports</Reports>;
          break;
        case 'dataMigration':
          tabHeader = getTabHeader(processKey, 'Data Migration', canSplit);
          processContainer = <DataMigration>Data Migration</DataMigration>;
          break;
        default:
          const response = process[process.tabName];
          const { constructOutputData } = response;
          const { detailedObjects, uiResource } = constructOutputData;
          const { presentations } = uiResource;
          const { presentationRuleMap, entityLevelMap } = presentations;
          const mainEntityId = entityLevelMap[0];
          const mainPresentaion = presentationRuleMap[mainEntityId][0];
          const { formName } = mainPresentaion;
          tabHeader = getTabHeader(processKey, formName, isClosable);
          processContainer = <ProcessContainer processKey={processKey} data={detailedObjects} process={uiResource}></ProcessContainer>;
      }

      const pane = (
        <TabPane tab={tabHeader} key={processKey} closable={isClosable}>
          {processContainer}
        </TabPane>
      );
      tabPanes.push(pane);
    });
    setPanes(tabPanes);
  }, [tabs, setSplitTab, currentPaneIndex]);

  const onEdit = (targetKey: any, action: string) => {
    if (action === 'remove') {
      removeProcess({ processKey: targetKey });
    }
  };

  return (
    <Tabs onChange={(activeKey: string) => setCurrentTab(activeKey)} hideAdd={true} animated={true} activeKey={currentProcess} onEdit={onEdit} type={panes.length > 1 || currentPaneIndex === 2 ? 'editable-card' : 'card'}>
      {panes}
    </Tabs>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(TabsContainer);

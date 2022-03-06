import "./index.less";
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import './index.less';
import { RootState } from 'core/store';
import processHelper from "core/helpers/ProcessHelper";
import _ from "lodash";
import { continueProcessAction, selectSplitPane } from "core/services/kgm/ProcessService";
import KgmList from "containers/KgmList/KgmList";
import { UITemplate } from "core/utils/CommonUtils";
import KgmForm from "containers/KgmForm/KgmForm";
import PresentationHelper from "core/helpers/PresentationHelper";
import { createStartRequest } from "core/utils/ProcessUtils";
import BreadCrumbs from "components/BreadCrumbs/BreadCrumbs";
import { Layout } from 'antd';

type OwnProps = {
  process: any;
  data: any;
  processKey: string;
  constructOutputData: any;
};

const mapStateToProps = (state: RootState) => {
  return {
    splitPanes: selectSplitPane(state)
  };
};

const mapDispatchToProps = {
  continueProcess: continueProcessAction
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;

const ProcessContainer = ({ splitPanes, process, processKey, data, constructOutputData, continueProcess }: Props) => {
  const [searchKey, setSearchKey] = useState("");
  const [tabId, setTabId] = useState("");
  const [presentationTree, setPresentationTree] = useState([]);
  const [breadCrumbs, setBreadCrumbs] = useState([]);

  useEffect(() => {
    const { FirstPane, SecondPane } = splitPanes;
    const tabInFirstPane = _.find(FirstPane.tabs, { processName: processKey });
    const tabInSecondPane = _.find(SecondPane.tabs, { processName: processKey });
    const currentTab = tabInFirstPane || tabInSecondPane;
    setTabId(currentTab.GUID);
    setSearchKey(currentTab.searchKey);
    setBreadCrumbs(currentTab.breadCrumbs);
    const _presentationTree = PresentationHelper.getPresentationTree(process);
    setPresentationTree(_presentationTree);
  }, []);


  const goToProcess = async (stepInfo) => {
    console.log(stepInfo);
    const request = createStartRequest(stepInfo.processName, tabId);
    if (stepInfo.uiTemplate && (stepInfo.uiTemplate == 'pChild' ||
      stepInfo.uiTemplate == 'edit' || stepInfo.uiTemplate == 'pcEmbedEdit')) {
      request.inputData.detailedObjects = stepInfo.detailedObjects;
    }

    const response = await processHelper.makeRequest(request);
    continueProcess({ newProcessData: response.data, processName: processKey });
  }


  const getProcessTemplate = (process: any, data: any, constructOutputData: any) => {
    const { uiTemplate } = process;
    let node: any = null;
    switch (uiTemplate) {
      case UITemplate.LIST:
        node = <KgmList process={process} data={data} tabId={tabId} constructOutputData={constructOutputData} currentSearchKey={searchKey} />;
        break;
      case UITemplate.PCEMBEDFORM:
        node = <KgmForm process={process} data={data} tabId={tabId} constructOutputData={constructOutputData} presentationTree={presentationTree} />
        break;
      default:
        break;
    }
    return node;
  };

  const className = 'process_tab tab ' + processKey;
  return <div className={className}>
    <Layout.Content style={{ height: "100%", overflow: "hidden" }}>
      <BreadCrumbs breadCrumbs={breadCrumbs} goToProcess={goToProcess} />
      {getProcessTemplate(process, data, constructOutputData)}
    </Layout.Content>
  </div>;
};
export default connect(mapStateToProps, mapDispatchToProps)(ProcessContainer);

import "./index.less";
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import './index.less';
import { RootState } from 'core/store';
import processHelper from "core/helpers/ProcessHelper";
import KgmGrid from "components/KgmGrid/KgmGrid";
import { createLoadRequest, createSearchRequest } from "core/utils/ProcessUtils";
import { callProcessDataActions, setSearchKeyAction } from "core/services/kgm/ProcessService";
import _ from "lodash";
import { selectSplitPane } from "core/services/kgm/ProcessService";
import { IRuntimeInput } from "core/Interfaces";
import { CONSTANTS } from "core/Constants";

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
  callProcessData: callProcessDataActions.request,
  setSearchKeyAction: setSearchKeyAction
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;



const ProcessContainer = ({ splitPanes, process, processKey, data, constructOutputData, callProcessData, setSearchKeyAction }: Props) => {
  const processDetails = processHelper.getProcessDetails(process, data);
  const [processData, setProcessData] = useState({ ...data });
  const [searchKey, setSearchKey] = useState("");
  const [tabId, setTabId] = useState("");
  const { presentation, stepInfo } = processDetails;

  useEffect(() => {
    const { FirstPane, SecondPane } = splitPanes;
    const tabInFirstPane = _.find(FirstPane.tabs, { processName: processKey });
    const tabInSecondPane = _.find(SecondPane.tabs, { processName: processKey });
    const currentTab = tabInFirstPane || tabInSecondPane;
    setTabId(currentTab.GUID);
    setSearchKey(currentTab.searchKey)
  }, []);

  const gridChange = (searchStr: string, pageNumber: number, pageSize: number) => {
    let request = createLoadRequest(stepInfo.processName, tabId);
    request.inputData.verbProperties[CONSTANTS.PAGENUMBER] = pageNumber;
    request.inputData.verbProperties[CONSTANTS.PAGESIZE] = pageSize;
    request.inputData.verbProperties[CONSTANTS.BYMEFORME] = searchStr;
    request.uiEvent.uiEventValue = presentation.presentationId + "_onLoad";
    makeOnLoadCall(request);
  }

  const gridSearch = (searchStr: string, pageNumber: number) => {
    const runtimeInput: IRuntimeInput = {
      id: CONSTANTS.RuntimeInput,
      searchKey: searchStr
    }
    const request = createSearchRequest(stepInfo.processName, presentation.presentationId, tabId, runtimeInput, pageNumber);
    makeOnLoadCall(request);
    setSearchKeyAction({ processName: stepInfo.processName, searchKey: searchStr });
  }

  const onLoadCallbacck = (response) => {
    console.log(response);
  }
  const makeOnLoadCall = (request) => {
    callProcessData({ request, onLoadCallbacck });
  }

  const getProcessTemplate = (process: any, data: any, constructOutputData: any) => {
    const { uiTemplate } = process;
    let node: any = null;
    switch (uiTemplate) {
      case 'list':
        node = <KgmGrid process={process} data={data} constructOutputData={constructOutputData} gridChange={gridChange} gridSearch={gridSearch} currentSearchKey={searchKey} />;
        break;
      default:
        break;
    }
    return node;
  };

  const className = 'process_tab tab ' + processKey;
  return <div className={className}>{getProcessTemplate(process, data, constructOutputData)}</div>;
};
export default connect(mapStateToProps, mapDispatchToProps)(ProcessContainer);

import "./index.less";
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import './index.less';
import { RootState } from 'core/store';
import processHelper from "core/helpers/ProcessHelper";
import KgmGrid from "components/KgmGrid/KgmGrid";
import { createLoadRequest } from "core/utils/ProcessUtils";
import { callProcessDataActions } from "core/services/kgm/ProcessService";
import _ from "lodash";
import { selectSplitPane } from "core/services/kgm/ProcessService";

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
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;

const getProcessTemplate = (process: any, data: any, constructOutputData: any, gridChange: any) => {
  const { uiTemplate } = process;
  let node: any = null;
  switch (uiTemplate) {
    case 'list':
      node = <KgmGrid process={process} data={data} constructOutputData={constructOutputData} gridChange={gridChange} />;
      break;
    default:
      break;
  }
  return node;
};

const ProcessContainer = ({ splitPanes, process, processKey, data, constructOutputData, callProcessData }: Props) => {
  const processDetails = processHelper.getProcessDetails(process, data);
  const [processData, setProcessData] = useState(data)
  const { presentation,stepInfo } = processDetails;

  const gridChange = (searchStr: string, pageNumber: number, pageSize: number) => {
    const { FirstPane, SecondPane } = splitPanes;
    const tabInFirstPane = _.find(FirstPane.tabs, { processName: processKey });
    const tabInSecondPane = _.find(SecondPane.tabs, { processName: processKey });
    const currentTab = tabInFirstPane || tabInSecondPane;
    const currentGuid = currentTab.GUID;
    console.log(process)
    let request = createLoadRequest(stepInfo.processName, currentGuid);
    request.inputData.verbProperties['pageNumber'] = pageNumber;
    request.inputData.verbProperties['pageSize'] = pageSize;
    request.inputData.verbProperties['byMeForMe'] = searchStr;
    request.uiEvent.uiEventValue = presentation.presentationId + "_onLoad";
    makeOnLoadCall(request);
  }

  const onLoadCallbacck = (response) => {
    console.log(response);
  }
  const makeOnLoadCall = (request) => {
    callProcessData({ request, onLoadCallbacck });
  }

  const className = 'process_tab tab ' + processKey;
  return <div className={className}>{getProcessTemplate(process, processData, constructOutputData, gridChange)}</div>;
};
export default connect(mapStateToProps, mapDispatchToProps)(ProcessContainer);

import "./index.less";
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import './index.less';
import { RootState } from 'core/store';
import processHelper from "core/helpers/ProcessHelper";
import _ from "lodash";
import { selectSplitPane } from "core/services/kgm/ProcessService";
import KgmList from "containers/KgmList/KgmList";
import { UITemplate } from "core/utils/CommonUtils";
import KgmForm from "containers/KgmForm/KgmForm";
import PresentationHelper from "core/helpers/PresentationHelper";

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
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;

const ProcessContainer = ({ splitPanes, process, processKey, data, constructOutputData }: Props) => {
  const [searchKey, setSearchKey] = useState("");
  const [tabId, setTabId] = useState("");
  const [presentationTree, setPresentationTree] = useState([]);

  useEffect(() => {
    const { FirstPane, SecondPane } = splitPanes;
    const tabInFirstPane = _.find(FirstPane.tabs, { processName: processKey });
    const tabInSecondPane = _.find(SecondPane.tabs, { processName: processKey });
    const currentTab = tabInFirstPane || tabInSecondPane;
    setTabId(currentTab.GUID);
    setSearchKey(currentTab.searchKey)
    const _presentationTree = PresentationHelper.getPresentationTree({ ...process });
    setPresentationTree(_presentationTree);
  }, []);

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
  return <div className={className}>{getProcessTemplate(process, data, constructOutputData)}</div>;
};
export default connect(mapStateToProps, mapDispatchToProps)(ProcessContainer);

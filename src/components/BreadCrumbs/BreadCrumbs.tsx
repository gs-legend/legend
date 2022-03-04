import { Breadcrumb } from 'antd';
import { continueProcessAction, selectSplitPane } from 'core/services/kgm/ProcessService';
import { RootState } from 'core/store';
import { createStartRequest } from 'core/utils/ProcessUtils';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import "./index.less";
import processHelper from "core/helpers/ProcessHelper";

type OwnProps = {
};

const mapDispatchToProps = {
  continueProcess: continueProcessAction
};

const mapStateToProps = (state: RootState) => {
  return {
    splitPanes: selectSplitPane(state)
  }
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;

function BreadCrumbs({ splitPanes, continueProcess }: Props) {
  const [breadCrumbs, setBreadCrumbs] = useState([]);
  const [currentProcess, setCurrentProcess] = useState("");
  const [tabId, setTabId] = useState("");
  useEffect(() => {
    const { FirstPane, SecondPane } = splitPanes;
    let firstCurrentTab = FirstPane.currentTab;
    let secondCurrentTab = SecondPane.currentTab;

    const tabInFirstPane = _.find(FirstPane.tabs, { processName: firstCurrentTab });
    const tabInSecondPane = _.find(SecondPane.tabs, { processName: secondCurrentTab }); // TODO: Breadcrumbs for second pane

    if (tabInFirstPane) {
      setBreadCrumbs(tabInFirstPane.breadCrumbs);
      setCurrentProcess(firstCurrentTab);
      setTabId(tabInFirstPane.GUID);
    }
  }, [splitPanes])


  const goToProcess = async (stepInfo) => {
    console.log(stepInfo);
    const request = createStartRequest(stepInfo.processName, tabId);
    if (stepInfo.uiTemplate && (stepInfo.uiTemplate == 'pChild' ||
      stepInfo.uiTemplate == 'edit' || stepInfo.uiTemplate == 'pcEmbedEdit')) {
      request.inputData.detailedObjects = stepInfo.detailedObjects;
    }

    const response = await processHelper.makeRequest(request);
    continueProcess({ newProcessData: response.data, processName: currentProcess });
  }

  const renderBreadCrumbs = () => {
    let showCrumb = true;
    let retVal = <></>;
    let crumbs = [];
    if (breadCrumbs.length > 1) {
      breadCrumbs.forEach((breadCrumb, index) => {
        let onClick: any = () => goToProcess(breadCrumb.stepInfo);
        if (index === breadCrumbs.length - 1) {
          onClick = () => { };
        }
        const crumb = <Breadcrumb.Item key={breadCrumb.stepInfo.processName} onClick={onClick}>{breadCrumb.label}</Breadcrumb.Item>
        crumbs.push(crumb);
        if (breadCrumb.label.includes("{{")) {
          showCrumb = false;
        }
      });
    }
    if (showCrumb) {
      retVal = <Breadcrumb className='breadcrumbs' separator=">">
        {crumbs}
      </Breadcrumb>
    }

    return retVal;
  }

  return (
    <>{renderBreadCrumbs()}</>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(BreadCrumbs);
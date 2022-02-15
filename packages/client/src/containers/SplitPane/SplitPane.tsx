import { useEffect, useState } from "react";
import "./index.less";
import { connect } from "react-redux";
import Split from "react-split";

import { RootState } from "core/store";
import _ from "lodash";
import TabsContainer from "containers/TabsContainer/TabsContainer";
import { selectProcessState, selectSplitPane, setCurrentPaneKeyAction, setSplitAction } from "core/services/kgm/process/process.service";

type OwnProps = {};

const mapStateToProps = (state: RootState) => {
  return {
    processState: selectProcessState(state),
    splitPanes: selectSplitPane(state),
  };
};

const mapDispatchToProps = {
  splitPaneAction: setSplitAction.request,
  setCurrentPaneKey: setCurrentPaneKeyAction,
};

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  OwnProps;

const SplitPane = ({
  processState,
  splitPanes,
  splitPaneAction,
  setCurrentPaneKey,
}: Props) => {
  const [firstPanetabs, setFirstPanetabs]: any = useState([]);
  const [secondPanetabs, setSecondPanetabs] = useState([]);
  const [firstPaneCurrentTab, setFirstPaneCurrentTab] = useState("");
  const [secondPaneCurrentTab, setSecondPaneCurrentTab] = useState("");

  useEffect(() => {
    const { FirstPane, SecondPane } = splitPanes;

    const fPaneTabs: any = [];
    const sPaneTabs: any = [];
    FirstPane.tabs.forEach((tab: any) => {
      const process = processState[tab];
      process && fPaneTabs.push({ processKey: tab, process });
    });
    SecondPane.tabs.forEach((tab: any) => {
      const process = processState[tab];
      process && sPaneTabs.push({ processKey: tab, process });
    });

    let firstCurrentTab = FirstPane.currentTab;
    let secondCurrentTab = SecondPane.currentTab;

    const tabInFirstPane = _.find(fPaneTabs, { processKey: firstCurrentTab });
    const tabInSecondPane = _.find(sPaneTabs, { processKey: secondCurrentTab });

    if (!tabInFirstPane && fPaneTabs.length) {
      firstCurrentTab = fPaneTabs[0].processKey;
    }

    if (!tabInSecondPane && sPaneTabs.length) {
      secondCurrentTab = sPaneTabs[0].processKey;
    }

    setFirstPaneCurrentTab(firstCurrentTab);
    setSecondPaneCurrentTab(secondCurrentTab);

    setFirstPanetabs(fPaneTabs);
    setSecondPanetabs(sPaneTabs);
  }, [processState, splitPanes]);

  const setFirstCurrentPaneKey = (processKey: string) => {
    setCurrentPaneKey({ processKey, paneNumber: 1 });
    setFirstPaneCurrentTab(processKey);
  };

  const setSecondCurrentPaneKey = (processKey: string) => {
    setCurrentPaneKey({ processKey, paneNumber: 2 });
    setSecondPaneCurrentTab(processKey);
  };

  const setSplitTab = (processKey: string) => {
    splitPaneAction({ processKey, action: "add" });
  };

  const removeSplitTab = (processKey: string) => {
    splitPaneAction({ processKey, action: "remove" });
  };

  const splitSizes = secondPanetabs.length ? [50, 50] : [100, 0];
  const className =
    "flex container " +
    (secondPanetabs.length ? "second-pane" : "no-second-pane");
  return (
    <Split className={className} sizes={splitSizes}>
      <div className="firstPane" style={{}}>
        <TabsContainer
          tabs={firstPanetabs}
          currentPaneIndex={1}
          currentProcess={firstPaneCurrentTab}
          setCurrentTab={setFirstCurrentPaneKey}
          setSplitTab={setSplitTab}
        />
      </div>
      <div className="secondPane">
        <TabsContainer
          tabs={secondPanetabs}
          currentPaneIndex={2}
          currentProcess={secondPaneCurrentTab}
          setCurrentTab={setSecondCurrentPaneKey}
          setSplitTab={removeSplitTab}
        />
      </div>
    </Split>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SplitPane);

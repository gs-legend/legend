import KgmForm from "containers/KgmForm/KgmForm";
import { newId } from "core/utils/ProcessUtils";
import "./index.less";

type Props = {
  presentationRule: any;
  process: any;
  data: any;
  constructOutputData: any;
  tabId: string;
};

function SectionPresentation({ presentationRule, data, process, constructOutputData, tabId }: Props) {
  const key = presentationRule.attrName + newId();
  return (
    <div className="section_presentation">
      <KgmForm key={key} process={process} data={data} constructOutputData={constructOutputData} tabId={tabId} presentationTree={[presentationRule.presentationRules]} />
    </div>
  )
}

export default SectionPresentation
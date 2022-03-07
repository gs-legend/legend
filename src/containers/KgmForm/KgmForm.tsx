import KgmField from "components/KgmField/KgmField";
import KgmNonField from "components/KgmNonField/KgmNonField";
import SectionPresentation from "components/SectionPresentation/SectionPresentation";
import { CONSTANTS, PRESENTATIONRULE_TYPES } from "core/Constants";
import { RootState } from "core/store";
import { connect } from "react-redux";
import { newId } from 'core/utils/ProcessUtils';
import "./index.less";
import { Form, Row } from "antd";

type OwnProps = {
  process: any;
  data: any;
  constructOutputData: any;
  tabId: string;
  presentationTree: Array<any>;
};

const mapStateToProps = (state: RootState) => {
  return {
  };
};

const mapDispatchToProps = {
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;


function KgmForm({ process, data, constructOutputData, tabId, presentationTree }: Props) {
  const getFields = (presentation) => {
    let fields = [];
    const { presentationRules } = presentation;
    if (presentationRules) {
      Object.keys(presentationRules).forEach((key) => {
        const presentationRule = presentationRules[key];
        const { visible } = presentationRule;
        if (visible) {
          const pRuleType = presentationRule[CONSTANTS.PRULE_TYPE];
          let field = null;
          const key = presentationRule.attrName + newId();
          switch (pRuleType) {
            case PRESENTATIONRULE_TYPES.FIELDPRESENTATION:
              field = <KgmField key={key} presentationRule={presentationRule} isEditing={true} data={data} />;
              fields.push(field);
              break;
            case PRESENTATIONRULE_TYPES.NONFIELDPRESENTATION:
              field = <KgmNonField key={key} presentationRule={presentationRule} data={data} />;
              fields.push(field);
              break;
            case PRESENTATIONRULE_TYPES.SECTIONPRESENTATION:
              field = <SectionPresentation key={key} presentationRule={presentationRule} data={data} />
              break;
            case PRESENTATIONRULE_TYPES.FORMPRESENTATION:
              field = <KgmForm key={key} process={process} data={data} constructOutputData={constructOutputData} tabId={tabId} presentationTree={[presentationRule]} />
              break;
          }
        }
        console.log(presentationRule)
      })
    }
    return fields;
  }

  const getField = (presentation) => {
    presentationTree.forEach(presentation => {
      console.log(presentation)
      const { presentationRules } = presentation;
      Object.keys(presentationRules).forEach((key) => {
        const presentationRule = presentationRules[key];
        console.log(presentationRule)
      })

    });
    return <></>;
  }

  return (
    <Form autoComplete="off"  >
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }} align="middle">
        {getFields(presentationTree[0] || {})}
      </Row>
    </Form>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(KgmForm);
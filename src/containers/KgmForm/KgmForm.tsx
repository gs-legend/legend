import KgmField from "components/KgmField/KgmField";
import KgmNonField from "components/KgmNonField/KgmNonField";
import SectionPresentation from "components/SectionPresentation/SectionPresentation";
import { CONSTANTS, PRESENTATIONRULE_TYPES } from "core/Constants";
import { RootState } from "core/store";
import { connect } from "react-redux";
import { createChangeRequest, newId } from 'core/utils/ProcessUtils';
import "./index.less";
import { Col, Collapse, Form, Row, Tabs } from "antd";
import KgmGrid from "components/KgmGrid/KgmGrid";
import processHelper from "core/helpers/ProcessHelper";
import { selectTheme } from 'core/services/kgm/PresentationService';
import { EDITABLE_TEMPLATES } from "core/utils/CommonUtils";
import { useState } from "react";

type OwnProps = {
  process: any;
  data: any;
  constructOutputData: any;
  tabId: string;
  presentationTree: Array<any>;
};

const mapStateToProps = (state: RootState) => {
  return {
    theme: selectTheme(state),
  };
};

const mapDispatchToProps = {
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;

function KgmForm({ process, data, constructOutputData, tabId, presentationTree, theme }: Props) {
  const [form] = Form.useForm();
  let editable = false;

  const onFinish = (values: any) => {
    console.log(values);
  };

  const onReset = () => {
    form.resetFields();
  };

  const onFill = () => {
  };

  const fieldChanged = (presentation, attrName, value) => {
    const request = createChangeRequest(presentation.process, attrName, presentation.presentationId, tabId);
    console.log(attrName, value, request);
  }

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
          const loop_key = presentationRule.attrName + newId();
          switch (pRuleType) {
            case PRESENTATIONRULE_TYPES.FIELDPRESENTATION:
              field = <KgmField key={loop_key} constructOutputData={constructOutputData} presentation={presentation} fieldChanged={fieldChanged} presentationRule={presentationRule} isEditing={true} data={data} />;
              fields.push(field);
              break;
            case PRESENTATIONRULE_TYPES.NONFIELDPRESENTATION:
              field = <KgmNonField key={loop_key} presentationRule={presentationRule} data={data} />;
              fields.push(field);
              break;
            case PRESENTATIONRULE_TYPES.SECTIONPRESENTATION:
              field = <SectionPresentation key={loop_key} process={process} presentationRule={presentationRule} data={data} constructOutputData={constructOutputData} tabId={tabId} />
              break;
            case PRESENTATIONRULE_TYPES.FORMPRESENTATION:
              field = <KgmForm key={loop_key} process={process} data={data} constructOutputData={constructOutputData} tabId={tabId} presentationTree={[presentationRule]} theme={theme} />
              break;
          }
        }
      })
    }
    return fields;
  }

  const renderPresentations = (presentations, baseForm: boolean) => {
    let renderVal = [];
    let embedControls = [];
    let defaultView = "tab"
    presentations.forEach((presentation, index) => {
      if (presentation.visible) {
        const loop_key = presentation.entityId + newId();
        if (index === 0 && baseForm) {
          defaultView = presentation.uiSettings?.defaultView;
          const { uiTemplate } = presentation;
          editable = EDITABLE_TEMPLATES.includes(uiTemplate);
          const mainPresentation = <Row key={loop_key} gutter={[4, 4]} style={{ marginTop: "10px" }} align="middle">
            {getFields(presentation)}
          </Row>;
          renderVal.push(mainPresentation);
        } else {
          embedControls.push(renderEmbedPresentation(presentation, defaultView));
        }
      }
    });
    let renderedEmbed = <></>;
    if (defaultView === "tab") {
      renderedEmbed = <Tabs key={"tabcontainer_" + newId()} hideAdd={true} animated={true} type='card'>
        {embedControls}
      </Tabs>;
    } else {
      renderedEmbed = <Collapse key={"collapsecontainer_" + newId()}>
        {embedControls}
      </Collapse>
    }
    const embed = <Row key={"row" + newId()} gutter={[4, 4]} style={{ marginTop: "10px" }} align="middle">
      <Col key={"col_" + newId()} span={24}>
        {renderedEmbed}
      </Col>
    </Row>
    renderVal.push(embed);
    return renderVal;
  }

  const renderEmbedPresentation = (presentation, defaultView) => {
    const loop_key = presentation.entityId + newId();
    const { list } = presentation;
    const processDetails = processHelper.getProcessDetails(process, data);
    const { stepInfo, primaryEntity } = processDetails;
    let fields = [];
    if (list) {
      const gridData = data[primaryEntity];
      const field = <KgmGrid key={loop_key} process={process} data={gridData} constructOutputData={constructOutputData} gridChange={() => { }} gridSearch={() => { }} onRecordsSelect={() => { }} currentSearchKey={""} theme={theme} isEmbed={true} isEditing={editable} />;
      fields.push(field);
    } else {
      const field = <KgmForm key={loop_key} process={process} data={data} constructOutputData={constructOutputData} tabId={tabId} presentationTree={[presentation]} theme={theme} />
      fields.push(field);
    }
    if (presentation.embedPresentations && presentation.embedPresentations.length > 0) {
      fields.push(renderPresentations(presentation.embedPresentations, false));
    };
    let retVal = <></>;
    if (defaultView === "tab") {
      retVal = <Tabs.TabPane tab={presentation.headerName} key={"tab_" + presentation.entityId + newId()} closable={false}>
        {fields}
      </Tabs.TabPane>
    } else {
      retVal = <Collapse.Panel key={"accordion_" + presentation.entityId + newId()} header={presentation.headerName}>
        {fields}
      </Collapse.Panel>
    }
    return retVal;
  }

  return (
    <Form layout="vertical" autoComplete="off" form={form} name={"form_" + newId()} onFinish={onFinish} >
      {renderPresentations(presentationTree, true)}
    </Form>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(KgmForm);
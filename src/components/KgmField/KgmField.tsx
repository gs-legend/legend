import _ from 'lodash';
import ProcessHelper from 'core/helpers/ProcessHelper';
import React from 'react'
import { CONSTANTS, HTML_CONTROLS, PRESENTATION_TYPES } from 'core/Constants';
import KgmText from './Fields/KgmText/KgmText';
import KgmDate from './Fields/KgmDate/KgmDate';
import KgmEmbedPresentation from './Fields/KgmEmbedPresentation/KgmEmbedPresentation';
import KgmReport from './Fields/KgmReport/KgmReport';
import KgmTreeSelect from './Fields/KgmTreeSelect/KgmTreeSelect';
import KgmImage from './Fields/KgmImage/KgmImage';
import KgmFile from './Fields/KgmFile/KgmFile';
import KgmRadio from './Fields/KgmRadio/KgmRadio';
import KgmSelect from './Fields/KgmSelect/KgmSelect';
import KgmNumber from './Fields/KgmNumber/KgmNumber';
import KgmBoolean from './Fields/KgmBoolean/KgmBoolean';
import KgmCurrency from './Fields/KgmCurrency/KgmCurrency';
import KgmActivity from './Fields/KgmActivity/KgmActivity';
import KgmComments from './Fields/KgmComments/KgmComments';
import KgmActivityLog from './Fields/KgmActivityLog/KgmActivityLog';
import KgmCheckList from './Fields/KgmCheckList/KgmCheckList';
import { Col, Form } from 'antd';

type Props = {
  presentationRule: any;
  data: any;
  isEditing: boolean;
  presentation: any;
  fieldChanged: any;
  constructOutputData: any;
};

function KgmField({ presentationRule, data, isEditing, presentation, fieldChanged, constructOutputData }: Props) {

  const onFieldChanged = (attrName, value) => {
    fieldChanged(presentation, attrName, value);
  }

  const defaultVal = () => {
    let value = _.get(data, presentationRule.attrName);
    let { entityConsumedFullNameForSearch, displayName } = ProcessHelper.getEntityConsumedFullNameForSearch(presentationRule);
    let retVal = <>{value}</>;
    let presentationAttrName;
    if (presentationRule.attrName && presentationRule.attrName.indexOf(".") >= 0) {
      presentationAttrName = presentationRule.attrName.split(".");
      let entity = _.get(data, presentationAttrName[0]);
      if (_.isArray(entity)) {
        value = _.get(entity[0], presentationAttrName[1]);
      }
    }
    if (entityConsumedFullNameForSearch) {
      value = ProcessHelper.getVariableValue(entityConsumedFullNameForSearch, data);
    }
    const fontStyles = ProcessHelper.getfontStyles(presentationRule);
    retVal = <span className={fontStyles.fontStr} style={{ color: fontStyles.fgColor }}> {value}</span >;
    if (presentationRule.attrName && presentationRule.attrName.indexOf(".") >= 0) {
      presentationAttrName = presentationRule.attrName.split(".");
      presentationAttrName = presentationAttrName[0];
      if (data[presentationAttrName] && data[presentationAttrName].Color) {
        const fgColor = data[presentationAttrName].Color.fgCode;
        const bgColor = data[presentationAttrName].Color.bgCode;
        retVal = <span className="statusWrap">
          <span className="statusIcon" style={{ backgroundColor: fgColor }}></span>
          {value}
        </span>
      }
    }
    if (!retVal) {
      retVal = <>{ProcessHelper.noValueText()}</>
    }
    return retVal;
  }

  const renderColumn = () => {
    console.log(presentationRule.htmlControl)
    const value = _.get(data, presentationRule.attrName);
    let renderVal = <>{value}</>
    const { htmlControl, embeddedPresentationId, policyMap, type } = presentationRule;
    let { entityConsumedFullNameForSearch, displayName } = ProcessHelper.getEntityConsumedFullNameForSearch(presentationRule);
    if (presentationRule.attrName == presentationRule.entityConsumed && !displayName) {
      displayName = CONSTANTS.ID;
    }
    let pRuleType = type;
    if (!pRuleType) {
      pRuleType = presentationRule[CONSTANTS.PRULE_TYPE];
    }

    if (policyMap?.presentation && false) {
      renderVal = <KgmText presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmText>;
    } else if (embeddedPresentationId) {
      if (htmlControl === HTML_CONTROLS.MULTISELECT) {
        renderVal = <KgmSelect presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmSelect>
      } else {
        renderVal = <KgmEmbedPresentation presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmEmbedPresentation>;
      }
    } else if (type == PRESENTATION_TYPES.REPORT) {
      renderVal = <KgmReport presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmReport>
    }
    else {
      switch (htmlControl) {
        case HTML_CONTROLS.DATE:
        case HTML_CONTROLS.DATETIME:
        case HTML_CONTROLS.TIME:
          renderVal = <KgmDate presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmDate>;
          break;
        case HTML_CONTROLS.TREESELECT:
          renderVal = <KgmTreeSelect presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmTreeSelect>;
          break;
        case HTML_CONTROLS.IMAGE:
          renderVal = <KgmImage presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmImage>;
          break;
        case HTML_CONTROLS.PREVIEW:
        case HTML_CONTROLS.FILE:
          renderVal = <KgmFile presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmFile>;
          break;
        case HTML_CONTROLS.RADIO:
          renderVal = <KgmRadio presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmRadio>;
          break;
        case HTML_CONTROLS.SEARCH:
        case HTML_CONTROLS.SELECT:
        case HTML_CONTROLS.MULTISELECT:
          renderVal = <KgmSelect presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmSelect>;
          break;
        case HTML_CONTROLS.TEXT:
          renderVal = <KgmText presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmText>;
          break;
        case HTML_CONTROLS.NUMBER:
          renderVal = <KgmNumber presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmNumber>;
          break;
        case HTML_CONTROLS.BOOLEAN:
          renderVal = <KgmBoolean presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmBoolean>;
          break;
        case HTML_CONTROLS.CURRENCY:
          renderVal = <KgmCurrency presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmCurrency>;
          break;
        case HTML_CONTROLS.ACTIVITY:
          renderVal = <KgmActivity presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmActivity>;
          break;
        case HTML_CONTROLS.COMMENTS:
          renderVal = <KgmComments presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmComments>;
          break;
        case HTML_CONTROLS.CUSTOMACTIVITYLOG:
          renderVal = <KgmActivityLog presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmActivityLog>;
          break;
        case HTML_CONTROLS.CHECKLIST:
          renderVal = <KgmCheckList presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={isEditing} onChange={onFieldChanged} defaultVal={defaultVal()}></KgmCheckList>;
          break;
        default:
          renderVal = <>{value}</>
      }
    }
    return renderVal;
  }

  return (
    <>
      {renderColumn()}
    </>
  )
}

export default KgmField;
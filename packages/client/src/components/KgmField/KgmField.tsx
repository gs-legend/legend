import _ from 'lodash';
import ProcessHelper from 'core/helpers/ProcessHelper';
import React from 'react'
import { HTML_CONTROLS, PRESENTATION_TYPES } from 'core/Constants';
import KgmText from './Fields/KgmText';
import KgmDateTime from './Fields/KgmDateTime';
import KgmDate from './Fields/KgmDate';
import KgmTime from './Fields/KgmTime';
import KgmMultiSelect from './Fields/KgmMultiSelect';
import KgmEmbedPresentation from './Fields/KgmEmbedPresentation';
import KgmReport from './Fields/KgmReport';
import KgmTreeSelect from './Fields/KgmTreeSelect';
import KgmImage from './Fields/KgmImage';
import KgmFile from './Fields/KgmFile';
import KgmSearch from './Fields/KgmSearch';
import KgmRadio from './Fields/KgmRadio';
import KgmSelect from './Fields/KgmSelect';
import KgmNumber from './Fields/KgmNumber';
import KgmBoolean from './Fields/KgmBoolean';
import KgmCurrency from './Fields/KgmCurrency';
import KgmActivity from './Fields/KgmActivity';
import KgmComments from './Fields/KgmComments';
import KgmActivityLog from './Fields/KgmActivityLog';
import KgmCheckList from './Fields/KgmCheckList';

type Props = {
  presentationRule: any;
  data: any;
};

function KgmField({ presentationRule, data }: Props) {
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
    const value = _.get(data, presentationRule.attrName);
    let renderVal = <>{value}</>
    const { htmlControl, embeddedPresentationId, policyMap, type } = presentationRule;
    let { entityConsumedFullNameForSearch, displayName } = ProcessHelper.getEntityConsumedFullNameForSearch(presentationRule);
    if (presentationRule.attrName == presentationRule.entityConsumed && !displayName) {
      displayName = 'id';
    }
    let pRuleType = type;
    if (!pRuleType) {
      pRuleType = presentationRule['@type']
    }

    if (policyMap?.presentation) {
      renderVal = <KgmText presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmText>;
    } else if (embeddedPresentationId) {
      if (htmlControl === HTML_CONTROLS.MULTISELECT) {
        renderVal = <KgmMultiSelect presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmMultiSelect>
      } else {
        renderVal = <KgmEmbedPresentation presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmEmbedPresentation>;
      }
    } else if (type == PRESENTATION_TYPES.REPORT) {
      renderVal = <KgmReport presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmReport>
    }
    else {
      switch (htmlControl) {
        case HTML_CONTROLS.DATE:
          renderVal = <KgmDate presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmDate>;
          break;
        case HTML_CONTROLS.DATETIME:
          renderVal = <KgmDateTime presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmDateTime>;
          break;
        case HTML_CONTROLS.TIME:
          renderVal = <KgmTime presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmTime>;
          break;
        case HTML_CONTROLS.MULTISELECT:
          renderVal = <KgmMultiSelect presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmMultiSelect>;
          break;
        case HTML_CONTROLS.TREESELECT:
          renderVal = <KgmTreeSelect presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmTreeSelect>;
          break;
        case HTML_CONTROLS.IMAGE:
          renderVal = <KgmImage presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmImage>;
          break;
        case HTML_CONTROLS.PREVIEW:
        case HTML_CONTROLS.FILE:
          renderVal = <KgmFile presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmFile>;
          break;
        case HTML_CONTROLS.SEARCH:
          renderVal = <KgmSearch presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmSearch>;
          break;
        case HTML_CONTROLS.RADIO:
          renderVal = <KgmRadio presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmRadio>;
          break;
        case HTML_CONTROLS.SELECT:
          renderVal = <KgmSelect presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmSelect>;
          break;
        case HTML_CONTROLS.TEXT:
          renderVal = <KgmText presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmText>;
          break;
        case HTML_CONTROLS.NUMBER:
          renderVal = <KgmNumber presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmNumber>;
          break;
        case HTML_CONTROLS.BOOLEAN:
          renderVal = <KgmBoolean presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmBoolean>;
          break;
        case HTML_CONTROLS.CURRENCY:
          renderVal = <KgmCurrency presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmCurrency>;
          break;
        case HTML_CONTROLS.ACTIVITY:
          renderVal = <KgmActivity presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmActivity>;
          break;
        case HTML_CONTROLS.COMMENTS:
          renderVal = <KgmComments presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmComments>;
          break;
        case HTML_CONTROLS.CUSTOMACTIVITYLOG:
          renderVal = <KgmActivityLog presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmActivityLog>;
          break;
        case HTML_CONTROLS.CHECKLIST:
          renderVal = <KgmCheckList presentationRule={presentationRule} data={data} isEditing={false} onChange={() => { }} defaultVal={defaultVal()}></KgmCheckList>;
          break;
        default:
          renderVal = <>{value}</>

      }
    }
    return renderVal;
  }
  return (
    <div>{renderColumn()}</div>
  )
}

export default KgmField;
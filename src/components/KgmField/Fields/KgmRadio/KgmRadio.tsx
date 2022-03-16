import { Radio } from 'antd';
import { CONSTANTS } from 'core/Constants';
import PresentationHelper from 'core/helpers/PresentationHelper';
import _ from 'lodash';
import React, { ReactElement, useEffect, useState } from 'react'

type Props = {
  presentationRule: any;
  data: any;
  onChange: any;
  isEditing: boolean;
  defaultVal: ReactElement;
  constructOutputData: any;
};

function KgmRadio({ presentationRule, data, onChange, isEditing, defaultVal, constructOutputData }: Props) {
  const { label, attrName, readOnly, mandatory, htmlControl } = presentationRule;
  const _value = _.get(data, attrName);
  const displayAttributes = PresentationHelper.getDisplayAttributes(presentationRule);
  const entityConsumed = PresentationHelper.getEntityConsumed(presentationRule);
  const [value, setValue] = useState(_value);
  const [radioGroup, setRadioGroup] = useState([]);

  useEffect(() => {
    renderOptions();
  }, [data])

  const onFieldChanged = (e: any) => {
    const selectedVal = e.target.value;
    onChange(attrName, selectedVal);
    setValue(selectedVal);
  };

  const renderOptions = () => {
    let options = [];
    let optionsData = constructOutputData[entityConsumed];
    if (optionsData === CONSTANTS.REMOVED) {
      optionsData = [];
    }
    if (optionsData) {
      optionsData.map(option => {
        const displayString = PresentationHelper.computeDisplayString(option, displayAttributes);
        const _option = <Radio key={entityConsumed + "_" + option.id} value={option.id} >{displayString}</Radio>;
        options.push(_option);
      });
    }
    setRadioGroup(options);
  }

  const renderVal = () => {
    return PresentationHelper.computeDisplayString(value, displayAttributes);
  }

  return (
    isEditing ?
      <div className={"field-wrapper" + (readOnly ? " disabled" : "")}>
        <Radio.Group onChange={onFieldChanged}>
          {radioGroup}
        </Radio.Group>
      </div>
      :
      <>{renderVal()}</>
  )
}

export default KgmRadio
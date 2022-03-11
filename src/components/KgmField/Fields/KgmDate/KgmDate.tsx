import { DatePicker, TimePicker } from 'antd';
import { HTML_CONTROLS } from 'core/Constants';
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

function KgmDate({ presentationRule, data, onChange, isEditing, defaultVal, constructOutputData }: Props) {
  const { attrName, readOnly, htmlControl } = presentationRule;
  const _value = _.get(data, attrName);
  const [value, setValue] = useState(_value);

  const onFieldChanged = (e: any) => {
    const selectedVal = e.target.value;
    onChange(attrName, selectedVal);
    setValue(selectedVal);
  };

  const renderDate = () => {
    let renderVal = <></>;
    switch (htmlControl) {
      case HTML_CONTROLS.DATETIME:
        renderVal = <DatePicker showTime onChange={onFieldChanged} value={value} />
        break;
      case HTML_CONTROLS.DATE:
        renderVal = <DatePicker onFieldChanged={onChange} value={value} />
        break;
      case HTML_CONTROLS.TIME:
        renderVal = <TimePicker onFieldChanged={onChange} value={value} />;
        break;
    }
    return renderVal;
  }

  return (
    isEditing ?
      <div className={"field-wrapper" + (readOnly ? " disabled" : "")}>
        {renderDate()}
      </div>
      :
      <>{defaultVal}</>
  )
}

export default KgmDate
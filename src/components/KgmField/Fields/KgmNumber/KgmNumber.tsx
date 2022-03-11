import { InputNumber } from 'antd';
import _ from 'lodash';
import React, { ReactElement, useState } from 'react'

type Props = {
  presentationRule: any;
  data: any;
  onChange: any;
  isEditing: boolean;
  defaultVal: ReactElement;
  constructOutputData: any;
};

function KgmNumber({ presentationRule, data, onChange, isEditing, defaultVal, constructOutputData }: Props) {
  const { label, attrName, readOnly, mandatory } = presentationRule;
  const _value = _.get(data, attrName);
  const [value, setValue] = useState(_value);

  const onFieldChanged = (e: any) => {
    onChange(attrName, e.target.value);
    setValue(e.target.value);
  };

  return (
    isEditing ?
      <div className={"field-wrapper" + (readOnly ? " disabled" : "")}>
        <InputNumber defaultValue={3} onChange={onFieldChanged} />
      </div> :
      <>{defaultVal}</>
  );
}

export default KgmNumber
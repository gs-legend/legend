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


function KgmActivity({ presentationRule, data, onChange, isEditing, defaultVal, constructOutputData }: Props) {
  const { attrName, readOnly, htmlControl } = presentationRule;
  const _value = _.get(data, attrName);
  const [value, setValue] = useState(_value);

  const onFieldChanged = (e: any) => {
    const selectedVal = e.target.value;
    onChange(attrName, selectedVal);
    setValue(selectedVal);
  };

  return (
    isEditing ?
      <div className={"field-wrapper" + (readOnly ? " disabled" : "")}>
        KgmActivity
      </div>
      :
      <>{defaultVal}</>
  )
}

export default KgmActivity
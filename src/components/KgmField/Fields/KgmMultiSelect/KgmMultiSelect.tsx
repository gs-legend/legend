import React, { ReactElement } from 'react'

type Props = {
  presentationRule: any;
  data: any;
  onChange: any;
  isEditing: boolean;
  defaultVal: ReactElement;
};

function KgmMultiSelect({ presentationRule, data, onChange, isEditing, defaultVal }: Props) {
  return (
    <>{defaultVal}</>
  )
}

export default KgmMultiSelect
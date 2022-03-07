import React, { ReactElement } from 'react'

type Props = {
  presentationRule: any;
  data: any;
  onChange: any;
  isEditing: boolean;
  defaultVal: ReactElement;
};

function KgmReport({ presentationRule, data, onChange, isEditing, defaultVal }: Props) {
  return (
    <>{defaultVal}</>
  )
}

export default KgmReport
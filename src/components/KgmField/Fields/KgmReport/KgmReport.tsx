import React, { ReactElement } from 'react'

type Props = {
  presentationRule: any;
  data: any;
  onChange: any;
  isEditing: boolean;
  defaultVal: ReactElement;
  constructOutputData: any;
};

function KgmReport({ presentationRule, data, onChange, isEditing, defaultVal, constructOutputData }: Props) {
  return (
    <>Report</>
  )
}

export default KgmReport
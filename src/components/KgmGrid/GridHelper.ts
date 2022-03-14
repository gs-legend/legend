export class GridHelper {
  constructor(private constructOutputData: any, private presentation: any, private presentationRules: Array<any>) {
  }

  getColumns = () => {
    const _self = this;
    const pRuleKeys = Object.keys(_self.presentationRules)
    const columns: any = [];
    if (_self.presentation.actions?.length) {
      columns.push({
        field: "", sortable: false, width: 64, suppressSizeToFit: true, suppressColumnsToolPanel: true, filter: false,
        headerCheckboxSelection: true, checkboxSelection: true, suppressMovable: true, pinned: 'left', resizable: false
      });
    }
    pRuleKeys.forEach((pRuleKey: any, index: number) => {
      const presentationRule = _self.presentationRules[pRuleKey];
      if (presentationRule.visible) {
        const column: any = {
          headerName: presentationRule.label,
          field: presentationRule.attrName,
          // valueGetter : ,
          type: 'nonEditableColumn',
          // cellRenderer: (props) => {
          //   const { data } = props;
          //   return <KgmField presentationRule={presentationRule} constructOutputData={constructOutputData} data={data} isEditing={false} presentation={presentation} fieldChanged={() => { }}></KgmField>;
          // }
        };
        if (index === 1) {
          column.pinned = 'left';
        }
        columns.push(column);
      }
    });
    return columns;
  }
}
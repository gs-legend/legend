import {
    Autowired,
    Bean,
    SelectableService,
    BeanStub
} from 'components/Grid/core';
import { IRowNodeStage, StageExecuteParams } from 'components/Grid/core/ts/interfaces/iRowNodeStage';

import { FilterService } from "./filterService";

@Bean('filterStage')
export class FilterStage extends BeanStub implements IRowNodeStage {

    @Autowired('selectableService') private selectableService: SelectableService;
    @Autowired('filterService') private filterService: FilterService;

    public execute(params: StageExecuteParams): void {
        const { rowNode, changedPath } = params;

        this.filterService.filter(changedPath!);

        this.selectableService.updateSelectableAfterFiltering(rowNode);
    }
}

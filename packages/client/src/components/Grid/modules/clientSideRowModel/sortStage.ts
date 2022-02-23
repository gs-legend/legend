import {
    _,
    Autowired,
    Bean,
    ColumnModel,
    RowNode,
    SortController,
    BeanStub,
} from 'components/Grid/core';
import { StageExecuteParams } from 'components/Grid/core/ts/interfaces/iRowNodeStage';
import { RowNodeTransaction } from 'components/Grid/core/ts/interfaces/rowNodeTransaction';
import { SortOption } from 'components/Grid/core/ts/rowNodes/rowNodeSorter';

import { SortService } from "./sortService";

@Bean('sortStage')
export class SortStage extends BeanStub {

    @Autowired('sortService') private sortService: SortService;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('columnModel') private columnModel: ColumnModel;

    public execute(params: StageExecuteParams): void {
        const sortOptions: SortOption[] = this.sortController.getSortOptions();

        const sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        const deltaSort = sortActive
            && _.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsWrapper.isDeltaSort();

        // we only need dirty nodes if doing delta sort
        const dirtyLeafNodes = deltaSort ? this.calculateDirtyNodes(params.rowNodeTransactions) : null;

        const noAggregations = _.missingOrEmpty(this.columnModel.getValueColumns());
        const sortContainsGroupColumns = sortOptions.some(opt => !!opt.column.getColDef().showRowGroup);

        this.sortService.sort(sortOptions, sortActive, deltaSort, dirtyLeafNodes, params.changedPath, noAggregations, sortContainsGroupColumns);
    }

    private calculateDirtyNodes(rowNodeTransactions?: RowNodeTransaction[] | null): { [nodeId: string]: boolean } {
        const dirtyNodes: { [nodeId: string]: boolean } = {};

        const addNodesFunc = (rowNodes: RowNode[]) => {
            if (rowNodes) {
                rowNodes.forEach(rowNode => dirtyNodes[rowNode.id!] = true);
            }
        };

        // all leaf level nodes in the transaction were impacted
        if (rowNodeTransactions) {
            rowNodeTransactions.forEach(tran => {
                addNodesFunc(tran.add);
                addNodesFunc(tran.update);
                addNodesFunc(tran.remove);
            });
        }

        return dirtyNodes;
    }

}

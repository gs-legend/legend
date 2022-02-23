import { Autowired, BeanStub, ColumnApi, Environment, GridApi, RowNode, _ } from 'components/Grid/core';
import { DetailGridInfo } from 'components/Grid/core/ts/gridApi';
import { IDetailCellRenderer, IDetailCellRendererCtrl, IDetailCellRendererParams } from 'components/Grid/core/ts/interfaces/masterDetail';

export class DetailCellRendererCtrl extends BeanStub implements IDetailCellRendererCtrl {

    @Autowired('environment') private environment: Environment;

    private params: IDetailCellRendererParams;

    private comp: IDetailCellRenderer;

    private loadRowDataVersion = 0;

    private needRefresh = false;

    public init(comp: IDetailCellRenderer, params: IDetailCellRendererParams): void {
        this.params = params;
        this.comp = comp;

        const doNothingBecauseInsidePinnedSection = params.pinned != null;
        if (doNothingBecauseInsidePinnedSection) { return; }

        this.setAutoHeightClasses();
        this.checkForDeprecations();
        this.ensureValidRefreshStrategy();
        this.addThemeToDetailGrid();
        this.createDetailGrid();
        this.loadRowData();

        this.addManagedListener(params.node.parent!, RowNode.EVENT_DATA_CHANGED, () => {
            this.needRefresh = true;
        });
    }

    private setAutoHeightClasses(): void {
        const autoHeight = this.gridOptionsWrapper.isDetailRowAutoHeight();

        const parentClass = autoHeight ? 'ag-details-row-auto-height' : 'ag-details-row-fixed-height';
        const detailClass =  autoHeight ? 'ag-details-grid-auto-height' : 'ag-details-grid-fixed-height';

        this.comp.addOrRemoveCssClass(parentClass, true);
        this.comp.addOrRemoveDetailGridCssClass(detailClass, true);
    }

    private checkForDeprecations(): void {
        if (this.params.suppressRefresh) {
            console.warn("AG Grid: as of v23.2.0, cellRendererParams.suppressRefresh for Detail Cell Renderer is no " +
                "longer used. Please set cellRendererParams.refreshStrategy = 'nothing' instead.");
            this.params.refreshStrategy = 'nothing';
        }
    }

    private ensureValidRefreshStrategy(): void {
        switch (this.params.refreshStrategy) {
            case 'rows':
            case 'nothing':
            case 'everything':
                return;
        }

        // check for incorrectly supplied refresh strategy
        if (this.params.refreshStrategy) {
            console.warn("AG Grid: invalid cellRendererParams.refreshStrategy = '" + this.params.refreshStrategy +
                "' supplied, defaulting to refreshStrategy = 'rows'.");
        }

        // use default strategy
        this.params.refreshStrategy = 'rows';
    }

    private addThemeToDetailGrid(): void {
        // this is needed by environment service of the child grid, the class needs to be on
        // the grid div itself - the browser's CSS on the other hand just inherits from the parent grid theme.
        const { theme } = this.environment.getTheme();
        if (theme) {
            this.comp.addOrRemoveDetailGridCssClass(theme, true);
        }
    }

    private createDetailGrid(): void {
        if (_.missing(this.params.detailGridOptions)) {
            console.warn('AG Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
            return;
        }

        const autoHeight = this.gridOptionsWrapper.isDetailRowAutoHeight();

        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api and columnApi into gridOptions
        const gridOptions = {...this.params.detailGridOptions};

        if (autoHeight) {
            gridOptions.domLayout = 'autoHeight';
        }

        this.comp.setDetailGrid(gridOptions);
    }

    public registerDetailWithMaster(api: GridApi, columnApi: ColumnApi): void {
        const rowId = this.params.node.id!;
        const masterGridApi = this.params.api;

        const gridInfo: DetailGridInfo = {
            id: rowId,
            api: api,
            columnApi: columnApi
        };

        const rowNode = this.params.node;

        // register with api
        masterGridApi.addDetailGridInfo(rowId, gridInfo);

        // register with node
        rowNode.detailGridInfo = gridInfo;

        this.addDestroyFunc(() => {
            // the gridInfo can be stale if a refresh happens and
            // a new row is created before the old one is destroyed.
            if (rowNode.detailGridInfo !== gridInfo) { return; }
            masterGridApi.removeDetailGridInfo(rowId); // unregister from api
            rowNode.detailGridInfo = null; // unregister from node
        });
    }

    private loadRowData(): void {

        // in case a refresh happens before the last refresh completes (as we depend on async
        // application logic) we keep track on what the latest call was.
        this.loadRowDataVersion++;
        const versionThisCall = this.loadRowDataVersion;

        const userFunc = this.params.getDetailRowData;
        if (!userFunc) {
            console.warn('AG Grid: could not find getDetailRowData for master / detail, ' +
                'please set gridOptions.detailCellRendererParams.getDetailRowData');
            return;
        }

        const successCallback = (rowData: any[]) => {
            const mostRecentCall = this.loadRowDataVersion === versionThisCall;
            if (mostRecentCall) {
                this.comp.setRowData(rowData);
            }
        };

        const funcParams: any = {
            node: this.params.node,
            // we take data from node, rather than params.data
            // as the data could have been updated with new instance
            data: this.params.node.data,
            successCallback: successCallback,
            context: this.gridOptionsWrapper.getContext()
        };
        userFunc(funcParams);
    }

    public refresh(): boolean {
        const GET_GRID_TO_REFRESH = false;
        const GET_GRID_TO_DO_NOTHING = true;

        // if we return true, it means we pretend to the grid
        // that we have refreshed, so refresh will never happen.
        const doNotRefresh = !this.needRefresh || this.params.refreshStrategy === 'nothing';
        if (doNotRefresh) {
            // we do nothing in this refresh method, and also tell the grid to do nothing
            return GET_GRID_TO_DO_NOTHING;
        }

        // reset flag, so don't refresh again until more data changes.
        this.needRefresh = false;

        if (this.params.refreshStrategy === 'everything') {
            // we want full refresh, so tell the grid to destroy and recreate this cell
            return GET_GRID_TO_REFRESH;
        } else {
            // do the refresh here, and tell the grid to do nothing
            this.loadRowData();
            return GET_GRID_TO_DO_NOTHING;
        }
    }
}

import {
    _,
    Autowired,
    ColumnApi,
    Component,
    Events,
    GridApi,
    ModuleNames,
    ModuleRegistry
} from 'components/Grid/core';
import { PivotModePanel } from "./pivotModePanel";
import { PivotDropZonePanel, RowGroupDropZonePanel, ValuesDropZonePanel } from "components/Grid/modules/rowGrouping";
import { PrimaryColsPanel } from "./primaryColsPanel";
import { IToolPanelComp, IToolPanelParams } from 'components/Grid/core/ts/interfaces/iToolPanel';
import { IColumnToolPanel } from 'components/Grid/core/ts/interfaces/iColumnToolPanel';
import { ColDef, ColGroupDef } from 'components/Grid/core/ts/entities/colDef';

export interface ToolPanelColumnCompParams extends IToolPanelParams {
    suppressColumnMove: boolean;
    suppressRowGroups: boolean;
    suppressValues: boolean;
    suppressPivots: boolean;
    suppressPivotMode: boolean;
    suppressColumnFilter: boolean;
    suppressColumnSelectAll: boolean;
    suppressColumnExpandAll: boolean;
    contractColumnSelection: boolean;
    suppressSyncLayoutWithGrid: boolean;
}

export class ColumnToolPanel extends Component implements IColumnToolPanel, IToolPanelComp {

    private static TEMPLATE = `<div class="ag-column-panel"></div>`;

    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("columnApi") private columnApi: ColumnApi;

    private initialised = false;
    private params: ToolPanelColumnCompParams;

    private childDestroyFuncs: (() => void)[] = [];

    private pivotModePanel: PivotModePanel;
    private primaryColsPanel: PrimaryColsPanel;
    private rowGroupDropZonePanel: RowGroupDropZonePanel;
    private valuesDropZonePanel: ValuesDropZonePanel;
    private pivotDropZonePanel: PivotDropZonePanel;

    constructor() {
        super(ColumnToolPanel.TEMPLATE);
    }

    // lazy initialise the panel
    public setVisible(visible: boolean): void {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    }

    public init(params: ToolPanelColumnCompParams): void {
        const defaultParams: ToolPanelColumnCompParams = {
            suppressColumnMove: false,
            suppressColumnSelectAll: false,
            suppressColumnFilter: false,
            suppressColumnExpandAll: false,
            contractColumnSelection: false,
            suppressPivotMode: false,
            suppressRowGroups: false,
            suppressValues: false,
            suppressPivots: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi
        };

        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;

        if (this.isRowGroupingModuleLoaded() && !this.params.suppressPivotMode) {
            this.pivotModePanel = this.createBean(new PivotModePanel()); // DO NOT CHANGE TO createManagedBean
            this.childDestroyFuncs.push(() => this.destroyBean(this.pivotModePanel));
            this.appendChild(this.pivotModePanel);
        }

        this.primaryColsPanel = this.createBean(new PrimaryColsPanel()); // DO NOT CHANGE TO createManagedBean
        this.childDestroyFuncs.push(() => this.destroyBean(this.primaryColsPanel));

        this.primaryColsPanel.init(true, this.params, "toolPanelUi");
        this.primaryColsPanel.addCssClass('ag-column-panel-column-select');
        this.appendChild(this.primaryColsPanel);

        if (this.isRowGroupingModuleLoaded()) {
            if (!this.params.suppressRowGroups) {
                this.rowGroupDropZonePanel = this.createBean(new RowGroupDropZonePanel(false)); // DO NOT CHANGE TO createManagedBean
                this.childDestroyFuncs.push(() => this.destroyBean(this.rowGroupDropZonePanel));
                this.appendChild(this.rowGroupDropZonePanel);
            }

            if (!this.params.suppressValues) {
                this.valuesDropZonePanel = this.createBean(new ValuesDropZonePanel(false)); // DO NOT CHANGE TO createManagedBean
                this.childDestroyFuncs.push(() => this.destroyBean(this.valuesDropZonePanel));
                this.appendChild(this.valuesDropZonePanel);
            }

            if (!this.params.suppressPivots) {
                this.pivotDropZonePanel = this.createBean(new PivotDropZonePanel(false)); // DO NOT CHANGE TO createManagedBean
                this.childDestroyFuncs.push(() => this.destroyBean(this.pivotDropZonePanel));
                this.appendChild(this.pivotDropZonePanel);
            }

            this.setLastVisible();
            const pivotModeListener = this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => {
                this.resetChildrenHeight();
                this.setLastVisible();
            });
            this.childDestroyFuncs.push(() => pivotModeListener!());
        }

        this.initialised = true;
    }

    public setPivotModeSectionVisible(visible: boolean): void {
        if (!this.isRowGroupingModuleLoaded()) { return; }

        if (this.pivotModePanel) {
            this.pivotModePanel.setDisplayed(visible);
        } else if (visible) {
            this.pivotModePanel = this.createBean(new PivotModePanel());

            // ensure pivot mode panel is positioned at the top of the columns tool panel
            this.getGui().insertBefore(this.pivotModePanel.getGui(), this.getGui().firstChild);
            this.childDestroyFuncs.push(() => this.destroyBean(this.pivotModePanel));
        }
        this.setLastVisible();
    }

    public setRowGroupsSectionVisible(visible: boolean): void {
        if (!this.isRowGroupingModuleLoaded()) { return; }

        if (this.rowGroupDropZonePanel) {
            this.rowGroupDropZonePanel.setDisplayed(visible);
        } else if (visible) {
            this.rowGroupDropZonePanel = this.createManagedBean(new RowGroupDropZonePanel(false));
            this.appendChild(this.rowGroupDropZonePanel);
        }
        this.setLastVisible();
    }

    public setValuesSectionVisible(visible: boolean): void {
        if (!this.isRowGroupingModuleLoaded()) { return; }

        if (this.valuesDropZonePanel) {
            this.valuesDropZonePanel.setDisplayed(visible);
        } else if (visible) {
            this.valuesDropZonePanel = this.createManagedBean(new ValuesDropZonePanel(false));
            this.appendChild(this.valuesDropZonePanel);
        }
        this.setLastVisible();
    }

    public setPivotSectionVisible(visible: boolean): void {
        if (!this.isRowGroupingModuleLoaded()) { return; }

        if (this.pivotDropZonePanel) {
            this.pivotDropZonePanel.setDisplayed(visible);
        } else if (visible) {
            this.pivotDropZonePanel = this.createManagedBean(new PivotDropZonePanel(false));
            this.appendChild(this.pivotDropZonePanel);
            this.pivotDropZonePanel.setDisplayed(visible);
        }
        this.setLastVisible();
    }

    private setResizers(): void {
        [
            this.primaryColsPanel,
            this.rowGroupDropZonePanel,
            this.valuesDropZonePanel,
            this.pivotDropZonePanel
        ].forEach(panel => {
            if (!panel) { return; }
            const eGui = panel.getGui();
            panel.toggleResizable(!eGui.classList.contains('ag-last-column-drop') && !eGui.classList.contains('ag-hidden'));
        });
    }

    private setLastVisible(): void {
        const eGui = this.getGui();

        const columnDrops: HTMLElement[] = Array.prototype.slice.call(eGui.querySelectorAll('.ag-column-drop'));

        columnDrops.forEach(columnDrop => columnDrop.classList.remove('ag-last-column-drop'));

        const columnDropEls = eGui.querySelectorAll('.ag-column-drop:not(.ag-hidden)');
        const lastVisible = _.last(columnDropEls) as HTMLElement;

        if (lastVisible) {
            lastVisible.classList.add('ag-last-column-drop');
        }

        this.setResizers();
    }

    private resetChildrenHeight(): void {
        const eGui = this.getGui();
        const children = eGui.children;

        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            child.style.removeProperty('height');
            child.style.removeProperty('flex');
        }
    }

    private isRowGroupingModuleLoaded(): boolean {
        return ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Row Grouping');
    }

    public expandColumnGroups(groupIds?: string[]): void {
        this.primaryColsPanel.expandGroups(groupIds);
    }

    public collapseColumnGroups(groupIds?: string[]): void {
        this.primaryColsPanel.collapseGroups(groupIds);
    }

    public setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void {
        this.primaryColsPanel.setColumnLayout(colDefs);
    }

    public syncLayoutWithGrid(): void {
        this.primaryColsPanel.syncLayoutWithGrid();
    }

    public destroyChildren(): void {
        this.childDestroyFuncs.forEach(func => func());
        this.childDestroyFuncs.length = 0;
        _.clearElement(this.getGui());
    }

    public refresh(): void {
        this.destroyChildren();
        this.init(this.params);
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so this must be public.
    public destroy(): void {
        this.destroyChildren();
        super.destroy();
    }
}

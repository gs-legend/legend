export enum ModuleNames {

    // when using modules, user references this
    CommunityCoreModule = "@kagami/grid/core", // should this be grid-community-core?
    // when not using modules, user references this
    CommunityAllModules = "@kagami/grid/core", // should this be grid-community-all

    // community modules
    InfiniteRowModelModule = "@kagami/grid/infiniteRowModel",
    ClientSideRowModelModule = "@kagami/grid/clientSideRowModel",
    CsvExportModule = "@kagami/grid/csvExport",

    // enterprise core - users never import on this, but other enterprise modules do
    EnterpriseCoreModule = "@kagami/grid/core", // should this be grid-enterprise-core?
    // when not using modules, user references this
    EnterpriseAllModules = "@kagami/grid/all", // should this be grid-enterprise-all

    // enterprise modules
    RowGroupingModule = "@kagami/grid/rowGrouping",
    ColumnToolPanelModule = "@kagami/grid/columnToolPanel",
    FiltersToolPanelModule = "@kagami/grid/filterToolPanel",
    MenuModule = "@kagami/grid/menu",
    SetFilterModule = "@kagami/grid/setFilter",
    MultiFilterModule = "@kagami/grid/multiFilter",
    StatusBarModule = "@kagami/grid/statusBar",
    SideBarModule = "@kagami/grid/sideBar",
    RangeSelectionModule = "@kagami/grid/rangeSelection",
    MasterDetailModule = "@kagami/grid/masterDetail",
    RichSelectModule = "@kagami/grid/richSelect",
    GridChartsModule = "@kagami/grid/charts",
    ViewportRowModelModule = "@kagami/grid/viewportRowModel",
    ServerSideRowModelModule = "@kagami/grid/serverSideRowmodel", // or
    ExcelExportModule = "@kagami/grid/excelExport",
    ClipboardModule = "@kagami/grid/clipboard",
    SparklinesModule = "@kagami/grid/sparkLines",

    // framework wrappers currently don't provide beans, comps etc, so no need to be modules,
    // however i argue they should be as in theory they 'could' provide beans etc
    ReactModule = "@kagami/grid/ReactGrid"

    // and then this, which is definitely not a grid module, as it should not have any dependency
    // on the grid (ie shouldn't even reference the Module interface)
    // ChartsModule = "@kagami/grid/charts-core",
}

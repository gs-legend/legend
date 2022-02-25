import { BaseComponentWrapper, CtrlsService, ColumnApi, ComponentUtil, Context, GridApi, GridCoreCreator,  _ } from 'components/Grid/core';
import React, { Component } from 'react';
import { AgGridColumn } from '../shared/agGridColumn';
import { ChangeDetectionService, ChangeDetectionStrategyType } from '../shared/changeDetectionService';
import { AgReactUiProps } from '../shared/interfaces';
import { NewReactComponent } from '../shared/newReactComponent';
import { PortalManager } from '../shared/portalManager';
import GridComp from './gridComp';
import { ReactFrameworkOverrides } from '../shared/reactFrameworkOverrides';
import { GridOptions } from 'components/Grid/core/ts/entities/gridOptions';
import { GridParams } from 'components/Grid/core/ts/grid';
import { FrameworkComponentWrapper, WrappableInterface } from 'components/Grid/core/ts/components/framework/frameworkComponentWrapper';
import { ComponentType } from 'components/Grid/core/ts/components/framework/componentTypes';

export class AgGridReactUi extends Component<AgReactUiProps, { context: Context | undefined }> {

    public api!: GridApi;
    public columnApi!: ColumnApi;

    private gridOptions!: GridOptions;

    private destroyFuncs: (() => void)[] = [];
    private changeDetectionService = new ChangeDetectionService();
    private eGui = React.createRef<HTMLDivElement>();

    private portalManager: PortalManager;

    private whenReadyFuncs: (()=>void)[] = [];
    private ready = false;

    constructor(public props: any) {
        super(props);
        this.state = {context: undefined};
        this.portalManager = new PortalManager(this, props.componentWrappingElement, props.maxComponentCreationTimeMs);
    }

    public render() {
        return (
            <div style={ this.createStyleForDiv() } className={ this.props.className } ref={ this.eGui }>
                { this.state.context && <GridComp context={ this.state.context }/> }
                { this.portalManager.getPortals() }
            </div>
        );
    }

    private createStyleForDiv() {
        return {
            height: '100%',
            ...(this.props.containerStyle || {})
        };
    }

    public componentDidMount() {

        const modules = this.props.modules || [];
        const gridParams: GridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this.portalManager)
            },
            modules,
            frameworkOverrides: new ReactFrameworkOverrides(true)
        };

        this.gridOptions = this.props.gridOptions || {};
        const {children} = this.props;

        if (AgGridColumn.hasChildColumns(children)) {
            this.gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(children);
        }

        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this.props);

        const createUiCallback = (context: Context) => {
            this.setState({context: context});

            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(CtrlsService.NAME) as CtrlsService;
            ctrlsService.whenReady( ()=> {
                this.api = this.gridOptions.api!;
                this.columnApi = this.gridOptions.columnApi!;
                this.props.setGridApi(this.api, this.columnApi);    
                this.destroyFuncs.push(() => this.api.destroy());
            });
        };

        // this callback adds to ctrlsService.whenReady(), just like above, however because whenReady() executes
        // funcs in the order they were received, we know adding items here will be AFTER the grid has set columns
        // and data. this is because GridCoreCreator sets these between calling createUiCallback and acceptChangesCallback
        const acceptChangesCallback = (context: Context)=> {
            const ctrlsService = context.getBean(CtrlsService.NAME) as CtrlsService;
            ctrlsService.whenReady( ()=> {
                this.whenReadyFuncs.forEach( f => f() );
                this.whenReadyFuncs.length = 0;
                this.ready = true;
            });
        }

        // don't need the return value
        const gridCoreCreator = new GridCoreCreator();
        gridCoreCreator.create(this.eGui.current!, this.gridOptions, createUiCallback, acceptChangesCallback, gridParams);
    }

    public componentWillUnmount() {
        this.destroyFuncs.forEach(f => f());
    }

    public componentDidUpdate(prevProps: any) {
        this.processPropsChanges(prevProps, this.props);
    }

    public processPropsChanges(prevProps: any, nextProps: any) {
        const changes = {};

        this.extractGridPropertyChanges(prevProps, nextProps, changes);
        this.extractDeclarativeColDefChanges(nextProps, changes);

        this.processChanges(changes);
    }

    private extractDeclarativeColDefChanges(nextProps: any, changes: any) {
        // if columnDefs are provided on gridOptions we use those - you can't combine both
        // we also skip if columnDefs are provided as a prop directly on AgGridReact
        if ((this.props.gridOptions && this.props.gridOptions.columnDefs) || this.props.columnDefs) {
            return;
        }

        const debugLogging = !!nextProps.debug;
        const propKey = 'columnDefs';
        const currentColDefs = this.gridOptions.columnDefs;

        if (AgGridColumn.hasChildColumns(nextProps.children)) {
            const detectionStrategy = this.changeDetectionService.getStrategy(this.getStrategyTypeForProp(propKey));
            const newColDefs = AgGridColumn.mapChildColumnDefs(nextProps.children);

            if (!detectionStrategy.areEqual(currentColDefs, newColDefs)) {
                if (debugLogging) {
                    console.log(`agGridReact: colDefs definitions changed`);
                }

                changes[propKey] =
                    {
                        previousValue: currentColDefs,
                        currentValue: newColDefs
                    };
            }
        } else if (currentColDefs && currentColDefs.length > 0) {
            changes[propKey] =
                {
                    previousValue: currentColDefs,
                    currentValue: []
                };
        }
    }

    private extractGridPropertyChanges(prevProps: any, nextProps: any, changes: any) {
        const debugLogging = !!nextProps.debug;

        Object.keys(nextProps).forEach(propKey => {
            if (_.includes(ComponentUtil.ALL_PROPERTIES, propKey)) {
                const changeDetectionStrategy = this.changeDetectionService.getStrategy(this.getStrategyTypeForProp(propKey));

                if (!changeDetectionStrategy.areEqual(prevProps[propKey], nextProps[propKey])) {
                    if (debugLogging) {
                        console.log(`agGridReact: [${propKey}] property changed`);
                    }

                    changes[propKey] = {
                        previousValue: prevProps[propKey],
                        currentValue: nextProps[propKey]
                    };
                }
            }
        });

        ComponentUtil.getEventCallbacks().forEach(funcName => {
            if (prevProps[funcName] !== nextProps[funcName]) {
                if (debugLogging) {
                    console.log(`agGridReact: [${funcName}] event callback changed`);
                }

                changes[funcName] = {
                    previousValue: prevProps[funcName],
                    currentValue: nextProps[funcName]
                };
            }
        });
    }

    private processChanges(changes: {}) {
        this.processWhenReady( ()=>
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi)
        );
    }

    private processWhenReady(func: ()=>void): void {
        if (this.ready) {
            func();
        } else {
            this.whenReadyFuncs.push(func);
        }
    }

    private getStrategyTypeForProp(propKey: string) {
        if (propKey === 'rowData') {
            if (this.props.rowDataChangeDetectionStrategy) {
                return this.props.rowDataChangeDetectionStrategy;
            }
            if (this.isImmutableDataActive()) {
                return ChangeDetectionStrategyType.IdentityCheck;
            }
        }

        // all other cases will default to DeepValueCheck
        return ChangeDetectionStrategyType.DeepValueCheck;
    }

    private isImmutableDataActive() {
        return (this.props.deltaRowDataMode || this.props.immutableData) ||
            (this.props.gridOptions && (this.props.gridOptions.deltaRowDataMode || this.props.gridOptions.immutableData));
    }
}

class ReactFrameworkComponentWrapper extends BaseComponentWrapper<WrappableInterface> implements FrameworkComponentWrapper {

    private readonly parent: PortalManager;    

    constructor(parent: PortalManager) {
        super();
        this.parent = parent;
    }

    createWrapper(UserReactComponent: { new(): any; }, componentType: ComponentType): WrappableInterface {
        return new NewReactComponent(UserReactComponent, this.parent, componentType);
    }
}

import { Bean, BeanStub } from 'components/Grid/core';
import { IStatusBarService } from 'components/Grid/core/ts/interfaces/iStatusBarService';
import { IStatusPanelComp } from 'components/Grid/core/ts/interfaces/iStatusPanel';

@Bean('statusBarService')
export class StatusBarService extends BeanStub implements IStatusBarService {

    private allComponents: { [p: string]: IStatusPanelComp } = {};

    // tslint:disable-next-line
    constructor() {
        super();
    }

    public registerStatusPanel(key: string, component: IStatusPanelComp): void {
        this.allComponents[key] = component;
    }

    public getStatusPanel(key: string): IStatusPanelComp {
        return this.allComponents[key];
    }
}

import { Bean, BeanStub,  SelectionHandleType } from 'components/Grid/core';
import { RangeHandle } from "./rangeHandle";
import { FillHandle } from "./fillHandle";
import { ISelectionHandle, ISelectionHandleFactory } from 'components/Grid/core/ts/interfaces/IRangeService';

@Bean('selectionHandleFactory')
export class SelectionHandleFactory extends BeanStub implements ISelectionHandleFactory {
    public createSelectionHandle(type: SelectionHandleType): ISelectionHandle {
        return this.createBean(type === SelectionHandleType.RANGE ? new RangeHandle() : new FillHandle());
    }
}

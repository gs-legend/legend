import { AbstractHeaderCellCtrl, HeaderGroupCellCtrl, HeaderCellCtrl, HeaderFilterCellCtrl, HeaderRowCtrl, HeaderRowType, _ } from 'components/Grid/core';
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import HeaderCellComp from './headerCellComp';
import HeaderGroupCellComp from './headerGroupCellComp';
import HeaderFilterCellComp from './headerFilterCellComp';
import { IHeaderRowComp } from 'components/Grid/core/ts/headerRendering/row/headerRowCtrl';

const HeaderRowComp = (props: {ctrl: HeaderRowCtrl}) => {

    const {gridOptionsWrapper} = useContext(BeansContext);

    const [ transform, setTransform ] = useState<string>();
    const [ height, setHeight ] = useState<string>();
    const [ top, setTop ] = useState<string>();
    const [ width, setWidth ] = useState<string>();
    const [ ariaRowIndex, setAriaRowIndex ] = useState<number>();
    const [ cellCtrls, setCellCtrls ] = useState<AbstractHeaderCellCtrl[]>([]);

    const eGui = useRef<HTMLDivElement>(null);

    const { ctrl } = props;

    const typeColumn = ctrl.getType() === HeaderRowType.COLUMN;
    const typeGroup = ctrl.getType() === HeaderRowType.COLUMN_GROUP;
    const typeFilter = ctrl.getType() === HeaderRowType.FLOATING_FILTER;

    const setCellCtrlsMaintainOrder = useCallback( (prev: AbstractHeaderCellCtrl[], next: AbstractHeaderCellCtrl[]) => {

        // if we are ensuring dom order, we set the ctrls into the dom in the same order they appear on screen
        if (gridOptionsWrapper.isEnsureDomOrder()) {
            return next;
        }

        // if not maintaining order, we want to keep the dom elements we have and add new ones to the end,
        // otherwise we will loose transition effects as elements are placed in different dom locations
        const prevMap = _.mapById(prev, c => c.getInstanceId());
        const nextMap = _.mapById(next, c => c.getInstanceId());

        const oldCtrlsWeAreKeeping = prev.filter( c => nextMap.has(c.getInstanceId()) );
        const newCtrls = next.filter( c => !prevMap.has(c.getInstanceId()) )

        return [...oldCtrlsWeAreKeeping, ...newCtrls];
    }, []);

    useEffect(() => {

        const compProxy: IHeaderRowComp = {
            setTransform: transform => setTransform(transform),
            setHeight: height => setHeight(height),
            setTop: top => setTop(top),
            setHeaderCtrls: ctrls => setCellCtrls(prev => setCellCtrlsMaintainOrder(prev, ctrls)),
            setWidth: width => setWidth(width),
            setAriaRowIndex: rowIndex => setAriaRowIndex(rowIndex)
        };

        ctrl.setComp(compProxy);

    }, []);

    const style = useMemo( ()=> ({
        transform: transform,
        height: height,
        top: top,
        width: width
    }), [transform, height, top, width]);

    const className = useMemo( ()=> {
        const res: string[] = [`ag-header-row`];
        
        typeColumn && res.push(`ag-header-row-column`);
        typeGroup && res.push(`ag-header-row-column-group`);
        typeFilter && res.push(`ag-header-row-column-filter`);

        return res.join(' ');
    }, []);

    const createCellJsx = useCallback( (cellCtrl: AbstractHeaderCellCtrl) => {
        switch (ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP :
                return <HeaderGroupCellComp ctrl={cellCtrl as HeaderGroupCellCtrl} key={cellCtrl.getInstanceId()} />;

            case HeaderRowType.FLOATING_FILTER :
                return <HeaderFilterCellComp ctrl={cellCtrl as HeaderFilterCellCtrl} key={cellCtrl.getInstanceId()} />;
                
            default :
                return <HeaderCellComp ctrl={cellCtrl as HeaderCellCtrl} key={cellCtrl.getInstanceId()} />;
        }
    }, []);

    // below, we are not doing floating filters, not yet
    return (
        <div ref={eGui} className={className} role="row" style={style} aria-rowindex={ariaRowIndex}>
            { cellCtrls.map( createCellJsx ) }
        </div>
    );
};

export default memo(HeaderRowComp);

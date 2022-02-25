import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import {
    HeaderRowCtrl, HeaderRowContainerCtrl, Constants
} from 'components/Grid/core';
import { CssClasses } from '../utils';
import HeaderRowComp from './headerRowComp';
import { IHeaderRowContainerComp } from 'components/Grid/core/ts/headerRendering/rowContainer/headerRowContainerCtrl';


const HeaderRowContainerComp = (props: { pinned: string | null }) => {

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [centerContainerWidth, setCenterContainerWidth] = useState<string>();
    const [centerContainerTransform, setCenterContainerTransform] = useState<string>();
    const [pinnedContainerWidth, setPinnedContainerWidth] = useState<string>();
    const [headerRowCtrls, setHeaderRowCtrls] = useState<HeaderRowCtrl[]>([]);

    const { context } = useContext(BeansContext);
    const eGui = useRef<HTMLDivElement>(null);

    const pinnedLeft = props.pinned === Constants.PINNED_LEFT;
    const pinnedRight = props.pinned === Constants.PINNED_RIGHT;
    const centre = !pinnedLeft && !pinnedRight;

    useEffect(() => {

        const compProxy: IHeaderRowContainerComp = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setCtrls: ctrls => setHeaderRowCtrls(ctrls),

            // centre only
            setCenterWidth: width => setCenterContainerWidth(width),
            setContainerTransform: transform => setCenterContainerTransform(transform),

            // pinned only
            setPinnedContainerWidth: width => setPinnedContainerWidth(width)
        };

        const ctrl = context.createBean(new HeaderRowContainerCtrl(props.pinned));
        ctrl.setComp(compProxy, eGui.current!);

        return () => {
            context.destroyBean(ctrl);
        };

    }, []);

    const className = useMemo(() => cssClasses.toString(), [cssClasses]);

    const insertRowsJsx = () => headerRowCtrls.map(ctrl => <HeaderRowComp ctrl={ctrl} key={ctrl.getInstanceId()} />);

    const eCenterContainerStyle = useMemo(() => ({
        width: centerContainerWidth,
        transform: centerContainerTransform
    }), [centerContainerWidth, centerContainerTransform]);

    const ePinnedStyle = useMemo(() => ({
        width: pinnedContainerWidth,
        minWidth: pinnedContainerWidth,
        maxWidth: pinnedContainerWidth,
    }), [pinnedContainerWidth]);

    return (
        <>
            {
                pinnedLeft &&
                <div ref={eGui} className={"ag-pinned-left-header " + className} role="presentation" style={ePinnedStyle}>
                    {insertRowsJsx()}
                </div>
            }
            {
                pinnedRight &&
                <div ref={eGui} className={"ag-pinned-right-header " + className} role="presentation" style={ePinnedStyle}>
                    {insertRowsJsx()}
                </div>
            }
            {
                centre &&
                <div ref={eGui} className={"ag-header-viewport " + className} role="presentation">
                    <div className={"ag-header-container"} role="rowgroup" style={eCenterContainerStyle}>
                        {insertRowsJsx()}
                    </div>
                </div>
            }
        </>
    );
};

export default memo(HeaderRowContainerComp);

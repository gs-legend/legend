import { SeriesNodeDatum, Sparkline } from '../sparkline';
import { Group } from '../../scene/group';
import { Line } from '../../scene/shape/line';
import { Selection } from '../../scene/selection';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { Rectangle } from './rectangle';
import { extent } from '../../util/array';
import { isNumber } from '../../util/value';
import { ColumnFormat, ColumnFormatterParams } from 'components/Grid/core';
import { FontStyle, FontWeight } from '../../scene/shape/text';
import { Label } from '../label/label';
import { Text } from '../label/text';
import { PointerEvents } from '../../scene/node';

export interface RectNodeDatum extends SeriesNodeDatum {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly label?: {
        readonly x: number;
        readonly y: number;
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        readonly fill: string;
    };
}

enum BarColumnNodeTag {
    Rect,
    Label,
}

export enum BarColumnLabelPlacement {
    InsideBase = 'insideBase',
    InsideEnd = 'insideEnd',
    Center = 'center',
    OutsideEnd = 'outsideEnd',
}

export class BarColumnLabel extends Label {
    formatter?: (params: { value: number | undefined }) => string = undefined;
    placement = BarColumnLabelPlacement.InsideEnd;
}

export abstract class BarColumnSparkline extends Sparkline {
    fill: string = 'rgb(124, 181, 236)';
    stroke: string = 'silver';
    strokeWidth: number = 0;
    paddingInner: number = 0.1;
    paddingOuter: number = 0.2;
    valueAxisDomain: [number, number] | undefined = undefined;
    formatter?: (params: ColumnFormatterParams) => ColumnFormat = undefined;

    protected axisLine: Line = new Line();

    private sparklineGroup: Group = new Group();
    private rectGroup: Group = new Group();
    private labelGroup: Group = new Group();

    private rectSelection: Selection<Rectangle, Group, RectNodeDatum, RectNodeDatum> = Selection.select(
        this.rectGroup
    ).selectAll<Rectangle>();
    private labelSelection: Selection<Text, Group, RectNodeDatum, RectNodeDatum> = Selection.select(
        this.labelGroup
    ).selectAll<Text>();

    private nodeSelectionData: RectNodeDatum[] = [];

    readonly label = new BarColumnLabel();

    constructor() {
        super();

        this.rootGroup.append(this.sparklineGroup);
        this.sparklineGroup.append([this.rectGroup, this.axisLine, this.labelGroup]);

        this.axisLine.lineCap = 'round';

        this.label.enabled = false;
    }

    protected abstract generateNodeData(): RectNodeDatum[] | undefined;
    protected abstract updateYScaleRange(): void;
    protected abstract updateXScaleRange(): void;

    protected getNodeData(): RectNodeDatum[] {
        return this.nodeSelectionData;
    }

    protected update(): void {
        this.updateSelections();
        this.updateNodes();
    }

    protected updateSelections(): void {
        const nodeData = this.generateNodeData();

        if (!nodeData) {
            return;
        }

        this.nodeSelectionData = nodeData;
        this.updateRectSelection(nodeData);
        this.updateLabelSelection(nodeData);
    }

    protected updateNodes(): void {
        this.updateRectNodes();
        this.updateLabelNodes();
    }

    protected updateYScaleDomain(): void {
        const { yScale, yData, valueAxisDomain } = this;

        const yMinMax = extent(yData, isNumber);

        let yMin = 0;
        let yMax = 1;

        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0] as number;
            yMax = this.max = yMinMax[1] as number;
        }

        // if yMin is positive, set yMin to 0
        yMin = yMin < 0 ? yMin : 0;

        // if yMax is negative, set yMax to 0
        yMax = yMax < 0 ? 0 : yMax;

        if (valueAxisDomain) {
            if (valueAxisDomain[1] < yMax) {
                valueAxisDomain[1] = yMax;
            }
            if (valueAxisDomain[0] > yMin) {
                valueAxisDomain[0] = yMin;
            }
        }

        yScale.domain = valueAxisDomain ? valueAxisDomain : [yMin, yMax];
    }

    private updateRectSelection(selectionData: RectNodeDatum[]): void {
        const updateRectSelection = this.rectSelection.setData(selectionData);

        const enterRectSelection = updateRectSelection.enter.append(Rectangle);

        updateRectSelection.exit.remove();

        this.rectSelection = updateRectSelection.merge(enterRectSelection);
    }

    protected updateRectNodes(): void {
        const { highlightedDatum, formatter: nodeFormatter, fill, stroke, strokeWidth } = this;
        const { fill: highlightFill, stroke: highlightStroke, strokeWidth: highlightStrokeWidth } = this.highlightStyle;

        this.rectSelection.each((node, datum, index) => {
            const highlighted = datum === highlightedDatum;
            const nodeFill = highlighted && highlightFill !== undefined ? highlightFill : fill;
            const nodeStroke = highlighted && highlightStroke !== undefined ? highlightStroke : stroke;
            const nodeStrokeWidth =
                highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : strokeWidth;

            let nodeFormat: ColumnFormat | undefined;

            const { x, y, width, height, seriesDatum } = datum;

            if (nodeFormatter) {
                const first = index === 0;
                const last = index === this.nodeSelectionData.length - 1;
                const min = seriesDatum.y === this.min;
                const max = seriesDatum.y === this.max;

                nodeFormat = nodeFormatter({
                    datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    width: width,
                    height: height,
                    min,
                    max,
                    first,
                    last,
                    fill: nodeFill,
                    stroke: nodeStroke,
                    strokeWidth: nodeStrokeWidth,
                    highlighted,
                });
            }

            node.fill = (nodeFormat && nodeFormat.fill) || nodeFill;
            node.stroke = (nodeFormat && nodeFormat.stroke) || nodeStroke;
            node.strokeWidth = (nodeFormat && nodeFormat.strokeWidth) || nodeStrokeWidth;

            node.x = node.y = 0;
            node.width = width;
            node.height = height;
            node.visible = node.height > 0;

            node.translationX = x;
            node.translationY = y;

            // shifts bars upwards?
            // node.crisp = true;
        });
    }

    private updateLabelSelection(selectionData: RectNodeDatum[]): void {
        const updateLabels = this.labelSelection.setData(selectionData);

        const enterLabels = updateLabels.enter.append(Text).each((text) => {
            (text.tag = BarColumnNodeTag.Label), (text.pointerEvents = PointerEvents.None);
        });

        updateLabels.exit.remove();

        this.labelSelection = updateLabels.merge(enterLabels);
    }

    private updateLabelNodes(): void {
        const {
            label: { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color },
        } = this;
        this.labelSelection.each((text, datum) => {
            const label = datum.label;

            if (label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fill = color;
                text.visible = true;
            } else {
                text.visible = false;
            }
        });
    }

    getTooltipHtml(datum: SeriesNodeDatum): string | undefined {
        const { dataType } = this;
        const { seriesDatum } = datum;
        const yValue = seriesDatum.y;
        const xValue = seriesDatum.x;
        const content = this.formatNumericDatum(yValue);
        const title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;

        const defaults = {
            content,
            title,
        };

        if (this.tooltip.renderer) {
            return toTooltipHtml(
                this.tooltip.renderer({
                    context: this.context,
                    datum: seriesDatum,
                    yValue,
                    xValue,
                }),
                defaults
            );
        }

        return toTooltipHtml(defaults);
    }

    protected formatLabelValue(value: number): string {
        return value % 1 !== 0 ? value.toFixed(1) : value.toFixed(0);
    }
}
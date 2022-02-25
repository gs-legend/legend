import { Autowired, Component, PostConstruct } from 'components/Grid/core';
import { ChartMenu } from "../menu/chartMenu";
import { ChartTranslationService } from "../services/chartTranslationService";
import { ChartController } from "../chartController";
import { ChartOptionsService } from "../services/chartOptionsService";

interface BBox { x: number; y: number; width: number; height: number }

export class TitleEdit extends Component {
    private static TEMPLATE = /* html */
        `<input
            class="ag-chart-title-edit"
            style="padding:0; border:none; border-radius: 0; min-height: 0; text-align: center;" />
        `;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private destroyableChartListeners: (() => void)[];
    private chartController: ChartController;
    private chartOptionsService: ChartOptionsService;

    constructor(private readonly chartMenu: ChartMenu) {
        super(TitleEdit.TEMPLATE);
    }

    @PostConstruct
    public init(): void {
        this.addManagedListener(this.getGui(), 'keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.endEditing();
            }
        });
        this.addManagedListener(this.getGui(), 'blur', this.endEditing.bind(this));
    }

    /* should be called when the containing component changes to a new chart proxy */
    public refreshTitle(chartController: ChartController, chartOptionsService: ChartOptionsService) {
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;

        const chartProxy = this.chartController.getChartProxy();

        if (chartProxy) {
            for (let i = 0; i++; i < this.destroyableChartListeners.length) {
                this.destroyableChartListeners[i]();
            }
            this.destroyableChartListeners = [];
        }

        const chart = chartProxy.getChart();
        const canvas = chart.scene.canvas.element;

        const destroyDbleClickListener = this.addManagedListener(canvas, 'dblclick', event => {
            const { title } = chart;

            if (title && title.node.containsPoint(event.offsetX, event.offsetY)) {
                const bbox = title.node.computeBBox()!;
                const xy = title.node.inverseTransformPoint(bbox.x, bbox.y);

                this.startEditing({ ...bbox, ...xy });
            }
        });

        const destroyMouseMoveListener = this.addManagedListener(canvas, 'mousemove', event => {
            const { title } = chart;

            const inTitle = title && title.enabled && title.node.containsPoint(event.offsetX, event.offsetY);

            canvas.style.cursor = inTitle ? 'pointer' : '';
        });

        this.destroyableChartListeners = [
            destroyDbleClickListener!,
            destroyMouseMoveListener!
        ];
    }

    private startEditing(titleBBox: BBox): void {
        if (this.chartMenu && this.chartMenu.isVisible()) {
            // currently we ignore requests to edit the chart title while the chart menu is showing
            // because the click to edit the chart will also close the chart menu, making the position
            // of the title change.
            return;
        }

        const minimumTargetInputWidth: number = 300;
        const maximumInputWidth: number = this.chartController.getChartProxy().getChart().width;
        const inputWidth = Math.max(Math.min(titleBBox.width + 20, maximumInputWidth), minimumTargetInputWidth);

        const inputElement = this.getGui() as HTMLInputElement;

        inputElement.classList.add('currently-editing');
        const inputStyle = inputElement.style;

        // match style of input to title that we're editing
        inputStyle.fontFamily = this.chartOptionsService.getChartOption('title.fontFamily');
        inputStyle.fontWeight = this.chartOptionsService.getChartOption('title.fontWeight');
        inputStyle.fontStyle = this.chartOptionsService.getChartOption('title.fontStyle');
        inputStyle.fontSize = this.chartOptionsService.getChartOption('title.fontSize') + 'px';
        inputStyle.color = this.chartOptionsService.getChartOption('title.color');

        // populate the input with the title, unless the title is the placeholder:
        const oldTitle = this.chartOptionsService.getChartOption('title.text');
        const inputValue = oldTitle === this.chartTranslationService.translate('titlePlaceholder') ? '' : oldTitle;
        inputElement.value = inputValue;

        const inputRect = inputElement.getBoundingClientRect();

        inputStyle.left = Math.round(titleBBox.x + titleBBox.width / 2 - inputWidth / 2) + 'px';
        inputStyle.top = Math.round(titleBBox.y + titleBBox.height / 2 - inputRect.height / 2) + 'px';
        inputStyle.width = Math.round(inputWidth) + 'px';

        inputElement.focus();
    }

    private endEditing(): void {
        const value = (this.getGui() as HTMLInputElement).value;

        this.chartOptionsService.setChartOption('title.text', value);

        this.eventService.dispatchEvent({type: 'chartTitleEdit'});
        this.removeCssClass('currently-editing')
    }
}

import { _, Autowired, Component, PostConstruct } from 'components/Grid/core';
import { Font, FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";

export default class TitlePanel extends Component {

    public static TEMPLATE = /* html */ `<div></div>`;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private activePanels: Component[] = [];
    private titlePlaceholder: string;

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super(TitlePanel.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.initFontPanel();
        this.titlePlaceholder = this.chartTranslationService.translate('titlePlaceholder');
    }

    private hasTitle(): boolean {
        const title: any = this.getOption('title');
        return title && title.enabled && title.text && title.text.length > 0;
    }

    private initFontPanel(): void {
        const hasTitle = this.hasTitle;

        const setFont = (font: Font) => {
            if (font.family) { this.setOption('title.fontFamily', font.family); }
            if (font.weight) { this.setOption('title.fontWeight', font.weight); }
            if (font.style) { this.setOption('title.fontStyle', font.style); }
            if (font.size) { this.setOption('title.fontSize', font.size); }
            if (font.color) { this.setOption('title.color', font.color); }
        };

        const initialFont = {
            family: this.getOption('title.fontFamily'),
            style: this.getOption('title.fontStyle'),
            weight: this.getOption('title.fontWeight'),
            size: this.getOption<number>('title.fontSize'),
            color: this.getOption('title.color')
        };

        if (!hasTitle) {
            setFont(initialFont);
        }

        const fontPanelParams: FontPanelParams = {
            name: this.chartTranslationService.translate('title'),
            enabled: this.hasTitle(),
            suppressEnabledCheckbox: false,
            initialFont,
            setFont,
            setEnabled: (enabled) => {
                this.setOption('title.enabled', enabled);
                const currentTitleText = this.getOption('title.text');
                if (enabled && currentTitleText === 'Title') {
                    this.setOption('title.text', this.titlePlaceholder);
                }
            }
        };

        const fontPanelComp = this.createBean(new FontPanel(fontPanelParams));
        this.getGui().appendChild(fontPanelComp.getGui());
        this.activePanels.push(fontPanelComp);

        // edits to the title can disable it, so keep the checkbox in sync:
        this.addManagedListener(this.eventService, 'chartTitleEdit', () => {
            fontPanelComp.setEnabled(this.hasTitle());
        });
    }

    private getOption<T = string>(expression: string): T {
        return this.chartOptionsService.getChartOption(expression);
    }

    private setOption(property: string, value: any): void {
        this.chartOptionsService.setChartOption(property, value);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}

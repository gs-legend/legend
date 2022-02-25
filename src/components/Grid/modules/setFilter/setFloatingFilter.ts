import {
    Autowired,
    Component,
    RefSelector,
    ValueFormatterService,
    AgInputTextField,
    _,
    ColumnModel,
} from 'components/Grid/core';

import { SetFilter } from './setFilter';
import { SetValueModel } from './setValueModel';
import { DEFAULT_LOCALE_TEXT } from './localeText';
import { IFloatingFilter, IFloatingFilterParams } from 'components/Grid/core/ts/filter/floating/floatingFilter';
import { ISetFilterParams, SetFilterModel } from 'components/Grid/core/ts/interfaces/iSetFilter';

export class SetFloatingFilterComp extends Component implements IFloatingFilter {
    @RefSelector('eFloatingFilterText') private readonly eFloatingFilterText: AgInputTextField;
    @Autowired('valueFormatterService') private readonly valueFormatterService: ValueFormatterService;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    private params: IFloatingFilterParams;
    private availableValuesListenerAdded = false;

    constructor() {
        super(/* html */`
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eFloatingFilterText"></ag-input-text-field>
            </div>`
        );
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public init(params: IFloatingFilterParams): void {
        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        this.eFloatingFilterText
            .setDisabled(true)
            .setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`)
            .addGuiEventListener('click', () => params.showParentFilter());

        this.params = params;
    }

    public onParentModelChanged(parentModel: SetFilterModel): void {
        this.updateFloatingFilterText(parentModel);
    }

    private parentSetFilterInstance(cb: (instance: SetFilter<unknown>) => void): void {
        this.params.parentFilterInstance((filter) => {
            if (!(filter instanceof SetFilter)) {
                throw new Error('AG Grid - SetFloatingFilter expects SetFilter as it\'s parent');
            }

            cb(filter);
        });
    }

    private addAvailableValuesListener(): void {
        this.parentSetFilterInstance((setFilter) => {
            const setValueModel = setFilter.getValueModel();

            if (!setValueModel) { return; }

            // unlike other filters, what we show in the floating filter can be different, even
            // if another filter changes. this is due to how set filter restricts its values based
            // on selections in other filters, e.g. if you filter Language to English, then the set filter
            // on Country will only show English speaking countries. Thus the list of items to show
            // in the floating filter can change.
            this.addManagedListener(
                setValueModel, SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED, () => this.updateFloatingFilterText());
        });

        this.availableValuesListenerAdded = true;
    }

    private updateFloatingFilterText(parentModel?: SetFilterModel | null): void {
        if (!this.availableValuesListenerAdded) {
            this.addAvailableValuesListener();
        }

        this.parentSetFilterInstance((setFilter) => {
            const { values } = parentModel || setFilter.getModel() || {};
            const valueModel = setFilter.getValueModel();

            if (values == null || valueModel == null) {
                this.eFloatingFilterText.setValue('');
                return;
            }

            const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            const availableValues = values.filter(v => valueModel.isValueAvailable(v))!;

            // format all the values, if a formatter is provided
            const formattedValues = availableValues.map(value => {
                const { column, filterParams } = this.params;
                const formattedValue = this.valueFormatterService.formatValue(
                    column, null, null, value, (filterParams as ISetFilterParams).valueFormatter, false);

                const valueToRender = formattedValue != null ? formattedValue : value;

                return valueToRender == null ? localeTextFunc('blanks', DEFAULT_LOCALE_TEXT.blanks) : valueToRender;
            })!;

            const arrayToDisplay = formattedValues.length > 10 ? formattedValues.slice(0, 10).concat('...') : formattedValues;
            const valuesString = `(${formattedValues.length}) ${arrayToDisplay.join(',')}`;

            this.eFloatingFilterText.setValue(valuesString);
        });
    }
}

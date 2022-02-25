// Implemented by Column and ProvidedColumnGroup. Allows the groups to contain a list of this type for it's children.
// See the note at the top of Column class.
import { ProvidedColumnGroup } from "./providedColumnGroup";

export interface IProvidedColumn {
    isVisible(): boolean;
    getColumnGroupShow(): string | undefined;
    getId(): string;
    setOriginalParent(originalParent: ProvidedColumnGroup | null): void;
}

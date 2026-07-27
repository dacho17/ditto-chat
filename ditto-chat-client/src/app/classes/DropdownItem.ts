export default class DropdownItem {
    private itemName: string
    private onClickFunction: Function

    public constructor(itemName: string, onClickFunction: Function) {
        this.itemName = itemName;
        this.onClickFunction = onClickFunction;
    }

    public getItemName(): string {
        return this.itemName;
    }

    public getFunction(): Function {
        return this.onClickFunction;
    }
} 

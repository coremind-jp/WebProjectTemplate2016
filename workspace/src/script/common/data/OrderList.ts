import {WeightingContainer} from "./WeightingContainer";
import {Dictionary} from "./Dictionary";

/**
 * 汎用重み付けリストクラス.
 */
export class OrderList<T> extends WeightingContainer<T>
{
	protected _priorityList: Dictionary<T, number>;

	public constructor()
	{
		super((a: T, b: T): T =>
		{
			let aVal: number = this._priorityList.getValue(a);
			let bVal: number = this._priorityList.getValue(b);
			return aVal < bVal ? b: a;
		});
		
		this._priorityList = new Dictionary<T, number>();
	}

	public destroy(): void
	{
		super.destroy();
		this._priorityList = null;
	}

	/**
	 * @inheritDoc
	 */
	public removeAll(): void
	{
		this._priorityList.removeAll();
		super.removeAll();
	}

	/**
	 * 値を追加する.`priority`に基づいて挿入位置が決定する.(値が高いほど先頭に挿入される)
	 * @param  {T}      child 追加する値
	 * @return {number}       追加後の要素数
	 */
	public add(child: T, priority: number = 0): number
	{
		this._priorityList.setValue(child, priority);
		return super.add(child);
	}

	/**
	 * @inheritDoc
	 */
	public remove(child: T): T
	{
		this._priorityList.deleteValue(child);
		return super.remove(child);
	}
}
import {ObjectContainer} from "./ObjectContainer";

/**
 * 重み付けが実装可能なオブジェクトコンテナクラス.
 */
export class WeightingContainer<T> extends ObjectContainer<T>
{
	private _compare: (a: T, b:T) => T;

	/**
	 * aとbを比較し"どちらがより先頭に挿入されるべきかを示す値を返す関数"をコンストラクターへ指定する.
	 * 
	 * ```
	 * 
	 * interface sample {
	 * 	prop: number
	 * }
	 * 
	 * var a: sample = { prop: 1 };
	 * var b: sample = { prop: 5 };
	 * var container: WeightingContainer<sample>((a: sample, b: sample): sample =>
	 * {
	 * 	return a.prop < b.prop ? b: a;
	 * }).add(a).add(b);
	 *
	 * container.each((child: sample, i: number): boolean => {
	 * 	console.log("index:", i, "sample.prop:", child.prop);
	 * });
	 *
	 * //console result
	 * //index: 0 sample.prop: 5
	 * //index: 1 sample.prop: 1
	 * 
	 * ```
	 * 
	 * 上記の場合`a`を先に`add`しているが、prop値が`b`の方が高い為、`each`呼び出し時に最初に参照するのはbとなる.
	 * @param  {T}      child 'add'呼び出し時に挿入位置を決める関数
	 */
	public constructor(compare: (a: T, b:T) => T)
	{
		super();
		this._compare = compare;
	}

	public destroy(): void
	{
		this._compare = null;
		super.destroy();
	}

	/**
	 * コンストラクターに渡した比較関数に基づい挿入位置に値を追加する.
	 * @param  {T}      child 追加する値
	 * @return {number}       追加後の要素数
	 */
	public add(child: T): number
	{
		if (this._children.indexOf(child) != -1)
			return this._children.length;

		for (let i = 0, len: number = this._children.length; i < len; ++i)
		{
			let listChild: T = this._children[i];

			if (this._compare(listChild, child) === child)
			{
				this._children.splice(i, 0, child);
				return this._children.length;
			}
		}

		return this._children.push(child);
	}
}
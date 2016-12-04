/**
 * 汎用オブジェクトコンテナクラス.
 */
export class ObjectContainer<T>
{
	protected _children: Array<T>;

	public constructor()
	{
		this._children = [];
	}

	public destroy(): void
	{
		this.removeAll();
		this._children = null;
	}

	/**
	 * 要素数を返す.
	 * @return {number} 
	 */
	public get numChildren(): number {
		return this._children.length;
	}

    /**
     * オブジェクトが追加されているかを示す値を返す.
     * @param object 追加されているかを調べたいオブジェクト
     * @returns 追加されている場合true, それ以外の場合false
     */
	public contains(object: T): boolean
	{
		return this._children.indexOf(object) > -1;
	}

	/**
	 * 全オブジェクトを削除する.
	 */
	public removeAll(): void
	{
		this._children.length = 0;
	}

    /**
     * オブジェクトを追加する.
     * 既に追加されている場合何もしない.
     * @param child 追加したいオブジェクト
	 * @return {number}       追加後の要素数
     */
	public add(child: T): number
	{
        if (this._children.indexOf(child) == -1)
            this._children.push(child);

        return this._children.length;
	}

    /**
     * オブジェクトを削除する.
     * 追加されていない場合何もしない.
     * @param child 削除したいオブジェクト
     * @returns 削除したオブジェクト
     */
	public remove(child: T): T
	{
        let i: number = this._children.indexOf(child);
        return i != -1 ? this._children.splice(i, 1)[0]: null;
	}

	/**
	 * `index`をもとに追加済みオブジェクトを取得する.
	 * 指定した`index`が範囲外の場合nullを返す.
	 * @param  {number} index 取得したいオブジェクトのインデックス
	 * @return {T}            インデックスに対応した追加済みオブジェクト
	 */
	public getChild(index: number): T
	{
		return 0 <= index && index < this._children.length ? this._children[index]: null;
	}

	/**
	 * `child`をもとに追加済みオブジェクトのインデックスを取得する.
	 * 指定した`child`が存在しない場合-1を返す.
	 * @param  {T}      child 追加済みオブジェクト
	 * @return {number}       `child`のインデックス
	 */
	public getChildIndex(child: T): number
	{
        return this._children.indexOf(child);
	}

    /**
     * 追加済みオブジェクトに対して関数を実行する.
     * 関数の戻り値がfalseだった場合そこで処理を終了する.
     * @param f 実行したい関数
     */
	public each(f: (child: T, i: number) => boolean): void
	{
		for (let i: number = 0, len: number = this._children.length; i < len; i++)
			if (f(this._children[i], i) === false)
				break;
	}
}
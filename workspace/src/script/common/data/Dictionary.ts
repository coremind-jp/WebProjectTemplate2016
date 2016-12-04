/**
 * typeをキーとした連想配列クラス
 * @type T キーとして設定可能なインスタンスのクラスを指定
 * @type U 値として設定可能なインスタンスのクラスを指定
 */
export class Dictionary<T, U>
{
	private _key: Array<T>;
	private _val: Array<U>;

	public constructor()
	{
		this._key = [];
		this._val = [];
	}

	public destroy(): void
	{
		this.removeAll();
		this._key = this._val = null;
	}

	/**
	 * 要素数を返す.
	 * @return {number} 
	 */
	public get numChildren(): number {
		return this._key.length;
	}

	/**
	 * 全ての要素への参照を削除する.
	 */
	public removeAll(): void
	{
		this._key.length = this._val.length = 0;
	}

	/**
	 * `key`をキーとした要素が設定済みかを示す値を返す.
	 * @param  {T}       key
	 * @return {boolean}     存在する場合true, それ以外の場合false
	 */
	public hasKey(key: T): boolean
	{
		return this._key.indexOf(key) > -1;
	}

	/**
	 * `val`を値とした要素が設定済みかを示す値を返す.
	 * @param  {U}       val
	 * @return {boolean}     存在する場合true, それ以外の場合false
	 */
	public hasValue(val: U): boolean
	{
		return this._val.indexOf(val) > -1;
	}

	/**
	 * 値を設定する.指定した`key`が既に設定済みの場合上書きする.
	 * @param  {T}                key  設定キー
	 * @param  {U}                val  設定値
	 * @return {Dictionary<T, U>}               このインスタンス
	 */
	public setValue(key: T, val: U): Dictionary<T, U>
	{
		let n: number = this._key.indexOf(key);
		if (n == -1)
		{
			this._key.push(key);
			this._val.push(val);
		}
		else this._val[n] = val;

		return this;
	}

	/**
	 * 設定済みのキーと値の参照を削除する.
	 * @param  {T}                key  削除対象のキー
	 * @return {Dictionary<T, U>}               このインスタンス
	 */
	public deleteValue(key: T): Dictionary<T, U>
	{
		let n: number = this._key.indexOf(key);
		if (n > -1)
		{
			this._key.splice(n, 1);
			this._val.splice(n, 1);
		}

		return this;
	}

	/**
	 * 指定された`key`に対応している値を返す.`key`が未設定の場合nullを返す.
	 * @param  {T} key キー
	 * @return {U}     キーに対応する値
	 */
	public getValue(key: T): U
	{
		let n: number = this._key.indexOf(key);
		return n == -1 ? null: this._val[n];
	}

	/**
     * 設定済みの値に対して関数を実行する.
     * 関数の戻り値がfalseだった場合そこで処理を終了する.
	 * @param {U) => boolean} f 実行したい関数
	 */
	public each(f: (key: T, val: U) => boolean): void
	{
		for (let i = 0, len: number = this._key.length; i < len; ++i)
			if (f(this._key[i], this._val[i]) === false)
				break;
	}
}
import {Event} from "./Event";

/**
 * イベント発火クラス.
 */
export class EventDispatcher
{
	private _dispatcherList: { [key: string]: UnitEventDispatcher<(event: Event) => void> };

	public constructor()
	{
		this._dispatcherList = {};
	}

	public destroy(): void
	{
		for (let type in this._dispatcherList)
		{
			this._dispatcherList[type].destroy();
			delete this._dispatcherList;
		}

		this._dispatcherList = null;
	}

	/**
	 * リスナーが追加済みかを示す値を返す.
	 * listenerパラメータを省略した場合、追加された全リスナーが対象となる.
	 * @param  {string}    type イベントタイプ
	 * @param  {Event) =>   void       = null} listener リスナー関数
	 * @return {boolean}        登録済みの場合true, それ以外の場合false
	 */
	public hasListener(type: string, listener?: (event: Event) => void): boolean
	{
		return type in this._dispatcherList ?
			this._dispatcherList[type].hasListener(listener):
			false;
	}

	/**
	 * リスナーを削除する.
	 * listenerパラメータを省略した場合、追加された全リスナーが対象となる.
	 * @param {string}    type イベントタイプ
	 * @param {Event) =>   void       = null} リスナー関数
	 */
	public removeListener(type: string, listener?: (event: Event) => void): void
	{
		if (type in this._dispatcherList)
			this._dispatcherList[type].removeListener(listener);
	}

	/**
	 * リスナーを追加する.
	 * 同一のイベントタイプに対して複数のリスナーを登録した場合priorityパラメータで実行順序を制御できる.
	 * priorityパラメータの数値が高いほど先に実行される.
	 * 同一の数値だった場合、先に登録したリスナーから実行される.
	 * @param {string}    type イベントタイプ
	 * @param {Event) =>   void}     listener リスナー関数
	 * @param {number =    0}           priority 実行優先度
	 */
	public addListener(type: string, listener: (event: Event) => void, priority: number = 0): void
	{
		if (!(type in this._dispatcherList))
			this._dispatcherList[type] = new UnitEventDispatcher<(event: Event) => void>();

		this._dispatcherList[type].addListener(listener, priority);
	}

	/**
	 * イベントを発火する.
	 * @param {Event} event 発火するイベントのイベントオブジェクト
	 */
	public dispatch(event: Event): void
	{
		if (event.type in this._dispatcherList)
			this._dispatcherList[event.type].dispatch(event);
	}
}

import {OrderList} from "../data/OrderList";
class UnitEventDispatcher<T extends (event: Event) => void>
{
	private _listenerList: OrderList<T>;

	public constructor()
	{
		this._listenerList = new OrderList<T>();
	}

	public destroy(): void
	{
		this._listenerList.destroy();
		this._listenerList = null;
	}

	public hasListener(listener?: T): boolean
	{
		return listener ?
			this._listenerList.contains(listener):
			this._listenerList.numChildren > 0;
	}

	public removeListener(listener?: T): void
	{
		listener ?
			this._listenerList.remove(listener):
			this._listenerList.removeAll();
	}

	public addListener(listener: T, priority: number = 0): void
	{
		this._listenerList.add(listener, priority);
	}

	public dispatch(event: Event): void
	{
		this._listenerList.each((listener: T, i:number): boolean => {
			listener(event);
			return !event.defaultPrevented;
		});
	}
}
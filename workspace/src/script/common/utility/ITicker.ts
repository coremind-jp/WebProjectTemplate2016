/**
 * ティッカーインターフェース.
 */
export interface ITicker {
	/**
	 * ティックハンドラ
	 * @param now Date.now()値
	 */
    onTick: (now: number) => void;
}
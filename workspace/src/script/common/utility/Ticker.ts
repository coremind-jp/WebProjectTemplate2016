import {ObjectContainer} from "../data/ObjectContainer";
import {ITicker} from "./ITicker";

/**
 * ティッカークラス.
 */
export class Ticker extends ObjectContainer<ITicker>
{
    static INSTANCE: Ticker = new Ticker();

    private _id: number;
    /**
     * @param intervalDelay    更新間隔(ms)
     */
    public constructor(intervalDelay: number = 60/1000)
    {
        super();

        this._id = setInterval(() =>
            {
                let now: number = Date.now();

                for (let ticker of this._children)
                    ticker.onTick(now);
            },
            intervalDelay);
    }
    /**
     * 破棄する.
     */
    public destroy(): void
    {
        clearInterval(this._id);
    }
}
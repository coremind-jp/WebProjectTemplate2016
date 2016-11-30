import {ITicker} from "./ITicker";
import {Ticker} from "./Ticker";
import {EventDispatcher} from "../event/EventDispatcher";
/**
 * 汎用タイマークラス.
 */
export class Timer extends EventDispatcher implements ITicker
{
    private static _TICKER:Ticker;

    private _onTick: (now: number) => void;
    private _delay: number;
    private _repeate: number;

    private _pauseDate: number;
    private _startDate: number;

    private _elapsed: number;
    private _lapElapsed: number;
    private _lap: number;

    constructor()
    {
        super();

        if (!Timer._TICKER)
             Timer._TICKER = new Ticker();

        this._pauseDate = 0;
    }

    /**
     * 稼働中かを示す値を返す.
     * 「稼働中」とはstartが呼ばれてからstopが呼ばれる、またはタイマーが終了するまでを示す.
     */
    public isRunning(): boolean
    {
        return Timer._TICKER.contains(this);
    }

    /**
     * 一時停止中かを示す値を返す.
     * 「一時停止中」とは稼働中にpauseが呼ばれてからresumeが呼ばれるまでを示す.
     */
    public isPause(): boolean
    {
        return this._onTick === this._onTickForPause;
    }

    /**
     * タイマーを停止する.
     * 稼働していない場合何もしない.
     */
    public stop(): void
    {
        if (!this.isRunning()) return;

        this._onTick = this._onTickDefault;

        Timer._TICKER.remove(this);
        console.log("stop");
    }

    /**
     * タイマーを開始する.
     * 稼働中の場合何もしない.
     * 停止（stop）後に再度呼び出した場合経過状態は初期化される.
     */
    public start(delay: number, repeate: number)
    {
        if (this.isRunning()) return;

        this.stop();

        this._delay       = delay;
        this._repeate     = repeate;

        this._startDate   = Date.now();
        this._lapElapsed  = 0;
        this._lap         = 0;
        this._onTick = this._onTickDefault;

        Timer._TICKER.add(this);
        console.log("start");
    }

    /**
     * タイマーを一時停止する.
     * 稼働していない、またはポーズ中の場合何もしない.
     */
    public pause(): void
    {
        if (!this.isRunning() || this.isPause()) return;

        console.log("pause.");
         this._pauseDate   = Date.now();
         this._onTick = this._onTickForPause;
    }

    /**
     * タイマーを再開する.
     * 稼働していない、またはポーズ中でない場合何もしない.
     */
    public resume(): void
    {
        if (!this.isRunning() || !this.isPause()) return;

        console.log("resume.");
        this._pauseDate   = 0;
        this._onTick = this._onTickDefault;
    }

    /**
     * 総経過時間(ms).
     */
    public get elapsed() : number
    {
        return this._elapsed;
    }

    /**
     * 総タイマー長に対する経過時間の比(0~1)を求める.
     * 無限ループでタイマーを開始した場合常に0を返す.
     */
    public calcElapsedRate(): number
    {
        if (this._repeate <= 0) return 0;
        else
        {
            let msElapsed: number = this._lap * this._delay + this._lapElapsed;
            let msFinish: number  = this._repeate * this._delay;
            return msElapsed / msFinish;
        }
    }

    /**
     * 現在のラップ値.
     */
    public get lap() : number
    {
        return this._lap;
    }

    /**
     * ラップに対する経過時間(ms).
     */
    public get lapElapsed() : number
    {
        return this._lapElapsed;
    }

    /**
     * ラップに対する経過時間の比(0~1)を求める.
     */
    public calcLapElapsedRate(): number
    {
        return this._lapElapsed / this._delay;
    }

    public onTick(now: number): void
    {
        this._onTick(now);
    }

    private _onTickDefault(now: number): void
    {
        this._elapsed    = now - this._startDate;
        this._lapElapsed = this._elapsed % this._delay;

        let beforeLap: number = this._lap;
        let afterLap: number  = (this._elapsed / this._delay)|0;

        if (beforeLap == afterLap)
            return;

        this._lap = afterLap;
        this.dispatch(new Event("onTimer"));

        if (this._repeate <= this._lap)
            this.stop();
    }

    private _onTickForPause(now: number): void
    {
        this._startDate += (now - this._pauseDate);
        this._pauseDate = now;
    }
}
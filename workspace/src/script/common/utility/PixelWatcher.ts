export type D1Handler = (y: number) => void;

export class D1
{
	public handler: D1Handler;

	private _resolution: number;
	private _initial: number;
	private _now: number;
	private _updater: (now: number) => number;

	constructor()
	{
		this._initial = this._now = 0;
		this.resolution = 1;
	}

	public get resolution() : number { return this._resolution; }
	public set resolution(resolution: number)
	{
		this._resolution = Math.abs(resolution)|0;

		this._updater = this._resolution == 1 ?
			this._updateFor1Pixel:
			this._updateForNot1Pixel;
	}

	public get now() : number { return this._now; }

	public destroy(): void
	{
		this.handler = this._updater = null;
	}

	public update(now: number): number { return this._updater(now); }

	private _updateFor1Pixel(now: number): number
	{
		if (this.handler)
			this.handler(this._initial = this._now = now);

		return now;
	}

	private _updateForNot1Pixel(now: number): number
	{
		this._now = now / this._resolution | 0;

		if (this._initial != this._now)
		{
			if (this.handler)
				this.handler(this._now);

			return this._initial = this._now;
		}
		else
			return -1;
	}
}

export type D2Handler = (x: number, y: number) => void;

export class D2
{
	public handler: D2Handler;

	private _x: D1;
	private _y: D1;

	constructor()
	{
		this._x = new D1();
		this._y = new D1();
	}

	public get x() :D1 { return this._x; }
	public get y() :D1 { return this._y; }

	public destroy()
	{
		this._x.destroy();
		this._y.destroy();

		this.handler = this._x = this._y = null;
	}

	public update(x: number, y: number): void
	{
		let xHandler: D1Handler = this._x.handler;
		let yHandler: D1Handler = this._y.handler;
		this._x.handler = this._y.handler = null;

		let afterX: number = this._x.update(x);
		let afterY: number = this._y.update(y);

		if (afterX > -1 && afterY > -1 && this.handler) this.handler(afterX, afterY);
		else if (afterX > -1 && xHandler) xHandler(afterX);
		else if (afterY > -1 && yHandler) yHandler(afterY);

		this._x.handler = xHandler;
		this._y.handler = yHandler;
	}
}

export class Element extends D2
{
	private _bind: (e: JQueryMouseEventObject) => any;
	private _target: HTMLElement;

	constructor(target: HTMLElement)
	{
		super();

		this._target = target;
		this._bind = this._onMove.bind(this);
		$(this._target).bind("mousemove", this._bind);
	}

	public destroy(): void
	{
		$(this._target).unbind("mousemove", this._bind);
		this._bind = this._target = null;

		super.destroy();
	}

	private _onMove(e: JQueryMouseEventObject): any
	{
		this.update(e.offsetX, e.offsetY);
	}
}
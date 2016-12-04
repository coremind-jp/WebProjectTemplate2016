export class Event
{
	private _defaultPrevented: boolean;
	private _cancelable: boolean;

	constructor(public type: string, cancelable: boolean = true)
	{
		this.type = type;
		this._cancelable = cancelable;
		this._defaultPrevented = false;
	}

	public preventDefault(): void
	{
		if (this._cancelable)
			this._defaultPrevented = true;
	}

	public reset()
	{
		this._defaultPrevented = false;
	}

	public get defaultPrevented(): boolean
	{
		return this._defaultPrevented;
	}
}

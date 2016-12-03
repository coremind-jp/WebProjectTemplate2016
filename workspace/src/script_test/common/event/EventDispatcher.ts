import * as assert from "power-assert";
import {EventDispatcher} from "../../../script/common/event/EventDispatcher";
import {Event} from "../../../script/common/event/Event";

describe("EventDispatcher", () =>
{
	beforeEach(() =>
	{
		this.dispatcher = new EventDispatcher();
	});

	afterEach(() =>
	{
		this.dispatcher.destroy();
		this.dispatcher = null;
	});

	it("addListener & dispatch", () =>
	{
		let assertResult: number = 0;

		this.dispatcher.addListener("test", (e: Event): boolean =>
		{
			assertResult += 1;
			return true;
		});

		this.dispatcher.dispatch(new Event("test"));

		assert(assertResult == 1);
	});

	it("addListener(priority)", () =>
	{
		let dispatchedOrder: Array<string> = [];

		for (let i: number = 0; i < 3; i++)
			for (let k: number = 0; k < 2; k++)
				this.dispatcher.addListener("test", (e: Event): boolean =>
				{
					dispatchedOrder.push(i+""+k);
					return true;
				}, i);

		this.dispatcher.dispatch(new Event("test"));
		assert(dispatchedOrder.join(",") == "20,21,10,11,00,01");
	});

	it("dispatch:プライオリティー値が同じ場合、先に追加されたリスナーから順に呼び出される", () =>
	{
		let dispatchedOrder: Array<number> = [];

		for (let i: number = 0; i < 3; i++)
		{
			this.dispatcher.addListener("test", (e: Event): boolean =>
			{
				dispatchedOrder.push(i);
				return true;
			}, 100);// <-毎回100で呼び出す.
		}

		this.dispatcher.dispatch(new Event("test"));
		assert(dispatchedOrder.join(",") == "0,1,2");
	});
});
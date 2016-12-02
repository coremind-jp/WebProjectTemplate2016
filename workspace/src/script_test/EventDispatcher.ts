import * as assert from "power-assert";
import {EventDispatcher} from "../script/common/event/EventDispatcher";
import {Event} from "../script/common/event/Event";

describe("EventDispatcher", () =>
{
	it("dispatch:イベント発火ができる", () =>
	{
		let assertResult: number = 0;
		let ed: EventDispatcher = new EventDispatcher();

		ed.addListener("test", (e: Event): boolean =>
		{
			assertResult += 1;
			return true;
		});

		ed.dispatch(new Event("test"));

		assert(assertResult == 1);
	});

	it("dispatch:プライオリティー値が高い順にリスナーが呼び出される", () =>
	{
		let dispatchedOrder: Array<string> = [];
		let ed: EventDispatcher = new EventDispatcher();

		for (let i: number = 0; i < 3; i++)
		{
			for (let k: number = 0; k < 2; k++)
			{
				ed.addListener("test", (e: Event): boolean =>
				{
					dispatchedOrder.push(i+"_"+k);
					return true;
				}, i);
			}
		}

		ed.dispatch(new Event("test"));
		assert(dispatchedOrder.join(",") == "2_0,2_1,1_0,1_1,0_0,0_1");
	});

	it("dispatch:プライオリティー値が同じ場合、先に追加されたリスナーから順に呼び出される", () =>
	{
		let dispatchedOrder: Array<number> = [];
		let ed: EventDispatcher = new EventDispatcher();

		for (let i: number = 0; i < 3; i++)
		{
			ed.addListener("test", (e: Event): boolean =>
			{
				dispatchedOrder.push(i);
				return true;
			}, 100);// <-毎回100で呼び出す.
		}

		ed.dispatch(new Event("test"));
		assert(dispatchedOrder.join(",") == "0,1,2");
	});
});
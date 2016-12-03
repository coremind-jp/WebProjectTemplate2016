import * as assert from "power-assert";
import {OrderList} from "../../../script/common/data/OrderList";
import {WeightingContainer} from "../../../script/common/data/WeightingContainer";

describe("OrderList", () =>
{
	beforeEach(() =>
	{
		this.orderList = new OrderList<number>();
	});

	afterEach(() =>
	{
		this.orderList.destroy();
		this.orderList = null;
	});

	it("add(priority) & remove", () =>
	{
		let order: Array<string> = [];

		for (let i: number = 0; i < 3; i++)
			for (let k: number = 0; k < 2; k++)
				this.orderList.add(i+""+k, i);
		this.orderList.each((v: string, i: number): boolean =>
		{
			order.push(v);
			return true;
		});
		assert(order.join(",") == "20,21,10,11,00,01");

		order.length = 0;
		this.orderList.remove("11");
		this.orderList.each((v: string, i: number): boolean =>
		{
			order.push(v);
			return true;
		});
		assert(order.join(",") == "20,21,10,00,01");
	});
});
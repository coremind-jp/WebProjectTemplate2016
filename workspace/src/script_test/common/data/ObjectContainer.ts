import * as assert from "power-assert";
import {ObjectContainer} from "../../../script/common/data/ObjectContainer";

interface Child { val: string };

describe("ObjectContainer", () =>
{
	beforeEach(() =>
	{
		this.oc = new ObjectContainer<Child>();
		this._1st = { val: "child1" };
		this._2nd = { val: "child2" };
		this._3rd = { val: "child3" };
	});

	afterEach(() =>
	{
		this.oc.destroy();
		this.oc = null;
	});

	it("add & remove & numChildren & contains", () =>
	{
		assert(this.oc.add(this._1st) === 1);
		assert(this.oc.numChildren === 1);
		assert(this.oc.contains(this._1st) === true);

		assert(this.oc.add(this._2nd) === 2);
		assert(this.oc.numChildren === 2);
		assert(this.oc.contains(this._2nd) === true);

		assert(this.oc.add(this._3rd) === 3);
		assert(this.oc.numChildren === 3);
		assert(this.oc.contains(this._3rd) === true);

		// ignore contains object
		assert(this.oc.add(this._1st) === 3);
		assert(this.oc.numChildren === 3);


		assert(this.oc.remove(this._1st) === this._1st);
		assert(this.oc.numChildren === 2);
		assert(this.oc.contains(this._1st) === false);

		// ignore not contains object
		assert(this.oc.remove(this._1st) === null);
		assert(this.oc.numChildren === 2);

		assert(this.oc.remove(this._2nd) === this._2nd);
		assert(this.oc.numChildren === 1);
		assert(this.oc.contains(this._2nd) === false);

		assert(this.oc.remove(this._3rd) === this._3rd);
		assert(this.oc.numChildren === 0);
		assert(this.oc.contains(this._3rd) === false);
	});

	it("removeAll", () =>
	{
		this.oc.add(this._1st);
		this.oc.add(this._2nd);
		this.oc.add(this._3rd);
		this.oc.removeAll();

		assert(this.oc.numChildren === 0);
	});

	it("getChild", () =>
	{
		this.oc.add(this._1st);
		this.oc.add(this._2nd);
		this.oc.add(this._3rd);

		assert(this.oc.getChild(-1) === null);
		assert(this.oc.getChild(0) === this._1st);
		assert(this.oc.getChild(1) === this._2nd);
		assert(this.oc.getChild(2) === this._3rd);
		assert(this.oc.getChild(3) === null);
	});

	it("getChildIndex", () =>
	{
		this.oc.add(this._1st);
		this.oc.add(this._2nd);
		this.oc.add(this._3rd);

		assert(this.oc.getChildIndex(this._1st) === 0);
		assert(this.oc.getChildIndex(this._2nd) === 1);
		assert(this.oc.getChildIndex(this._3rd) === 2);
		assert(this.oc.getChildIndex({ val: "unknown"}) === -1);
	});

	it("each", () =>
	{
		let res:Array<string> = [];

		this.oc.add(this._1st);
		this.oc.add(this._2nd);
		this.oc.add(this._3rd);
		this.oc.each((child: Child, index: number): boolean =>
		{
			res.push(child.val);
			return true;
		});

		assert(res.join(",") === "child1,child2,child3");
	});

	it("each(break)", () =>
	{
		let res:Array<string> = [];
		let breakPoint:number = 1;

		this.oc.add(this._1st);
		this.oc.add(this._2nd);
		this.oc.add(this._3rd);
		this.oc.each((child: Child, index: number): boolean =>
		{
			res.push(child.val);
			return index < breakPoint;
		});

		assert(res.join(",") === "child1,child2");
	});
});
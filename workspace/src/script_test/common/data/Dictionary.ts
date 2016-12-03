import * as assert from "power-assert";
import {Dictionary} from "../../../script/common/data/Dictionary";

interface IKey   { keyContext: string };
interface IValue { valContext: string };

describe("Dictionary", () =>
{
	beforeEach(() =>
	{
		this.dic = new Dictionary<IKey, IValue>();
		this.key1 = { keyContext: "Key1"   };
		this.val1 = { valContext: "Value1" };
		this.key2 = { keyContext: "Key2"   };
		this.val2 = { valContext: "Value2" };
	});

	afterEach(() =>
	{
		this.dic.destroy();
		this.dic = null;
	});

	it("setValue & hasKey & hasValue & getValue & deleteValue & numChildren", () =>
	{
		this.dic.setValue(this.key1, this.val1);
		assert(this.dic.hasKey(this.key1) === true);
		assert(this.dic.hasValue(this.val1) === true);
		assert(this.dic.getValue(this.key1) === this.val1);
		assert(this.dic.numChildren === 1);

		this.dic.deleteValue(this.key1);
		assert(this.dic.hasKey(this.key1) === false);
		assert(this.dic.hasValue(this.val1) === false);
		assert(this.dic.getValue(this.key1) === null);
		assert(this.dic.numChildren === 0);
	});

	it("removeAll", () =>
	{
		this.dic.setValue(this.key1, this.val1);
		this.dic.setValue(this.key2, this.val2);
		assert(this.dic.numChildren === 2);

		this.dic.removeAll();
		assert(this.dic.numChildren === 0);

		assert(this.dic.hasKey(this.key1) === false);
		assert(this.dic.hasKey(this.key2) === false);

		assert(this.dic.hasValue(this.val1) === false);
		assert(this.dic.hasValue(this.val2) === false);

		assert(this.dic.getValue(this.key1) === null);
		assert(this.dic.getValue(this.key2) === null);
	});

	it("each", () =>
	{
		let res:Array<string> = [];

		this.dic.setValue(this.key1, this.val1);
		this.dic.setValue(this.key2, this.val2);
		this.dic.each((key: IKey, val: IValue): boolean =>
		{
			res.push(key.keyContext+val.valContext);
			return true;
		});

		assert(res.join(",") === "Key1Value1,Key2Value2");
	});

	it("each(break)", () =>
	{
		let res:Array<string> = [];

		this.dic.setValue(this.key1, this.val1);
		this.dic.setValue(this.key2, this.val2);
		this.dic.each((key: IKey, val: IValue): boolean =>
		{
			res.push(key.keyContext+val.valContext);
			return false;
		});

		assert(res.join(",") === "Key1Value1");
	});
});
import * as assert from "power-assert";
import {EventDispatcher} from "../../../script/common/event/EventDispatcher";
import {Event} from "../../../script/common/event/Event";

describe("EventDispatcher", () =>
{
	beforeEach(() =>
	{
		this.dispatcher = new EventDispatcher();
		this.dispatched = [];
		this.listernA = (e: Event) => { this.dispatched.push("A"); };
		this.listernB = (e: Event) => { this.dispatched.push("B"); };
		this.listernC = (e: Event) => { this.dispatched.push("C"); };
		this.preventDefaultListener = (e: Event) =>
		{
			e.preventDefault();
			this.dispatched.push("callPreventDefault.");
		};
	});

	afterEach(() =>
	{
		this.dispatcher.destroy();
		this.dispatcher = null;
		this.dispatched = null;
	});

	it("addListener & removeListener & hasListener", () =>
	{
		this.dispatcher.addListener("test", this.listenerA);
		assert(this.dispatcher.hasListener("test", this.listenerA) === true);

		this.dispatcher.removeListener("test", this.listenerA);
		assert(this.dispatcher.hasListener("test", this.listenerA) === false);

		this.dispatcher.addListener("test", this.listenerA);
		this.dispatcher.addListener("test", this.listenerB);
		this.dispatcher.addListener("test", this.listenerC);
		assert(this.dispatcher.hasListener("test") === true);// equal has any listeners(type = test).
		assert(this.dispatcher.hasListener("test", this.listenerA) === true);
		assert(this.dispatcher.hasListener("test", this.listenerB) === true);
		assert(this.dispatcher.hasListener("test", this.listenerC) === true);

		this.dispatcher.removeListener("test");// equal all listeners removed.
		assert(this.dispatcher.hasListener("test") === false);
		assert(this.dispatcher.hasListener("test", this.listenerA) === false);
		assert(this.dispatcher.hasListener("test", this.listenerB) === false);
		assert(this.dispatcher.hasListener("test", this.listenerC) === false);
	});

	it("dispatche", () =>
	{
		this.dispatcher.addListener("test", this.listernA);
		this.dispatcher.addListener("test", this.listernB);
		this.dispatcher.addListener("test", this.listernC);
		this.dispatcher.dispatch(new Event("test"));

		assert(this.dispatched.join(",") === "A,B,C");
	});

	it("dispatche canceled", () =>
	{
		this.dispatcher.addListener("test", this.listernA);
		this.dispatcher.addListener("test", this.preventDefaultListener);
		this.dispatcher.addListener("test", this.listernB);//canceled
		this.dispatcher.addListener("test", this.listernC);//canceled
		this.dispatcher.dispatch(new Event("test"));

		assert(this.dispatched.join(",") === "A,callPreventDefault.");
	});
});
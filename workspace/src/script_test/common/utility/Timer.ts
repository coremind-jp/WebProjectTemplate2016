import * as assert from "power-assert";
import {Timer} from "../../../script/common/utility/Timer";
import {TimerEvent} from "../../../script/common/utility/Timer";

describe("Timer", () =>
{
	beforeEach(() =>
	{
		this.timerComplete = false;

		this.timer = new Timer();
		this.timer.addListener(TimerEvent.TIMER_COMPLETE, (e: Event): void => {
			this.timerComplete = true;
		});
	});

	afterEach(() =>
	{
		this.timer.destroy();
		this.timer = null;
	});

	it("start", (done) =>
	{
		this.timer.start(100, 1);

		setTimeout(() => {
			assert(this.timerComplete === true);
			assert(this.timer.lap === 1);
			done();
		}, 110);
	});

	it("pause", (done) =>
	{
		this.timer.start(100, 1);
		this.timer.pause(100);

		setTimeout(() => {
			assert(this.timerComplete === false);
			assert(this.timer.lap === 0);
		}, 110);

		setTimeout(() => {
			assert(this.timerComplete === true);
			assert(this.timer.lap === 1);
			done();
		}, 210);
	});

	it("repeate", (done) =>
	{
		this.timer.start(100, 5);

		let test = (expectedLap: number, isComplete: boolean): () => void => {
			return (): void => {
				assert(this.timerComplete === isComplete);
				assert(this.timer.lap === expectedLap);
				if (isComplete) done();
			};
		};

		setTimeout(test(1, false), 110);
		setTimeout(test(2, false), 210);
		setTimeout(test(3, false), 310);
		setTimeout(test(4, false), 410);
		setTimeout(test(5,  true), 510);
	});
});
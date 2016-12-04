import {Timer} from "../common/utility/Timer";
import {Ticker} from "../common/utility/Ticker";
import {Event} from "../common/event/Event";

var timer:Timer = new Timer();
timer.start(2 * 1000, 3);
timer.addListener("onTimer", (e: Event): void =>  {
	console.log(
		"--------------------",
		"\nelapsed           :", timer.elapsed,
		"\ncalcElapsedRate   :", timer.calcElapsedRate(),
		"\nlap               :", timer.lap
	);
});

var ticker:Ticker = new Ticker(100);
ticker.add({
	onTick: (now: number): void => {
		console.log(
			"-----pause ?"+timer.isPause()+"-----",
			"\nlapElapsed        :", timer.lapElapsed,
			"\ncalcLapElapsedRate:", timer.calcLapElapsedRate()
		);
	}
});

setTimeout(() => {
	let ticker:Ticker = new Ticker(2000);

	ticker.add({
		onTick: (now: number): void => {
			timer.isPause() ? timer.resume(): timer.pause();
		}
	});

}, 1000);

import * as assert from "power-assert";
import * as PixelWatcher from "../../../script/common/utility/PixelWatcher";

describe("PixelWatcher", () =>
{
	beforeEach(() =>
	{
		this.d1Return = NaN;
		this.d2Return = {
			x: NaN,
			y: NaN
		};

		this.pwD1 = new PixelWatcher.D1();
		this.pwD1.handler = (now: number): void => {
			this.d1Return = now;
		};

		this.pwD2 = new PixelWatcher.D2();
		this.pwD2.x.handler = (now: number): void => {
			this.d2Return.x = now;
		};
		this.pwD2.y.handler = (now: number): void => {
			this.d2Return.y = now;
		};
		this.pwD2.handler = (x: number, y: number): void => {
			this.d2Return.x = x;
			this.d2Return.y = y;
		};
	});

	afterEach(() =>
	{
		this.pwD1.destroy();
		this.pwD1 = null;

		this.pwD2.destroy();
		this.pwD2 = null;
	});

	describe("D1", () =>
	{
		it("update", (done) =>
		{
			this.pwD1.update(5);

			setTimeout(() =>
			{
				assert(this.d1Return === 5);
				done();
			}, 4);
		});

		describe("update(resolution) resolutionで指定した値未満の値変動があってもhandlerは呼ばれない", () =>
		{
			it("正", (done) =>
			{
				this.pwD1.resolution = 100;
				this.pwD1.update(56);

				setTimeout(() =>
				{
					assert(isNaN(this.d1Return) === true);
					done();
				}, 4);
			});

			it("負", (done) =>
			{
				this.pwD1.resolution = 100;
				this.pwD1.update(-20);

				setTimeout(() =>
				{
					assert(isNaN(this.d1Return) === true);
					done();
				}, 4);
			});
		});

		describe("update(resolution) resolutionで指定した値以上の値変動があった場合handlerを呼びだす. 引数には入力に対する分解値を渡す.", () =>
		{
			it("分解能100, 変化量100", (done) =>
			{
				this.pwD1.resolution = 100;
				this.pwD1.update(100);
				
				setTimeout(() =>
				{
					//100を100で分解するので1を期待する
					assert(this.d1Return === 1);
					done();
				}, 4);
			});

			it("分解能100, 変化量-100(負)", (done) =>
			{
				this.pwD1.resolution = 100;
				this.pwD1.update(-100);
				
				setTimeout(() =>
				{
					//100を100で分解するので1を期待する
					assert(this.d1Return === -1);
					done();
				}, 4);
			});

			it("分解能100, 変化量-200", (done) =>
			{
				this.pwD1.resolution = 100;
				this.pwD1.update(200);
				
				setTimeout(() =>
				{
					//200を100で分解するので2を期待する
					assert(this.d1Return === 2);
					done();
				}, 4);
			});

			it("分解能100, 変化量-200(負)", (done) =>
			{
				this.pwD1.resolution = 100;
				this.pwD1.update(-200);
				
				setTimeout(() =>
				{
					//200を100で分解するので2を期待する
					assert(this.d1Return === -2);
					done();
				}, 4);
			});
		});

	});

	describe("D2", () =>
	{
		it("update x, y共にhandlerが呼び出された場合に限りD2Handlerを呼び出す", (done) =>
		{
			this.pwD2.x.resolution = 50;
			this.pwD2.y.resolution = 50;
			this.pwD2.update(60, 70);

			setTimeout(() =>
			{
				assert(this.d2Return.x === 1);
				assert(this.d2Return.y === 1);
				done();
			}, 4);
		});

		it("update x, yどちらかのみhandlerが呼び出された場合はx, y側のhandlerが呼び出される.", (done) =>
		{
			this.pwD2.x.resolution = 50;
			this.pwD2.y.resolution = 50;
			this.pwD2.update(23, 70);

			setTimeout(() =>
			{
				assert(isNaN(this.d2Return.x) === true);
				assert(this.d2Return.y === 1);
				done();
			}, 4);
		});
	});
});
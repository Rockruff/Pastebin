const QueuedPromise = (function () {
	let queue = Promise.resolve();
	// exec new promise only if prev tasks is done.
	// to prevent deadlock, never use QueuedPromise in executor
	return function (executor) {
		let result = queue
			.then(() => new Promise(executor)) // onFulfilled
			.catch(console.error); // onRejected
		queue = result;
		return result;
	};
})();

//example 1
async function setValue1(v) {
	let sleepTime = Math.random() * 50;
	window.v1 = await new Promise((resolve) => setTimeout(resolve, sleepTime, v));
}

async function setValue2(v) {
	let sleepTime = Math.random() * 50;
	window.v2 = await new QueuedPromise((resolve) => setTimeout(resolve, sleepTime, v));
}

for (let i = 0; i <= 100; ++i) {
	setValue1(i); //v1 is random
	setValue2(i); //v2 must be 100
}

//example 2
const sleep = function (ms) {
	if (typeof ms !== "number") ms = Math.random() * 50;
	return new Promise((resolve) => setTimeout(resolve, ms, ms));
};

const storageEmu1 = {
	_data: {},
	set(v) {
		return new Promise(async (resolve) => {
			await sleep(); //can be interrupted
			Object.assign(this._data, v);
			resolve();
		});
	},
	get() {
		return new Promise(async (resolve) => {
			await sleep(); //can be interrupted
			console.log("get storageEmu1", this._data);
			resolve();
		});
	},
};

const storageEmu2 = {
	_data: {},
	set(v) {
		return new QueuedPromise(async (resolve, reject) => {
			await sleep(); //can be interrupted
			Object.assign(this._data, v);
			resolve();
		});
	},
	get() {
		return new QueuedPromise(async (resolve) => {
			await sleep(); //can be interrupted
			console.log("get storageEmu2", this._data);
			resolve();
		});
	},
};

for (let i = 0; i <= 100; ++i) {
	storageEmu1.set({ i });
	storageEmu2.set({ i });
}

storageEmu1.get(); //may not after all set() and i is random
storageEmu2.get(); //always after all set2() and i === 100

/********** Hash **********/

const SHA1 = (function () {
	/*
	 * Calculate the SHA1 of a raw string
	 */
	function rstr_sha1(s) {
		return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
	}

	/*
	 * Convert a raw string to a hex string
	 */
	function rstr2hex(input) {
		var output = "";
		var x;
		for (var i in input) {
			x = input.charCodeAt(i);
			output += ((x >> 4) & 0x0f).toString(16) + (x & 0x0f).toString(16);
		}
		return output;
	}

	/*
	 * Encode a string as utf-8.
	 * For efficiency, this assumes the input is valid utf-16.
	 */
	function str2rstr_utf8(input) {
		var output = "";
		var i = -1;
		var x, y;

		while (++i < input.length) {
			/* Decode utf-16 surrogate pairs */
			x = input.charCodeAt(i);
			y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
			if (0xd800 <= x && x <= 0xdbff && 0xdc00 <= y && y <= 0xdfff) {
				x = 0x10000 + ((x & 0x03ff) << 10) + (y & 0x03ff);
				i++;
			}

			/* Encode output as utf-8 */
			if (x <= 0x7f) output += String.fromCharCode(x);
			else if (x <= 0x7ff) output += String.fromCharCode(0xc0 | ((x >> 6) & 0x1f), 0x80 | (x & 0x3f));
			else if (x <= 0xffff) output += String.fromCharCode(0xe0 | ((x >> 12) & 0x0f), 0x80 | ((x >> 6) & 0x3f), 0x80 | (x & 0x3f));
			else if (x <= 0x1fffff) output += String.fromCharCode(0xf0 | ((x >> 18) & 0x07), 0x80 | ((x >> 12) & 0x3f), 0x80 | ((x >> 6) & 0x3f), 0x80 | (x & 0x3f));
		}
		return output;
	}

	/*
	 * Convert a raw string to an array of big-endian words
	 * Characters >255 have their high-byte silently ignored.
	 */
	function rstr2binb(input) {
		var output = [];
		for (var i = 0; i < input.length * 8; i += 8) output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (24 - (i % 32));
		return output;
	}

	/*
	 * Convert an array of big-endian words to a string
	 */
	function binb2rstr(input) {
		var output = "";
		for (var i = 0; i < input.length * 32; i += 8) output += String.fromCharCode((input[i >> 5] >> (24 - (i % 32))) & 0xff);
		return output;
	}

	/*
	 * Calculate the SHA-1 of an array of big-endian words, and a bit length
	 */
	function binb_sha1(x, len) {
		/* append padding */
		x[len >> 5] |= 0x80 << (24 - (len % 32));
		x[(((len + 64) >> 9) << 4) + 15] = len;

		var w = [];
		var a = 1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d = 271733878;
		var e = -1009589776;

		for (var i = 0; i < x.length; i += 16) {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
			var olde = e;

			for (var j = 0; j < 80; j++) {
				if (j < 16) w[j] = x[i + j];
				else w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
				var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
				e = d;
				d = c;
				c = bit_rol(b, 30);
				b = a;
				a = t;
			}

			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
			e = safe_add(e, olde);
		}
		return [a, b, c, d, e];
	}

	/*
	 * Perform the appropriate triplet combination function for the current
	 * iteration
	 */
	function sha1_ft(t, b, c, d) {
		if (t < 20) return (b & c) | (~b & d);
		if (t < 40) return b ^ c ^ d;
		if (t < 60) return (b & c) | (b & d) | (c & d);
		return b ^ c ^ d;
	}

	/*
	 * Determine the appropriate additive constant for the current iteration
	 */
	function sha1_kt(t) {
		return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514;
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y) {
		var lsw = (x & 0xffff) + (y & 0xffff);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xffff);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt) {
		return (num << cnt) | (num >>> (32 - cnt));
	}

	return function (s) {
		return rstr2hex(rstr_sha1(str2rstr_utf8(s)));
	};
})();

const MD5 = (function () {
	/*
	 * Calculate the MD5 of a raw string
	 */
	function rstr_md5(s) {
		return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
	}

	/*
	 * Convert a raw string to a hex string
	 */
	function rstr2hex(input) {
		var hex_tab = "0123456789abcdef";
		var output = "";
		var x;
		for (var i = 0; i < input.length; i++) {
			x = input.charCodeAt(i);
			output += hex_tab.charAt((x >>> 4) & 0x0f) + hex_tab.charAt(x & 0x0f);
		}
		return output;
	}

	/*
	 * Encode a string as utf-8.
	 * For efficiency, this assumes the input is valid utf-16.
	 */
	function str2rstr_utf8(input) {
		var output = "";
		var i = -1;
		var x, y;

		while (++i < input.length) {
			/* Decode utf-16 surrogate pairs */
			x = input.charCodeAt(i);
			y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
			if (0xd800 <= x && x <= 0xdbff && 0xdc00 <= y && y <= 0xdfff) {
				x = 0x10000 + ((x & 0x03ff) << 10) + (y & 0x03ff);
				i++;
			}

			/* Encode output as utf-8 */
			if (x <= 0x7f) output += String.fromCharCode(x);
			else if (x <= 0x7ff) output += String.fromCharCode(0xc0 | ((x >>> 6) & 0x1f), 0x80 | (x & 0x3f));
			else if (x <= 0xffff) output += String.fromCharCode(0xe0 | ((x >>> 12) & 0x0f), 0x80 | ((x >>> 6) & 0x3f), 0x80 | (x & 0x3f));
			else if (x <= 0x1fffff) output += String.fromCharCode(0xf0 | ((x >>> 18) & 0x07), 0x80 | ((x >>> 12) & 0x3f), 0x80 | ((x >>> 6) & 0x3f), 0x80 | (x & 0x3f));
		}
		return output;
	}

	/*
	 * Convert a raw string to an array of little-endian words
	 * Characters >255 have their high-byte silently ignored.
	 */
	function rstr2binl(input) {
		var output = Array(input.length >> 2);
		for (var i = 0; i < output.length; i++) output[i] = 0;
		for (var i = 0; i < input.length * 8; i += 8) output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
		return output;
	}

	/*
	 * Convert an array of little-endian words to a string
	 */
	function binl2rstr(input) {
		var output = "";
		for (var i = 0; i < input.length * 32; i += 8) output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
		return output;
	}

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length.
	 */
	function binl_md5(x, len) {
		/* append padding */
		x[len >> 5] |= 0x80 << len % 32;
		x[(((len + 64) >>> 9) << 4) + 14] = len;

		var a = 1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d = 271733878;

		for (var i = 0; i < x.length; i += 16) {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;

			a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
			d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
			c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
			b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
			a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
			d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
			c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
			b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
			a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
			d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
			c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
			b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
			a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
			d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
			c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
			b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

			a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
			d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
			c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
			b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
			a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
			d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
			c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
			b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
			a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
			d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
			c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
			b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
			a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
			d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
			c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
			b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

			a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
			d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
			c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
			b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
			a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
			d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
			c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
			b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
			a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
			d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
			c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
			b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
			a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
			d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
			c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
			b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

			a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
			d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
			c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
			b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
			a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
			d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
			c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
			b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
			a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
			d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
			c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
			b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
			a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
			d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
			c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
			b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
		}
		return Array(a, b, c, d);
	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t) {
		return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
	}
	function md5_ff(a, b, c, d, x, s, t) {
		return md5_cmn((b & c) | (~b & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t) {
		return md5_cmn((b & d) | (c & ~d), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t) {
		return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t) {
		return md5_cmn(c ^ (b | ~d), a, b, x, s, t);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y) {
		var lsw = (x & 0xffff) + (y & 0xffff);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xffff);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt) {
		return (num << cnt) | (num >>> (32 - cnt));
	}

	return function (s) {
		return rstr2hex(rstr_md5(str2rstr_utf8(s)));
	};
})();

/********** Network **********/

function TransformResponse(resp) {
	if (resp.respCode !== 200) {
		throw resp;
	}
	try {
		return resp.attribute.data;
	} catch {
		return resp.attribute;
	}
}

function HttpGet(url) {
	return fetch(url)
		.then((r) => r.json())
		.then(TransformResponse);
}

function HttpPost(url, form) {
	return fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams(form).toString(),
	})
		.then((r) => r.json())
		.then(TransformResponse);
}

/********** Util **********/

function Time() {
	return new Date().getTime();
}

function Sleep(sec) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, sec * 1000);
	});
}

function Random(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

/********** Main **********/

function CalcWatchInfo(watchInfo) {
	watchInfo.timestamp = Time();
	watchInfo.sign = SHA1(watchInfo.pid + watchInfo.vid + watchInfo.playduration + watchInfo.timestamp + MD5(watchInfo.vid).substr(0, 8));
	const result = JSON.stringify(watchInfo);
	watchInfo.playduration += 10;
	return result;
}

async function Main() {
	const playerId = Time() + "X" + Random(1000000, 2000000);

	const myClassId = "fca2e32f-4c4f-4ffe-84f2-6e00c9252f14";
	const { myClassCourseRPList } = await HttpGet("http://zzszyk.user.ghlearning.com/train/class/my-class.gson?myClassId=" + myClassId);

	for (const { videoRPs } of myClassCourseRPList) {
		for (const video of videoRPs) {
			try {
				console.log(video.videoName, video.learnSpeed);
				if (!(video.learnSpeed < 100)) continue;

				// set last video
				await HttpPost("http://zzszyk.user.ghlearning.com/train/cms/my-video/update-last-video.gson", {
					myClassId: myClassId,
					myClassCourseId: video.myClassCourseId,
					myClassCourseVideoId: video.myClassCourseVideoId,
				});

				const watchInfo = {
					vid: video.videoSource,
					pid: playerId,
					playduration: 0,
				};

				// start video
				await HttpPost("http://zzszyk.user.ghlearning.com/train/cms/my-video/sv.gson", {
					myClassId: myClassId,
					myClassCourseId: video.myClassCourseId,
					myClassCourseVideoId: video.myClassCourseVideoId,
					watchInfo: CalcWatchInfo(watchInfo),
				});

				// learn until complete
				for (await Sleep(5); ; await Sleep(10)) {
					const { respCode, respDesc, videoLearnRate } = await HttpPost("http://zzszyk.user.ghlearning.com/train/cms/my-video/cv.gson", {
						myClassId: myClassId,
						myClassCourseId: video.myClassCourseId,
						myClassCourseVideoId: video.myClassCourseVideoId,
						watchInfo: CalcWatchInfo(watchInfo),
						isCalculateclassHourFlag: true,
					});
					console.log(respDesc, videoLearnRate);
					if (!(videoLearnRate < 100)) break;
					if (respCode === "INVALID_RESTART") {
						console.log("Aborted", new Date());
						return;
					}
				}
			} catch (e) {
				console.error(e);
				await Sleep(60);
			}
		}
	}
}

Main();

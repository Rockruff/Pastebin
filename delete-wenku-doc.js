async function deleteDocument(doc_id_str)
{
	const post = (url, form) => fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams(form).toString()
	}).then(r => r.json());

	let fold_id_str = await post(
		"https://wenku.baidu.com/user/interface/getfoldid",
		{ docid: doc_id_str }
	).then(({ data }) => data);

	if (fold_id_str.errmsg) {
		console.error(fold_id_str.errmsg);
		return;
	}

	fold_id_str = fold_id_str.data[doc_id_str];

	let { new_token, token } = await post(
		"https://wenku.baidu.com/user/interface/getcontribution"
	).then(({ data }) => data);

	let { error_no } = await post(
		"https://wenku.baidu.com/user/submit/newdocDelete",
		{ doc_id_str, new_token, token, fold_id_str }
	);

	console.log(error_no); //0 == success
}

//VIP documents can be deleted too, with some delay.
deleteDocument("8ead12787fd5360cba1adb13");

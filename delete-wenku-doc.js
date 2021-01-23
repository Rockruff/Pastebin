async function deleteDocument(docid)
{
	const postForm = (url, form) =>
		fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams(form).toString()
		});

	let data = await postForm(
		"https://wenku.baidu.com/user/interface/getfoldid",
		{ docid }
	)
		.then(r => r.json())
		.then(({ data }) => data);

	if (data.errmsg) {
		console.error(data.errmsg);
		return;
	}

	let foldid = data.data[docid];

	data = await fetch("https://wenku.baidu.com/user/interface/getcontribution")
		.then(r => r.json())
		.then(({ data }) => data);

	let { new_token, token } = data;

	let { error_no } = await postForm(
		"https://wenku.baidu.com/user/submit/newdocDelete",
		{ doc_id_str: docid, new_token, token, fold_id_str: foldid }
	).then(r => r.json());

	console.log(error_no); //0 == success
}

//VIP documents can be deleted too, with some delay.
deleteDocument("8ead12787fd5360cba1adb13");

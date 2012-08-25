
// スレッドURLを取得する
function get_thread_url( board_id, thread_id ) {
	if ( ! exist_board_id( board_list, board_id ) ) return false;
	var ind_1 = board_list_mapping[board_id];
	var res = board_list[ind_1].url;
	var n = res.length;
	if ( res[n-1] != '/' ) res += '/';
	res += 'dat/'+thread_id;
	return res;
}

// datの形式を読み取る
function get_response_info( line ) {
	var item = line.split('<>');
	if ( item.length != 5 ) return false;
	var name = item[0];
	var mail = item[1];
	var info = item[2];
	var body = item[3];
	var title = item[4];
	return {
		name: name,
		mail: mail,
		info: info,
		body: body,
		title: title
	};
}

// レス一覧を取得する
function get_response_list( board_id, thread_id, callback ) {
	var req = new XMLHttpRequest();
	req.open( 'GET', get_thread_url( board_id, thread_id ) );
	req.overrideMimeType('text/plain; charset=x-user-defined');
	req.send(null);
	req.onreadystatechange = function() {
		if ( req.readyState == 4 ) {
			complete_func(req);
		}
	};
	
	function complete_func( data ) {
		if ( data.status != 200 ) {
			callback( {status:false} );
			return;
		}
		var ret = data.responseText;
		var lines = ret.split('\n');
		var n = lines.length;
		var items = [];
		for ( var i = 0; i < n; ++ i ) {
			lines[i] = ConvertEncodingFromSJIS( lines[i] );
		}
		for ( var i = 0; i < n; ++ i ) {
			items.push( get_response_info( lines[i] ) );
		}
		callback( {status:true, response_list:items} );
	}
}

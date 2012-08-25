

// 実際にマッピングを行う
function mapping_id_to_index_sub( mapping_list, id, index ) {
	board_list_mapping[id] = index;
}

// 板一覧を渡すと板IDで板情報を引き出せるようにする
function mapping_id_to_index( board_list ) {
	var res = [];
	var n = board_list.length;
	for ( var i = 0; i < n; ++ i ) {
		mapping_id_to_index_sub( board_list_mapping, board_list[i].id, i );
	}
	return res;
}

// 板IDを渡すとsubject.txtへのURLに変換してくれる
function get_subject_url_from_board_id( id ) {
	var ind_1 = board_list_mapping[id];
	return board_list[ind_1].url+'/subject.txt';
}

// 板IDを渡すと、スレッド一覧を取得して返す
function get_thread_list( board_id, callback ) {
	if ( wait_flag ) {
		setTimeout( function() {
			get_thread_list( board_id, callback );
		}, 1000 );
		return;
	}
	if ( ! exist_board_id( board_list, board_id ) ) {
		callback( { status: false } );
		return;
	}
	
	var req = new XMLHttpRequest();
	req.open( 'GET', get_subject_url_from_board_id(board_id)+'?'+(new Date()).getTime(), true );
	req.overrideMimeType('text/plain; charset=x-user-defined');
	req.send(null);
	req.onreadystatechange = function() {
		if ( req.readyState == 4 ) {
			complete_func(req);
		}
	};
	
	function complete_func(data) {
		if ( data.status != 200 ) {
			callback( {status:false} );
			return;
		}
		var ret = data.responseText;
		var lines = ret.split('\n');
		var n = lines.length;
		var items = [];
		for ( var i = 0; i < n; ++ i ) {
			var item = lines[i].split('<>');
			if ( item.length != 2 ) continue;
			items.push({id:item[0], title:item[1]});
		}
		n = items.length;
		for ( var i = 0; i < n; ++ i ) {
			items[i].title = ConvertEncodingFromSJIS( items[i].title );
		}
		callback( {status:true, thread_list:items} );
	}
}
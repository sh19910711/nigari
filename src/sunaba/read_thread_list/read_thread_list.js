
var board_list = [];
var board_list_mapping = [];
var wait_flag = true; // 板一覧を読み込むまで実行を待たせる

(function() {
	get_board_list( function( ret ) {
		board_list = ret.board_list;
		mapping_id_to_index( board_list );
		wait_flag = false;
	} );
})();

// 実際にマッピングを行う
function mapping_id_to_index_sub( mapping_list, id, index ) {
	mapping_list[id] = index;
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
function get_url_from_board_id( id ) {
	var ind_1 = board_list_mapping[id];
	return board_list[ind_1].url+'/subject.txt';
}

// UTF-8のバイト列を文字列に変換する
function ConvertBytesToStringWithUTF8( bytes ) {
	var res = '';
	var code;
	while ( code = bytes.shift() ) {
		if ( code <= 0x7f ) {
			res += String.fromCharCode(code);
		} else if ( code <= 0xdf ) {
			var c = ((code&0x1f)<<6);
			c += bytes.shift() & 0x3f;
			res += String.fromCharCode(code);
		} else if ( code <= 0xe0 ) {
			var c = ((bytes.shift()&0x1f)<<6)|0x0800;
			c += bytes.shift() & 0x3f;
			res += String.fromCharCode(c);
		} else {
			var c = ((code&0x0f)<<12);
			c += (bytes.shift()&0x3f)<<6;
			c += bytes.shift() & 0x3f;
			res += String.fromCharCode(c);
		}
	}
	return res;
}

// SJISをUTF-8に変換する
function ConvertEncodingFromSJIS(s) {
	var bytes = [];
	var n = s.length;
	for ( var i = 0; i < n; ++ i ) {
		var code = s.charCodeAt(i);
		bytes.push(parseInt(code&0xFF));
	}
	var utf8_bytes = Encoding.convert(bytes, 'UTF8', 'AUTO');
	return ConvertBytesToStringWithUTF8(utf8_bytes);
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
	req.open( 'GET', get_url_from_board_id(board_id)+'?'+(new Date()).getTime(), true );
	req.overrideMimeType('text/plain; charset=x-user-defined');
	req.send(null);
	req.onreadystatechange = function() {
		if ( req.readyState == 4 ) {
			complete_func(req);
		}
	};
	
	function complete_func(data) {
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

/*
 * 板関連
 */

var board_url_reg = /^http:\/\/.*\.2ch\.net\/([^\/\. ]+)\/?$/;

//2chの板URLかどうかチェックする
function check_board_url( url ) {
	if ( url == 'http://info.2ch.net/guide/' ) return false;
	return board_url_reg.test(url);
}

//bbsmenu.htmlのアンカータグからURLとタイトルを取り出す
function get_board_info( line ) {
	var reg = /<A HREF=(.*)>(.*)<\/A>/;
	if ( ! reg.test( line ) ) return false;
	var ret = line.match( reg );
	return { url:ret[1], title:ret[2], id:get_board_id_from_url(ret[1]) };
}

//board_listからHTMLコードを生成する
function get_html_from_board_list( board_list ) {
	var lines = [];
	lines.push('<ul>');
	for ( var i = 0; i < board_list.length; ++ i ) {
		var url = board_list[i].url;
		var title = board_list[i].title;
		lines.push( '<li><a href="'+url+'">'+title+'</a></li>' );
	}
	lines.push('</ul>');
	return lines.join('');
}

//URLから板IDを取得する
function get_board_id_from_url( url ) {
	if ( ! board_url_reg.test( url ) ) return false;
	return url.match(board_url_reg)[1];
}

//与えられた板一覧に指定した板IDが存在するかどうか調べる
function exist_board_id( board_list, id ) {
	var n = board_list.length;
	for ( var i = 0; i < n; ++ i ) {
		if ( board_list[i].id == id ) return true;
	}
	return false;
}

//板一覧を取得する
function get_board_list( callback ) {
	$.ajax({
		url: 'http://menu.2ch.net/bbsmenu.html',
		cache : false,
		dataType: 'html',
		scriptCharset: 'Shift_JIS',
		complete: complete_func
	});

	function complete_func( data ) {
		var text = data.responseText;

		var reg1 = /<font size=2>([\n\r]|.)*<\/font>/;
		text = text.match(reg1)[0];
		var lines = text.split(/\r\n|\r|\n/);

		var board_list = [];
		for ( var i = 0; i < lines.length; ++ i ) {
			var ret = get_board_info( lines[i] );
			if ( ! ret ) continue;
			if ( ! check_board_url( ret.url ) ) continue;
			board_list.push( ret );
		}

		var status = data.status == 200;
		callback( { status: status, board_list: board_list  } );
	}
}



/*
 * レス関連
 */

//スレッドURLを取得する
function get_thread_url( board_id, thread_id ) {
	if ( ! exist_board_id( board_list, board_id ) ) return false;
	var ind_1 = board_list_mapping[board_id];
	var res = board_list[ind_1].url;
	var n = res.length;
	if ( res[n-1] != '/' ) res += '/';
	res += 'dat/'+thread_id;
	return res;
}

//datの形式を読み取る
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

//レス一覧を取得する
function get_response_list( board_id, thread_id, callback ) {
	var req = new XMLHttpRequest();
	req.open( 'GET', get_thread_url( board_id, thread_id )+'?'+(new Date()).getTime() );
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
			var ret = get_response_info( lines[i] );
			if ( ret ) items.push( ret );
		}
		callback( {status:true, response_list:items} );
	}
}



/*
 * スレッド関連
 */

//実際にマッピングを行う
function mapping_id_to_index_sub( mapping_list, id, index ) {
	board_list_mapping[id] = index;
}

//板一覧を渡すと板IDで板情報を引き出せるようにする
function mapping_id_to_index( board_list ) {
	var res = [];
	var n = board_list.length;
	for ( var i = 0; i < n; ++ i ) {
		mapping_id_to_index_sub( board_list_mapping, board_list[i].id, i );
	}
	return res;
}

//板IDを渡すとsubject.txtへのURLに変換してくれる
function get_subject_url_from_board_id( id ) {
	var ind_1 = board_list_mapping[id];
	return board_list[ind_1].url+'/subject.txt';
}

//板IDを渡すと、スレッド一覧を取得して返す
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



/*
 * エンコーディング周り（SJIS->UTF-8）
 */

//UTF-8のバイト列を文字列に変換する
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

//SJISをUTF-8に変換する
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

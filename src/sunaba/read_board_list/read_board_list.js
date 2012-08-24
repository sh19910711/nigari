
// 2chの板URLかどうかチェックする
function check_board_url( url ) {
	var reg = /^http:\/\/.*\.2ch\.net\/[^\/]+\//;
	return reg.test(url);
}

// bbsmenu.htmlのアンカータグからURLとタイトルを取り出す
function get_board_info( line ) {
	var reg = /<A HREF=(.*)>(.*)<\/A>/;
	if ( ! reg.test( line ) ) return false;
	var ret = line.match( reg );
	return { url:ret[1], title:ret[2] };
}

// board_listからHTMLコードを生成する
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

// 板一覧を取得する
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

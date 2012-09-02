
// 
var board_url_reg = /^http:\/\/.*\.2ch\.net\/([^\/\.]+)\/?$/;
var category_html_reg = /^<BR><BR><B>([^<]+)<\/B><BR>/;

// 2chの板URLかどうかチェックする
function check_board_url( url ) {
	if ( url == 'http://info.2ch.net/guide/' ) return false;
	return board_url_reg.test(url);
}

// カテゴリ名かどうかチェックする
function check_category_html( s ) {
	return category_html_reg.test(s);
} 

// カテゴリ名を取得する
function get_category_name_from_html( s ) {
	return s.match( category_html_reg )[1];
}

// bbsmenu.htmlのアンカータグからURLとタイトルを取り出す
function get_board_info( line ) {
	var reg = /<A HREF=(.*)>(.*)<\/A>/;
	if ( ! reg.test( line ) ) return false;
	var ret = line.match( reg );
	return { url:ret[1], title:ret[2], id:get_board_id_from_url(ret[1]) };
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

// URLから板IDを取得する
function get_board_id_from_url( url ) {
	if ( ! board_url_reg.test( url ) ) return false;
	return url.match(board_url_reg)[1];
}

// 与えられた板一覧に指定した板IDが存在するかどうか調べる
function exist_board_id( board_list, id ) {
	var n = board_list.length;
	for ( var i = 0; i < n; ++ i ) {
		if ( board_list[i].id == id ) return true;
	}
	return false;
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
		var category = '';
		
		var board_list = [];
		for ( var i = 0; i < lines.length; ++ i ) {
			if ( check_category_html( lines[i] ) ) {
				category = get_category_name_from_html( lines[i] );
				continue;
			}
			if ( category == '' ) continue;
			var ret = get_board_info( lines[i] );
			ret.category = category;
			if ( ! ret ) continue;
			if ( ! check_board_url( ret.url ) ) continue;
			board_list.push( ret );
		}
		
		var status = data.status == 200;
		callback( { status: status, board_list: board_list  } );
	}
}
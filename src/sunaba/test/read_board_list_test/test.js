
test('get board test', function() {
	function check_board_list( board_list ) {
		for ( var i = 0; i < board_list.length; ++ i ) {
			if ( ! check_board_url( board_list[i].url ) ) return false;
			if ( board_list[i].id == '' || ! board_list[i].id ) return false;
			if ( board_list[i].category == '' ) return false;
		}
		return true;
	}

	stop();
	get_board_list( function( ret ) {
		ok( ret.status, 'status = ok' );
		ok( check_board_list( ret.board_list ), '変なのが混じっていないか確認する' );
		start();
	} );
});

test('check board test', function() {
	console.log('test2');
	ok( ! check_board_url('test'), '適当な文字列' );
	ok( check_board_url('http://hayabusa.2ch.net/news4vip/') );
	ok( check_board_url('http://anago.2ch.net/owabiplus/') );
	ok( check_board_url('http://toro.2ch.net/poetics/') );
	ok( check_board_url('http://engawa.2ch.net/nohodame/') );
	ok( check_board_url('http://engawa.2ch.net/msports/') );
	ok( ! check_board_url('http://menu.2ch.net/bbsmenu.html'), '似ているURL' );
	ok( ! check_board_url('http://info.2ch.net/mag.html'), '似ているURL' );
});

test('check category html', function() {
	ok( check_category_html( '<BR><BR><B>特別企画</B><BR> ' ) );
	ok( ! check_category_html( '<BR><BR>--> ' ) );
	equal( get_category_name_from_html( '<BR><BR><B>特別企画</B><BR>') , '特別企画' );
});

test('get html from board list', function() {
	stop();
	get_board_list( function( ret ) {
		var board_list = ret.board_list;
		var ret1 = get_html_from_board_list( board_list );
		equal( $('li', ret1).size(), board_list.length );
		start();
	});
});

test('URLからの板ID取得', function() {
	equal( get_board_id_from_url('http://hayabusa.2ch.net/news4vip/'), 'news4vip' );
	equal( get_board_id_from_url('http://anago.2ch.net/owabiplus/'), 'owabiplus' );
	equal( get_board_id_from_url('http://toro.2ch.net/poetics'), 'poetics' );
	equal( get_board_id_from_url('http://engawa.2ch.net/nohodame'), 'nohodame'  );
	equal( false, get_board_id_from_url('http://menu.2ch.net/bbsmenu.html'), '似ているURL' );
	equal( false, get_board_id_from_url('http://info.2ch.net/mag.html'), '似ているURL' );
});

test('指定した板IDが一覧に存在するかどうか調べる', function() {
	stop();
	get_board_list(function(ret) {
		start();
		var board_list = ret.board_list;
		ok( exist_board_id( board_list, 'news4vip' ) );
		ok( exist_board_id( board_list, 'owabiplus' ) );
		ok( ! exist_board_id( board_list, 'あいうえお' ), '不正な文字列' );
		ok( ! exist_board_id( board_list, 'test.html' ), '不正な文字列' );
		ok( ! exist_board_id( board_list, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' ), '不正な文字列' );
	});
});


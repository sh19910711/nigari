
function check_board_list( board_list ) {
	for ( var i = 0; i < board_list.length; ++ i ) {
		if ( ! check_board_url( board_list[i].url ) ) return false;
	}
	return true;
}

test("get board test", function() {
	stop();
	get_board_list( function( ret ) {
		ok( ret.status, 'status = ok' );
		ok( check_board_list( ret.board_list ), '変なのが混じっていないか確認する' );
		start();
	} );
});

test("check board test", function() {
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

asyncTest( 'スレッド一覧を取得してみる', function() {
	// 少なくとも空文字列では無い
	function check_thread_list( thread_list ) {
		var n = thread_list.length;
		for ( var i = 0; i < n; ++ i ) {
			if ( thread_list[i].id == '' ) return false;
			if ( thread_list[i].title == '' ) return false;
		}
		return true;
	}
	
	get_thread_list( 'news4vip', function( ret ) {
		start();
		ok( ret.status, 'ちゃんと取得できたらしい' );
		ok( check_thread_list( ret.thread_list ), 'スレッド一覧も正常っぽい' );
	} );
});

asyncTest( '不正な板IDを指定してちゃんと失敗することを確認する', function() {
	get_thread_list( 'あいうえお', function( ret ) {
		start();
		ok( ! ret.status, 'ちゃんと失敗している' );
	} );
} );

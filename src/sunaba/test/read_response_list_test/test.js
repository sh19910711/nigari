
var board_list = [];
var board_list_mapping = [];
var wait_flag = true; // 板一覧を読み込むまで実行を待たせる

(function() {
	get_board_list( function( ret ) {
		board_list = ret.board_list;
		mapping_id_to_index( board_list );
		wait_flag = false;
		run_test();
	} );
})();

function run_test() {
	test( 'スレッドURLのテスト', function() {
		equal( get_thread_url( 'news4vip', 'hogehoge.dat' ), 'http://hayabusa.2ch.net/news4vip/dat/hogehoge.dat' );
		equal( get_thread_url( 'あいうえお', 'hogehoge.dat' ), false, '存在しない板ID' );
	} );
	
	test( 'レスポンスの分解テスト', function() {
		function check_response_info( response_info ) {
			// TODO: もっと色々追加する
			if ( response_info.body == '' ) return false;
			return true;
		}
		ok( check_response_info( get_response_info( 'A<>B<>C<>D<>E' ) ) );
		ok( ! get_response_info( 'A<>B<>C<>DE' ) );
	} );
	
	asyncTest( '一番最新のスレッドからレス一覧を取得してみる', function() {
		function check_response_list( response_list ) {
			var n = response_list.length;
			for ( var i = 0; i < n; ++ i ) {
				// TODO: もっと色々追加する
				if ( response_list[i].body == '' ) return false;
			}
			return true;
		}
		
		get_thread_list( 'news4vip', function( ret ) {
			thread_list = ret.thread_list;
			ok( thread_list.length > 0, '使用できるスレッドが存在しない' );
			get_response_list( 'news4vip', thread_list[0].id, function( ret ) {
				console.log(ret);
				start();
				ok( ret.status, 'ちゃんと取得できたようだ！' );
				response_list = ret.response_list;
				ok( check_response_list( response_list ), '不正なレスポンスは存在しないようだ！' );
			} );
		} );
	} );
}
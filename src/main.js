
var board_list = [];
var board_list_mapping = [];
var wait_flag = true; // 板一覧を読み込むまで実行を待たせる
var current_board;
var thread_list = [];
var current_thread;
var response_list = [];

var board_list_top = 0;
var thread_list_top_lower = 24;
var thread_list_top = thread_list_top_lower;
var response_list_top_lower = 24;
var response_list_top = response_list_top_lower;
var mouse_wheel_delta = 128;

function add_loading( parent ) {
	var loading = '<div class="loading"><div class="dummy"></div></div>';
	parent.append(loading);
	var obj = $('.loading', parent);
	(function anim() {
		$(obj, '.dummy')
		.queue([])
		.css({dummy:0})
		.animate({
			dummy:360*4
		}, {
			duration: 4000,
			easing: 'easeOutBack',
			step: function(t) {
				obj.css({'-webkit-transform': 'rotate('+(t%360)+'deg)'});
			}
		});
	})();
}

$(window).load(function() {
	// イベントを設定する

	// 実行
	(function first_step() {
		$('#board_list').empty();
		add_loading($('#board_list'));
		get_board_list( function( ret ) {
			board_list = ret.board_list;
			mapping_id_to_index( board_list );
			wait_flag = false;
			step_2();
		});
	})();
	function step_2() {
		set_board_list( board_list );
	}
});

function set_board_list( board_list ) {
	var n = board_list.length;
	var lines = [];
	lines.push('<ul>');
	for ( var i = 0; i < n; ++ i ) {
		lines.push('<li data-board-index="'+i+'">'+board_list[i].title+'</li>');
	}
	lines.push('</ul>');
	$('#board_list').empty().append(lines.join(''));

	// イベントを設定する
	$('#board_list')
	.css({
		top: board_list_top+'px'
	})
	.unbind('mousewheel')
	.mousewheel(function( e, d ) {
		if ( board_list_top + d * mouse_wheel_delta <= 0 ) {
			board_list_top += d * mouse_wheel_delta;
		}
		$('#board_list > ul')
		.queue([])
		.animate({
			top: board_list_top+'px'
		}, {
			duration: 500,
			easing: 'easeOutCirc'
		});
	});
	$('#board_list li[data-board-index]').click( click_at_board_list );
}

function set_thread_list( thread_list ) {
	thread_list_top = thread_list_top_lower;
	$('#current_board').empty().append( current_board.title + ': <span class="url">' + current_board.url + '</span>' );
	var n = thread_list.length;
	var lines = [];
	lines.push('<ul>');
	for ( var i = 0; i < n; ++ i ) {
		lines.push( '<li data-thread-index="'+i+'">'+thread_list[i].title+'</li>' );
	}
	lines.push('</ul>');
	$('#thread_list').empty().append(lines.join(''));

	// イベントを設定する
	$('#thread_list > ul')
	.css({
		top: thread_list_top_lower+'px'
	});
	$('#thread_list')
	.unbind('mousewheel')
	.mousewheel(function( e, d ){
		if ( thread_list_top + d * mouse_wheel_delta <= thread_list_top_lower ) {
			thread_list_top += d * mouse_wheel_delta;
		}
		if ( thread_list_top > thread_list_top_lower ) thread_list_top = thread_list_top_lower;
		$('#thread_list > ul')
		.queue([])
		.animate({
			top: thread_list_top+'px'
		}, {
			duration: 500,
			easing: 'easeOutCirc'
		});
	});
	$('#thread_list li[data-thread-index]').click( click_at_thread_list );
}

function set_response_list( response_list ) {
	response_list_top = response_list_top_lower;
	$('#current_thread').empty().append( current_thread.title );
	var n = response_list.length;
	var lines = [];
	lines.push('<ul>');
	for ( var i = 0; i < n; ++ i ) {
		var response = response_list[i];
		var item = '<ul class="response">'
			+ '<li>'+(i+1)+': <span class="name"><b>'+response.name+'</b></span> ['+response.mail+']</li>'
			+ '<li class="info">'+response.info+'</li>'
			+ '<li>'+response.body+'</li>'
			+ '</ul>';
		lines.push('<li>'+item+'</li>');
	}
	lines.push('</ul>');
	$('#response_list').empty().append(lines.join(''));

	// イベントを設定する
	$('#response_list > ul')
	.css({
		top: response_list_top_lower + 'px'
	});
	$('#response_list')
	.unbind('mousewheel')
	.mousewheel(function( e, d ){
		if ( response_list_top + d * mouse_wheel_delta <= response_list_top_lower ) {
			response_list_top += d * mouse_wheel_delta;
		}
		$('#response_list > ul')
		.queue([])
		.animate({
			top: response_list_top+'px'
		}, {
			duration: 500,
			easing: 'easeOutCirc'
		});
	});
}

function click_at_board_list() {
	var ind_1 = $(this).data('board-index');
	var board = board_list[ind_1];
	current_board = board;
	$('#thread_list').empty();
	add_loading($('#thread_list'));
	get_thread_list( board.id, function( ret ) {
		thread_list = ret.thread_list;
		set_thread_list( ret.thread_list );
	} );
}

function click_at_thread_list() {
	var ind_1 = $(this).data('thread-index');
	var thread = thread_list[ind_1];
	current_thread = thread;
	$('#response_list').empty();
	add_loading($('#response_list'));
	get_response_list( current_board.id, current_thread.id, function( ret ) {
		response_list = ret.response_list;
		set_response_list( ret.response_list );
	} );
}


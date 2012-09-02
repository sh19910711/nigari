
var board_list = [];
var board_list_mapping = [];
var wait_flag = true; // 板一覧を読み込むまで実行を待たせる
var current_board;
var thread_list = [];
var current_thread;
var response_list = [];
var categories = [];
var app_info;

var board_list_top = 0;
var board_list_top_lower = 0;
var board_list_limit = 0;
var thread_list_top_lower = 24;
var thread_list_top = thread_list_top_lower;
var thread_list_limit = 0;
var response_list_top_lower = 24;
var response_list_top = response_list_top_lower;
var response_list_limit = 0;
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
			dummy:360*3
		}, {
			duration: 3000,
			easing: 'easeOutBack',
			step: function(t) {
				obj.css({'-webkit-transform': 'rotate('+(t%360)+'deg)'});
			}
		});
	})();
}

function get_categories( board_list ) {
	var res = [];
	var prev = '';
	board_list.forEach( function(item) {
		if ( item.category != prev ) {
			res.push( item.category );
			prev = item.category;
		}
	} );
	return res;
}

$(window).load(function() {
	// イベントを設定する

	$.getJSON( 'manifest.json', function( ret ) {
		app_info = ret;
		$('#app_version').text(app_info.version);
	} );

	$('body').off('mouseup');
	$('body').off('mousemove');

	// 板一覧を調整する奴
	(function() {
		var sx, sy;
		var dragging2 = false;
		$('#ajust_board_list').off('mousedown').on('mousedown', function(e) {
			sx = e.clientX;
			sy = e.clientY;
			dragging2 = true;
			return false;
		});
		$('body').on('mouseup', function(e) {
			dragging2 = false;
			return false;
		});
		$('body').on('mousemove', function(e) {
			var bar = $('#ajust_board_list');
			var mx = e.clientX;
			var my = e.clientY;
			if ( dragging2 ) {
				var dx = mx - sx;
				var dy = my - sy;
				var width = $('.small').width();
				width += dx;
				$('.small').width(width);
				$('.wide').css({marginLeft: width+'px'});
				var bar_x = parseInt(bar.css('left'));
				bar_x += dx;
				bar.css({left: bar_x});
			}
			sx = mx;
			sy = my;
		});
	})();

	// スレッド一覧を調整する奴
	(function() {
		var sx, sy;
		var dragging1 = false;
		$('#ajust_thread_list').off('mousedown').on('mousedown', function(e) {
			sx = e.clientX;
			sy = e.clientY;
			dragging1 = true;
			return false;
		});
		$('body').on('mouseup', function(e) {
			dragging1 = false;
			return false;
		});
		$('body').on('mousemove', function(e) {
			var obj = $('.wide').first();
			var bar = $('#ajust_thread_list');
			var mx = e.clientX;
			var my = e.clientY;
			if ( dragging1 ) {
				var dx = mx - sx;
				var dy = my - sy;
				var height = obj.height();
				height += dy;
				obj.height(height);
				obj.css({height: height+'px'});
				var bar_y = parseInt(bar.css('top'));
				bar_y += dy;
				bar.css({top: bar_y});
				var whole_height = $('#contents').height();
				var obj2 = $('.wide.second').first();
				obj2.css({top:height+'px'}).height( whole_height - height );
			}
			sx = mx;
			sy = my;
		});
	})();

	// そのほかの調整
	(function() {
		$(window).off('resize').on('resize', function() {
			var obj1 = $('.wide').first();
			var height = obj1.height();
			var whole_height = $('#contents').height();
			var obj2 = $('.wide.second').first();
			obj2.css({top:height+'px'}).height( whole_height - height );
		});

		var obj1 = $('.wide').first();
		var height = obj1.height();
		var whole_height = $('#contents').height();
		var obj2 = $('.wide.second').first();
		obj2.css({top:height+'px'}).height( whole_height - height );

		// 適当に更新情報を表示
		current_board = { title: 'Nigariの更新情報', url: '' };
		var dummy_thread_list = [
		                         { title: '2012/08/26: [Ver. 0.0.2] 見た目を調整しました。', url:'', id:false },
		                         { title: '2012/08/26: [Ver. 0.0.1] スレッドが閲覧できるようになりました。', url:'', id:false },
		                         { title: '2012/08/24: [Ver. 0.0.0] 開発を開始しました。', url:'', id:false }
		                         ];
		set_thread_list( dummy_thread_list );
	})();

	// 実行
	(function first_step() {
		$('#board_list').empty();
		add_loading($('#board_list'));
		get_board_list( function( ret ) {
			board_list = ret.board_list;
			categories = get_categories( board_list );
			mapping_id_to_index( board_list );
			board_list_limit = board_list.length * 32 + categories.length * 32 - 32;
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
	var category_board_list = [];
	for ( var i = 0; i < n; ++ i ) {
		if ( ! ( category_board_list[board_list[i].category] instanceof Array ) ) category_board_list[board_list[i].category] = [];
		category_board_list[board_list[i].category].push( {item:board_list[i], id:i} );
	}
	$('#board_list').empty();
	var html_text = '<ul class="whole"><li>';
	categories.forEach(function( category ) {
		var board_list = category_board_list[category];
		var lines = [];
		html_text += '<ul><li class="category">'+category+'</li><li class="category_board_list"><ul>';
		for ( var i = 0; i < board_list.length; ++ i ) {
			html_text += '<li class="board" data-board-index="'+board_list[i].id+'">'+board_list[i].item.title+'</li>';
		}
		html_text += '</ul></li></ul>';
	});
	html_text += '</li></ul>';
	$('#board_list').append(html_text);

	// イベントを設定する
	$('#board_list')
	.css({
		top: board_list_top+'px'
	})
	.unbind('mousewheel')
	.mousewheel(function( e, d ) {
		board_list_top += d * mouse_wheel_delta;	
		if ( board_list_top > board_list_top_lower ) {
			board_list_top = board_list_top_lower;
		}
		if ( board_list_top < -board_list_limit ) {
			board_list_top = -board_list_limit;
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
	$('#board_list li.category').click( function() {
		var obj = $(this).parent().children('li.category_board_list');
		var n = obj.find('.board').size(); // 閉じる個数
		if ( obj.hasClass('closed') ) {
			// 開く
			obj.removeClass('closed');
			console.log( ( n * 32 ) + 'px' );
			obj
			.queue([])
			.animate({
				height: ( n * 32 ) + 'px',
				opacity: 1
			}, {
				duration: 500,
				easing: 'easeOutQuint'
			});
			board_list_limit += n * 32;
		} else {
			// ぐいっと閉じる
			obj.addClass('closed');
			obj
			.queue([])
			.animate({
				height: 0,
				opacity: 0
			}, {
				duration: 500,
				easing: 'easeOutQuint'
			});
			board_list_limit -= n * 32;
		}
	} );
}

/**
 * スレッド一覧の設定
 * @param thread_list
 */
function set_thread_list( thread_list ) {
	thread_list_top = thread_list_top_lower;
	$('#current_board').empty().append( current_board.title + ': <span class="url">' + current_board.url + '</span>' );
	var n = thread_list.length;
	var lines = [];
	lines.push('<ul>');
	for ( var i = 0; i < n; ++ i ) {
		var attr = '';
		// TODO
		console.log(thread_list[i].id);
		if ( thread_list[i].id != false ) attr += ' data-thread-index="'+i+'"';
		lines.push( '<li'+attr+'>'+thread_list[i].title+'</li>' );
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
		thread_list_top += d * mouse_wheel_delta;
		if ( thread_list_top < -thread_list_limit ) thread_list_top = -thread_list_limit;
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
	lines.push('<ul class="responses">');
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
	response_list_limit = $('#response_list ul.responses').height();

	// イベントを設定する
	$('#response_list > ul')
	.css({
		top: response_list_top_lower + 'px'
	});
	$('#response_list')
	.unbind('mousewheel')
	.mousewheel(function( e, d ){
		response_list_top += d * mouse_wheel_delta;
		if ( response_list_top > response_list_top_lower  ) {
			response_list_top = response_list_top_lower;
		}
		if ( response_list_top < -response_list_limit ) {
			response_list_top = -response_list_limit;
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
		thread_list_limit = thread_list.length * 18 - 18*3;
	} );
}

function click_at_thread_list() {
	var ind_1 = $(this).data('thread-index');
	var thread = thread_list[ind_1];
	current_thread = thread;
	$('#response_list').empty();
	add_loading($('#response_list'));
	get_response_list( current_board.id, current_thread.id, function( ret ) {
		console.log( '@get_response_list result: ', ret );
		response_list = ret.response_list;
		set_response_list( ret.response_list );
	} );
}


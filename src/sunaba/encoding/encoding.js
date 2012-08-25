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
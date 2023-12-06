function qrBase64(text, options){
	if(typeof(options) == 'undefined'){
		options = {};
	}
	options = $.extend( {}, {
			width		: 256,
			height		: 256,
			typeNumber	: -1,
			correctLevel	: QRErrorCorrectLevel.H,
            background      : [255, 255, 255],
            foreground      : [0, 0, 0]
		}, options);
	
	var qrcode	= new QRCode(options.typeNumber, options.correctLevel);
	qrcode.addData(text);
	qrcode.make();
	
	palette = [options.background, options.foreground];
	
	// compute tileS percentage
	var tileW	= options.width / qrcode.getModuleCount();
	var tileH	= options.height / qrcode.getModuleCount();

	// create grid array
	var grid = [];
	
	// draw in the table
	for(var row = 0; row < qrcode.getModuleCount(); row++ ){
		for(var i = 0; i < tileH; i++){
			var rowArray = [];
			for(var col = 0; col < qrcode.getModuleCount(); col++ ){
				for(var j = 0; j < tileW; j++){
					rowArray.push(qrcode.isDark(row, col) ? 1 : 0);
				}
			}
			grid.push(rowArray);
		}
	}
	// return just built canvas
	
	return bmp_lib.imageSource(grid, palette);
}
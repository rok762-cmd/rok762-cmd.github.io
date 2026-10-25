document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(sheetCb&&$('#sheetForm'))sheetCb.cancel();else if($('.modal')){$('#layer').innerHTML='';render()}else if(tool){tool=null;pending=null;renderStage()}}});
render();

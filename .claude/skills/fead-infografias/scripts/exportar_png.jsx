#target illustrator
// Exporta cada mesa de trabajo del documento activo como PNG 2x en <carpeta del .ai>/png/. Solo si el usuario lo pide.
var doc=app.activeDocument,o=new ExportOptionsPNG24();o.artBoardClipping=true;o.horizontalScale=200;o.verticalScale=200;
var out=new Folder(doc.path+'/png');if(!out.exists)out.create();
for(var i=0;i<doc.artboards.length;i++){doc.artboards.setActiveArtboardIndex(i);
  doc.exportFile(new File(out+'/'+doc.artboards[i].name.replace(/ /g,'_')+'.png'),ExportType.PNG24,o);}
doc.artboards.setActiveArtboardIndex(0);'PNG '+doc.artboards.length+' -> '+out.fsName;

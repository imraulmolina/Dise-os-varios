#target illustrator
// Exporta cada mesa del documento activo como PNG al 50 % en %TEMP%/fead_revision/ para revisarlas (no toca la carpeta del usuario).
var doc=app.activeDocument,o=new ExportOptionsPNG24();o.artBoardClipping=true;o.horizontalScale=50;o.verticalScale=50;
var out=new Folder(Folder.temp+'/fead_revision');if(!out.exists)out.create();
for(var i=0;i<doc.artboards.length;i++){doc.artboards.setActiveArtboardIndex(i);
  doc.exportFile(new File(out+'/'+(i<9?'0':'')+(i+1)+'.png'),ExportType.PNG24,o);}
doc.artboards.setActiveArtboardIndex(0);out.fsName;

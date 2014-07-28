//jAnqular controller



jQuery(document).ready(function() 
{ 
	var scope = new Scope();
	scope.add("app", jQuery("#application") );
	scope.add("home" ,scope.app.data("home") );
	scope.add("apphome" , scope.app.data("apphome") );
	scope.add("componentroot" ,scope.app.data("home") );
	scope.add("collectionid", $("#collectiontoplevel").data("collectionid") );
	scope.add("catalogid" ,'emsite/catalog');
	
	jAngular.init(scope);
	var editor = new AnnotationEditor(scope);
	scope.add("annotationEditor",editor);
	
	editor.loadModels();
	editor.loadSelectors();
	editor.fabric.setBackgroundImage(editor.currentAnnotatedAsset.sourcepath)
	

	editor.connect();

});
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
	var editor = new AnnotationEditor(scope);
	scope.add("annotationEditor",editor);
	jAngular.addScope("annoscope",scope);
	
	editor.loadModels();
	editor.loadSelectors();

});
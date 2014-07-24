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

	var editor = new AnnotationEditor();
	editor.scope = scope;
	scope.add("annotationEditor",editor);	
	
	editor.loadModels();
	editor.loadSelectors();
	
	jAngular.init(scope);
	editor.connect();

});
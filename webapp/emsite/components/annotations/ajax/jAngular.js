// jAngular.js

var Scope = function() {
	var parentScope;
	var out = {
		add: function(name, model) {
			this[name] = model;
		},
		get: function(name) 
		{
			var command = name;
			if( !name.indexOf("if") == 0 )  //starts with
			{
				command = "this." + name;
			}
			var found = eval(command);
			if( parentScope != null && found == null )
			{
				return parentScope.get(name);
			}
			return found;
		},
		createScope: function()
		{
			var newscope = new Scope();
			newscope.parentScope  = this;
			return newscope
		}
		}
		return out;
	}


var Replacer = function() {
	var out = {
		replace : function( inCode, scope)
		{
			if( inCode == null)
			{
				return inCode;
			}
			var start = 0;
			while( (start = inCode.indexOf("{{",start)) != -1)
			{
				var end = inCode.indexOf("}}",start);			
				if( end == -1)
				{
					break;
				}
				
				var key = inCode.substring(start+2,end);
				var value = null;
				try
				{
					value = scope.get(key); //check for property
				} 
				catch ( err )
				{
					value = err.message;
				}	
				
				if( typeof value !== 'undefined')
				{
					//sub = replace(sub,inValues);  //recursive
					inCode = inCode.substring(0,start) + value + inCode.substring(end+2);
					start = start + key.length + 1;
				}				
				else
				{
					start = end; //could not find a hit, go to the next one
				}
			}
			return inCode;
		}	
	};
	return out;
};

var jAngular =  {};

jAngular.render = function(scope, div)
{ 
	var replacer = new Replacer();
	
	var selector = 'li[ng-repeat]';
	if( div )
	{
		selector = div + " " + selector;
	} 
	
	//Live query this?
	$( selector ).each(function( index ) 
	{
		var li = $(this);
		var vars = li.attr("ng-repeat");
		var split = vars.indexOf(" in ");
		
		var rowname = vars.substring(0,split);
		var loopname = vars.substring(split + 4,vars.length );
		
		var rows = scope.get(loopname);  //TODO: Find the name
		
		//set a local scope of asset = rows[i];
		var origContent = this.origContent;
		if( typeof( origContent ) === 'undefined' )
		{
			origContent = li.html();

			this.origContent =origContent; 
		}
		li.html("");
		if( rows )
		{
			$.each(rows, function(index, value) {
				//TODO: replace scope variables
				var localscope = scope.createScope();
				localscope.add(rowname,value);
				var evalcontent = replacer.replace(origContent,localscope);
				evalcontent = evalcontent.replace("ng-src","src");
				li.append(evalcontent);
				
	        });
	     }
		
	});
	// $.each($("body *")
	// 	.contents()
	// 	.filter(function(index, item)
	// 		{
	// 			return item.nodeType === 3 && $(item).text().indexOf("{{") != -1}), function(index, element)
	// 			{
	$.each($(".jq-replace"), function(index, element)
	{
			// possible fix to having to add class:
			// check in each filter function for .text() OR defined origContent with brackets

			element = $(element); // cast to jQuery object
			var origContent = this.origContent;
			if( typeof( origContent ) === 'undefined' )
			{
				origContent = element.text();
				this.origContent = origContent;
			}
			var text = origContent;
			var regex = /{{([^{]+)}}/g;
			var m;
			while ((m = regex.exec(text)) !== null)
			{
				text = text.replace(m[0], eval(m[1]));
			}
			element.text(text);

	});

};
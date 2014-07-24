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
				var variable = scope.get(key); //check for property
				
				if( typeof variable != 'undefined')
				{
					//sub = replace(sub,inValues);  //recursive
					inCode = inCode.substring(0,start) + variable + inCode.substring(end+2);
					start = start + variable.length + 1;
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

jAngular.init = function(scope)
{ 
	var replacer = new Replacer();
	
	//Live query this?
	$( 'li[ng-repeat]' ).each(function( index ) 
	{
		var li = $(this);
		var vars = li.attr("ng-repeat");
		var split = vars.indexOf(" in ");
		
		var rowname = vars.substring(0,split);
		var loopname = vars.substring(split + 4,vars.length );
		
		var rows = scope.get(loopname);  //TODO: Find the name
		
		//set a local scope of asset = rows[i];
		var content = li.html();
		li.html("");
		if( rows )
		{
			$.each(rows, function(index, value) {
				//TODO: replace scope variables
				var localscope = scope.createScope();
				localscope.add(rowname,value);
				var evalcontent = replacer.replace(content,localscope);
				evalcontent = evalcontent.replace("ng-src","src");
				li.append(evalcontent);
				
	        });
	     }
		
	});
};
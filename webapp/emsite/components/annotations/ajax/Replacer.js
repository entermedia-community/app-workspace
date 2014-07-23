var Replacer = (function() {
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
			var variable = scope.get(value); //check for property
			
			if( variable != null)
			{
				String sub = variable.toString();
				//sub = replace(sub,inValues);  //recursive
				inCode = inCode.substring(0,start) + sub + inCode.substring(end+1);
				start = start + sub.length();
			}
			else
			{
				start = end; //could not find a hit, go to the next one
			}
		}
		return inCode;
	}	
}
return out;
})();

replacer = Replacer;


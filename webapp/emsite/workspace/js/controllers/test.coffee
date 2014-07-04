main = (args...) ->
	someFunc = (func, arg) ->
		func arg

	someFunc (x) -> 
		x*x
	, arg

	func2 = (input, total) ->
		input = for i in [0..parseInt total]
			i
		input

	class someClass
		constructor: (word) ->
			@dummyprop = word

	do (path) ->
		# make something to return
		return {
			init: (path) ->
				dummyObj = {}
				{canvas: dummyObj}

		}

	repeat = (str, n) ->
		res = ''
		while n > 0
			res += str if n & 1
			n >>>= 1
			str += str
		res

	recursion = (obj = dick: {balls: 2}, ass: {hole: 1}, head: {face: 1}, hair: 'brown') ->
		for prop in obj
			if typeof obj[prop] is "object" then recursion obj[prop] else console.log obj[prop]
		null


	( (path)->
		() -> 'f'
	)()

	class useless
		constructor: () ->
			@unit = {}

	class christ
		constructor: (@unit={}) ->

	console.log '500'


	makeObj = (obj) ->
		f = ->
		f.prototype = obj
		new f()
	inherit = (subClass, superClass) ->
		superCopy = makeObj(subClass)
		superCopy.constructor = subClass
		subClass.prototype = superCopy
		{}

	objarray = [
		{
			name: 'head'
			face: true
			leghand: false
		},
		{
			name: 'arm'
			face: false
			leghand: false
		},
		{
			name: 'foot'
			face: false
			leghand: true
		}
	]


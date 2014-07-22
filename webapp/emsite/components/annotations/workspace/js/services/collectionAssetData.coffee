Workspace.factory 'collectionAssetData', () ->
	result = {}
	# get images from collection
	$.ajax {
		type: "GET"
		url: "#{apphome}/components/annotations/json/viewassets.json?id=#{collectionid}"
		# contentType: "application/json; charset=utf-8"
		# dataType: "json"
		async: false
		error: (data, status, err) ->
			console.log 'from error:', data
			em.unit
		,	
		success: (data) ->
			console.log 'from success:', data
			result.imageData = data
			em.unit
		,
		failure: (errMsg) ->
			alert errMsg
			em.unit
		}
	###
	# project:
	# 		id: 1
	# 		name: "Bad Project"
	# 	annotation:
	# 		id: 101
	# 		name: "Stupid art"
	# 		description: "This is my fifth child's bad art"
	# 		status: 'Done'
	# 		hasRecentActivity: true
	# 		createTime: '05/04/2014 14:33:56'
	# 		lastUpdateTime: '05/06/2014 06:30:23'
	# 		owner: 'Bob Dole'
	# 		path: 'img/ForMom.jpg'
	###
	result.assetData = []
	result.thumbs = (id: image.id, sourcepath: image.thumb for image in result.imageData)
	result.images = (id: image.id, sourcepath: image.sourcepath for image in result.imageData)
	result.assets = (image.id for image in result.imageData)
	result.collectionid = collectionid
	# for now, loop through assets and set up data model to match old spec
	for assetSpec in result.imageData
		result.assetData.push {
			project: 
				id: 1
				name: "None"
			annotation:
				id: assetSpec.id
				name: "None"
				description: "None"
				status: 'None'
				hasRecentActivity: 'none'
				createTime: '4 B.C.'
				lastUpdateTime: '2000 A.D.'
				owner: 'Enrico Fermi'
				sourcepath: assetSpec.sourcepath
				assetspec: assetSpec
		}

	result.getThumbSrc = (id) ->
		found = _.findWhere result.thumbs, id: id
		found.src
	result.getImageSrc = (id) ->
		found = _.findWhere result.images, id: id
		found.src
	result
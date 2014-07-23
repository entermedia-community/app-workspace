Workspace.controller 'ProjectDetailsCtrl', [
 '$scope', '$stateParams', 'collectionAssetData', 
 ($scope, $stateParams, collectionAssetData) ->
		$scope.currentAnnotation = _.find collectionAssetData.assetData, (item) ->
			item.project.id is parseInt $stateParams.projectID
		em.unit
]

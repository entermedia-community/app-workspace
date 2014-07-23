Workspace.controller 'ProjectDetailsCtrl', ['$rootScope', '$scope', '$stateParams', 'collectionAssetData', 
($rootScope, $scope, $stateParams, collectionAssetData) ->
		$rootScope.$broadcast 'navigatedTo', 'Projects'
		$scope.currentAnnotation = _.find collectionAssetData.assetData, (item) ->
			item.project.id is parseInt $stateParams.projectID
		em.unit
]

package org.entermedia.websocket.annotation;

import org.json.simple.JSONObject;

public interface AnnotationCommandListener
{

	void annotationAdded(AnnotationConnection annotationConnection, JSONObject json, String message, String catalogid, String inCollectionId, String inAssetId);
	void annotationModified(AnnotationConnection annotationConnection, JSONObject json, String message, String catalogid, String inCollectionId, String inAssetId);
	void loadAnnotatedAsset(AnnotationConnection annotationConnection, String catalogid, String inCollectionId, String inAssetId);

}

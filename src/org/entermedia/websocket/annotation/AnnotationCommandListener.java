package org.entermedia.websocket.annotation;

import org.json.simple.JSONObject;

public interface AnnotationCommandListener
{

	void annotationAdded(AnnotationConnection annotationConnection, JSONObject json, String message);

}

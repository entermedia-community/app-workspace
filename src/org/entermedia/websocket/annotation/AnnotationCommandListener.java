package org.entermedia.websocket.annotation;

import org.json.simple.JSONObject;

public interface AnnotationCommandListener
{

	void annotationSaved(AnnotationConnection annotationConnection, JSONObject json, String message);

}

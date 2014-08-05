package org.entermedia.websocket.annotation;

import groovy.json.JsonSlurper;

import java.io.IOException;
import java.io.StringReader;
import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.websocket.MessageHandler;
import javax.websocket.RemoteEndpoint;

import org.json.simple.JSONObject;
import org.openedit.data.SearcherManager;

import com.openedit.OpenEditException;

public class AnnotationConnection implements MessageHandler.Whole<String>
{

	private final RemoteEndpoint.Basic remoteEndpointBasic;
	protected SearcherManager fieldSearcherManager;
	protected String fieldCollectionId;
	protected String fieldCatalogId;
	protected HttpSession fieldSession;
	protected JsonSlurper fieldJSOSlurper;
	protected AnnotationCommandListener fieldAnnotationCommandListener;
	public AnnotationCommandListener getAnnotationCommandListener()
	{
		return fieldAnnotationCommandListener;
	}
	
	public JsonSlurper getJSOSlurper()
	{
		return fieldJSOSlurper;
	}

	public void setJSOSlurper(JsonSlurper fieldJSOSlurper)
	{
		this.fieldJSOSlurper = fieldJSOSlurper;
	}

	protected AnnotationConnection(SearcherManager searchers, String inCatalogId, String collectionid, HttpSession http, RemoteEndpoint.Basic remoteEndpointBasic, AnnotationCommandListener inListener )
	{
		this.remoteEndpointBasic = remoteEndpointBasic;
		fieldSearcherManager = searchers;
		fieldCatalogId = inCatalogId;
		fieldCollectionId = collectionid;
		fieldSession = http;
		fieldAnnotationCommandListener = inListener;
	}

	@Override
	public void onMessage(String message)
	{
//		if (remoteEndpointBasic != null)
//		{
//			return;
//		}
		try
		{
			Map<String, String> json = (Map<String, String>)getJSOSlurper().parse(new StringReader(message));
			String command = (String)json.get("command");
			if ("list".equals(command)) //Return all the annotation on this asset
			{
				JSONObject obj = new JSONObject();
				obj.put("stuff", "array of annotations");
				remoteEndpointBasic.sendText(obj.toJSONString());
			}
			else if ("annotation.added".equals(command)) //Return all the annotation on this asset
			{
				//see if ID is set
				JSONObject obj = new JSONObject();
				obj.putAll(json);
				//command.annotationdata
				//obj.put("stuff", "array of annotations");
				//remoteEndpointBasic.sendText(message);
				getAnnotationCommandListener().annotationAdded(this, json, message);
			}
		}
		catch (IOException e)
		{
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/*
	 * private static void broadcast(String msg) { for (ChatAnnotation client :
	 * connections) { try { synchronized (client) {
	 * client.session.getBasicRemote().sendText(msg); } } catch (IOException e)
	 * { log.debug("Chat Error: Failed to send message to client", e);
	 * connections.remove(client); try { client.session.close(); } catch
	 * (IOException e1) { // Ignore } String message = String.format("* %s %s",
	 * client.nickname, "has been disconnected."); broadcast(message); } }
	 */

	public void sendMessage(JSONObject json)
	{
		try
		{
			remoteEndpointBasic.sendText(json.toJSONString());
		}
		catch (IOException e)
		{
			throw new OpenEditException(e);
		}
	}
}

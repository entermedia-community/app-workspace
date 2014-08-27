package org.entermedia.websocket.annotation;

import groovy.json.JsonSlurper;

import java.io.IOException;
import java.io.StringReader;
import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.websocket.MessageHandler;
import javax.websocket.RemoteEndpoint;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.openedit.data.SearcherManager;
import org.openedit.entermedia.modules.AdminModule;

import com.openedit.OpenEditException;

public class AnnotationConnection implements MessageHandler.Partial<String>
{
	private static final Log log = LogFactory.getLog(AnnotationConnection.class);
	private final RemoteEndpoint.Basic remoteEndpointBasic;
	protected SearcherManager fieldSearcherManager;
	protected String fieldCollectionId;
	protected String fieldCatalogId;
	protected HttpSession fieldSession;
	protected JSONParser fieldJSONParser;
	protected AnnotationCommandListener fieldAnnotationCommandListener;
	
	protected StringBuffer fieldBufferedMessage;
	
	
	public AnnotationCommandListener getAnnotationCommandListener()
	{
		return fieldAnnotationCommandListener;
	}
	
	public JSONParser getJSONParser()
	{
		if (fieldJSONParser == null) {
			fieldJSONParser = new JSONParser();
		}
		return fieldJSONParser;
	}

	protected StringBuffer getBufferedMessage()
	{
		if (fieldBufferedMessage == null)
		{
			fieldBufferedMessage = new StringBuffer();
		}

		return fieldBufferedMessage;
	}
	
	public void setJSONParser(JSONParser fieldJSONParser)
	{
		this.fieldJSONParser = fieldJSONParser;
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
	public HttpSession getSession() {
		return fieldSession;
	}

	@Override
	public synchronized void onMessage(String inData, boolean completed)
	{		
		getBufferedMessage().append(inData);
		if(!completed)
		{
			return;
		}
		String message = getBufferedMessage().toString();
		fieldBufferedMessage = null;
		
//		if (remoteEndpointBasic != null)
//		{
//			return;
//		}
		try
		{
//			message = message.replaceAll("null", "\"null\"");
			JSONObject map = (JSONObject)getJSONParser().parse(new StringReader(message));
			String command = (String)map.get("command");
			String catalogid = (String)map.get("catalogid");
			String collectionid = (String)map.get("collectionid");
			String assetid = (String)map.get("assetid");
			
			if ("server.loadAnnotatedAsset".equals(command)) //Return all the annotation on this asset
			{
				getAnnotationCommandListener().loadAnnotatedAsset(this,catalogid, collectionid,assetid);
			}
			else if ("annotation.modified".equals(command))
			{
//				JSONObject obj = new JSONObject();
				getAnnotationCommandListener().annotationModified(this, map, message, catalogid, collectionid,assetid);
			}
			else if ("annotation.added".equals(command)) //Return all the annotation on this asset
			{
				//see if ID is set
//				JSONObject json = new JSONObject();
//				json.putAll(map);
				//command.annotationdata
				//obj.put("stuff", "array of annotations");
				//remoteEndpointBasic.sendText(message);
				getAnnotationCommandListener().annotationAdded(this, map, message, catalogid, collectionid,assetid);
			}
		}
		catch (Exception e)
		{
			// TODO Auto-generated catch block
			log.error(e);
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
			log.info("sent message");
		}
		catch (Exception e)
		{
			log.error(e);
//			throw new OpenEditException(e);
		}
	}
}

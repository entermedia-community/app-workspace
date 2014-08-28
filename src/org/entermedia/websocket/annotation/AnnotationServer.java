/*
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package org.entermedia.websocket.annotation;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.websocket.CloseReason;
import javax.websocket.Endpoint;
import javax.websocket.EndpointConfig;
import javax.websocket.RemoteEndpoint;
import javax.websocket.Session;

import org.entermedia.cache.CacheManager;
import org.json.simple.JSONObject;
import org.openedit.Data;
import org.openedit.data.SearcherManager;

import com.openedit.ModuleManager;

public class AnnotationServer extends Endpoint implements AnnotationCommandListener  {

	 private static final Set<AnnotationConnection> connections =
	            new CopyOnWriteArraySet<>();
	 
	 private static final String CACHENAME = "AnnotationServer";
	 
	 protected CacheManager fieldCacheManager;
	 protected ModuleManager fieldModuleManager;
	 protected SearcherManager fieldSearcherManager;
	 
	 public SearcherManager getSearcherManager()
	{
		if (fieldSearcherManager == null)
		{
			fieldSearcherManager =  (SearcherManager)getModuleManager().getBean("searcherManager");
		}
		return fieldSearcherManager;
	}
	public void setSearcherManager(SearcherManager inSearcherManager)
	{
		fieldSearcherManager = inSearcherManager;
	}
	public ModuleManager getModuleManager()
	{
		return fieldModuleManager;
	}
	public void setModuleManager(ModuleManager inModuleManager)
	{
		fieldModuleManager = inModuleManager;
	}
	public CacheManager getCacheManager()
	{
		if (fieldCacheManager == null)
		{
			fieldCacheManager = new CacheManager();
		}

		return fieldCacheManager;
	}
	public void setCacheManager(CacheManager inCacheManager)
	{
		fieldCacheManager = inCacheManager;
	}
	
	 @Override
	public void onError(Session session, Throwable throwable)
	{
		// TODO Auto-generated method stub
		super.onError(session, throwable);
	}
	 
	@Override
	public void onClose(Session session, CloseReason closeReason) {
		for (Iterator iterator = connections.iterator(); iterator.hasNext();)
		{
			AnnotationConnection annotationConnection2 = (AnnotationConnection) iterator.next();
			if (session == annotationConnection2.getSession())
			{
				connections.remove(annotationConnection2);
				break;
			}
		}
		super.onClose(session, closeReason);
	}
    @Override
    public void onOpen(Session session, EndpointConfig endpointConfig) 
    {
        RemoteEndpoint.Basic remoteEndpointBasic = session.getBasicRemote();
        
        javax.servlet.http.HttpSession http = (javax.servlet.http.HttpSession)session.getUserProperties().get("javax.servlet.http.HttpSession");
//        Enumeration<String> enuma = http.getAttributeNames();
//        while(enuma.hasMoreElements())
//        {
//            System.out.println(enuma.nextElement());
//        }
        
        String catalogid = session.getPathParameters().get("catalogid");
        String collectionid = session.getPathParameters().get("collectionid");
         
        if( getModuleManager() == null)
        {
	        ModuleManager manager  = (ModuleManager)http.getAttribute("moduleManager");
	        if( manager != null )
	        {
	        	setModuleManager(manager);
	        }
        }
        
        //ws://localhost:8080/entermedia/services/websocket/echoProgrammatic?catalogid=emsite/catalog&collectionid=102
        
        //TODO: Load from spring0
        AnnotationConnection connection = new AnnotationConnection(getSearcherManager(),catalogid, collectionid,http,remoteEndpointBasic, this);
        connections.add(connection);	
        session.addMessageHandler(connection);
      //  session.addMessageHandler(new EchoMessageHandlerBinary(remoteEndpointBasic));
    }
    public void annotationModified(AnnotationConnection annotationConnection, JSONObject command, String message, String catalogid, String inCollectionId, String inAssetId)
	{
    	//TODO: update our map
    	JSONObject obj = loadAnnotatedAsset(catalogid,inCollectionId,inAssetId);
		Collection annotations = (Collection)obj.get("annotations");
		JSONObject annotation = (JSONObject)command.get("annotationdata");
		String id = (String)annotation.get("id");
		for (Iterator iterator = annotations.iterator(); iterator.hasNext();)
		{
			JSONObject existing = (JSONObject) iterator.next();
			if( id.equals( existing.get("id") ) )
			{
				annotations.remove(existing);
				annotations.add(annotation);
				break;
			}
		}
    	//getCacheManager().put(CACHENAME, catalogid + inCollectionId + inAssetId, command.get("annotat"));
    	
		for (Iterator iterator = connections.iterator(); iterator.hasNext();)
		{
			AnnotationConnection annotationConnection2 = (AnnotationConnection) iterator.next();
			annotationConnection2.sendMessage(command);
		}
	}
    
	public void annotationAdded(AnnotationConnection annotationConnection, JSONObject command, String message, String catalogid, String inCollectionId, String inAssetId)
	{
		JSONObject obj = loadAnnotatedAsset(catalogid,inCollectionId,inAssetId);
		Collection annotations = (Collection)obj.get("annotations");
		
		JSONObject annotation = (JSONObject)command.get("annotationdata");
		annotations.add(annotation);
		
		for (Iterator iterator = connections.iterator(); iterator.hasNext();)
		{
			AnnotationConnection annotationConnection2 = (AnnotationConnection) iterator.next();
			annotationConnection2.sendMessage(command);
		}
	}
    
	public void loadAnnotatedAsset(AnnotationConnection annotationConnection, String catalogid, String inCollectionId, String inAssetId)
	{
		JSONObject newcommand = new JSONObject(); //Get this from our map of annotatedAssets
		newcommand.put("command", "asset.loaded");
		
		JSONObject asset = loadAnnotatedAsset(catalogid,inCollectionId, inAssetId);
		newcommand.put("annotatedAssetJson", asset);
		
		annotationConnection.sendMessage(newcommand);
	}
	protected JSONObject loadAnnotatedAsset(String inCatalogId, String inCollection, String inAssetId)
	{
    	JSONObject obj = (JSONObject)getCacheManager().get(CACHENAME, inCatalogId + inCollection + inAssetId);
		if( obj == null)
		{
			//Goto database and load it?
			obj = new JSONObject();
			JSONObject assetData = new JSONObject();
			assetData.put("id",inAssetId);
			Data asset = getSearcherManager().getData(inCatalogId, "asset", inAssetId);
			assetData.put("sourcepath",asset.getSourcePath()); 
			obj.put("assetData",assetData);
			obj.put("annotations", new ArrayList());
			obj.put("annotationIndex", new Integer(1));
			getCacheManager().put(CACHENAME, inCatalogId + inCollection + inAssetId, obj);
		}
		return obj;
	}
	


	
}    
//    private static class EchoMessageHandlerBinary
//            implements MessageHandler.Partial<ByteBuffer> {
//
//        private final RemoteEndpoint.Basic remoteEndpointBasic;
//
//        private EchoMessageHandlerBinary(RemoteEndpoint.Basic remoteEndpointBasic) {
//            this.remoteEndpointBasic = remoteEndpointBasic;
//        }
//
//        @Override
//        public void onMessage(ByteBuffer message, boolean last) {
//            try {
//                if (remoteEndpointBasic != null) {
//                    remoteEndpointBasic.sendBinary(message, last);
//                }
//            } catch (IOException e) {
//                // TODO Auto-generated catch block
//                e.printStackTrace();
//            }
//        }
//    }


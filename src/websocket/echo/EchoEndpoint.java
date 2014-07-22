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
package websocket.echo;

import groovy.json.JsonSlurper;

import java.io.IOException;
import java.io.StringReader;
import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.websocket.Endpoint;
import javax.websocket.EndpointConfig;
import javax.websocket.MessageHandler;
import javax.websocket.RemoteEndpoint;
import javax.websocket.Session;

import org.json.simple.JSONObject;
import org.openedit.data.SearcherManager;

import com.openedit.ModuleManager;

public class EchoEndpoint extends Endpoint {

    @Override
    public void onOpen(Session session, EndpointConfig endpointConfig) {
        RemoteEndpoint.Basic remoteEndpointBasic = session.getBasicRemote();
        
        javax.servlet.http.HttpSession http = (javax.servlet.http.HttpSession)session.getUserProperties().get("javax.servlet.http.HttpSession");
//        Enumeration<String> enuma = http.getAttributeNames();
//        while(enuma.hasMoreElements())
//        {
//            System.out.println(enuma.nextElement());
//        }
        
        String catalogid = session.getPathParameters().get("catalogid");
        String collectionid = session.getPathParameters().get("collectionid");
         
        ModuleManager manager  = (ModuleManager)http.getAttribute("moduleManager");
        
        SearcherManager searchers = (SearcherManager)manager.getBean("searcherManager");
        
        //ws://localhost:8080/entermedia/services/websocket/echoProgrammatic?catalogid=emsite/catalog&collectionid=102
        
        //TODO: Load from spring
        session.addMessageHandler(new AnnotationServer(searchers,catalogid, collectionid,http,remoteEndpointBasic) );
      //  session.addMessageHandler(new EchoMessageHandlerBinary(remoteEndpointBasic));
    }
    protected static class AnnotationServer
            implements MessageHandler.Partial<String> {

        private final RemoteEndpoint.Basic remoteEndpointBasic;
        protected SearcherManager fieldSearcherManager;
        protected String fieldCollectionId;
        protected String fieldCatalogId;
        protected HttpSession fieldSession;
        protected JsonSlurper fieldJSOSlurper;
        
        public JsonSlurper getJSOSlurper() {
        	if (fieldJSOSlurper == null) {
        		fieldJSOSlurper = new JsonSlurper();
        	}
			return fieldJSOSlurper;
		}

		public void setJSOSlurper(JsonSlurper fieldJSOSlurper) {
			this.fieldJSOSlurper = fieldJSOSlurper;
		}

		protected AnnotationServer( SearcherManager searchers, String inCatalogId, String collectionid, HttpSession http, RemoteEndpoint.Basic remoteEndpointBasic) 
        {
            this.remoteEndpointBasic = remoteEndpointBasic;
            fieldSearcherManager = searchers;
            fieldCatalogId = inCatalogId;
            fieldCollectionId = collectionid;
            fieldSession = http;
        }

        @Override
        public void onMessage(String message, boolean last) {
        	 if (remoteEndpointBasic == null) {
        		 return;
        	 }
            try 
            {
            	Map<String,String> json = (Map<String,String>)getJSOSlurper().parse(new StringReader(message));
            	String command = json.get("command");
            	if( "list".equals(command))  //Return all the annotation on this asset
            	{
            		JSONObject obj = new JSONObject();
            		obj.put("stuff","array of annotations");
                    remoteEndpointBasic.sendText(obj.toJSONString(), last);
            	}
            	else if( "save".equals(command))   //Return all the annotation on this asset
            	{
            		//see if ID is set
            		JSONObject obj = new JSONObject();
            		obj.put("stuff","array of annotations");
                    remoteEndpointBasic.sendText(obj.toJSONString(), last);
            	}
            	else
            	{
            		remoteEndpointBasic.sendText(message, last);
            	}
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
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
}

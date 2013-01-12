package io.sodabox.mod.server;

import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

public interface NodeManager<O> {

	public void refreshNode(JsonArray jsonArray);
	public void destoryNode();
	public void messageHandle(Message<JsonObject> message);
	public O getNode(String keyOrRefer);
	
	
}

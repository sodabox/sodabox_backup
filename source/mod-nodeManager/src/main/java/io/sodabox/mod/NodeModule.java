package io.sodabox.mod;

import io.sodabox.mod.server.NodeManager;
import io.sodabox.mod.server.RedisNodeManager;
import io.sodabox.mod.server.ServerNodeManager;
import io.sodabox.mod.server.node.RedisPoolNode;
import io.sodabox.mod.server.node.ServerNode;
import io.sodabox.mod.server.zk.ZooKeeperClient;
import io.sodabox.mod.server.zk.ZooKeeperClient.Credentials;
import io.sodabox.mod.server.zk.ZooKeeperConnectionException;
import io.sodabox.mod.server.zk.ZooKeeperUtils;

import java.util.List;

import org.apache.zookeeper.CreateMode;
import org.apache.zookeeper.KeeperException;
import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher;
import org.apache.zookeeper.ZooDefs;
import org.vertx.java.busmods.BusModBase;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;

public class NodeModule extends BusModBase implements Handler<Message<JsonObject>> {

	interface NODE {
		String ROOT_NODE 	= "/SODABOX/node";
	}

	private Logger log;

	private ZooKeeperClient zkClient;
	private String address;
	private boolean isReady;

	private NodeManager<ServerNode> 	serverNodeManager;
	private NodeManager<RedisPoolNode> 	redisNodeManager;


	public void start() {

		super.start();

		log = container.getLogger();
		address = getMandatoryStringConfig("address");
		
		JsonArray 	zookeeperServers 	= getOptionalArrayConfig("zookeeper", null);
		int 		zookeeperTomeout 	= getOptionalIntConfig("zookeeper.timeout", ZooKeeperUtils.DEFAULT_ZK_SESSION_TIMEOUT);
		String 		mode 				= getOptionalStringConfig("mode", "WEB-SERVER");

		try {
			
			zkClient = new ZooKeeperClient(zookeeperTomeout, Credentials.NONE, zookeeperServers);

		} catch (ZooKeeperConnectionException e) {
			ERROR("zookeeper is not existed [%s]", zookeeperServers.encode());
			e.printStackTrace();
		}

		if(mode.equals("WEB-SERVER")){

			if(log.isDebugEnabled()){
				serverNodeManager 		= new ServerNodeManager(log);
			}else{
				serverNodeManager 		= new ServerNodeManager();
			}

			if(log.isDebugEnabled()){
				redisNodeManager = new RedisNodeManager(log);
			}else{
				redisNodeManager = new RedisNodeManager();
			}

			// watching !!!
			try {
				
				ZooKeeperUtils.ensurePath(zkClient, ZooDefs.Ids.OPEN_ACL_UNSAFE, NODE.ROOT_NODE);
				
				List<String> channels = zkClient.get().getChildren(NODE.ROOT_NODE, new Watcher() {
					public void process(WatchedEvent event) {
						try {
							List<String> channels = zkClient.get().getChildren(NODE.ROOT_NODE, this);
							DEBUG("** WATCHED ** %s %s", NODE.ROOT_NODE, channels);
							refreshNode(channels);
						} catch (Exception e) {
							throw new RuntimeException(e);
						}
					}
				});

				if(channels.size() > 0){

					isReady = true;
					refreshNode(channels);
					
				}else{
					
					ERROR("message server is not existed from [%s]..", NODE.ROOT_NODE);
					
				}
				
			} catch (KeeperException | InterruptedException
					| ZooKeeperConnectionException e) {
				e.printStackTrace();
				ERROR("%s", e.getMessage());
			}

		}else{

			// SockServer : 노드만 생성한다. 
			JsonObject 	nodes 	= getOptionalObjectConfig("nodes", null);
			String 		channel = getMandatoryStringConfig("channel");
			try {
				initNode(channel, nodes);
			} catch (ZooKeeperConnectionException | InterruptedException
					| KeeperException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		}
		
		eb.registerHandler(address, this);
	}

	protected void DEBUG(String message, Object... args ){
		if(log != null) log.debug("[MOD::NODE] "+String.format(message, args));
	}
	protected void ERROR(String message, Object... args ){
		if(log != null) log.error("[MOD::NODE] "+String.format(message, args));
	}


	@Override
	public void stop() {
		try {
			super.stop();
			if(serverNodeManager != null) 	serverNodeManager.destoryNode();
			if(redisNodeManager != null) 	redisNodeManager.destoryNode();
		} catch (Exception e) {
		}
	}

	private void initNode(final String channel, final JsonObject data) throws ZooKeeperConnectionException, InterruptedException, KeeperException{

		ZooKeeperUtils.ensurePath(zkClient, ZooDefs.Ids.OPEN_ACL_UNSAFE, NODE.ROOT_NODE);

		if (zkClient.get().exists(NODE.ROOT_NODE+"/"+channel, false) == null) {
			
			DEBUG("create node [%s]", data.encode());
			
			zkClient.get().create(
					NODE.ROOT_NODE+"/"+channel, 
					data.encode().getBytes(), 
					ZooDefs.Ids.OPEN_ACL_UNSAFE, 
					CreateMode.EPHEMERAL);
		}

	}

	private void refreshNode(List<String> channels) throws KeeperException, InterruptedException, ZooKeeperConnectionException{

		if(channels.size() > 0){

			JsonArray servers = new JsonArray();
			JsonArray redises = new JsonArray();

			for(String channel : channels){

				JsonObject nodes = new JsonObject(
						new String(zkClient.get().getData(NODE.ROOT_NODE + "/"+channel, false, null))
						);

				servers.addObject(nodes.getObject("server").putString("channel", channel));
				redises.addObject(nodes.getObject("redis").putString("channel", channel));

			}

			serverNodeManager.refreshNode(servers);
			redisNodeManager.refreshNode(redises);

			isReady = true;
			
		}else{
			
			isReady = false;
			
			ERROR("message server is not existed from [%s]", NODE.ROOT_NODE);
			serverNodeManager.destoryNode();
			redisNodeManager.destoryNode();
			
		}

	}

	@Override
	public void handle(Message<JsonObject> message) {
		String action = message.body.getString("action");
		
		if(isReady){
			
			if(action.startsWith("server")){
				serverNodeManager.messageHandle(message);
			}else if(action.startsWith("message")){
				redisNodeManager.messageHandle(message);
			}
			
		}else{
			sendError(message, "message server is not existed");
		}
		
	}

}

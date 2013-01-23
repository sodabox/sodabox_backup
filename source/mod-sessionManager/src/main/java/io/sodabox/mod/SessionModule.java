package io.sodabox.mod;

import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.vertx.java.busmods.BusModBase;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

public class SessionModule extends BusModBase implements Handler<Message<JsonObject>> {

	interface NODE {
		String ROOT_NODE 	= "/SODABOX/node";
	}
	interface NODE_MANAGER {
		String ADDRESS 	= "mod-nodeManager";

		interface ACTION{
			String GET_NODE 			= "server:node"; // refer, callback
			String GET_NODE_BY_CHANNEL 	= "server:nodeByChannel";
		}
	}

	private Logger log;
	private String address;
	private boolean isReady;
	private JedisPool redisPool;

	public void start() {

		super.start();

		log = container.getLogger();
		address = getMandatoryStringConfig("address");

		JsonObject 	sessionConf = getOptionalObjectConfig("sessionStorage", null);
		if(sessionConf != null){

			JedisPoolConfig config = new JedisPoolConfig();
			config.testOnBorrow = true;

			JedisPool jedisPool;
			if( StringUtils.isEmpty(sessionConf.getString("host")) ){
				jedisPool = new JedisPool(config, "localhost");
			}else{
				jedisPool = new JedisPool(config, 
						sessionConf.getString("host"), 
						sessionConf.getInteger("port").intValue());
			}

			this.redisPool = jedisPool;

			isReady = true;
		}else{
			isReady = false;
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
			this.redisPool.destroy();
		} catch (Exception e) {
		}
	}

	@Override
	public void handle(final Message<JsonObject> message) {
		String action = message.body.getString("action");

		if(isReady){

			if("session:in".equals(action)){

				String refer = message.body.getString("refer");

				String[] refers = getHostUrl(refer);

				Jedis jedis = this.redisPool.getResource();
				String channel = jedis.hget(refers[0], refers[1]);
				this.redisPool.returnResource(jedis);

				if(channel == null){
					JsonObject reqJson = new JsonObject();
					reqJson.putString("action"	, NODE_MANAGER.ACTION.GET_NODE);
					reqJson.putString("refer"	, refer);
					reqJson.putString("key"		, refers[0]);
					reqJson.putString("field"	, refers[1]);

					eb.send(NODE_MANAGER.ADDRESS, reqJson, new Handler<Message<JsonObject>>() {
						public void handle(Message<JsonObject> message1) {

							Jedis jedis = redisPool.getResource();
							jedis.hsetnx(
									message1.body.getString("key"), 
									message1.body.getString("field"),
									message1.body.getString("channel")
									);
							redisPool.returnResource(jedis);

							sendOK(message, message1.body);
						}
					});
					
				}else{ // 이미 접속한 세션이 있다면,
					
					JsonObject reqJson = new JsonObject();
					reqJson.putString("action"	, NODE_MANAGER.ACTION.GET_NODE_BY_CHANNEL);
					reqJson.putString("channel"	, channel);
					reqJson.putString("refer"	, refer);
					reqJson.putString("key"		, refers[0]);
					reqJson.putString("field"	, refers[1]);

					
					eb.send(NODE_MANAGER.ADDRESS, reqJson, new Handler<Message<JsonObject>>() {
						
						public void handle(Message<JsonObject> message1) {
							
							// 체널이 존재 하지 않는다면?
							if("error".equals(message1.body.getString("status"))){
								
								// 지우고 다시 생성 
								Jedis jedis = redisPool.getResource();
								jedis.hdel(message1.body.getString("key"), message1.body.getString("field"));
								redisPool.returnResource(jedis);
								

								JsonObject reqJson = new JsonObject();
								reqJson.putString("action"	, NODE_MANAGER.ACTION.GET_NODE);
								reqJson.putString("refer"	, message1.body.getString("refer"));
								reqJson.putString("key"		, message1.body.getString("key"));
								reqJson.putString("field"	, message1.body.getString("field"));
								
								eb.send(NODE_MANAGER.ADDRESS, reqJson, new Handler<Message<JsonObject>>() {
									
									public void handle(Message<JsonObject> message2) {

										Jedis jedis = redisPool.getResource();
										jedis.hsetnx(
												message2.body.getString("key"), 
												message2.body.getString("field"),
												message2.body.getString("channel")
												);
										redisPool.returnResource(jedis);

										sendOK(message, message2.body);
									}
								});
								
							}else{
								sendOK(message, message1.body);
							}
						}
					});

				}
				
			}else if("session:del".equals(action)){
				
				String refer = message.body.getString("refer");

				String[] refers = getHostUrl(refer);

				Jedis jedis = this.redisPool.getResource();
				jedis.hdel(refers[0], refers[1]);
				this.redisPool.returnResource(jedis);
				
				sendOK(message);
				
			}else if("session:list".equals(action)){
				
				String refer = message.body.getString("refer");

				String[] refers = getHostUrl(refer);

				Jedis jedis = this.redisPool.getResource();
				Map<String, String> list = jedis.hgetAll(refers[0]);
				this.redisPool.returnResource(jedis);
				
				for (Map.Entry<String, String> entry: list.entrySet()) {
					
					JsonObject obj = new JsonObject();
					obj.putString("path", entry.getKey());
					obj.putString("path", entry.getValue());
				}
				
				sendOK(message);

			}

		}else{
			sendError(message, "session storage is not existed");
		}

	}

	private String[] getHostUrl(String str){

		String[] rtn = new String[2];

		if(str.indexOf("https://") >= 0){
			if(str.substring(8).indexOf("/") >= 0){
				int s =  8+str.substring(8).indexOf("/");
				rtn[0] = str.substring(0, s);
				rtn[1] = str.substring(s);
			}else{
				rtn[0] =  str;
				rtn[1] = "/";
			}
		} else if(str.indexOf("http://") >= 0){
			if(str.substring(7).indexOf("/") >= 0){
				int s =  7+str.substring(7).indexOf("/");
				rtn[0] = str.substring(0, s);
				rtn[1] = str.substring(s);
			}else{
				rtn[0] = str;
				rtn[1] = "/";
			}
		} else {
			if(str.indexOf("/") >= 0){
				rtn[0] = str.substring(0, str.indexOf("/"));
				rtn[1] = str.substring(str.indexOf("/"));
			}else{
				rtn[0] = str;
				rtn[1] = "/";
			}
		}

		return rtn;

	}

}

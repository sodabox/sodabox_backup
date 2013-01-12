import org.apache.commons.lang.StringUtils;
import org.vertx.java.core.json.JsonObject;

import redis.clients.jedis.Jedis;


public class TestJdedis {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		
		Jedis jedis;
		
		//{"host":"127.0.0.1","port":9901,"channel":"CH001"}
		JsonObject jsonObject = new JsonObject();
		jsonObject.putString("channel", "CH001");
		jsonObject.putString("host", "127.0.0.1");
		jsonObject.putNumber("port", 9901);
		
		if( StringUtils.isEmpty(jsonObject.getString("host")) ){
			jedis = new Jedis("localhost");
		}else{
			jedis = new Jedis( 
					jsonObject.getString("host"), 
					jsonObject.getInteger("port").intValue());
		}
		//jedis.set("foo", "bar");
		//jedis.connect();
		System.out.println(jedis.ping());
	}

}

package io.sodabox.mod.subscribe;

import org.vertx.java.busmods.BusModBase;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;

public class SubscribeModule extends BusModBase {

	private String 	address;
	private String 	host;
	private int 	port;
	private String 	channel;
	private String	replyAddress;

	private Logger log;

	public void start() {
		super.start();

		log = container.getLogger();

		address 	= getMandatoryStringConfig("address");
		host 		= getMandatoryStringConfig("host");
		port 		= getMandatoryIntConfig("port");
		channel 	= getMandatoryStringConfig("channel");
		replyAddress= getMandatoryStringConfig("reply-address");

		// run thread!!
		new Thread(new SubscribeThread(log, eb, host, port, channel, replyAddress)).start();

		eb.registerHandler(address, new Handler<Message<JsonObject>>() {
			public void handle(Message<JsonObject> message) {
				
				// @ TODO 뭘 할까요?

			}
		});
		
		JsonObject replyObj = getOptionalObjectConfig("reply", null);
		
	}



}
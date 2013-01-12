package io.sodabox.mod;

public class Action {

	public static final String PREFIX_SERVER 	= "server:";
	public static final class SERVER {

		public static final String SERVER_NODE 	= "server:node";
		public static final String OK 			= "server:Ok";

	}

	public static final String PREFIX_SESSION 	= "session:";
	public static final String PREFIX_MESSAGE 	= "message:";
	
	public static final class REDIS {

		public static final String GET 		= "session:get";
		public static final String SET 		= "session:set";
		public static final String HSET 	= "session:hset";
		public static final String HGET 	= "session:hget";
		public static final String HKEYS 	= "session:hkeys";

		public static final String PUB 	= "message:publish";
		public static final String SUB 	= "message:subscribe";

		public static final String OK 		= "redis:Ok";

	}
	
	public static final class REPLY {

		public static final String MESSAGE 		= "reply:message";
	}
}

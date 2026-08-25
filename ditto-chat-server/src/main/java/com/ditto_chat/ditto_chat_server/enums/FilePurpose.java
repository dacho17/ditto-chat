package com.ditto_chat.ditto_chat_server.enums;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public enum FilePurpose {
    ACCOUNT_IMAGE ((short) 1),
    MESSAGE_ATTACHMENT ((short) 2);

	private short value;
	private static final Map<Short, FilePurpose> lookupMap
		= new HashMap<Short, FilePurpose>();

	static {
		for(FilePurpose anEnum: EnumSet.allOf(FilePurpose.class))
			lookupMap.put(anEnum.getValue(), anEnum);
	}
	
	private FilePurpose(final short value) {
		this.value = value;
	}

	public short getValue() {
		return value;
	}

	public static FilePurpose getFilePurpose(Short val) {
		return lookupMap.get(val);
	}
}

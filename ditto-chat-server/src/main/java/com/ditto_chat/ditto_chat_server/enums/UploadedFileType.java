package com.ditto_chat.ditto_chat_server.enums;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public enum UploadedFileType {
    PNG ((short) 1),
    JPEG ((short) 2),
    TXT ((short) 3),
    PDF ((short) 4);

	private short value;
	private static final Map<Short, UploadedFileType> lookupMap
		= new HashMap<Short, UploadedFileType>();
	private static final Set<UploadedFileType> uploadedFileImageEnumSet
		= new HashSet<UploadedFileType>(List.of(PNG, JPEG));
	private static final Set<UploadedFileType> uploadedFileMessageAttachmentEnumSet
		= new HashSet<UploadedFileType>(List.of(PNG, JPEG, PDF, TXT));

	static {
		for(UploadedFileType anEnum: EnumSet.allOf(UploadedFileType.class))
			lookupMap.put(anEnum.getValue(), anEnum);
	}
	
	private UploadedFileType(final short value) {
		this.value = value;
	}

	public short getValue() {
		return value;
	}

	public static UploadedFileType getUploadedFileType(Short val) {
		return lookupMap.get(val);
	}

	public static boolean isUploadedFileTypeAnImage(UploadedFileType uploadedFileType) {
		return uploadedFileImageEnumSet.contains(uploadedFileType);
	}

	public static boolean isUploadedFileTypeBeAMessageAttachment(UploadedFileType uploadedFileType) {
		return uploadedFileMessageAttachmentEnumSet.contains(uploadedFileType);
	}
}

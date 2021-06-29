package com.subex.partnermanagement.helper;

public class InfoDataMapper {
	
	private Long dfnId;
	private Long infId;
	public Long getDfnId() {
		return dfnId;
	}
	public void setDfnId(Long dfnId) {
		this.dfnId = dfnId;
	}
	public Long getInfId() {
		return infId;
	}
	public InfoDataMapper(Long dfnId, Long infId) {
		super();
		this.dfnId = dfnId;
		this.infId = infId;
	}
	public void setInfId(Long infId) {
		this.infId = infId;
	}
	

}

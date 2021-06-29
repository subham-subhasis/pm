package com.subex.partnermanagement.helper;

public class PSAccountResponse {
private String status;
private String message;
private String paccAcctRefNo;
private String paccId;
public String[] getMessages() {
	return messages;
}
public void setMessages(String[] messages) {
	this.messages = messages;
}
private String paccName;
private String[] messages;
public String getStatus() {
	return status;
}
public void setStatus(String status) {
	this.status = status;
}
public String getMessage() {
	return message;
}
public void setMessage(String message) {
	this.message = message;
}
public String getPaccAcctRefNo() {
	return paccAcctRefNo;
}
public void setPaccAcctRefNo(String paccAcctRefNo) {
	this.paccAcctRefNo = paccAcctRefNo;
}
public String getPaccId() {
	return paccId;
}
public void setPaccId(String paccId) {
	this.paccId = paccId;
}
public String getPaccName() {
	return paccName;
}
public void setPaccName(String paccName) {
	this.paccName = paccName;
}

}

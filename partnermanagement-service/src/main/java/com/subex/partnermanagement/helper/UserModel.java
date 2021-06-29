package com.subex.partnermanagement.helper;

import javax.xml.bind.JAXBElement;

public class UserModel {

	private JAXBElement<String> usrName;
	private JAXBElement<String> usrPassword;
	private JAXBElement<String> usrForename;	
	private JAXBElement<String> usrSurname;
	private JAXBElement<String> usrEmailAddress;
	private String partition;
	
	public String getPartition() {
		return partition;
	}
	public void setPartition(String partition) {
		this.partition = partition;
	}
	public JAXBElement<String> getUsrName() {
		return usrName;
	}
	public void setUsrName(JAXBElement<String> usrName) {
		this.usrName = usrName;
	}
	public JAXBElement<String> getUsrPassword() {
		return usrPassword;
	}
	public void setUsrPassword(JAXBElement<String> usrPassword) {
		this.usrPassword = usrPassword;
	}
	public JAXBElement<String> getUsrForename() {
		return usrForename;
	}
	public void setUsrForename(JAXBElement<String> usrForename) {
		this.usrForename = usrForename;
	}
	public JAXBElement<String> getUsrSurname() {
		return usrSurname;
	}
	public void setUsrSurname(JAXBElement<String> usrSurname) {
		this.usrSurname = usrSurname;
	}
	public JAXBElement<String> getUsrEmailAddress() {
		return usrEmailAddress;
	}
	public void setUsrEmailAddress(JAXBElement<String> usrEmailAddress) {
		this.usrEmailAddress = usrEmailAddress;
	}
	
	
	
}

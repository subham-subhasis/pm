package com.subex.partnermanagement.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table( name = "check_list" )
public class CheckListEntity {
	
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "checklist_generator")
@SequenceGenerator(name="checklist_generator", sequenceName = "checklist_seq", allocationSize=1)
@Column(name = "id")	
private Long id;

@Column(name = "partnerId")
private Integer partnerId;

@Column(name = "teamName")
private String teamName;

@Column(name = "toDos")
private String toDos;

@Column(name = "checkFlag")
private Boolean checkFlag;

public Boolean getCheckFlag() {
	return checkFlag;
}
public void setCheckFlag(Boolean checkFlag) {
	this.checkFlag = checkFlag;
}
public Long getId() {
	return id;
}
public void setId(Long id) {
	this.id = id;
}
public Integer getPartnerId() {
	return partnerId;
}
public void setPartnerId(Integer partnerId) {
	this.partnerId = partnerId;
}
public String getTeamName() {
	return teamName;
}
public void setTeamName(String teamName) {
	this.teamName = teamName;
}
public String getToDos() {
	return toDos;
}
public void setToDos(String toDos) {
	this.toDos = toDos;
}

}

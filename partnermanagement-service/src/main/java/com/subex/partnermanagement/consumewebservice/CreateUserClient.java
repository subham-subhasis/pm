package com.subex.partnermanagement.consumewebservice;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.JAXBElement;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.ws.client.core.support.WebServiceGatewaySupport;
import org.springframework.ws.soap.client.core.SoapActionCallback;

import com.subex.partnermanagement.exception.NoUserExistException;
import com.subex.partnermanagement.helper.UserModel;
import com.subex.wsdl.ComboBoxData;
import com.subex.wsdl.CreateUser;
import com.subex.wsdl.CreateUserResponse;
import com.subex.wsdl.GridData;
import com.subex.wsdl.ObjectFactory;
import com.subex.wsdl.WebServiceParameter;

@Component
public class CreateUserClient extends WebServiceGatewaySupport {
	private static final Logger LOGGER = LoggerFactory.getLogger(CreateUserClient.class);
	@Value("${ROCSOAPURLUserManagement}")
	private String ROCSOAPURLUserManagement;
		
	
	public CreateUserResponse createUser(JAXBElement<String> user,UserModel userModel, String rolePartition) {
			
	    
		String url = ROCSOAPURLUserManagement+"createUser";

		ObjectFactory objFact = new ObjectFactory();
		CreateUser request = new CreateUser();
		request.setLoggedInUserName(user);		

		List<WebServiceParameter> parameterList= new ArrayList<WebServiceParameter>();		
		

		WebServiceParameter usrName = new WebServiceParameter();
		usrName.setId(objFact.createWebServiceParameterId("usrName"));
		usrName.setValue(userModel.getUsrName());
		parameterList.add(usrName);
		
		WebServiceParameter usrForename = new WebServiceParameter();
		usrForename.setId(objFact.createWebServiceParameterId("usrForename"));
		usrForename.setValue(userModel.getUsrForename());
		parameterList.add(usrForename);
		
		WebServiceParameter usrSurname = new WebServiceParameter();
		usrSurname.setId(objFact.createWebServiceParameterId("usrSurname"));
		usrSurname.setValue(userModel.getUsrSurname());
		parameterList.add(usrSurname);
		
		WebServiceParameter usrEmailAddress = new WebServiceParameter();
		usrEmailAddress.setId(objFact.createWebServiceParameterId("usrEmailAddress"));
		usrEmailAddress.setValue(userModel.getUsrEmailAddress());
		parameterList.add(usrEmailAddress);
		
		WebServiceParameter usrPassword = new WebServiceParameter();
		usrPassword.setId(objFact.createWebServiceParameterId("usrPassword"));
		usrPassword.setValue(userModel.getUsrPassword());
		parameterList.add(usrPassword);
		
		//Partiton 
		ComboBoxData partitionData = new ComboBoxData();
		partitionData.setId(objFact.createComboBoxDataId("PartitionCombo"));
		partitionData.setSelectedValue(objFact.createComboBoxDataSelectedValue(userModel.getPartition()));	
		WebServiceParameter partitionCombo = new WebServiceParameter();
		partitionCombo.setComboData(objFact.createWebServiceParameterComboData(partitionData));	
		parameterList.add(partitionCombo);
		
		//Aplplication grid values
		GridData applicationdata = new GridData();
		applicationdata.setId(objFact.createGridDataId("ApplicationGrid"));
		applicationdata.getRows().add("ROC Partner Portal;true;null");				
		WebServiceParameter applicationGrid = new WebServiceParameter();
		applicationGrid.setGridData(objFact.createWebServiceParameterGridData(applicationdata));
		parameterList.add(applicationGrid);
		
		// RolePartitionGrid data 
		GridData rolePartitionData = new GridData();
		rolePartitionData.setId(objFact.createGridDataId("RolePartitionGrid"));
		rolePartitionData.getRows().add(rolePartition+";"+userModel.getPartition()+":true");			
		WebServiceParameter rolePartitionGrid = new WebServiceParameter();
		rolePartitionGrid.setGridData(objFact.createWebServiceParameterGridData(rolePartitionData));
		parameterList.add(rolePartitionGrid);
				
		//Set WebServiceParameter parameter list
		request.getData().addAll(parameterList);		
		
		CreateUserResponse  createUserResponse =(CreateUserResponse) getWebServiceTemplate().marshalSendAndReceive(url,request,new SoapActionCallback("http://tempuri.org/onboarding-service/createUser"));
		if(createUserResponse.getReturn().getValue() != null)
		{
			 LOGGER.error("User Creation Failed in ROC !!!"+createUserResponse.getReturn().getValue());
			 throw new NoUserExistException("User Creation Failed in ROC !!!");
		}
		return  createUserResponse;
	}
		
}

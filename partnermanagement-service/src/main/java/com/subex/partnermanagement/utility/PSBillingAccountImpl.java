package com.subex.partnermanagement.utility;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.google.gson.Gson;
import com.subex.partnermanagement.exception.NoUserExistException;
import com.subex.partnermanagement.helper.PSAccountResponse;
import com.subex.partnermanagement.helper.PSLoginResponse;
import com.subex.partnermanagement.helper.UserAccountMapModel;
import com.subex.partnermanagement.model.InfoData;
import com.subex.partnermanagement.model.RocPsAccountApiModelPost;


@Component("psbilling")
public class PSBillingAccountImpl implements BillingAccount{
	private static final Logger log = LoggerFactory.getLogger(PSBillingAccountImpl.class);
	
	@Autowired
	PSBillingAccountUtilty  psBillingAccountUtilty;
	
	 String psAccountCreationApiUrl;		
	 String psLoginUrl;	
	 String psServiceKey;
	 String userAccountMapUrl;
	
	public PSBillingAccountImpl(@Value("${psAccountCreationApiUrl}") String psAccountCreationApiUrl,@Value("${psLoginUrl}") String psLoginUrl
			,@Value("${psServiceKey}") String psServiceKey ,@Value("${userAccountMapUrl}") String userAccountMapUrl) {
		
		this.psAccountCreationApiUrl = psAccountCreationApiUrl;
		this.psLoginUrl= psLoginUrl;
		this.psServiceKey= psServiceKey;
		this.userAccountMapUrl=userAccountMapUrl;
	}

	RestTemplate restTemplate = new RestTemplate();	
	public void createAccount(Map<String, InfoData> defNameMap,String userName,String companyName)
	{	
		HttpHeaders loginHeader = new HttpHeaders();
		loginHeader.setContentType(MediaType.APPLICATION_JSON); 
		loginHeader.set("PSSERVICEKEY", psServiceKey);      
		HttpEntity<?> request = new HttpEntity<>(loginHeader);
		PSLoginResponse loginResponse= null;
		try {
		loginResponse = restTemplate.postForObject(psLoginUrl, request, PSLoginResponse.class); 
		}
		catch(Exception e) {
			log.error(e.getLocalizedMessage());
		}
		if(loginResponse!=null)
		{
		String casTgc= loginResponse.getCasTgc();
		
		RocPsAccountApiModelPost rocPsAccountApiModelPost=psBillingAccountUtilty.psCreateAccountRequestModel(defNameMap);
		Gson gson = new Gson();
		System.out.println(gson.toJson(rocPsAccountApiModelPost));
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.set("casTgc", casTgc);      
		HttpEntity<RocPsAccountApiModelPost> httpEntity = new HttpEntity<>(rocPsAccountApiModelPost, headers);
		PSAccountResponse psAccountResponse =null;
		try{
			psAccountResponse =restTemplate.postForObject(psAccountCreationApiUrl, httpEntity, PSAccountResponse.class); 
		 }
		catch(Exception e) {
			log.error(e.getLocalizedMessage());
		 }		
		if (psAccountResponse==null)
		  {
			throw new NoUserExistException(" Account creation Failed !!!");
		  }
		userToAcountmap(userName,companyName, casTgc);
		
	    }
		else
		 {
			throw new NoUserExistException("Partner-Settlement Login Failed !!!");
		 }
	}
	
	public void userToAcountmap(String userName,String accountName, String casTgc)
	{
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON); 
		headers.set("casTgc", casTgc);      		
		UserAccountMapModel userAccountMapModel= new UserAccountMapModel();
		userAccountMapModel.setUserName(userName);
		userAccountMapModel.setAccountName(accountName);
		HttpEntity<UserAccountMapModel> httpEntity = new HttpEntity<>(userAccountMapModel, headers);
		String usrAccMapResponse= null;
		try {
			usrAccMapResponse = restTemplate.postForObject(userAccountMapUrl, httpEntity, String.class); 
		}
		catch(Exception e) {
			log.error(e.getLocalizedMessage());
		}
		if (usrAccMapResponse==null)
		{
			throw new NoUserExistException("User to Account mapping Failed !!!");
		}
	}
}

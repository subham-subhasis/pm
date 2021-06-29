package com.subex.partnermanagement.utility;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.JAXBElement;

import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.subex.partnermanagement.OpenAPI2SpringBoot;
import com.subex.partnermanagement.consumewebservice.CreateUserClient;
import com.subex.partnermanagement.entity.DefinitionEntity;
import com.subex.partnermanagement.entity.InfoDataEntity;
import com.subex.partnermanagement.entity.PartnerInfoEntity;
import com.subex.partnermanagement.helper.EmailModel;
import com.subex.partnermanagement.helper.RoleEntityMapper;
import com.subex.partnermanagement.helper.ScoreData;
import com.subex.partnermanagement.helper.UserInfoMapper;
import com.subex.partnermanagement.helper.UserModel;
import com.subex.partnermanagement.model.EmailData;
import com.subex.partnermanagement.model.InfoData;
import com.subex.partnermanagement.model.PartnerInfo;
import com.subex.partnermanagement.model.PartnerModel;
import com.subex.wsdl.ObjectFactory;

@Component
public class PartnerInfoUtility {
	private static final Logger LOGGER = LoggerFactory.getLogger(PartnerInfoUtility.class);
	@Autowired
	CreateUserClient setCreateUserClient;
	
	@Autowired
	HttpServletRequest request;
		
	private String emailServiceUrl;	
	private String file;
	private String actorPassword;
	private String pcpWorkflowurl;
	private String workFlowServiceUrl;
	private String prefix;
	private String userManagementRoleEntityURL;
	public PartnerInfoUtility(@Value("${emailServiceUrl}")String emailServiceUrl,@Value("${file}") String file,@Value("${actorPassword}") String actorPassword,
	 @Value("${pcpWorkflowurl}") String pcpWorkflowurl,@Value("${workFlowServiceUrl}") String workFlowServiceUrl,
	 @Value("${registrationCode.prefix}") String prefix, @Value("${userManagementRoleEntityURL}") String userManagementRoleEntityURL)
	{			
		this.emailServiceUrl= emailServiceUrl;		
		this.file=file;
		this.actorPassword=actorPassword;
		this.pcpWorkflowurl=pcpWorkflowurl;
		this.workFlowServiceUrl=workFlowServiceUrl;
		this.prefix=prefix;
		this.userManagementRoleEntityURL=userManagementRoleEntityURL;
	}

	
public PartnerInfoEntity emailServiceValidation(String emailId, EmailModel emailModel,String status){
	PartnerInfoEntity partnerInfoEntity =new PartnerInfoEntity();
	RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON); 
  //  headers.set("Authorization", request.getHeader("Authorization"));
    List<String> tolist= new ArrayList<>();
    tolist.add(emailId);
    EmailData emailData= new EmailData();
    emailData.setTolist(tolist);
    InputStream is=null;
    try {
    	if("underconsideration".equalsIgnoreCase(status) || "onhold".equalsIgnoreCase(status))
		      is = new ClassPathResource("MailFormatReview.html").getInputStream();
    	if("rejected".equalsIgnoreCase(status))
    		  is = new ClassPathResource("MailFormatReject.html").getInputStream();
    	if("active".equalsIgnoreCase(status))
    		  is = new ClassPathResource("MailFormat.html").getInputStream(); 
	    } catch ( IOException e1) { }
	InputStreamReader isReader = new InputStreamReader(is);
	String emailTextBody=formEmailBody(isReader);
	String emailTextBodyFormat ="";
    if("underconsideration".equalsIgnoreCase(status))
    { 
      String randamAlphaNum= RandomStringUtils.randomAlphanumeric(6);
	  partnerInfoEntity.setRegistrationCode(prefix+randamAlphaNum);
      String encrRegCode = new String(Base64.getEncoder().encode(partnerInfoEntity.getRegistrationCode().getBytes()));
      String reformedUrl = pcpWorkflowurl+encrRegCode;
      emailData.setSubject(emailModel.getEmailSubject());	
      emailTextBodyFormat = emailTextBody.replace("%1%", emailModel.getFirstName()+" "+emailModel.getLastName());
      emailTextBodyFormat=emailTextBodyFormat.replace("%2%", emailModel.getEmailText());
      emailTextBodyFormat=emailTextBodyFormat.replace("%3%", reformedUrl);
    }
    if("rejected".equalsIgnoreCase(status))
    {
      emailData.setSubject(emailModel.getEmailSubject());		
      emailTextBodyFormat= emailTextBody.replace("%1%", emailModel.getFirstName()+" "+emailModel.getLastName());
      emailTextBodyFormat=emailTextBodyFormat.replace("%2%", emailModel.getEmailText());
    }
   // "onhold" status will be coming only from workflow. 
    if("onhold".equalsIgnoreCase(status))
    {
      emailData.setSubject(emailModel.getEmailSubject());
      emailData.setFrom(emailModel.getFromAddress());
      String encrRegCode = new String(Base64.getEncoder().encode(emailModel.getRegistrationCode().getBytes()));
      String reformedUrl = pcpWorkflowurl+encrRegCode;
      emailTextBodyFormat= emailTextBody.replace("%1%", emailModel.getFirstName()+" "+emailModel.getLastName());
      emailTextBodyFormat=emailTextBodyFormat.replace("%2%", emailModel.getEmailText());
      emailTextBodyFormat=emailTextBodyFormat.replace("%3%", reformedUrl);
    }
    if("active".equalsIgnoreCase(status))
    {
      emailData.setSubject(emailModel.getEmailSubject());
      emailTextBodyFormat= emailTextBody.replace("%1%", emailModel.getFirstName()+" "+emailModel.getLastName());
      emailTextBodyFormat=emailTextBodyFormat.replace("%2%", emailModel.getReformedUrl());
      emailTextBodyFormat=emailTextBodyFormat.replace("%3%", emailModel.getUserName());
    }
    
    String emailBase64Text= new String(Base64.getEncoder().encode(emailTextBodyFormat.getBytes()));
    emailData.setEmailBase64Text(emailBase64Text);
    HttpEntity<EmailData> entity = new HttpEntity<>(emailData,headers);				    
    String response = "";
    try 
    {
     response = restTemplate.postForObject(emailServiceUrl, entity, String.class);    
    }
    catch(Exception e) 
    {
    	System.out.println(e.getLocalizedMessage());
    }
    
    if(response.equalsIgnoreCase(""))
    {
    	partnerInfoEntity.setEmailSerivice("");   	
    	return partnerInfoEntity;
    }	
    else if(response.equalsIgnoreCase("success")) 
    {
    	partnerInfoEntity.setEmailSerivice(status);
        return partnerInfoEntity;
    }
    else
    	partnerInfoEntity.setEmailSerivice("Failed");
         return partnerInfoEntity;   
 }


private String formEmailBody( InputStreamReader isReader) 
{
    BufferedReader reader = null;
    StringBuffer sb = new StringBuffer();
    try
    {
        reader = new BufferedReader( isReader ) ;
        String fileContent = "";
        while ( ( fileContent = reader.readLine() ) != null )
            sb.append( fileContent );
    }
    catch ( IOException e ) { }
    finally
    {
        try
        {
            if ( reader != null )
                reader.close();
        }
        catch ( IOException e ) { }
    }
    return sb.toString();
  }


public void sendNotificationToTeam(String emailId,EmailModel emailModel)
{	
	RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON); 
   // headers.set("Authorization", request.getHeader("Authorization"));
    List<String> tolist= new ArrayList<>();
    tolist.add(emailId);
    EmailData emailData= new EmailData();
    emailData.setTolist(tolist);
    emailData.setSubject(emailModel.getEmailSubject());   
    emailData.setEmailText(emailModel.getEmailText());
    HttpEntity<EmailData> entity = new HttpEntity<>(emailData,headers);
    try 
    {
     restTemplate.postForObject(emailServiceUrl, entity, String.class);    
    }
    catch(Exception e) 
    {
    	System.out.println(e.getLocalizedMessage());
    }    
   
}


  public PartnerModel updateWorkFlowAPIcall(String userName,String partnerinfoId) {	
	RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setBasicAuth(userName, actorPassword);
    headers.setContentType(MediaType.APPLICATION_JSON);   
    //headers.set("Authorization", request.getHeader("Authorization"));
    PartnerModel partnerModel=new PartnerModel();
	partnerModel.setActorId(userName);
	partnerModel.setPartnerId(partnerinfoId);
    HttpEntity<PartnerModel> partnerModelPar = new HttpEntity<>(partnerModel,headers);	
    PartnerModel responsePartnerModel=null;
		 try 
        {
			 responsePartnerModel = restTemplate.postForObject(workFlowServiceUrl, partnerModelPar, PartnerModel.class);    
        }
        catch(Exception e) 
         {
    	  System.out.println(e.getLocalizedMessage());
         }
	
	return responsePartnerModel;
 }
  public UserInfoMapper getUserDetailsAPIcall(String filter,String userDetailsServiceUrl ){
	  RestTemplate restTemplate = new RestTemplate();
	  HttpHeaders headers = new HttpHeaders();
	  headers.setContentType(MediaType.APPLICATION_JSON); 
	  headers.set("Authorization", request.getHeader("Authorization"));
	  UserInfoMapper userInfo=null;
      List<UserInfoMapper> users=null;
	  try {
		//  ResponseEntity<UserInfoMapper[]> result = restTemplate.getForEntity(userDetailsServiceUrl+filter, UserInfoMapper[].class);
		  ResponseEntity<UserInfoMapper[]> result = restTemplate.exchange(
				  userDetailsServiceUrl+filter, HttpMethod.GET, new HttpEntity<Object>(headers),
				  UserInfoMapper[].class);
		  
		  users =  Arrays.asList( result.getBody());   
		   userInfo=users.get(0);
	   }
       catch(Exception e) 
       {
  	      System.out.println(e.getLocalizedMessage());
       }
	  
	  return userInfo;
  }
  

  public void partnerScoringAPIcall(Integer partnerId,String profileName,String scoreApiURL)
  {
	    RestTemplate restTemplate = new RestTemplate();
	    HttpHeaders headers = new HttpHeaders();
	    headers.setContentType(MediaType.APPLICATION_JSON);
	    ScoreData scoreData = new ScoreData();
		scoreData.setPartnerId(partnerId);
		scoreData.setProfileName(profileName);
	    HttpEntity<ScoreData> scoreDataPar = new HttpEntity<>(scoreData,headers);
	    try 
	    {
	     restTemplate.postForObject(scoreApiURL, scoreDataPar, String.class);    
	    }
	    catch(Exception e) 
	    {
	    	System.out.println(e.getLocalizedMessage());
	    }  
	    
  }
  
 public InfoDataEntity setDfnBlobTypeAndValue(String dfnVal ,InfoDataEntity ide)
 {
	String fileType  = dfnVal.substring(0, dfnVal.indexOf(','));
	ide.setDfnBlobType(fileType);
	String fileVal = dfnVal.substring( dfnVal.indexOf(',')+ 1 );			
	byte[] decodedByte = Base64.getDecoder().decode(fileVal);
	ide.setDfnBlobVal( decodedByte );	
	return ide;	
 }

 public PartnerInfoEntity updatePartnerEntity(PartnerInfoEntity partnerInfoEntity, PartnerInfo partnerInfo)
   {	
	 partnerInfoEntity.setModifiedDate( new Date() );
	 partnerInfoEntity.setBlockChainStatus(partnerInfo.getBlockChainStatus());
	 partnerInfoEntity.setStatus(partnerInfo.getStatus());	 
	 partnerInfoEntity.setPreOnBoardScore(partnerInfo.getPreOnBoardScore());
	 partnerInfoEntity.setPostOnBoardScore(partnerInfo.getPostOnBoardScore());
	 partnerInfoEntity.setProfileName(partnerInfo.getProfileName());	 
	 
	 return partnerInfoEntity;
   }

 public InfoDataEntity updatePartnerDefinitions(InfoData w,Map<Long,Long> map,Map<Long,DefinitionEntity> defMap)
 {
		InfoDataEntity ide  = new InfoDataEntity();
		if(map.containsKey(w.getDfnId().longValue())) {
			   ide.setId(map.get(w.getDfnId().longValue()));
		}		
		if(file.equalsIgnoreCase(defMap.get(w.getDfnId().longValue()).getFieldType()) ) {
			if (w.getDfnVal() != null && w.getDfnVal().contains(",")) {
				String fileType = w.getDfnVal().substring(0, w.getDfnVal().indexOf(','));
				ide.setDfnBlobType(fileType);
				String fileVal = w.getDfnVal().substring(w.getDfnVal().indexOf(',') + 1);
				byte[] decodedByte = Base64.getDecoder().decode(fileVal);
				ide.setDfnBlobVal(decodedByte);
			}
		}
		else 
		{
			ide.setDfnVal(w.getDfnVal());
		}		
		ide.setDefinitionEntity(defMap.get(w.getDfnId().longValue()));
		
		return ide;
 }
 
 public void createUser(Map<String, String> defNameMap,String loggedInUser,String userName,String partition)
 {
	 ObjectFactory objectFactory = new ObjectFactory();
	   
     JAXBElement<String> loggedInuser =objectFactory.createCreateUserLoggedInUserName(loggedInUser);
  
     UserModel userModel =new UserModel();   
     userModel.setUsrName(objectFactory.createWebServiceParameterValue(userName));
     userModel.setUsrForename(objectFactory.createWebServiceParameterValue(defNameMap.get("First Name")));
     userModel.setUsrSurname(objectFactory.createWebServiceParameterValue(defNameMap.get("Last Name")));
     userModel.setUsrEmailAddress(objectFactory.createWebServiceParameterValue(defNameMap.get("Email")));
     userModel.setUsrPassword(objectFactory.createWebServiceParameterValue("welcome1"));
     userModel.setPartition(partition);
     String rolePatition = getRolePatition();
     setCreateUserClient.createUser(loggedInuser,userModel, rolePatition);   
     
 }
 
 
 private String getRolePatition() {
	 RestTemplate restTemplate = new RestTemplate();
	 HttpHeaders headers = new HttpHeaders();
	 headers.setContentType(MediaType.APPLICATION_JSON);
	 String rolePartitionNameForIsExternal = "";
     List<RoleEntityMapper> roles=null;
	  try {
		  ResponseEntity<RoleEntityMapper[]> result = restTemplate.exchange(
				  userManagementRoleEntityURL, HttpMethod.GET, new HttpEntity<Object>(headers),
				  RoleEntityMapper[].class);
		  
		  roles =  Arrays.asList( result.getBody());
		  for (RoleEntityMapper roleEntityMapper : roles) {
			if(roleEntityMapper.getIsExternal() != null && roleEntityMapper.getIsExternal()) {
				rolePartitionNameForIsExternal = roleEntityMapper.getRoleName();
				break;
			}
		  }
	   }
      catch(Exception e) 
      {
    	  LOGGER.error(e.getLocalizedMessage());
      }
	  
	  return rolePartitionNameForIsExternal;
 }
}

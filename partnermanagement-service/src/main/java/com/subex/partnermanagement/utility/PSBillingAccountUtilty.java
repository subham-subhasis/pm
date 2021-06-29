package com.subex.partnermanagement.utility;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.subex.partnermanagement.model.AccountAddressTypeApiModelPost;
import com.subex.partnermanagement.model.AccountExtraInfo;
import com.subex.partnermanagement.model.AgentApiModelPost;
import com.subex.partnermanagement.model.BankApiModelPost;
import com.subex.partnermanagement.model.CountryApiModelPost;
import com.subex.partnermanagement.model.CustomerClassificationApiModelPost;
import com.subex.partnermanagement.model.CustomerPriceApiModelPost;
import com.subex.partnermanagement.model.EntityStatusApiModelPost;
import com.subex.partnermanagement.model.FranchiseApiModelPost;
import com.subex.partnermanagement.model.InfoData;
import com.subex.partnermanagement.model.RocPsAccountAddressApiModelPost;
import com.subex.partnermanagement.model.RocPsAccountApiModelPost;
import com.subex.partnermanagement.model.RocPsAccountContactInfoApiModelPost;
import com.subex.partnermanagement.model.RocPsAccountTypeApiModelPost;
import com.subex.partnermanagement.model.RocPsBankAccountApiModelPost;
import com.subex.partnermanagement.model.SalesRegionApiModelPost;
import com.subex.partnermanagement.model.UserTblApiModelPost;

@Component
public class PSBillingAccountUtilty {
	private static final Logger LOGGER = LoggerFactory.getLogger(PSBillingAccountUtilty.class);
	 String entityName;		
	 String entitygroupNmae;
	 Map<String,String> entityNameFieldMap;
	 String dateFormatterForAccountExtraInfo;

	
	public PSBillingAccountUtilty(@Value("${entityName}") String entityName,@Value("#{${entityNameFieldMap}}") Map<String,String> entityNameFieldMap 
			,@Value("${entitygroupNmae}") String entitygroupNmae,
			 @Value("${dateFormatterForAccountExtraInfo}") String dateFormatterForAccountExtraInfo) {
		
		this.entityName = entityName;
		this.entityNameFieldMap= entityNameFieldMap;
		this.entitygroupNmae= entitygroupNmae;
		this.dateFormatterForAccountExtraInfo= dateFormatterForAccountExtraInfo;

	}
	
	
	public RocPsAccountApiModelPost psCreateAccountRequestModel(Map<String, InfoData> defNameMap)
	{
		RocPsAccountApiModelPost rocPsAccountApiModelPost = new RocPsAccountApiModelPost();

		rocPsAccountApiModelPost.setLob(defNameMap.get("lob").getDfnVal());
		rocPsAccountApiModelPost.setPaccName(defNameMap.get("Company Name").getDfnVal());
		if(defNameMap.get("Account Name") != null && defNameMap.get("Account Name").getDfnVal() != null) {
			rocPsAccountApiModelPost.setPaccName(defNameMap.get("Account Name").getDfnVal());
		}
		   RocPsAccountTypeApiModelPost accountType =new RocPsAccountTypeApiModelPost();
		   accountType.setPatpName(defNameMap.get("Account Type").getDfnVal());
		rocPsAccountApiModelPost.setAccountType(accountType );
		rocPsAccountApiModelPost.setCustomerType(defNameMap.get("Customer Type").getDfnVal());
		   EntityStatusApiModelPost entityStatusApiModelPost=new EntityStatusApiModelPost();
		   entityStatusApiModelPost.setEntityStatusCode("Active");
		rocPsAccountApiModelPost.setEntityStatus(entityStatusApiModelPost);
		   AgentApiModelPost agentApiModelPost =new AgentApiModelPost();
		   agentApiModelPost.setAgentDisplay(defNameMap.get("Managing Agent").getDfnVal());
		rocPsAccountApiModelPost.setAgent(agentApiModelPost);
		if(!("".equalsIgnoreCase(defNameMap.get("Credit Rating").getDfnVal())))
	    {	
		rocPsAccountApiModelPost.setAccountCreditScore(Long.parseLong(defNameMap.get("Credit Rating").getDfnVal()));   
	    }

		   CustomerClassificationApiModelPost customerClassificationApiModelPost=new CustomerClassificationApiModelPost();
		   customerClassificationApiModelPost.setPcctName(defNameMap.get("Classification").getDfnVal());
	    rocPsAccountApiModelPost.setCustomerClassification(customerClassificationApiModelPost); 
		   CustomerPriceApiModelPost customerPriceApiModelPost =new CustomerPriceApiModelPost();
		   customerPriceApiModelPost.setCustomerPriceCode(defNameMap.get("Payment Type").getDfnVal());
	    rocPsAccountApiModelPost.setCustomerPrice(customerPriceApiModelPost);
		   SalesRegionApiModelPost salesRegionApiModelPost=new SalesRegionApiModelPost();
		   salesRegionApiModelPost.setSalesRegionCode(defNameMap.get("Sales Region").getDfnVal());
	   rocPsAccountApiModelPost.setSalesRegion(salesRegionApiModelPost);
	       FranchiseApiModelPost franchiseApiModelPost=new FranchiseApiModelPost();
	       franchiseApiModelPost.setFranchiseCode(defNameMap.get("Franchise").getDfnVal());
	   rocPsAccountApiModelPost.setFranchise(franchiseApiModelPost);    
	   rocPsAccountApiModelPost.setPaccAcctRefNo(defNameMap.get("Account Reference").getDfnVal());
	   
	      RocPsAccountAddressApiModelPost rocPsAccountAddressApiModelPost=new RocPsAccountAddressApiModelPost();	  
	      AccountAddressTypeApiModelPost accountAddressTypeApiModelPost=new AccountAddressTypeApiModelPost();
	      accountAddressTypeApiModelPost.setAccountAddressTypeName(defNameMap.get("Address Type").getDfnVal());
	     
	      rocPsAccountAddressApiModelPost.setAccountAddressType(accountAddressTypeApiModelPost);
	      rocPsAccountAddressApiModelPost.setAddress(defNameMap.get("Address Name").getDfnVal());
	      rocPsAccountAddressApiModelPost.setCompanyName(defNameMap.get("Company Name").getDfnVal());
	      rocPsAccountAddressApiModelPost.setAddresseeEnvelope(defNameMap.get("Addressed To").getDfnVal());
	      rocPsAccountAddressApiModelPost.setCompanyRegistrationNumber(defNameMap.get("Company Reg Number").getDfnVal());
	      rocPsAccountAddressApiModelPost.setCompanyRegistrationType(defNameMap.get("Registration Type").getDfnVal());
	      if(!("".equalsIgnoreCase(defNameMap.get("Years Trading").getDfnVal())))
	      {	
	      rocPsAccountAddressApiModelPost.setCompanyTradeYears(Long.parseLong(defNameMap.get("Years Trading").getDfnVal()));
	      }
	      CountryApiModelPost countryApiModelPost= new CountryApiModelPost();
	      countryApiModelPost.setCtrName(defNameMap.get("Country").getDfnVal());
	      rocPsAccountAddressApiModelPost.setCountry(countryApiModelPost);
	      rocPsAccountAddressApiModelPost.setPacdBuilding(defNameMap.get("Building").getDfnVal());
	      rocPsAccountAddressApiModelPost.setPacdCompanyRegCity(defNameMap.get("Registration City").getDfnVal());
	      rocPsAccountAddressApiModelPost.setPacdPostcode(defNameMap.get("Postal Code").getDfnVal());
	      rocPsAccountAddressApiModelPost.setPacdStreet(defNameMap.get("Street").getDfnVal());
	      rocPsAccountAddressApiModelPost.setSalutation(defNameMap.get("Salutation").getDfnVal());
	      rocPsAccountAddressApiModelPost.setTown(defNameMap.get("Town").getDfnVal());
	      rocPsAccountAddressApiModelPost.setDefaultAddress(true);
	      List<RocPsAccountAddressApiModelPost> accountAddresses=new ArrayList<>();
	      accountAddresses.add(rocPsAccountAddressApiModelPost);
	   
	   rocPsAccountApiModelPost.setAccountAddresses(accountAddresses);
	   
	      RocPsBankAccountApiModelPost rocPsBankAccountApiModelPost=new RocPsBankAccountApiModelPost();
	      BankApiModelPost bankApiModelPost=new BankApiModelPost();
	      bankApiModelPost.setPbnkName(defNameMap.get("Bank Name").getDfnVal());
	      rocPsBankAccountApiModelPost.setBank(bankApiModelPost);
	      rocPsBankAccountApiModelPost.setPbacExtra1(defNameMap.get("Bank AC Number").getDfnVal());
	      rocPsBankAccountApiModelPost.setBankAccountExtra2(defNameMap.get("Bank Account Name").getDfnVal());
	     
	      List<RocPsBankAccountApiModelPost> bankAccounts=new ArrayList<>();
	      bankAccounts.add(rocPsBankAccountApiModelPost);
	      
	   rocPsAccountApiModelPost.setBankAccounts(bankAccounts);
	   
	      RocPsAccountContactInfoApiModelPost rocPsAccountContactInfoApiModelPost=new RocPsAccountContactInfoApiModelPost();
	      rocPsAccountContactInfoApiModelPost.setAccountContactInfoFax(defNameMap.get("Fax").getDfnVal());
	      rocPsAccountContactInfoApiModelPost.setAccountContactInfoHomeNumber(defNameMap.get("Home Number").getDfnVal());
	      rocPsAccountContactInfoApiModelPost.setPaciEmail(defNameMap.get("Email").getDfnVal());
	      rocPsAccountContactInfoApiModelPost.setPaciMobileNo(defNameMap.get("Mobile Number").getDfnVal());
	      rocPsAccountContactInfoApiModelPost.setPaciName(defNameMap.get("Contact Name").getDfnVal());
	      rocPsAccountContactInfoApiModelPost.setPaciOfficeNo(defNameMap.get("Office Number").getDfnVal());
	      rocPsAccountContactInfoApiModelPost.setIsDefaultContact(true);
	      List<RocPsAccountContactInfoApiModelPost> accountContactInfos=new ArrayList<>();
	      accountContactInfos.add(rocPsAccountContactInfoApiModelPost);	     	     
	      rocPsAccountApiModelPost.setAccountContactInfos(accountContactInfos); 
	      
	      List<AccountExtraInfo> accountExtraInfos= new ArrayList<>(); 
	      for (Map.Entry<String,InfoData> entry : defNameMap.entrySet())
	      {
	    	  
	    	  if(entry.getValue().getGroupName()!=null &&entry.getValue().getGroupName().equalsIgnoreCase(entitygroupNmae))
	    	  {
	    		  AccountExtraInfo accountExtraInfo =new AccountExtraInfo();
	    		  accountExtraInfo.setEadName(entry.getValue().getDfnName());
	    		  if( "date".equalsIgnoreCase(entry.getValue().getType())) {
	    			  try {
	    				  DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.ENGLISH);
	    				  DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern(dateFormatterForAccountExtraInfo, Locale.ENGLISH);
	    				  LocalDateTime date = LocalDateTime.parse(entry.getValue().getDfnVal(), inputFormatter);
	    				  String formattedDate = outputFormatter.format(date);
	    				  LOGGER.info(formattedDate);
	    				  accountExtraInfo.setEadVal(formattedDate);
					} catch (Exception e) {
						LOGGER.error("Error while Parsing date for account extra information in Account utility. It's expecting in yyyy-MM-dd'T'HH:mm:ss.SSS'Z' format and it has got :"+entry.getValue().getDfnVal());
					}
	    		  } else {
		    		  accountExtraInfo.setEadVal(entry.getValue().getDfnVal());
	    		  }

	    		  accountExtraInfo.setEntityName(entityName);
	    		if(entityNameFieldMap.containsKey(entry.getValue().getDfnName()))
	    		{
	    			String mapValue = entityNameFieldMap.get(entry.getValue().getDfnName());
	    			List<String> keyValues = Stream.of(mapValue.split("\\|", -1))
	    					  .collect(Collectors.toList());
		    		
		    		accountExtraInfo.setEntityNameField(keyValues.get(0));	    		
		    		accountExtraInfo.setEntityPrimaryKeyColumn(keyValues.get(1));
		    		accountExtraInfo.setEadType(keyValues.get(2));
	    		}
	    		else
	    		{
	    			
	    			accountExtraInfo.setEadType("string");
	    		}
	    		accountExtraInfos.add(accountExtraInfo);
	    	  }
	    	  
	      }
	      rocPsAccountApiModelPost.setAccountExtraInfos(accountExtraInfos);
	      UserTblApiModelPost userTblApiModelPost=new UserTblApiModelPost();
	      rocPsAccountApiModelPost.setUserTbl(userTblApiModelPost);
	      
	      
		return rocPsAccountApiModelPost;
		 
	}
}

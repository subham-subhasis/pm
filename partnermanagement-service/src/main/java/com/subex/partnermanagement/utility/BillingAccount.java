package com.subex.partnermanagement.utility;

import java.util.Map;
import com.subex.partnermanagement.model.InfoData;


public interface BillingAccount {

	public void createAccount(Map<String, InfoData> defNameMap,String userName,String companyName);
}

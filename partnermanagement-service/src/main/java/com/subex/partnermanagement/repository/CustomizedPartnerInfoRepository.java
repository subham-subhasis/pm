package com.subex.partnermanagement.repository;

import java.util.List;

public interface CustomizedPartnerInfoRepository {
	List<Integer> filteredSearchTextPartners(String query);
}

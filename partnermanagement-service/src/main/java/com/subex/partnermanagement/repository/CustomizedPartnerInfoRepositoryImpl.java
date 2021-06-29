package com.subex.partnermanagement.repository;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

import org.springframework.stereotype.Component;

@Component("customizedImpl")
public class CustomizedPartnerInfoRepositoryImpl implements CustomizedPartnerInfoRepository {

	@PersistenceContext
	private EntityManager em;
	
	@Override
	public List<Integer> filteredSearchTextPartners(String query){
	 TypedQuery<Integer> q=em.createQuery(query,Integer.class);
	 return q.getResultList();
	}
}

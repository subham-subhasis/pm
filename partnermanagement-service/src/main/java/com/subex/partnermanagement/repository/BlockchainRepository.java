package com.subex.partnermanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.subex.partnermanagement.entity.PartnerBlockchainEntity;


public interface BlockchainRepository extends JpaRepository<PartnerBlockchainEntity, Integer> {
	
	@Query("from PartnerBlockchainEntity bc where bc.partnerId = :partnerId ")
	Optional<PartnerBlockchainEntity> findByPartnerId(@Param("partnerId") Integer partnerId);
}

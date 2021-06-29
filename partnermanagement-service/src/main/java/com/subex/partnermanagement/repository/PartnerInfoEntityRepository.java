package com.subex.partnermanagement.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.subex.partnermanagement.entity.PartnerInfoEntity;



@Repository
public interface PartnerInfoEntityRepository extends JpaRepository<PartnerInfoEntity, Integer>, JpaSpecificationExecutor<PartnerInfoEntity>, CustomizedPartnerInfoRepository {

	@Query("from PartnerInfoEntity p where p.partnerId in( select i.partnerInfoEntity.partnerId from InfoDataEntity i where i.dfnVal = :dfnValue and i.definitionEntity.dfnName = :dfnName and i.partnerInfoEntity.partnerId <> :partnerId )")
	Optional<PartnerInfoEntity> findByDfnName(@Param("dfnValue") String dfnValue ,@Param("dfnName") String dfnName, @Param("partnerId") Integer partnerId);

	@Query("from PartnerInfoEntity d where d.registrationCode = :requestNumber")
	List<PartnerInfoEntity> findByRequest( @Param("requestNumber") String requestNumber);

	@Query("from PartnerInfoEntity d where d.wfProcessInstanceId <> null and d.status  = 'underconsideration' ")
	List<PartnerInfoEntity> findAllInWorkflow();
    
	@Query("from PartnerInfoEntity pe where pe.blockChainStatus like '%InProgress%' ")
	List<PartnerInfoEntity> findAllInProgressBlockchainStatusPartners();
	
}

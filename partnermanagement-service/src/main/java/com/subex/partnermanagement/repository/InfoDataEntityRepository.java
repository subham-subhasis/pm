package com.subex.partnermanagement.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.subex.partnermanagement.entity.DefinitionEntity;
import com.subex.partnermanagement.entity.InfoDataEntity;
import com.subex.partnermanagement.entity.PartnerInfoEntity;
import com.subex.partnermanagement.helper.InfoDataMapper;



@Repository
public interface InfoDataEntityRepository extends JpaRepository<InfoDataEntity, Long> {
	
	@Query("from InfoDataEntity d where d.definitionEntity = :definitionEntity and dfnVal = :dfnVal")
    List<InfoDataEntity> findAllInfoDataEntityByDfn(@Param("definitionEntity") DefinitionEntity definitionEntity, @Param("dfnVal") String dfnVal);

	@Query(value ="select new com.subex.partnermanagement.helper.InfoDataMapper(d.definitionEntity.dfnId   , d.id )  from InfoDataEntity d where d.partnerInfoEntity = :partnerInfoEntity")
    List<InfoDataMapper> findAllInfoDataEntityByPrt(@Param("partnerInfoEntity") PartnerInfoEntity partnerInfoEntity);

}

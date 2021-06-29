package com.subex.partnermanagement.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.subex.partnermanagement.entity.DefinitionEntity;

import java.util.List;

@Repository
public interface DefinitionRepository extends JpaRepository<DefinitionEntity, Long>
{

    @Query("from DefinitionEntity d where d.profileName = :profileName")
    List<DefinitionEntity> findAllDfnsForProfile(@Param("profileName") String profileName);
    
    @Query("from DefinitionEntity d where d.action in ('score','publish-score') and d.profileName = :profileName")
    List<DefinitionEntity> findAllScorableDfnsForProfile(@Param("profileName") String profileName);
}

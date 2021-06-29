package com.subex.partnermanagement.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.subex.partnermanagement.entity.CheckListEntity;

@Repository
public interface CheckListRepository extends JpaRepository<CheckListEntity, Long>{

	@Query("from CheckListEntity c where c.toDos = :toDos and c.teamName = :teamName and c.partnerId = :partnerId ")
	Optional<CheckListEntity> findByName( @Param("toDos") String toDos,@Param("teamName") String teamName,@Param("partnerId") Integer partnerId);
	
	@Query("from CheckListEntity c where c.teamName = :teamName and c.partnerId = :partnerId ")
	List<CheckListEntity> findAllCheckListsByPartner(@Param("partnerId") Integer partnerId,@Param("teamName") String teamName);

	
}

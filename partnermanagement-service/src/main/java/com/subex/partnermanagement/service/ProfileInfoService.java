package com.subex.partnermanagement.service;

import org.dozer.DozerBeanMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import com.subex.partnermanagement.api.ProfileinfosApiDelegate;
import com.subex.partnermanagement.entity.*;
import com.subex.partnermanagement.model.*;
import com.subex.partnermanagement.repository.DefinitionRepository;
import com.subex.partnermanagement.utility.*;


import java.util.List;
import java.util.Map;
import com.subex.ngp.audit.trail.lib.AuditEventModel;
@Service
public class ProfileInfoService implements ProfileinfosApiDelegate
{
    DozerBeanMapper mapper = new DozerBeanMapper();
    
    @Autowired
    DefinitionRepository definitionRepository;
   
    
    @Autowired
    ProfileInfoUtility profileUtility;

    String status="Success";
  
   

	@Override
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public ResponseEntity<List<ProfileInfo>> getprofileinfos(String profileName) {
        List<DefinitionEntity>  definitionEntities = null;
        definitionEntities = definitionRepository.findAllDfnsForProfile( profileName );
        
        Map<String, Map<ProfileFieldGroupEntity,List<Definition>>> configMap = profileUtility.getDefinitionEntities(definitionEntities);     
        List<ProfileInfo> profileInfos =profileUtility.setProfileInfosData(configMap);
        AuditEventModel.callAuditLog("PROFILE-FIELD-GROUP-ENTITY", "Fetch ALL Profile Information", "All Profile Infos list fetched successfully for : "+profileName, "success");
        return  new ResponseEntity<>( profileInfos , HttpStatus.OK );
    }

	
	
	
}

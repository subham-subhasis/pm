package com.subex.partnermanagement.utility;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.dozer.DozerBeanMapper;
import org.springframework.stereotype.Component;

import com.subex.partnermanagement.entity.DefinitionEntity;
import com.subex.partnermanagement.entity.FieldGroupEntity;
import com.subex.partnermanagement.entity.ProfileFieldGroupEntity;
import com.subex.partnermanagement.entity.ValidationEntity;
import com.subex.partnermanagement.entity.WeightageEntity;
import com.subex.partnermanagement.model.Definition;
import com.subex.partnermanagement.model.FieldGroupModel;
import com.subex.partnermanagement.model.FormFieldGroup;
import com.subex.partnermanagement.model.ProfileInfo;


@Component
public class ProfileInfoUtility {
	DozerBeanMapper mapper = new DozerBeanMapper();
    
   public ProfileFieldGroupEntity setProfileFieldGroupEntityProperties(ProfileInfo profileInfo ,FormFieldGroup formFieldGroup,ProfileFieldGroupEntity profileFieldGroupEntity) {          
	        profileFieldGroupEntity.setFieldGroupEntity( mapper.map( formFieldGroup.getFieldGroup() , FieldGroupEntity.class ));
	        profileFieldGroupEntity.setGrpOrder( formFieldGroup.getGroupOrder() );
	        profileFieldGroupEntity.setProfileName( profileInfo.getProfileName() );
			return profileFieldGroupEntity;
		}
		 
    public DefinitionEntity setDefinitionEntityProperties(Definition dfn, ProfileFieldGroupEntity profileFieldGroupEntity) {
    	 DefinitionEntity definitionEntity = mapper.map( dfn , DefinitionEntity.class );
         definitionEntity.setIsMandatory(dfn.getIsMandatory());
         definitionEntity.setWebScrap(dfn.getIsWebScrap());
         definitionEntity.setProfileFieldGroupEntity( profileFieldGroupEntity );
         definitionEntity.setProfileName(profileFieldGroupEntity.getProfileName());
		return definitionEntity;
	}

	public List<WeightageEntity> setWeightageEntityProperties(Definition dfn, DefinitionEntity definitionEntity) {
		
		List<WeightageEntity> weightageEntities = new ArrayList<>();
		 if(dfn.getWeightages() != null && !dfn.getWeightages().isEmpty()) {
             dfn.getWeightages().forEach(w -> {
                 WeightageEntity weightageEntity = new WeightageEntity();
                 weightageEntity.setDefinitionEntity(definitionEntity);
                 weightageEntity.setType(w.getType());
                 weightageEntity.setWeightageVal(w.getWeightageVal());
                 weightageEntities.add(weightageEntity);
             });
             
		 } 
		return weightageEntities;
	}
	
	public List<ValidationEntity> setValidationEntityProperties(Definition dfn, DefinitionEntity definitionEntity){
		
		List<ValidationEntity> validationEntities = new ArrayList<>();
		 if(dfn.getValidations() != null && !dfn.getValidations().isEmpty()) {
            dfn.getValidations().forEach(w -> {
            	ValidationEntity validationEntity = new ValidationEntity();
            	validationEntity.setDefinitionEntity(definitionEntity);
            	validationEntity.setValidationName(w.getValidationName());
            	validationEntity.setValidationMsg(w.getValidationMsg());
            	validationEntity.setValue(w.getValue());
            	validationEntities.add(validationEntity);
            });
            
		 }		
		return validationEntities;
	}
	

	 public Map<String, Map<ProfileFieldGroupEntity,List<Definition>>> getDefinitionEntities(List<DefinitionEntity> definitionEntities) {
	        Map<String, Map<ProfileFieldGroupEntity,List<Definition>>> configMap = new HashMap<>();

	        definitionEntities.forEach(dfn -> {
	            Definition definition = mapper.map(dfn, Definition.class);
	            definition.setIsMandatory( dfn.getIsMandatory() );
	            definition.setIsWebScrap( dfn.getWebScrap() );
	            definition.setPanelOpenState(false);
	            if( !configMap.containsKey(dfn.getProfileName()) )
	                configMap.put(dfn.getProfileName(), new HashMap<>());
	            if( !configMap.get(dfn.getProfileName()).containsKey(dfn.getProfileFieldGroupEntity() ) )
	                configMap.get(dfn.getProfileName()).put(dfn.getProfileFieldGroupEntity(), new ArrayList<>() );
	            configMap.get(dfn.getProfileName()).get(dfn.getProfileFieldGroupEntity()).add( definition );
	        });
	        
	        return configMap;
	       }
	 
	 public List<ProfileInfo> setProfileInfosData(Map<String, Map<ProfileFieldGroupEntity,List<Definition>>> configMap) {
	        List<ProfileInfo> profileInfos = new ArrayList<>();
	        configMap.forEach( (profileNameStr, fieldGroupMap ) -> {
	            ProfileInfo profileInfo = new ProfileInfo();
	            profileInfo.setIsStub(false);
	            profileInfo.setProfileName( profileNameStr );

	            List<FormFieldGroup> formFieldGroups = new ArrayList<>();
	            fieldGroupMap.forEach( (fieldGrp , definitions ) -> {
	                FieldGroupModel fieldGroupModel = mapper.map( fieldGrp.getFieldGroupEntity() , FieldGroupModel.class );
	                FormFieldGroup formFieldGroup = new FormFieldGroup();
	                formFieldGroup.setCollapse(false);
	                formFieldGroup.setGroupOrder( fieldGrp.getGrpOrder());
	                formFieldGroup.setFieldGroup( fieldGroupModel );
	                formFieldGroup.setDefinitions( definitions );
	                formFieldGroups.add(formFieldGroup);
	            });
	            profileInfo.setProfileData( formFieldGroups );
	            profileInfos.add(profileInfo);
	        });
	       return profileInfos;
	 }
	
}

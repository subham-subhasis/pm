package com.subex.partnermanagement.service;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.subex.partnermanagement.entity.DefinitionEntity;
import com.subex.partnermanagement.entity.FieldGroupEntity;
import com.subex.partnermanagement.entity.ProfileFieldGroupEntity;
import com.subex.partnermanagement.model.Definition;
import com.subex.partnermanagement.model.FieldGroupModel;
import com.subex.partnermanagement.model.FormFieldGroup;
import com.subex.partnermanagement.model.ProfileInfo;
import com.subex.partnermanagement.model.Validation;
import com.subex.partnermanagement.model.Weightage;
import com.subex.partnermanagement.repository.DefinitionRepository;

@ExtendWith(SpringExtension.class)
@SpringBootTest 
public class ProfileInfoServiceTest {
	
	@MockBean
    DefinitionRepository definitionRepositoryMock;

	@Autowired
	ProfileInfoService profileInfoService;
	
	 public DefinitionEntity setDefinitionEntity(long dfnId ,String dfnName,String fieldType) {
	    	DefinitionEntity definitionEntity= new DefinitionEntity();
	    	definitionEntity.setDfnId(dfnId);
	    	definitionEntity.setDfnName(dfnName);
	    	definitionEntity.setFieldType(fieldType);
	    	return definitionEntity;		
	    	}
	 public ProfileFieldGroupEntity setProfileFieldEnities(String profileNmae) {
			
			FieldGroupEntity fieldGroupEntity=new FieldGroupEntity();
			fieldGroupEntity.setFieldGrpId((long) 1);
			fieldGroupEntity.setFieldGrpName("Basic Details"); 
			ProfileFieldGroupEntity profileFieldGroupEntity= new ProfileFieldGroupEntity();
			profileFieldGroupEntity.setProfileName(profileNmae);
			profileFieldGroupEntity.setId((long) 1);
			profileFieldGroupEntity.setFieldGroupEntity(fieldGroupEntity);
			
			return profileFieldGroupEntity;
			
			
		}

	public List<DefinitionEntity>  setDefinitionEntityList()
	{
		ProfileFieldGroupEntity profileFieldGroupEntity=setProfileFieldEnities("MVN");
		DefinitionEntity df1= setDefinitionEntity(1,"First Name","input");
		df1.setProfileName("MVN");
		df1.setProfileFieldGroupEntity(profileFieldGroupEntity);
    	DefinitionEntity df2= setDefinitionEntity(2,"Last Name","input");
    	df2.setProfileName("MVN");
    	df2.setProfileFieldGroupEntity(profileFieldGroupEntity);
    	DefinitionEntity df3= setDefinitionEntity(3,"Email","input");
    	df3.setProfileName("MVN");
    	df3.setProfileFieldGroupEntity(profileFieldGroupEntity);
    	DefinitionEntity df4= setDefinitionEntity(4,"Company Name","input");  
    	df4.setProfileName("MVN");
    	df4.setProfileFieldGroupEntity(profileFieldGroupEntity);
    	List<DefinitionEntity> definitions = new ArrayList<>();
    	definitions.add(df1);
    	definitions.add(df2);
    	definitions.add(df3);
    	definitions.add(df4);
    	return definitions;
	}
	
	public ProfileInfo setProfileInfo() {
		Weightage weightage = new Weightage();
		weightage.setType("banglore");
		weightage.setWeightageVal(6.7);
		Validation validation =new Validation();
		validation.setValidationName("max");
		validation.setValidationMsg("maximum number");
		List<Weightage> weightages = new ArrayList();	
		weightages.add(weightage);
		List<Validation> validations = new ArrayList();
		validations.add(validation);
			
		FieldGroupModel fieldGroupModel =new FieldGroupModel();
		fieldGroupModel.setFieldGrpName("Basic Details");
		fieldGroupModel.setFieldGrpId(1);
		
		Definition definition=new Definition();
		definition.setProfileName("MVN");
		definition.setDfnName("Fname");
		definition.setWeightages(weightages);
		definition.setValidations(validations);		
		List<Definition> definitions = new ArrayList();
	    definitions.add(definition);
		
		FormFieldGroup formFieldGroup =new FormFieldGroup();
		List<FormFieldGroup> formFieldGrouplist =new ArrayList();
		formFieldGroup.setFieldGroup(fieldGroupModel);
		formFieldGroup.setGroupOrder(1);
		formFieldGroup.setDefinitions(definitions);		
		formFieldGrouplist.add(formFieldGroup);
		
		ProfileInfo profileInfo= new ProfileInfo();
		profileInfo.setProfileName("MVN");
		profileInfo.setProfileData(formFieldGrouplist);
		return profileInfo;		
		}

	@Test
	void getprofileinfosTest()
	{	
		List<DefinitionEntity>  definitionEntities = setDefinitionEntityList();
		when(definitionRepositoryMock.findAllDfnsForProfile("MVN")).thenReturn(definitionEntities);
		  ProfileInfo profileInfo= setProfileInfo(); 
			List<ProfileInfo> profileInfos = new ArrayList();
			profileInfos.add(profileInfo);		
		    ResponseEntity<List<ProfileInfo>> responsEntExpec =profileInfoService.getprofileinfos("MVN");
		    for (ProfileInfo p :responsEntExpec.getBody())
		    {
		    assertEquals(profileInfo.getProfileName(),p.getProfileName() );
		    }

	}

}

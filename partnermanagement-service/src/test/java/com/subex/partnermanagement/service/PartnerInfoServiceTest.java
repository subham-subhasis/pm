package com.subex.partnermanagement.service;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.client.RestTemplate;

import com.subex.partnermanagement.entity.CheckListEntity;
import com.subex.partnermanagement.entity.DefinitionEntity;
import com.subex.partnermanagement.entity.InfoDataEntity;
import com.subex.partnermanagement.model.PagedPartnerInfoEntities;
import com.subex.partnermanagement.entity.PartnerInfoEntity;
import com.subex.partnermanagement.helper.InfoDataMapper;
import com.subex.partnermanagement.helper.UserInfoMapper;
import com.subex.partnermanagement.model.CheckListModel;
import com.subex.partnermanagement.model.Definition;
import com.subex.partnermanagement.model.InfoData;
import com.subex.partnermanagement.model.PartnerInfo;
import com.subex.partnermanagement.model.PartnerModel;
import com.subex.partnermanagement.model.Response;
import com.subex.partnermanagement.repository.CheckListRepository;
import com.subex.partnermanagement.repository.DefinitionRepository;
import com.subex.partnermanagement.repository.InfoDataEntityRepository;
import com.subex.partnermanagement.repository.PartnerInfoEntityRepository;

@ExtendWith(SpringExtension.class)
@SpringBootTest 
 class PartnerInfoServiceTest {

	@Autowired
	private PartnerInfoService partnerInfoService ;
	
	@MockBean
	PartnerInfoEntityRepository partnerInfoEntityRepositoryMock;
	
	@MockBean
    DefinitionRepository definitionRepositoryMock;
	
	@MockBean
	CheckListRepository checkListRepositoryMock;
	
	@MockBean
	InfoDataEntityRepository infoDataEntityRepositoryMock;
	
	@Mock
    private RestTemplate restTemplateMock;
	
	 public DefinitionEntity setDefinitionEntity(long dfnId ,String dfnName,String fieldType) {
	    	DefinitionEntity definitionEntity= new DefinitionEntity();
	    	definitionEntity.setDfnId(dfnId);
	    	definitionEntity.setDfnName(dfnName);
	    	definitionEntity.setFieldType(fieldType);
	    	return definitionEntity;		
	    	}
	 
	 public InfoDataEntity setInfoDataEntity(long infoId ,String infoValue,PartnerInfoEntity partnerInfoEntity ,byte[] infoblob) {
	    	InfoDataEntity inf =new InfoDataEntity();
	    	inf.setId(infoId);
	    	inf.setDfnVal(infoValue);
	    	inf.setDfnBlobVal(infoblob);
	    	inf.setPartnerInfoEntity(partnerInfoEntity);
	    	
	    	return inf;		
	    	}
	 
	public PartnerInfoEntity partnerInfoEntity()
	{
		
	PartnerInfoEntity pinf=new PartnerInfoEntity();	
 	pinf.setPartnerId(1);
 	pinf.setProfileName("SMS");
 	pinf.setEmailSerivice("Success");
 	return pinf;
    }
	
	public InfoData setInfoData(Integer id, String dfnName,String defvalue) {
    	InfoData inf =new InfoData();
    	inf.setDfnId(id);
    	inf.setDfnName(dfnName);
    	inf.setDfnVal(defvalue);
    	return inf;	
             }

	
	public PartnerInfo setrPartnerInfo()
    {
    	InfoData inf =setInfoData(1,"First Name", "Santosh");
    	InfoData inf2 =setInfoData(2,"Last Name", "Haller");
    	InfoData inf3=setInfoData(3,"Email", "santosh.haller@subex.com");
    	InfoData inf4 =setInfoData(4,"Company Name", "subex");
    	List<InfoData> infos = new ArrayList<>();
    	infos.add(inf);
    	infos.add(inf2);
    	infos.add(inf3);
    	infos.add(inf4);   	
    	PartnerInfo partnerInfo= new PartnerInfo();
    	partnerInfo.setProfileName("SMS");
    	partnerInfo.setInfoData(infos);  	
    	return partnerInfo;
    }
	
	public List<DefinitionEntity>  setDefinitionEntityList()
	{
		DefinitionEntity df1= setDefinitionEntity(1,"First Name","input");
    	DefinitionEntity df2= setDefinitionEntity(2,"Last Name","input");
    	DefinitionEntity df3= setDefinitionEntity(3,"Email","input");
    	DefinitionEntity df4= setDefinitionEntity(4,"Company Name","input");  	
    	List<DefinitionEntity> definitions = new ArrayList<>();
    	definitions.add(df1);
    	definitions.add(df2);
    	definitions.add(df3);
    	definitions.add(df4);
    	return definitions;
	}
	
	@Test
	void getpartnerinfoentitiesTest()
	{		    		 
	    	PartnerInfoEntity pinf=partnerInfoEntity();		   
	    	DefinitionEntity df1= setDefinitionEntity(1,"First Name","input");
	    	DefinitionEntity df2= setDefinitionEntity(2,"Last Name","input");
	    	DefinitionEntity df3= setDefinitionEntity(3,"Email","input");
	    	DefinitionEntity df4= setDefinitionEntity(4,"Company Name","input");  
	    	InfoDataEntity inf =setInfoDataEntity(1, "Santosh", pinf, null);
			inf.setDefinitionEntity(df1);	
	    	InfoDataEntity inf2 =setInfoDataEntity(2, "Haller", pinf, null);
	    	inf2.setDefinitionEntity(df2);
	    	InfoDataEntity inf3 =setInfoDataEntity(3, "santosh.haller@subex.com", pinf, null);
	    	inf3.setDefinitionEntity(df3);
	    	InfoDataEntity inf4 =setInfoDataEntity(4, "Subex", pinf, null);
	    	inf4.setDefinitionEntity(df4);
	    	List<InfoDataEntity> infodatas = new ArrayList<>();
	    	infodatas.add(inf);
	    	infodatas.add(inf2);
	    	infodatas.add(inf3);
	    	infodatas.add(inf4);	    		    	
	    	pinf.setInfos(infodatas);
	    	//pinf.setRegistrationCode("1111");
	    	
		List<PartnerInfoEntity> tempPiList =new ArrayList<>();
		tempPiList.add(pinf);
		when(partnerInfoEntityRepositoryMock.findAllInWorkflow()).thenReturn(tempPiList);
    	when(partnerInfoEntityRepositoryMock.findByRequest("1111")).thenReturn(tempPiList);
		when(partnerInfoEntityRepositoryMock.findAll()).thenReturn(tempPiList);
						
	   ResponseEntity<List<PartnerInfo>> responsEnt =partnerInfoService.getpartnerinfoentities("1111",false);
	   for (PartnerInfo p :responsEnt.getBody())
	    {
	    assertEquals(pinf.getProfileName(),p.getProfileName() );
	    }

	}
	 
	
	 @Test
	 void getpartnerInfoEntityTest()
	{
		PartnerInfoEntity pinf=partnerInfoEntity();
		DefinitionEntity df1= setDefinitionEntity(1,"First Name","input");
    	DefinitionEntity df2= setDefinitionEntity(2,"Last Name","input");
    	DefinitionEntity df3= setDefinitionEntity(3,"Email","input");
    	DefinitionEntity df4= setDefinitionEntity(4,"Company Name","input");  
		InfoDataEntity inf =setInfoDataEntity(1, "Santosh", pinf, null);
		inf.setDefinitionEntity(df1);	
    	InfoDataEntity inf2 =setInfoDataEntity(2, "Haller", pinf, null);
    	inf2.setDefinitionEntity(df2);
    	InfoDataEntity inf3 =setInfoDataEntity(3, "santosh.haller@subex.com", pinf, null);
    	inf3.setDefinitionEntity(df3);
    	InfoDataEntity inf4 =setInfoDataEntity(4, "Subex", pinf, null);
    	inf4.setDefinitionEntity(df4);
    	
    	List<InfoDataEntity> infodatas = new ArrayList<>();
    	infodatas.add(inf);
    	infodatas.add(inf2);
    	infodatas.add(inf3);
    	infodatas.add(inf4);	    		    	
    	pinf.setInfos(infodatas);
		Optional<PartnerInfoEntity> partnerInfoEntityOpt = Optional.of(pinf);
		when(partnerInfoEntityRepositoryMock.findById(23)).thenReturn(partnerInfoEntityOpt);
		ResponseEntity<PartnerInfo> responsEnt =partnerInfoService.getpartnerInfoEntity("23");
		
	  assertEquals(pinf.getProfileName(),responsEnt.getBody().getProfileName() );
	}
	
	@Test
    void updatepartnerInfoEntityTest()
	{
	
		PartnerInfoEntity pinf=partnerInfoEntity();				
		List<DefinitionEntity> definitions =setDefinitionEntityList();
    	List<InfoDataMapper> infolist= new ArrayList<>();  	
    	InfoDataEntity inf =setInfoDataEntity(1, "Santosh", pinf, null);
    	
    	InfoDataEntity inf2 =setInfoDataEntity(2, "Haller", pinf, null);
    	InfoDataEntity inf3 =setInfoDataEntity(3, "santosh.haller@subex.com", pinf, null);
    	InfoDataEntity inf4 =setInfoDataEntity(4, "Subex", pinf, null);
    	List<InfoDataEntity> infodatas = new ArrayList<>();
    	infodatas.add(inf);
    	infodatas.add(inf2);
    	infodatas.add(inf3);
    	infodatas.add(inf4);
    	pinf.setInfos(infodatas);

		Optional<PartnerInfoEntity> partnerInfoEntityOpt = Optional.of(pinf);
		when(partnerInfoEntityRepositoryMock.findById(23)).thenReturn(partnerInfoEntityOpt);
		when(definitionRepositoryMock.findAll()).thenReturn(definitions);
		when(infoDataEntityRepositoryMock.findAllInfoDataEntityByPrt(pinf)).thenReturn(infolist);		
		when(partnerInfoEntityRepositoryMock.findByDfnName("","",23)).thenReturn(partnerInfoEntityOpt);
		when(partnerInfoEntityRepositoryMock.save(pinf)).thenReturn(pinf);
		when(infoDataEntityRepositoryMock.saveAll(infodatas)).thenReturn(infodatas);
				
		    PartnerInfo partnerInfo= setrPartnerInfo();
		    Response response = new Response();
			response.setStatus(null);
			response.setStatusCode(HttpStatus.ACCEPTED+""); 
			ResponseEntity<Response> responsEntExpec =new ResponseEntity<>(response, HttpStatus.ACCEPTED);
			
		 ResponseEntity<Response> responsEnt =partnerInfoService.updatepartnerInfoEntity("23",partnerInfo,"1");
		 assertEquals(responsEntExpec, responsEnt);
		}
	
	
	@Test
	void getScorableDefinitionsTest()
	{
		List<DefinitionEntity> definitions =setDefinitionEntityList();
		when(definitionRepositoryMock.findAllScorableDfnsForProfile("SMS")).thenReturn(definitions);
				
		ResponseEntity<List<Definition>> responsEnt =partnerInfoService.getScorableDefinitions("SMS");
		for (Definition dfn :responsEnt.getBody())
		{
			if(dfn.getDfnName().equalsIgnoreCase("First Name"))
			      assertEquals("First Name",dfn.getDfnName() );
		}
	}
	
	@Test
	void updatePartnerWorkflowStatusTest()
	{
		
		PartnerInfoEntity pinf=partnerInfoEntity();	
		InfoDataEntity inf =setInfoDataEntity(1, "Santosh", pinf, null);
		DefinitionEntity df1= setDefinitionEntity(1,"First Name","input");
		inf.setDefinitionEntity(df1);
    	InfoDataEntity inf2 =setInfoDataEntity(2, "Haller", pinf, null);
    	DefinitionEntity df2= setDefinitionEntity(2,"Last Name","input");
    	inf2.setDefinitionEntity(df2);
    	InfoDataEntity inf3 =setInfoDataEntity(3, "santosh.haller@subex.com", pinf, null);
    	DefinitionEntity df3= setDefinitionEntity(3,"Email","input");
    	inf3.setDefinitionEntity(df3);
    	InfoDataEntity inf4 =setInfoDataEntity(4, "Subex", pinf, null);
    	DefinitionEntity df4= setDefinitionEntity(4,"Company Name","input");
    	inf4.setDefinitionEntity(df4);
    	List<InfoDataEntity> infodatas = new ArrayList<>();
    	infodatas.add(inf);
    	infodatas.add(inf2);
    	infodatas.add(inf3);
    	infodatas.add(inf4);
    	pinf.setInfos(infodatas);
    	pinf.setRegistrationCode("1234");
    	
    	
    	UserInfoMapper userInfo = new UserInfoMapper();
    	userInfo.setUserForename("Robin");
    	userInfo.setUserSurname("hood");
    	userInfo.setUserEmail("santosh.haller@subex.com");
    	UserInfoMapper[] users= {userInfo};
    	
		Optional<PartnerInfoEntity> partnerInfoEntityOpt = Optional.of(pinf);
		when(partnerInfoEntityRepositoryMock.findById(23)).thenReturn(partnerInfoEntityOpt);
		when(partnerInfoEntityRepositoryMock.save(pinf)).thenReturn(pinf);
		
		ResponseEntity<UserInfoMapper[]> restTemplateResp =new ResponseEntity<>(users, HttpStatus.OK);
		Mockito.when(restTemplateMock.getForEntity("http://127.0.0.1:8086/api/userinfos/getuserinfos?teamName="+"Admin",UserInfoMapper[].class)).thenReturn(restTemplateResp);
//		Mockito.when(restTemplateMock.getForEntity(ArgumentMatchers.eq("http://127.0.0.1:8086/api/userinfos/getuserinfos?teamName=Admin"),ArgumentMatchers.any(UserInfoMapper[].class))).thenReturn(restTemplateResp);
		
		
	    Response response = new Response();
		response.setStatus("success");
		response.setStatusCode(HttpStatus.ACCEPTED+""); 
		ResponseEntity<Response> responsEntExpec =new ResponseEntity<>(response, HttpStatus.ACCEPTED);
		
		PartnerModel partnerModel=new PartnerModel();
		partnerModel.setTeamName("Admin");
		partnerModel.setStatusInWorkstep("onhold");
		
	 ResponseEntity<Response> responsEnt =partnerInfoService.updatePartnerWorkflowStatus(partnerModel,"23");
	 assertEquals(responsEntExpec, responsEnt);

	 // To test workflow
	 PartnerModel partnerModelWorkflow=new PartnerModel();
	 partnerModelWorkflow.setTeamName("Admin");
	 partnerModelWorkflow.setStatusInWorkstep("inprogress");
	 partnerModelWorkflow.setAction("movetomybucket");
		
	 ResponseEntity<Response> responsEntWorkflow =partnerInfoService.updatePartnerWorkflowStatus(partnerModelWorkflow,"23");
	 assertEquals(responsEntExpec, responsEntWorkflow);
	 
	 
	 partnerModelWorkflow.setTeamName(null);
	 partnerModelWorkflow.setActorId("Admin");

	 ResponseEntity<Response> responsEntWorkflow1 =partnerInfoService.updatePartnerWorkflowStatus(partnerModelWorkflow,"23");
	 assertEquals(responsEntExpec, responsEntWorkflow1);
	}
	
	@Test
	void updatePartnerScoreTest()
	{
		PartnerInfoEntity pinf=partnerInfoEntity();	
			
		InfoDataEntity inf =setInfoDataEntity(1, "Santosh", pinf, null);
    	InfoDataEntity inf2 =setInfoDataEntity(2, "Haller", pinf, null);
    	InfoDataEntity inf3 =setInfoDataEntity(3, "santosh.haller@subex.com", pinf, null);
    	InfoDataEntity inf4 =setInfoDataEntity(4, "Subex", pinf, null);
    	List<InfoDataEntity> infodatas = new ArrayList<>();
    	infodatas.add(inf);
    	infodatas.add(inf2);
    	infodatas.add(inf3);
    	infodatas.add(inf4);
    	pinf.setInfos(infodatas);
    	Optional<PartnerInfoEntity> partnerInfoEntityOpt = Optional.of(pinf);
		when(partnerInfoEntityRepositoryMock.findById(1)).thenReturn(partnerInfoEntityOpt);
		
		List<DefinitionEntity> definitions =setDefinitionEntityList();
		when(definitionRepositoryMock.findAll()).thenReturn(definitions);
		List<InfoDataMapper> infolist= new ArrayList<>();  	
		when(infoDataEntityRepositoryMock.findAllInfoDataEntityByPrt(pinf)).thenReturn(infolist);
		when(partnerInfoEntityRepositoryMock.save(pinf)).thenReturn(pinf);
		when(infoDataEntityRepositoryMock.saveAll(infodatas)).thenReturn(infodatas);
		Response response = new Response();
		response.setStatus("success");
		response.setStatusCode(HttpStatus.ACCEPTED+""); 
		PartnerInfo partnerInfo= setrPartnerInfo();
		partnerInfo.setPartnerId(1);
		ResponseEntity<Response> responsEntExpec =new ResponseEntity<>(response, HttpStatus.ACCEPTED);
		ResponseEntity<Response> responsEnt =partnerInfoService.updatePartnerScore(partnerInfo,"");
		assertEquals(responsEntExpec, responsEnt);
		
	}
	
	@Test
	void createCheckListDataTest()	
	{
		CheckListEntity checkListEntity =new CheckListEntity();
		CheckListModel checkListModel= new CheckListModel();
		Optional<CheckListEntity> checklistEntOpt =Optional.of(checkListEntity);
		when(checkListRepositoryMock.findByName("","",1)).thenReturn(checklistEntOpt);
		when(checkListRepositoryMock.save(checkListEntity)).thenReturn(checkListEntity);
		
		Response response = new Response();
		response.setStatus("success");
		response.setStatusCode(HttpStatus.CREATED+"");
		
		ResponseEntity<Response> responsEntExpec =new ResponseEntity<>(response, HttpStatus.CREATED);
		ResponseEntity<Response> responsEnt =partnerInfoService.createCheckListData(checkListModel);
		assertEquals(responsEntExpec, responsEnt);
	}
	

	@Test
	void getCheckListDataTest()	
	{
		CheckListEntity checkListEntity =new CheckListEntity();
		checkListEntity.setId((long) 1);
		checkListEntity.setTeamName("Admin");
		checkListEntity.setCheckFlag(true);
		
		List<CheckListEntity>  checkListEnities= new ArrayList<>();
		when(checkListRepositoryMock.findAllCheckListsByPartner(1,"")).thenReturn(checkListEnities);
	
		ResponseEntity<List<CheckListModel>> responsEnt =partnerInfoService.getCheckListData(1,"");
		
		for(CheckListModel cm:responsEnt.getBody())
		{
			assertEquals("Admin", cm.getTeamName());
		}
		
	}
	
	@Test
	void getPartnersInfoPaginatedPostTest()	
	{
		
		//when(partnerInfoEntityRepositoryMock.findAll(paging)).thenReturn();
	//	ResponseEntity<Response> responsEntExpec =new ResponseEntity<>(pagedPartnerInfoEntities, HttpStatus.OK);
		ResponseEntity<PagedPartnerInfoEntities> responsEnt =partnerInfoService.getPartnersInfoPaginatedPost(1,10,null,null,"","",null);
		assertEquals(null, responsEnt);
		
	
	
	}
	
}

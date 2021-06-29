package com.subex.partnermanagement.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.dozer.DozerBeanMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.subex.ngp.audit.trail.lib.AuditEventModel;
import com.subex.partnermanagement.api.PartnerinfosApiDelegate;
import com.subex.partnermanagement.entity.CheckListEntity;
import com.subex.partnermanagement.entity.DefinitionEntity;
import com.subex.partnermanagement.entity.InfoDataEntity;
import com.subex.partnermanagement.entity.PartnerBlockchainEntity;
import com.subex.partnermanagement.entity.PartnerInfoEntity;
import com.subex.partnermanagement.exception.NoUserExistException;
import com.subex.partnermanagement.exception.PartnerAlreadyExistException;
import com.subex.partnermanagement.helper.BlockchainOrgRegisterResponse;
import com.subex.partnermanagement.helper.EmailModel;
import com.subex.partnermanagement.helper.InfoDataMapper;
import com.subex.partnermanagement.helper.UserInfoMapper;
import com.subex.partnermanagement.model.BlockChainModel;
import com.subex.partnermanagement.model.CheckListModel;
import com.subex.partnermanagement.model.Definition;
import com.subex.partnermanagement.model.FilterMap;
import com.subex.partnermanagement.model.InfoData;
import com.subex.partnermanagement.model.PagedPartnerInfoEntities;
import com.subex.partnermanagement.model.PartnerBlockchainModel;
import com.subex.partnermanagement.model.PartnerInfo;
import com.subex.partnermanagement.model.PartnerModel;
import com.subex.partnermanagement.model.Response;
import com.subex.partnermanagement.repository.BlockchainRepository;
import com.subex.partnermanagement.repository.CheckListRepository;
import com.subex.partnermanagement.repository.CustomizedPartnerInfoRepository;
import com.subex.partnermanagement.repository.DefinitionRepository;
import com.subex.partnermanagement.repository.InfoDataEntityRepository;
import com.subex.partnermanagement.repository.PartnerInfoEntityRepository;
import com.subex.partnermanagement.utility.BillingAccount;
import com.subex.partnermanagement.utility.PartnerInfoUtility;

@Service
public class PartnerInfoService implements PartnerinfosApiDelegate {
	private static final Logger LOGGER = LoggerFactory.getLogger(PartnerInfoService.class);
	@Autowired
	PartnerInfoEntityRepository partnerInfoEntityRepository;
	
	@Autowired
	@Qualifier(value = "customizedImpl")
	CustomizedPartnerInfoRepository customizedUserRepository ;

	@Autowired
	InfoDataEntityRepository infoDataEntityRepository;

	@Autowired
	DefinitionRepository definitionRepository;

	@Autowired
	CheckListRepository checkListRepository;

	@Autowired
	BlockchainRepository blockchainRepository;

	@Autowired
	PartnerInfoUtility partnerInfoUtility;

	@Autowired
	@Qualifier(value = "psbilling")
	BillingAccount billingAccount;

	DozerBeanMapper mapper = new DozerBeanMapper();

	@Value("${firstName}")
	private String partnerFirstName;

	@Value("${lastName}")
	private String partnerLastName;

	@Value("${email}")
	private String email;

	@Value("${file}")
	private String file;

	@Value("${multiselect}")
	private String multiselect;

	@Value("${registrationCode.prefix}")
	private String regCodePrefix;

	@Value("${definition.duplicateCheck.keys}")
	private List<String> defNames;

	@Value("${emailSubject}")
	private String emailSubject;

	@Value("${rejectedEmailSubject}")
	private String rejectedEmailSubject;

	@Value("${reviewEmailText}")
	private String reviewEmailText;

	@Value("${rejectedEmailText}")
	private String rejectedEmailText;

	@Value("${workflowSubject.approve}")
	private String emailSubjectForWorkflow;

	@Value("${workflowSubject.requestMoreInfo}")
	private String requestMoreInfo;

	@Value("${emailTextToTeam}")
	private String emailTextToTeam;

	@Value("${scoreApiURL}")
	private String scoreApiURL;

	@Value("${emailSubjectActive}")
	private String emailSubjectActive;

	@Value("${setPasswordUrl}")
	private String setPasswordUrl;

	@Value("${partnerscoringRequired}")
	private Boolean partnerscoringRequired;

	@Value("${userDetailsByTeamUrl}")
	private String userDetailsByTeamUrl;

	@Value("${userDetailsByFilterUrl}")
	private String userDetailsByFilterUrl;

	@Value("${companyName}")
	private String companyName;

	@Value("${emailSubjectToAdmin}")
	private String emailSubjectToAdmin;

	@Value("${emailTextToAdmin}")
	private String emailTextToAdmin;

	@Value("${statusForScore}")
	private List<String> statusForScore;

	@Value("${registerBlockchain.url}")
	private String getRegisterBlockchainUrl;

	@Value("${blockchainStatus.url}")
	private String getBlockChainStatus;

	@Value("${isAccountRequired}")
	private Boolean isAccountRequired;
	
	@Value("${isWorkflowRequired}")
	private Boolean isWorkflowRequired;

	private static final String SUCCESS = "success";
	private static final String CREATEDDATESTR = "createdDate";
	private static final String PROFILENAMESTR = "profileName";
	private static final String STATUSSTR = "status";
	private static final String PARTNERIDSTR = "partnerId";

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<List<PartnerInfo>> getpartnerinfoentities(String requestNumber, Boolean isWorkflow) {
		List<PartnerInfo> piList = new ArrayList<>();
		List<PartnerInfoEntity> tempPiList = null;
		if (isWorkflow != null && isWorkflow)
			tempPiList = partnerInfoEntityRepository.findAllInWorkflow();
		else if (requestNumber != null)
			tempPiList = partnerInfoEntityRepository.findByRequest(requestNumber);
		else
			tempPiList = partnerInfoEntityRepository.findAll();

		tempPiList.forEach(tempPIEnt -> {
			PartnerInfo partnerInfo = mapper.map(tempPIEnt, PartnerInfo.class);
			Collection<InfoDataEntity> idEntityList = tempPIEnt.getInfos();
			if (idEntityList != null)
				partnerInfo.setInfoData(idEntityList.stream().map(entry -> {
					InfoData ifd = new InfoData();
					ifd.setDfnId(Integer.valueOf(entry.getDefinitionEntity().getDfnId().intValue()));
					ifd.setDfnName(entry.getDefinitionEntity().getDfnName());
					ifd.setDfnVal(entry.getDfnVal());
					if (file.equalsIgnoreCase(entry.getDefinitionEntity().getFieldType())) {
						if (entry.getDfnBlobVal() != null) {
							byte[] base64String = Base64.getEncoder().encode(entry.getDfnBlobVal());
							ifd.setDfnVal(entry.getDfnBlobType() + "," + new String(base64String));
						}
					}
					if (multiselect.equalsIgnoreCase(entry.getDefinitionEntity().getFieldType())) {
						ifd.setDfnVal(multiselect + "#&#" + entry.getDfnVal());
					}
					ifd.setWebScrap(entry.getDefinitionEntity().getWebScrap());
					return ifd;
				}).collect(Collectors.toList()));
			piList.add(partnerInfo);
		});
		
		if (isWorkflow != null && isWorkflow)
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Fetch list PartnerInfos", "Fetching All list of PartnerInfos for in workflow.", "success");
		else if (requestNumber != null)
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Fetch list PartnerInfos", "Fetching All list of PartnerInfos for request number :"+requestNumber, "success");
		else
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Fetch list PartnerInfos", "Fetching All list of PartnerInfos.", "success");
		return new ResponseEntity<>(piList, HttpStatus.OK);
	}
	
	

	
	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<PagedPartnerInfoEntities> getPartnersInfoPaginatedPost(Integer firstIndex,
	        Integer lastIndex,
	        List<String> filterProfile,
	        List<String> filterStatus,
	        String filterCreatedFromDate,
	        String filterCreatedToDate,
	        List<FilterMap> filterMap) {
		PagedPartnerInfoEntities pagedPartnerInfoEntities = new PagedPartnerInfoEntities();
		int countPerPage = lastIndex - firstIndex;
		int pageNo = lastIndex / countPerPage;
		List<PartnerInfo> piList = new ArrayList<>();
		Page<PartnerInfoEntity> pagedResult;
		try {
			Pageable paging = PageRequest.of(pageNo - 1, countPerPage, Sort.by(CREATEDDATESTR).descending());
			if (filterMap == null && filterStatus == null  && filterProfile == null
					&& filterCreatedFromDate.equals("") && filterCreatedToDate.equals("")) {
				pagedResult = partnerInfoEntityRepository.findAll(paging);
			} else {
				pagedResult = filteredPartners(filterProfile, filterStatus, filterCreatedFromDate, filterCreatedToDate, filterMap,
						paging);
			}
			pagedResult.forEach(tempPIEnt -> {
				PartnerInfo partnerInfo = mapper.map(tempPIEnt, PartnerInfo.class);
				Collection<InfoDataEntity> idEntityList = tempPIEnt.getInfos();
				if (idEntityList != null)
					partnerInfo.setInfoData(idEntityList.stream().map(entry -> {
						InfoData ifd = new InfoData();
						ifd.setDfnId(Integer.valueOf(entry.getDefinitionEntity().getDfnId().intValue()));
						ifd.setDfnName(entry.getDefinitionEntity().getDfnName());
						ifd.setDfnVal(entry.getDfnVal());
						if (file.equalsIgnoreCase(entry.getDefinitionEntity().getFieldType())) {
							if (entry.getDfnBlobVal() != null) {
								byte[] base64String = Base64.getEncoder().encode(entry.getDfnBlobVal());
								ifd.setDfnVal(entry.getDfnBlobType() + "," + new String(base64String));
							}
						}
						if (multiselect.equalsIgnoreCase(entry.getDefinitionEntity().getFieldType())) {
							ifd.setDfnVal(multiselect + "#&#" + entry.getDfnVal());
						}
						ifd.setWebScrap(entry.getDefinitionEntity().getWebScrap());
						return ifd;
					}).collect(Collectors.toList()));
				piList.add(partnerInfo);
				pagedPartnerInfoEntities.setPartnerInfos(piList);
				pagedPartnerInfoEntities.setTotalPages((int) pagedResult.getTotalPages());
				pagedPartnerInfoEntities.setTotalPartners((int) pagedResult.getTotalElements());
			});
		} catch (Exception e) {
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Fetch list Paged PartnerInfos", "Fetching All list of PartnerInfos failed. "+e.getMessage(), "failure");
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
		AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Fetch list Paged PartnerInfos", "Fetching All list of PartnerInfos from :"+pageNo+" page.", "success");
		return new ResponseEntity<PagedPartnerInfoEntities>(pagedPartnerInfoEntities, HttpStatus.OK);

	}
	
	private Page<PartnerInfoEntity> filteredPartners(List<String> filterProfile, List<String> filterStatus,
			String filterCreatedFromDate, String filterCreatedToDate, List<FilterMap> filterMap, Pageable paging) {
		List<Specification<PartnerInfoEntity>> specifications = new LinkedList<>();
		if(filterMap != null && !filterMap.isEmpty()) {
			specifications.add(inFoDataFilters(filterMap));
		}
		if (filterStatus != null && !filterStatus.isEmpty()) {
			specifications.add(inFilterStatus(filterStatus));
		}
		if (filterProfile != null && !filterProfile.isEmpty()) {
			specifications.add(inFilterProfile(filterProfile));
		}
		if(!filterCreatedFromDate.equals("") && !filterCreatedToDate.equals("")) {
			specifications.add(inFilterBetweenFromToDate(filterCreatedFromDate, filterCreatedToDate));
		}
		else {
			if(!filterCreatedFromDate.equals("")) {
				specifications.add(inFilterFromDate(filterCreatedFromDate));
			}
			if(!filterCreatedToDate.equals("")) {
				specifications.add(inFilterToDate(filterCreatedToDate));
			}
		}
		if (specifications.isEmpty()) {
			return partnerInfoEntityRepository.findAll(paging);
		} else {
			Specification<PartnerInfoEntity> query = Specification.where(specifications.remove(0));
			for (Specification<PartnerInfoEntity> partnerSpecification : specifications) {
				query = query.and(partnerSpecification);
			}
			return partnerInfoEntityRepository.findAll(query, paging);
		}
	}

	private Specification<PartnerInfoEntity> inFoDataFilters(List<FilterMap> allFilters) {
		StringBuilder sbQuery = new StringBuilder();
		sbQuery.append("SELECT i.partnerInfoEntity.partnerId FROM InfoDataEntity i WHERE ");
		for (int i=0; i < allFilters.size(); i++) 
		{ 
			sbQuery.append("(");
			sbQuery.append("i.definitionEntity.dfnId IN ( SELECT d.dfnId FROM DefinitionEntity d WHERE d.dfnName LIKE '%");
			sbQuery.append(allFilters.get(i).getFilterKey());
			sbQuery.append("%' AND UPPER(i.dfnVal) LIKE '%");
			sbQuery.append(allFilters.get(i).getFilterValue().toUpperCase());
			sbQuery.append("%') ");
			sbQuery.append(") ");
			if (i != allFilters.size() - 1) {
				sbQuery.append("AND ");
			}
		}
		List<Integer> partnerId =  customizedUserRepository.filteredSearchTextPartners(sbQuery.toString());
		return (partner, cq, cb) -> partner.get(PARTNERIDSTR).in(partnerId);
	}
	
	private Specification<PartnerInfoEntity> inFilterStatus(List<String> status) {
		return (partner, cq, cb) -> partner.get(STATUSSTR).in(status);
	}

	private Specification<PartnerInfoEntity> inFilterProfile(List<String> profileName) {
		return (partner, cq, cb) -> partner.get(PROFILENAMESTR).in(profileName);
	}
	
	@SuppressWarnings("deprecation")
	private Specification<PartnerInfoEntity> inFilterFromDate(String createdDate) {
		return (partner, cq, cb) -> cb.greaterThanOrEqualTo(partner.<Date>get(CREATEDDATESTR), new Date(createdDate));
	}
	
	@SuppressWarnings("deprecation")
	private Specification<PartnerInfoEntity> inFilterToDate(String createdDate) {
		return (partner, cq, cb) -> cb.lessThanOrEqualTo(partner.<Date>get(CREATEDDATESTR), new Date(createdDate));
	}
	
	@SuppressWarnings("deprecation")
	private Specification<PartnerInfoEntity> inFilterBetweenFromToDate(String fromDate, String toDate) {
		return (partner, cq, cb) -> cb.between(partner.<Date>get(CREATEDDATESTR), new Date(fromDate), new Date(toDate));
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<PartnerInfo> getpartnerInfoEntity(String partnerinfoId) {

		Optional<PartnerInfoEntity> opnEnt = partnerInfoEntityRepository.findById(Integer.parseInt(partnerinfoId));
		if (opnEnt.isPresent()) {
			PartnerInfoEntity ent = opnEnt.get();
			PartnerInfo partnerInfo = mapper.map(ent, PartnerInfo.class);
			List<InfoDataEntity> infoDataEntryList = new ArrayList<>(ent.getInfos());

			List<InfoData> infoDataList = new ArrayList<>();
			infoDataEntryList.forEach((entry) -> {
				InfoData ifd = new InfoData();
				ifd.setDfnId(entry.getDefinitionEntity().getDfnId().intValue());
				ifd.setDfnName(entry.getDefinitionEntity().getDfnName());
				ifd.setDfnVal(entry.getDfnVal());
				if (file.equalsIgnoreCase(entry.getDefinitionEntity().getFieldType())) {
					if (entry.getDfnBlobVal() != null) {
						String base64String = Base64.getEncoder().encodeToString(entry.getDfnBlobVal());
						ifd.setDfnVal(entry.getDfnBlobType() + "," + base64String);
					}
				}
				if (multiselect.equalsIgnoreCase(entry.getDefinitionEntity().getFieldType())) {
					ifd.setDfnVal(multiselect + "#&#" + entry.getDfnVal());
				}
				ifd.setWebScrap(entry.getDefinitionEntity().getWebScrap());
				infoDataList.add(ifd);
			});
			partnerInfo.setInfoData(infoDataList);
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Fetch list PartnerInfos", "Fetching All list of PartnerInfos for "+partnerinfoId, "success");
			return new ResponseEntity<>(partnerInfo, HttpStatus.OK);
		} else {
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Fetch list PartnerInfos", "Fetching All list of PartnerInfos failed."+partnerinfoId+" not found.", "failure");
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<Response> updatepartnerInfoEntity(String partnerinfoId, PartnerInfo partnerInfo,
			String actorId) {

		Optional<PartnerInfoEntity> opnEnt = partnerInfoEntityRepository.findById(Integer.parseInt(partnerinfoId));
		if (opnEnt.isPresent()) {
			PartnerInfoEntity partnerInfoEntity = partnerInfoUtility.updatePartnerEntity(opnEnt.get(), partnerInfo);
			List<InfoDataEntity> infoDataEntries = new ArrayList<>();
			List<DefinitionEntity> defList = definitionRepository.findAll();
			Map<Long, DefinitionEntity> defMap = defList.stream()
					.collect(Collectors.toMap(DefinitionEntity::getDfnId, Function.identity()));
			List<InfoDataMapper> existInfoEntityList = infoDataEntityRepository
					.findAllInfoDataEntityByPrt(partnerInfoEntity);
			Map<Long, Long> map = existInfoEntityList.stream()
					.collect(Collectors.toMap(InfoDataMapper::getDfnId, InfoDataMapper::getInfId));
			Map<String, String> defNameMap = new HashMap<>();
			String firstName = null;
			String lastName = null;
			Map<String, InfoData> defNameToEntityMap = new HashMap<>();
			for (InfoData w : partnerInfo.getInfoData()) {
				defNameMap.put(w.getDfnName(), w.getDfnVal());
				InfoDataEntity ide = partnerInfoUtility.updatePartnerDefinitions(w, map, defMap);
				ide.setPartnerInfoEntity(partnerInfoEntity);
				infoDataEntries.add(ide);
				w.setType(ide.getDefinitionEntity().getFieldType());
				w.setGroupName(ide.getDefinitionEntity().getProfileFieldGroupEntity().getFieldGroupEntity().getFieldGrpName());
				 defNameToEntityMap.put(w.getDfnName(), w);

			}
			List<String> defNameList = new ArrayList<>();
			for (String defName : defNames) {
				Optional<PartnerInfoEntity> partnerInfoEntOpt = partnerInfoEntityRepository
						.findByDfnName(defNameMap.get(defName), defName, Integer.parseInt(partnerinfoId));
				if (partnerInfoEntOpt.isPresent())
					defNameList.add(defName);
			}
			if (!defNameList.isEmpty()) {
				String delim = ",";
				String duplicateFields = String.join(delim, defNameList);
				AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Update PartnerInfos", "Updating partner info for "+partnerinfoId+" by "+actorId+ " has failed. Partner with same" + duplicateFields + " already exist", "failure");
				throw new PartnerAlreadyExistException("Partner with same " + duplicateFields + " already exist!!");
			}

			if (isWorkflowRequired && "underconsideration".equalsIgnoreCase(partnerInfo.getStatus())
					&& partnerInfo.getWfProcessInstanceId() == null) {
				PartnerModel responsePartnerModel = partnerInfoUtility.updateWorkFlowAPIcall(actorId, partnerinfoId);
				partnerInfoEntity.setWfProcessInstanceId(responsePartnerModel.getProcessInstanceId());
				partnerInfoEntity.setWorkStepTeam(responsePartnerModel.getTeamName());
				partnerInfoEntity.setStatusInWorkStepTeam("inprogress");
				partnerInfoEntityRepository.save(partnerInfoEntity);
			}
			Response response = new Response();
			if (("underconsideration".equalsIgnoreCase(partnerInfo.getStatus())
					&& !("underconsideration".equalsIgnoreCase(partnerInfoEntity.getEmailSerivice())))
					|| ("rejected".equalsIgnoreCase(partnerInfo.getStatus())
							&& !("rejected".equalsIgnoreCase(partnerInfoEntity.getEmailSerivice())))) {
				String emailId = defNameMap.get(email);
				firstName = defNameMap.get(partnerFirstName);
				lastName = defNameMap.get(partnerLastName);
				EmailModel emailModel = new EmailModel();
				emailModel.setFirstName(firstName);
				emailModel.setLastName(lastName);
				if ("underconsideration".equalsIgnoreCase(partnerInfo.getStatus())) {
					emailModel.setEmailSubject(emailSubject);
					emailModel.setEmailText(reviewEmailText);
				}
				if ("rejected".equalsIgnoreCase(partnerInfo.getStatus())) {
					emailModel.setEmailSubject(rejectedEmailSubject);
					emailModel.setEmailText(rejectedEmailText);
				}
				PartnerInfoEntity partnerInfoEmailObj = partnerInfoUtility.emailServiceValidation(emailId, emailModel,
						partnerInfo.getStatus());
				partnerInfoEntity.setRegistrationCode(partnerInfoEmailObj.getRegistrationCode());
				if ("".equalsIgnoreCase(partnerInfoEmailObj.getEmailSerivice())) {
					response.setStatus("emailServiceDown");
					partnerInfoEntity.setEmailSerivice("emailSeviceDown");
				} else if ("failed".equalsIgnoreCase(partnerInfoEmailObj.getEmailSerivice())) {
					response.setStatus("invalidMailId");
					partnerInfoEntity.setEmailSerivice(partnerInfoEmailObj.getEmailSerivice());
				} else {
					response.setStatus(SUCCESS);
					partnerInfoEntity.setEmailSerivice(partnerInfoEmailObj.getEmailSerivice());
				}
			}

			if ("active".equalsIgnoreCase(partnerInfo.getStatus())) {
				String partnerMailId = defNameMap.get(email);
				firstName = defNameMap.get(partnerFirstName);
				lastName = defNameMap.get(partnerLastName);

				// User creation flow starts here
				if (!("active".equalsIgnoreCase(partnerInfoEntity.getEmailSerivice()))) {
					String userName = partnerMailId.substring(0, partnerMailId.lastIndexOf('.'));
					partnerInfoEntity.setUserName(userName);
					UserInfoMapper checkUserInfo = partnerInfoUtility.getUserDetailsAPIcall(partnerMailId,
							userDetailsByFilterUrl);
					if(null == checkUserInfo) {
						partnerInfoUtility.createUser(defNameMap, actorId, userName, partnerInfo.getProfileName());
					}
					LOGGER.error("flag isAccountRequired : "+ isAccountRequired);
					if (isAccountRequired) {
						InfoData infoData=new InfoData();
						infoData.setDfnName("lob");
						infoData.setDfnVal(partnerInfo.getProfileName());
						defNameToEntityMap.put("lob", infoData);
						billingAccount.createAccount(defNameToEntityMap, userName, defNameMap.get(companyName));
					}

					UserInfoMapper userInfo = partnerInfoUtility.getUserDetailsAPIcall(partnerMailId,
							userDetailsByFilterUrl);

					if ((userInfo != null)) {
						String encrUserName = new String(Base64.getEncoder().encode(userInfo.getUserName().getBytes()));
						String reformedUrl = setPasswordUrl + encrUserName;
						EmailModel emailModel = new EmailModel();
						emailModel.setFirstName(firstName);
						emailModel.setLastName(lastName);
						emailModel.setUserName(userInfo.getUserName());
						emailModel.setEmailSubject(emailSubjectActive);
						emailModel.setReformedUrl(reformedUrl);
						PartnerInfoEntity pObj = partnerInfoUtility.emailServiceValidation(partnerMailId, emailModel,
								partnerInfo.getStatus());
						partnerInfoEntity.setEmailSerivice(pObj.getEmailSerivice());
					} else {
						LOGGER.error("User Info could not fetched for email id :"+ partnerMailId);
						AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Update PartnerInfos", "Updating partner info for "+partnerinfoId+" by "+actorId+ " has failed. User does not exist", "failure");
						throw new NoUserExistException("User does not exist!!");
					}
				}
			}
			partnerInfoEntityRepository.save(partnerInfoEntity);
			infoDataEntityRepository.saveAll(infoDataEntries);
			if (partnerscoringRequired && statusForScore.contains(partnerInfo.getStatus())) {
				partnerInfoUtility.partnerScoringAPIcall(Integer.parseInt(partnerinfoId), partnerInfo.getProfileName(),
						scoreApiURL);
			}

			response.setStatusCode(HttpStatus.ACCEPTED + "");
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Update PartnerInfos", "Updating partner info for "+partnerinfoId+" by "+actorId, "success");
			return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
		} else {
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Update PartnerInfos", "Updating partner info for "+partnerinfoId+" by "+actorId+ " has failed.", "failure");
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<List<Definition>> getScorableDefinitions(String profileName) {
		List<Definition> definitionList = new ArrayList<>();
		List<DefinitionEntity> dfns = definitionRepository.findAllScorableDfnsForProfile(profileName);
		dfns.forEach(dfn -> {
			Definition definition = mapper.map(dfn, Definition.class);
			definition.setIsWebScrap(dfn.getWebScrap());
			definition.setIsMandatory(dfn.getIsMandatory());
			definitionList.add(definition);
		});
		AuditEventModel.callAuditLog("DEFINITION-ENTITY", "Get Scorable Definition", "Fetching scorable definitions for profile name : "+ profileName, "success");
		return new ResponseEntity<>(definitionList, HttpStatus.OK);
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<Response> updatePartnerWorkflowStatus(PartnerModel partnerModel, String partnerId) {
		Optional<PartnerInfoEntity> opnEnt = partnerInfoEntityRepository.findById(Integer.parseInt(partnerId));
		if (opnEnt.isPresent()) {
			PartnerInfoEntity partnerInfoEntity = opnEnt.get();
			partnerInfoEntity.setStatusInWorkStepTeam(partnerModel.getStatusInWorkstep());
			partnerInfoEntity.setWorkStepTeam(partnerModel.getTeamName());
			List<InfoDataEntity> list = partnerInfoEntity.getInfos().stream().collect(Collectors.toList());
			Map<String, String> defNameMap = new HashMap<>();
			for (InfoDataEntity w : list) {
				defNameMap.put(w.getDefinitionEntity().getDfnName(), w.getDfnVal());
			}

			String emailId = defNameMap.get(email);
			String firstName = defNameMap.get(partnerFirstName);
			String lastName = defNameMap.get(partnerLastName);
			String company = defNameMap.get(companyName);
			String emailText = partnerModel.getEmailBodyContent();
			EmailModel emailModel = new EmailModel();
			if ("onhold".equalsIgnoreCase(partnerModel.getStatusInWorkstep())) {
				UserInfoMapper userInfo = partnerInfoUtility.getUserDetailsAPIcall(partnerModel.getTeamName(),
						userDetailsByTeamUrl);
				emailModel.setFromAddress(userInfo.getUserEmail());
				emailModel.setFirstName(firstName);
				emailModel.setLastName(lastName);
				emailModel.setEmailSubject(requestMoreInfo);
				emailModel.setEmailText(emailText);
				emailModel.setRegistrationCode(partnerInfoEntity.getRegistrationCode());
				partnerInfoUtility.emailServiceValidation(emailId, emailModel, partnerModel.getStatusInWorkstep());
			} else if (!("movetomybucket".equalsIgnoreCase(partnerModel.getAction()))
					&& ("inprogress".equalsIgnoreCase(partnerModel.getStatusInWorkstep()))) {
				UserInfoMapper userInfo = partnerInfoUtility.getUserDetailsAPIcall(partnerModel.getTeamName(),
						userDetailsByTeamUrl);
				emailModel.setFirstName(userInfo.getUserForename());
				emailModel.setLastName(userInfo.getUserSurname());
				emailModel.setEmailSubject(emailSubjectForWorkflow);
				String emailTextBody = String.format(emailTextToTeam,
						emailModel.getFirstName() + " " + emailModel.getLastName(), emailText,
						firstName + " " + lastName, company);
				emailModel.setEmailText(emailTextBody);
				partnerInfoUtility.sendNotificationToTeam(userInfo.getUserEmail(), emailModel);
			}

			if (partnerModel.getTeamName() == null) {
				UserInfoMapper userInfo = partnerInfoUtility.getUserDetailsAPIcall(partnerModel.getActorId(),
						userDetailsByFilterUrl);
				emailModel.setFirstName(userInfo.getUserForename());
				emailModel.setLastName(userInfo.getUserSurname());
				emailModel.setEmailSubject(emailSubjectToAdmin);
				String emailTextBody = String.format(emailTextToTeam,
						emailModel.getFirstName() + " " + emailModel.getLastName(), emailTextToAdmin,
						firstName + " " + lastName, company);
				emailModel.setEmailText(emailTextBody);
				partnerInfoUtility.sendNotificationToTeam(userInfo.getUserEmail(), emailModel);
			}
			partnerInfoEntityRepository.save(partnerInfoEntity);
			Response response = new Response();
			response.setStatus(SUCCESS);
			response.setStatusCode(HttpStatus.ACCEPTED + "");
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Update PartnerInfos Workflow status", "Updating workflow status for partner id : "+partnerId, "success");
			return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
		} else {
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Update PartnerInfos Workflow status", "Updating workflow status for partner id : "+partnerId+ " has failed.", "failure");
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<Response> updatePartnerScore(PartnerInfo partnerInfo, String scoreType) {
		Optional<PartnerInfoEntity> opnEnt = partnerInfoEntityRepository.findById(partnerInfo.getPartnerId());
		if (opnEnt.isPresent()) {
			PartnerInfoEntity partnerInfoEntity = opnEnt.get();
			partnerInfoEntity.setPostOnBoardScore(partnerInfo.getPostOnBoardScore());
			partnerInfoEntity.setPreOnBoardScore(partnerInfo.getPreOnBoardScore());
			partnerInfoEntity.setModifiedDate(new Date());
			List<InfoDataEntity> infoDataEntries = new ArrayList<>();
			List<DefinitionEntity> defList = definitionRepository.findAll();
			Map<Long, DefinitionEntity> defMap = defList.stream()
					.collect(Collectors.toMap(DefinitionEntity::getDfnId, Function.identity()));

			List<InfoDataMapper> existInfoEntityList = infoDataEntityRepository
					.findAllInfoDataEntityByPrt(partnerInfoEntity);
			Map<Long, Long> map = existInfoEntityList.stream()
					.collect(Collectors.toMap(InfoDataMapper::getDfnId, InfoDataMapper::getInfId));

			partnerInfo.getInfoData().forEach(w -> {
				InfoDataEntity ide = new InfoDataEntity();
				if (map.containsKey(w.getDfnId().longValue()))
					ide.setId(map.get(w.getDfnId().longValue()));
				if ("file".equalsIgnoreCase(defMap.get(w.getDfnId().longValue()).getFieldType())) {
					if (w.getDfnVal() != null && w.getDfnVal().contains(",")) {
						String fileType = w.getDfnVal().substring(0, w.getDfnVal().indexOf(','));
						ide.setDfnBlobType(fileType);

						String fileVal = w.getDfnVal().substring(w.getDfnVal().indexOf(',') + 1);
						byte[] decodedByte = Base64.getDecoder().decode(fileVal);
						ide.setDfnBlobVal(decodedByte);
					}
				} else {
					ide.setDfnVal(w.getDfnVal());	
				}
				if (!"post".equals(scoreType))
					ide.setPreOnBoardScore(w.getScore());
				ide.setPartnerInfoEntity(partnerInfoEntity);
				ide.setDefinitionEntity(defMap.get(w.getDfnId().longValue()));
				infoDataEntries.add(ide);
			});
			partnerInfoEntityRepository.save(partnerInfoEntity);
			infoDataEntityRepository.saveAll(infoDataEntries);
			Response response = new Response();
			response.setStatus(SUCCESS);
			response.setStatusCode(HttpStatus.ACCEPTED + "");
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Update Partner Score", "Updating partner score for partner id : "+partnerInfo.getPartnerId(), "success");
			return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
		} else {
			AuditEventModel.callAuditLog("PARTNER-INFO-ENTITY", "Update Partner Score", "Updating partner score for partner id : "+partnerInfo.getPartnerId()+" has failed.", "failure");
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<Response> createCheckListData(CheckListModel checkListModel) {

		CheckListEntity checkListEntity = null;
		Optional<CheckListEntity> checklistEntOpt = checkListRepository.findByName(checkListModel.getToDos(),
				checkListModel.getTeamName(), checkListModel.getPartnerId());
		if (checklistEntOpt.isPresent()) {
			checkListEntity = checklistEntOpt.get();
			checkListEntity.setPartnerId(checkListModel.getPartnerId());
			checkListEntity.setTeamName(checkListModel.getTeamName());
			checkListEntity.setToDos(checkListModel.getToDos());
			checkListEntity.setCheckFlag(checkListModel.getCheckFlag());
		} else {
			checkListEntity = mapper.map(checkListModel, CheckListEntity.class);
		}
		checkListRepository.save(checkListEntity);
		Response response = new Response();
		response.setStatus(SUCCESS);
		response.setStatusCode(HttpStatus.CREATED + "");
		AuditEventModel.callAuditLog("CHECKLIST-ENTITY", "Create CheckList for partner", "Create CheckList details for "+checkListModel.getPartnerId(), "success");
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<List<CheckListModel>> getCheckListData(Integer partnerId, String teamName) {
		List<CheckListEntity> checkListEnities = null;
		checkListEnities = checkListRepository.findAllCheckListsByPartner(partnerId, teamName);
		List<CheckListModel> checkLists = new ArrayList<>();
		checkListEnities.forEach(cl -> {
			CheckListModel checklist = mapper.map(cl, CheckListModel.class);
			checkLists.add(checklist);
		});
		AuditEventModel.callAuditLog("CHECKLIST-ENTITY", "Get CheckList Details for partner", "Fetching of CheckList details for "+partnerId+" and the team name is :"+teamName, "success");
		return new ResponseEntity<>(checkLists, HttpStatus.OK);
	}

	//@Scheduled(cron = "${crone.rate}")
	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<Response> getBlockChainStatus() {

		RestTemplate restTemplate = new RestTemplate();
		List<PartnerInfoEntity> findAllInProgressBlockchainStatusPartnersEntities = null;
		findAllInProgressBlockchainStatusPartnersEntities = partnerInfoEntityRepository
				.findAllInProgressBlockchainStatusPartners();
		findAllInProgressBlockchainStatusPartnersEntities.forEach(inprogressEntity -> {
			ResponseEntity<String> result = restTemplate
					.getForEntity(getBlockChainStatus + "/" + inprogressEntity.getProfileName(), String.class); // +"/"+inprogressEntity.getProfileName()
			Response response = new Response();
			if (result.getStatusCode() == HttpStatus.OK || result.getStatusCode() == HttpStatus.NO_CONTENT) {
				if (result.getStatusCode() == HttpStatus.OK) {
					inprogressEntity.setBlockChainStatus("Registered");
					partnerInfoEntityRepository.save(inprogressEntity);
				}
				response.setStatus(SUCCESS);
				response.setStatusCode(HttpStatus.OK + "");
			} else {
				response.setStatus("Failed to register");
				inprogressEntity.setBlockChainStatus("Failed");
				partnerInfoEntityRepository.save(inprogressEntity);
				response.setStatusCode(HttpStatus.EXPECTATION_FAILED + "");
			}
		});
		AuditEventModel.callAuditLog("PARTNER-BLOCKCHAIN-ENTITY", "Get Blockchain Status", "Fetching of Blockchain status is successfull.", "success");
		return new ResponseEntity<>(HttpStatus.OK);
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<Response> registerToBlockChain(BlockChainModel blockChainModel) {
		RestTemplate restTemplate = new RestTemplate();
		PartnerBlockchainModel partnerBlockchainModel = new PartnerBlockchainModel();
		partnerBlockchainModel.setAmountThreshold(blockChainModel.getAmountThreshold());
		partnerBlockchainModel.setDomain(blockChainModel.getDomain());
		partnerBlockchainModel.setDurationThreshold(blockChainModel.getDurationThreshold());
		partnerBlockchainModel.setOrganisationName(blockChainModel.getOrganisationName());
		partnerBlockchainModel.setOrganisationPrefix(blockChainModel.getOrganisationPrefix());
		partnerBlockchainModel.setPartnerName(blockChainModel.getPartnerName());
		partnerBlockchainModel.setSmartContracts(blockChainModel.getTypes());
		ResponseEntity<BlockchainOrgRegisterResponse> result = restTemplate.postForEntity(getRegisterBlockchainUrl,
				partnerBlockchainModel, BlockchainOrgRegisterResponse.class);
		Response response = new Response();
		if (result.getStatusCode() == HttpStatus.CREATED) {
			PartnerBlockchainEntity partnerBlockchainEntity = null;
			Optional<PartnerBlockchainEntity> blockchainEntOpt = blockchainRepository
					.findByPartnerId(blockChainModel.getPartnerId());
			if (blockchainEntOpt.isPresent()) {
				partnerBlockchainEntity = blockchainEntOpt.get();
			} else {
				partnerBlockchainEntity = new PartnerBlockchainEntity();
			}
			partnerBlockchainEntity.setAmountThreshold(blockChainModel.getAmountThreshold());
			partnerBlockchainEntity.setDomain(blockChainModel.getDomain());
			partnerBlockchainEntity.setDurationThreshold(blockChainModel.getDurationThreshold());
			partnerBlockchainEntity.setNetworkMountPoint(blockChainModel.getNetworkMountPoint());
			partnerBlockchainEntity.setOrganisationName(blockChainModel.getOrganisationName());
			partnerBlockchainEntity.setOrganisationPrefix(blockChainModel.getOrganisationPrefix());
			partnerBlockchainEntity.setPartnerId(blockChainModel.getPartnerId());
			partnerBlockchainEntity.setPartnerName(blockChainModel.getPartnerName());
			if (result.getBody() != null) {
				partnerBlockchainEntity.setNetworkMountPoint(result.getBody().getNetworkMountPoint());
			}
			List<String> types = blockChainModel.getTypes();
			String[] strTypes= new String[types.size()];
			for (int j = 0; j < types.size(); j++) {
				strTypes[j] = types.get(j);
			}
			partnerBlockchainEntity.setTypes(strTypes);
			blockchainRepository.save(partnerBlockchainEntity);
			response.setStatus(SUCCESS);
			response.setStatusCode(HttpStatus.CREATED + "");
			Optional<PartnerInfoEntity> partnerInfoEntity = partnerInfoEntityRepository
					.findById(blockChainModel.getPartnerId());
			if (partnerInfoEntity.isPresent()) {
				PartnerInfoEntity partnerEntObj = partnerInfoEntity.get();
				partnerEntObj.setBlockChainStatus("InProgress");
				partnerInfoEntityRepository.save(partnerEntObj);
			}

		}
		AuditEventModel.callAuditLog("PARTNER-BLOCKCHAIN-ENTITY", "Register to Blockchain", "Registartion to Blockchain network successfully for :"+blockChainModel.getPartnerName()+" partner.", "success");
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
	public ResponseEntity<BlockChainModel> getBlockchainDetailsByPartnerId(String partnerId) {
		BlockChainModel blockChainModel = null;
		PartnerBlockchainEntity partnerBlockchainEntity = null;
		Optional<PartnerBlockchainEntity> blockchainEntOpt = blockchainRepository
				.findByPartnerId(Integer.parseInt(partnerId));
		if (blockchainEntOpt.isPresent()) {
			blockChainModel = new BlockChainModel();
			partnerBlockchainEntity = blockchainEntOpt.get();
			blockChainModel.setAmountThreshold(partnerBlockchainEntity.getAmountThreshold());
			blockChainModel.setDomain(partnerBlockchainEntity.getDomain());
			blockChainModel.setDurationThreshold(partnerBlockchainEntity.getDurationThreshold());
			blockChainModel.setNetworkMountPoint(partnerBlockchainEntity.getNetworkMountPoint());
			blockChainModel.setOrganisationName(partnerBlockchainEntity.getOrganisationName());
			blockChainModel.setOrganisationPrefix(partnerBlockchainEntity.getOrganisationPrefix());
			blockChainModel.setPartnerBlockchainId(partnerBlockchainEntity.getPartnerBlockchainId());
			blockChainModel.setPartnerId(partnerBlockchainEntity.getPartnerId());
			blockChainModel.setPartnerName(partnerBlockchainEntity.getPartnerName());
			blockChainModel.setTypes(Arrays.asList(partnerBlockchainEntity.getTypes()));
			blockChainModel.setNetworkMountPoint(partnerBlockchainEntity.getNetworkMountPoint());
		}
		AuditEventModel.callAuditLog("PARTNER-BLOCKCHAIN-ENTITY", "Fetching Blockchain details for partner", "Blockchain details are fetched successfully for :"+partnerBlockchainEntity.getPartnerName()+" partner.", "success");
		return new ResponseEntity<>(blockChainModel, HttpStatus.CREATED);
	}
}

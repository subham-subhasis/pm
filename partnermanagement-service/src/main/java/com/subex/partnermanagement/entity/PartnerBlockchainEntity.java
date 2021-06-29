package com.subex.partnermanagement.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "partner_blockchain")
public class PartnerBlockchainEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "partner_blockchain_generator")
	@SequenceGenerator(name="partner_blockchain_generator", sequenceName = "partner_blockchain_seq", allocationSize=1)
	@Column(name = "prt_blockchain_id")
	private Integer partnerBlockchainId;

	@Column(name = "domain")
	private String domain;
	
	@Column(name = "network_mount_point")
	private String networkMountPoint;
	
	@Column(name = "organisation_name")
	private String organisationName;
	
	@Column(name = "organisation_prefix")
	private String organisationPrefix;
	
	@Column(name = "partner_name")
	private String partnerName;
	
	@Column(name = "types")
	private String types;
	
	@Column(name = "prt_id")
	private Integer partnerId;
	
	@Column(name = "amount_threshold")
	private Double amountThreshold;
	
	@Column(name = "duration_threshold")
	private Double durationThreshold;

	public Integer getPartnerBlockchainId() {
		return partnerBlockchainId;
	}

	public void setPartnerBlockchainId(Integer partnerBlockchainId) {
		this.partnerBlockchainId = partnerBlockchainId;
	}

	public String getDomain() {
		return domain;
	}

	public void setDomain(String domain) {
		this.domain = domain;
	}

	public String getNetworkMountPoint() {
		return networkMountPoint;
	}

	public void setNetworkMountPoint(String networkMountPoint) {
		this.networkMountPoint = networkMountPoint;
	}

	public String getOrganisationName() {
		return organisationName;
	}

	public void setOrganisationName(String organisationName) {
		this.organisationName = organisationName;
	}

	public String getOrganisationPrefix() {
		return organisationPrefix;
	}

	public void setOrganisationPrefix(String organisationPrefix) {
		this.organisationPrefix = organisationPrefix;
	}

	public String getPartnerName() {
		return partnerName;
	}

	public void setPartnerName(String partnerName) {
		this.partnerName = partnerName;
	}

	public String[] getTypes() {
		return types.split(",");
	}

	public void setTypes(String types[]) {
		this.types = String.join(",", types);
	}

	public Integer getPartnerId() {
		return partnerId;
	}

	public void setPartnerId(Integer partnerId) {
		this.partnerId = partnerId;
	}

	public Double getAmountThreshold() {
		return amountThreshold;
	}

	public void setAmountThreshold(Double amountThreshold) {
		this.amountThreshold = amountThreshold;
	}

	public Double getDurationThreshold() {
		return durationThreshold;
	}

	public void setDurationThreshold(Double durationThreshold) {
		this.durationThreshold = durationThreshold;
	}
}

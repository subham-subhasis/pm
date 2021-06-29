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

import com.subex.partnermanagement.model.Profile;
import com.subex.partnermanagement.repository.ProfileFieldGroupRepository;

@ExtendWith(SpringExtension.class)
@SpringBootTest 
public class ProfileServiceTest {
	@MockBean
	ProfileFieldGroupRepository profileFieldGroupRepositoryMock;

	@Autowired
	ProfileService profileService;
	@Test
	void getprofileinfosTest()
	{
		List<String> listPro = new ArrayList<>();
		listPro.add("MVN");
		
	 
	  when(profileFieldGroupRepositoryMock.getProfiles()).thenReturn(listPro);
	  ResponseEntity<List<Profile>> responsEntExpec =profileService.getprofiles();
	    for (Profile p :responsEntExpec.getBody())
	    {
	    assertEquals("MVN",p.getProfileName());
	    }
	}
}

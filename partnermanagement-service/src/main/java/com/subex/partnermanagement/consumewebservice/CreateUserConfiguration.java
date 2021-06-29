package com.subex.partnermanagement.consumewebservice;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.oxm.jaxb.Jaxb2Marshaller;

 

@Configuration
public class CreateUserConfiguration {
    
    @Value("${ROCSOAPURLUserManagement}")
    private String ROCSOAPURLUserManagement;

 

    @Bean
    public Jaxb2Marshaller marshaller() {
        Jaxb2Marshaller marshaller = new Jaxb2Marshaller();
        // this package must match the package in the <generatePackage> specified in
        // pom.xml
        marshaller.setContextPath("com.subex.wsdl");
        return marshaller;
    }
    @Bean
    public CreateUserClient setCreateUserClient(Jaxb2Marshaller marshaller) {
    	CreateUserClient client = new CreateUserClient();
        client.setDefaultUri(ROCSOAPURLUserManagement);
        client.setMarshaller(marshaller);
        client.setUnmarshaller(marshaller);
        return client;
    }

 

}
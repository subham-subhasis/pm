package com.subex.partnermanagement;

import org.openapitools.jackson.nullable.JsonNullableModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.ExitCodeGenerator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.fasterxml.jackson.databind.Module;

@SpringBootApplication
//@EnableScheduling
@ComponentScan(basePackages = { "com.subex.partnermanagement", "com.subex.partnermanagement.api", "org.openapitools.configuration",
		"com.subex.partnermanagement.service"})
public class OpenAPI2SpringBoot implements CommandLineRunner {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(OpenAPI2SpringBoot.class);
	@Autowired 
	private MdcLogInterceptor mdcLogInterceptor;

	@Override
	public void run(String... arg0) throws Exception {
		if (arg0.length > 0 && arg0[0].equals("exitcode")) {
			throw new ExitException();
		}
	}

	public static void main(String[] args) throws Exception {
		new SpringApplication(OpenAPI2SpringBoot.class).run(args);
		LOGGER.error("Message logged at ERROR level");
		LOGGER.warn("Message logged at WARN level");
		LOGGER.info("Message logged at INFO level");
		LOGGER.debug("Message logged at DEBUG level");
	}
	
	@Autowired
	private JWTAuthenticationEntryPoint jwtAuthenticationEntryPoint;
	
	
	@EnableWebSecurity
	@Configuration
	class WebSecurityConfig extends WebSecurityConfigurerAdapter {
		
		private final JWTAuthorizationFilter authenticationFilter;
		public WebSecurityConfig(JWTAuthorizationFilter authenticationFilter) {
			this.authenticationFilter = authenticationFilter;
		}
		@Override
		protected void configure(HttpSecurity http) throws Exception {
			http.csrf().disable()
				.authorizeRequests()
				.anyRequest().authenticated().and().
				exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint).and().sessionManagement()
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
			http.addFilterAfter(authenticationFilter, UsernamePasswordAuthenticationFilter.class);
			http.cors();
		}
	}
	
	//.antMatchers("/api/**").permitAll() for any specific we want to pass
	//.addFilterAfter(new JWTAuthorizationFilter(), UsernamePasswordAuthenticationFilter.class)

	static class ExitException extends RuntimeException implements ExitCodeGenerator {
		private static final long serialVersionUID = 1L;

		@Override
		public int getExitCode() {
			return 10;
		}

	}

	@Bean
	public WebMvcConfigurer webConfigurer() {
		return new WebMvcConfigurer() {
			
			  @Override public void addCorsMappings(CorsRegistry registry) {
			   registry.addMapping("/**") .allowedOrigins("*") .allowedMethods("*")
			  .allowedHeaders("*") ; }
			  @Override 
				public void addInterceptors(InterceptorRegistry registry) {
					   registry.addInterceptor(mdcLogInterceptor).addPathPatterns("/**");
				}
			 
		};
	}

	@Bean
	public Module jsonNullableModule() {
		return new JsonNullableModule();
	}

}

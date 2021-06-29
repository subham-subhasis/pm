package com.subex.partnermanagement;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.exceptions.InvalidClaimException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.subex.partnermanagement.utility.AuthTokenValidatorImpl;
import com.subex.partnermanagement.utility.DefaultKeyContentFetcher;
import com.subex.partnermanagement.utility.IAuthTokenValidator;
import com.subex.partnermanagement.utility.IKeyContentFetcher;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;

@Component
public class JWTAuthorizationFilter extends OncePerRequestFilter {
	
	private final Logger logger = LogManager.getLogger(JWTAuthorizationFilter.class);
	
	@Value("${publickey.path}")
	private String publicKeyPath;
	@Value("${errorMessage.expireTimeNotSet}")
	private String expireTimeNotSet;
	@Value("${errorMessage.missingAuthorizationBearer}")
	private String missingAuthorizationBearer;
	@Value("${errorMessage.tokenVerificationFailed}")
	private String tokenVerificationFailed;
	private final String HEADER = "Authorization";
	private final String PREFIX = "Bearer ";
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String errorMessage = "";
		List<String> authorities = new ArrayList<String>();
		boolean isError = true;
		try {
			if (checkJWTToken(request, response)) {
				String jwtToken = request.getHeader(HEADER).replace(PREFIX, "");
				IKeyContentFetcher keyContentFetcher = new DefaultKeyContentFetcher(publicKeyPath, null);
				IAuthTokenValidator jwtValidator = new AuthTokenValidatorImpl(keyContentFetcher);
				DecodedJWT jwt = jwtValidator.getDecodedJWT(jwtToken);
				String subject = jwt.getSubject();
				if (jwt.getExpiresAt() == null) {
					errorMessage = expireTimeNotSet;
				} else {
					isError = false;
					UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
							subject,null, authorities.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList()));
							SecurityContextHolder.getContext().setAuthentication(auth);
					logger.info("Token validation successfull");
				}
			} else {
				errorMessage = missingAuthorizationBearer;
				response.setStatus(HttpServletResponse.SC_FORBIDDEN);
				((HttpServletResponse) response).sendError(HttpServletResponse.SC_FORBIDDEN, errorMessage);
				SecurityContextHolder.clearContext();
			}
			if (!isError) {
				chain.doFilter(request, response);
			}
		}
		catch (ExpiredJwtException | IllegalArgumentException | UnsupportedJwtException | MalformedJwtException  e) {
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			((HttpServletResponse) response).sendError(HttpServletResponse.SC_FORBIDDEN, e.getMessage());
			return;
		}
		catch (TokenExpiredException e) 
		{
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			((HttpServletResponse) response).sendError(HttpServletResponse.SC_FORBIDDEN, e.getMessage());
			return;
		}
		catch (InvalidClaimException e)
		{
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			((HttpServletResponse) response).sendError(HttpServletResponse.SC_FORBIDDEN, e.getMessage());
			return;
		}
		catch(Exception e)
		{
			errorMessage = tokenVerificationFailed;
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			((HttpServletResponse) response).sendError(HttpServletResponse.SC_FORBIDDEN, errorMessage);
			return;
		}
	}

	private boolean checkJWTToken(HttpServletRequest request, HttpServletResponse res) {
		String authenticationHeader = request.getHeader(HEADER);
		if (authenticationHeader == null || !authenticationHeader.startsWith(PREFIX))
			return false;
		return true;
	}

}
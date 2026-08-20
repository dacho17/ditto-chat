package com.ditto_chat.ditto_chat_server.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.helpers.auth.ChatterAccessDeniedHandler;
import com.ditto_chat.ditto_chat_server.helpers.auth.ChatterAuthEntryPoint;
import com.ditto_chat.ditto_chat_server.utils.CryptoTool;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {
	@Autowired
	private ChatterAuthEntryPoint chatterAuthenticationHandler;
	@Autowired
	private ChatterAccessDeniedHandler chatterAuthorizationHandler;

	@Value("${client.domain}")
    private String DITTO_CHAT_CLIENT_DOMAIN;

	@Bean
    @Scope("singleton")
    public DaoAuthenticationProvider chatterAuthProvider(@Qualifier("chatterUserDetailsService") UserDetailsService chatterUserDetailsService) {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(chatterUserDetailsService);
        authProvider.setPasswordEncoder(CryptoTool.getPasswordEncoder());

		return authProvider;
    }

	/*
	@Bean
    public CorsConfigurationSource corsConfigurationSource() {
		String httpDittoChatClientOrigin = "http://" + DITTO_CHAT_CLIENT_DOMAIN;
		String httpsDittoChatClientOrigin = "https://" + DITTO_CHAT_CLIENT_DOMAIN;

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(httpDittoChatClientOrigin, httpsDittoChatClientOrigin));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
	*/

	@Bean
    @Scope("singleton")
    @DependsOn("chatterAuthProvider")
	public SecurityFilterChain chatterSecurityFilterChain(HttpSecurity http, @Qualifier("chatterAuthProvider") DaoAuthenticationProvider chatterAuthProvider) throws Exception {
		AuthenticationManager chatterAuthenticationManager = new ProviderManager(chatterAuthProvider);

		http.securityMatcher("/**")
			.cors(Customizer.withDefaults())
			.csrf(csrf -> csrf.disable())
			.exceptionHandling(t -> t.authenticationEntryPoint(chatterAuthenticationHandler))
			.exceptionHandling(t -> t.accessDeniedHandler(chatterAuthorizationHandler))
			.authenticationManager(chatterAuthenticationManager)
			.authorizeHttpRequests(auth -> auth
				.requestMatchers(HttpMethod.GET, Constants.REGISTER_URL).permitAll()
				.requestMatchers(HttpMethod.POST, Constants.REGISTER_URL).permitAll()
				.requestMatchers(HttpMethod.GET, Constants.LOGIN_URL).permitAll()
				.requestMatchers(HttpMethod.POST, Constants.LOGIN_URL).permitAll()
				.requestMatchers(HttpMethod.GET, Constants.FORGOT_PASSWORD_URL).permitAll()
				.requestMatchers(HttpMethod.POST, Constants.FORGOT_PASSWORD_URL).permitAll()
				.requestMatchers(HttpMethod.GET, Constants.RESET_PASSWORD_URL).permitAll()
				.requestMatchers(HttpMethod.POST, Constants.RESET_PASSWORD_URL).permitAll()
				.anyRequest().authenticated()
			)
			.logout(logout -> logout	// TODO-logout: logout needs to be allowed only for tenants with the active session
				.logoutUrl(Constants.LOGOUT_URL)
				.invalidateHttpSession(true)
				.deleteCookies("SESSION")
				.clearAuthentication(true)
				.logoutSuccessHandler((request, response, authentication) -> {
					response.setStatus(HttpServletResponse.SC_OK);
					// TODO-logout: this Handler can be Implemented in a separate class an send a redirectUrl in response similary as Auth Handlers do 
				})
			);

		return http.build();
	}

	@Bean
    @Scope("singleton")
    @DependsOn("chatterSecurityFilterChain")
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.cors(Customizer.withDefaults())
			.csrf(csrf -> csrf.disable())
			.sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
			.authorizeHttpRequests(auth -> auth
				.anyRequest().denyAll()
			);

		return http.build();
	}
}
